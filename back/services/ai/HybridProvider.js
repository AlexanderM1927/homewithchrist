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

  async generateEmbedding(input) {
    const embeddings = await this.generateEmbeddings([input])
    return embeddings[0]
  }

  async generateEmbeddings(inputs) {
    if (this._isPrimaryCoolingDown()) {
      console.warn('[HybridProvider] Ollama en cooldown para embeddings. Usando OpenAI.')
      return this.fallback.generateEmbeddings(inputs)
    }

    try {
      return await this.primary.generateEmbeddings(inputs)
    } catch (err) {
      if (!this._canFallback(err)) throw err
      this._markPrimaryUnavailable()
      console.warn('[HybridProvider] Ollama no disponible para embeddings. Usando OpenAI.')
      return this.fallback.generateEmbeddings(inputs)
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
