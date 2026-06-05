'use strict'

class OllamaProvider {
  constructor({
    baseUrl = process.env.OLLAMA_URL,
    mainModel = process.env.MAIN_OLLAMA_MODEL || 'gemma3:4b',
    secondaryModel = process.env.SECONDARY_OLLAMA_MODEL || 'qwen3:0.6b'
  } = {}) {
    this.baseUrl = baseUrl
    this.mainModel = mainModel
    this.secondaryModel = secondaryModel
  }

  async generateTitle(userMessage) {
    const fallback = userMessage.slice(0, 60) || 'Nuevo chat'
    if (!this.baseUrl) return fallback

    const prompt = `Genera un titulo corto (maximo 8 palabras) para este chat espiritual.
Devuelve solo el titulo, sin comillas ni puntuacion extra.

Mensaje del usuario: "${userMessage}"`

    try {
      const data = await this._generate({
        model: this.secondaryModel,
        prompt
      })
      const title = (data.response || '')
        .replace(/["'`]/g, '')
        .replace(/\s+/g, ' ')
        .trim()

      return title.slice(0, 120) || fallback
    } catch {
      return fallback
    }
  }

  async classifyTopics(userMessage, topics) {
    if (!this.baseUrl || topics.length === 0) return []

    const topicList = topics
      .map(topic => `- ${topic.slug}: ${topic.name}${topic.description ? ` (${topic.description})` : ''}`)
      .join('\n')

    const prompt =
      `Eres un clasificador de temas biblicos. Analiza el siguiente mensaje y determina cuales de los temas listados son relevantes para responder con contexto biblico apropiado.

Mensaje del usuario: "${userMessage}"

Temas disponibles:
${topicList}

Responde UNICAMENTE con un objeto JSON valido con este formato exacto:
{"topics": ["slug1", "slug2"]}

Si ningun tema es relevante responde: {"topics": []}
No incluyas texto adicional, solo el JSON.`

    try {
      const data = await this._generate({
        model: this.secondaryModel,
        prompt,
        format: 'json'
      })
      const parsed = JSON.parse(data.response)
      return Array.isArray(parsed.topics) ? parsed.topics : []
    } catch {
      return []
    }
  }

  async streamChat(messages, onToken) {
    if (!this.baseUrl) {
      throw this._unavailableError()
    }

    let response
    try {
      response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(60000),
        body: JSON.stringify({
          model: this.mainModel,
          messages,
          stream: true
        })
      })
    } catch {
      throw this._unavailableError()
    }

    if (!response.ok || !response.body) {
      throw this._unavailableError()
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    let fullContent = ''

    while (true) {
      const { done, value } = await reader.read()
      buffer += decoder.decode(value || new Uint8Array(), { stream: !done })

      const lines = buffer.split('\n')
      buffer = done ? '' : lines.pop()

      for (const line of lines) {
        if (!line.trim()) continue

        try {
          const data = JSON.parse(line)
          const token = data.message?.content ?? ''
          if (token) fullContent += token
          onToken({ token, done: Boolean(data.done) })
        } catch {
          // Ignore malformed provider chunks without interrupting the stream.
        }
      }

      if (done) break
    }

    return fullContent || null
  }

  async _generate({ model, prompt, format }) {
    const response = await fetch(`${this.baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt,
        stream: false,
        ...(format ? { format } : {})
      })
    })

    if (!response.ok) {
      throw this._unavailableError()
    }

    return response.json()
  }

  _unavailableError() {
    const error = new Error('Proveedor de IA no disponible')
    error.code = 'AI_UNAVAILABLE'
    return error
  }
}

module.exports = OllamaProvider
