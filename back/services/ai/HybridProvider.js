'use strict'
const OllamaProvider = require('./OllamaProvider')
const OpenAIProvider = require('./OpenAIProvider')

class HybridProvider {
  constructor({
    primary = new OllamaProvider(),
    fallback = new OpenAIProvider(),
    primaryCooldownMs = Number(process.env.HYBRID_PRIMARY_COOLDOWN_MS) || 60000
  } = {}) {
    this.primary = primary
    this.fallback = fallback
    this.primaryCooldownMs = primaryCooldownMs
    this.primaryUnavailableUntil = 0
    this.mainModel = primary.mainModel
    this.secondaryModel = primary.secondaryModel
    this.embeddingModel = primary.embeddingModel
  }

  async generateTitle(userMessage) {
    return this._withFallback('generateTitle', [userMessage])
  }

  async classifyTopics(userMessage, topics) {
    return this._withFallback('classifyTopics', [userMessage, topics])
  }

  async selectRelevantDiaryEntries(userMessage, entries, maxEntries = 3) {
    return this._withFallback('selectRelevantDiaryEntries', [userMessage, entries, maxEntries])
  }

  async streamChat(messages, onToken, metadata = {}) {
    if (this._isPrimaryCoolingDown()) {
      console.warn('[HybridProvider] Ollama en cooldown para chat. Usando OpenAI.')
      return this.fallback.streamChat(messages, onToken, metadata)
    }

    try {
      return await this.primary.streamChat(messages, onToken, metadata)
    } catch (err) {
      if (!this._canFallback(err)) throw err
      this._markPrimaryUnavailable()
      console.warn('[HybridProvider] Ollama no disponible para chat. Usando OpenAI.')
      return this.fallback.streamChat(messages, onToken, metadata)
    }
  }

  canEmbed() {
    return this.primary.canEmbed() || this.fallback.canEmbed()
  }

  getEmbeddingIdentity() {
    const provider = this.primary.canEmbed() && !this._isPrimaryCoolingDown()
      ? this.primary
      : this.fallback
    return provider.getEmbeddingIdentity()
  }

  async generateEmbedding(input) {
    const result = await this.generateEmbeddingsWithMetadata([input])
    return result.embeddings[0]
  }

  async generateEmbeddings(inputs) {
    const result = await this.generateEmbeddingsWithMetadata(inputs)
    return result.embeddings
  }

  async generateEmbeddingsWithMetadata(inputs) {
    if (!this.primary.canEmbed()) {
      console.warn('[HybridProvider] Ollama no configurado para embeddings. Usando OpenAI.')
      return this.fallback.generateEmbeddingsWithMetadata(inputs)
    }

    if (this._isPrimaryCoolingDown()) {
      console.warn('[HybridProvider] Ollama en cooldown para embeddings. Usando OpenAI.')
      return this.fallback.generateEmbeddingsWithMetadata(inputs)
    }

    try {
      return await this.primary.generateEmbeddingsWithMetadata(inputs)
    } catch (err) {
      if (!this._canFallback(err)) throw err
      this._markPrimaryUnavailable()
      console.warn('[HybridProvider] Ollama no disponible para embeddings. Usando OpenAI.')
      return this.fallback.generateEmbeddingsWithMetadata(inputs)
    }
  }

  async _withFallback(method, args) {
    if (this._isPrimaryCoolingDown()) {
      console.warn(`[HybridProvider] Ollama en cooldown para ${method}. Usando OpenAI.`)
      return this.fallback[method](...args)
    }

    try {
      return await this.primary[method](...args)
    } catch (err) {
      if (!this._canFallback(err)) throw err
      this._markPrimaryUnavailable()
      console.warn(`[HybridProvider] Ollama no disponible para ${method}. Usando OpenAI.`)
      return this.fallback[method](...args)
    }
  }

  _canFallback(err) {
    return err?.code === 'AI_UNAVAILABLE'
  }

  _isPrimaryCoolingDown() {
    return Date.now() < this.primaryUnavailableUntil
  }

  _markPrimaryUnavailable() {
    this.primaryUnavailableUntil = Date.now() + this.primaryCooldownMs
  }
}

module.exports = HybridProvider
