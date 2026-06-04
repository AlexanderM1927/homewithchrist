'use strict'
const trainingRepository = require('../repositories/TrainingRepository')

const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'gemma3'

const SYSTEM_PROMPT = `Te llamas Hope, eres un asistente cristiano de acompañamiento espiritual.
Tus respuestas deben estar basadas en la Biblia, en la vida y enseñanzas de Jesús,
y en principios como amor, perdón, humildad, verdad, misericordia, fe y esperanza.

No inventes doctrina.
No reemplaces a un pastor, psicólogo, médico o consejero profesional.
Cuando el tema sea grave, recomienda buscar ayuda humana confiable.
Responde con empatía, claridad y respeto.`

class ChatController {
  async chat (req, res) {
    const ollamaUrl = process.env.OLLAMA_URL
    const userMessage = (req.body.prompt || '').trim()

    if (!userMessage) {
      return res.status(400).json({ error: 'El mensaje es requerido' })
    }

    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')

    const emit = (data) => res.write(`data: ${JSON.stringify(data)}\n\n`)

    try {
      // 1. Obtener todos los topics activos de la BD
      emit({ phase: 'classifying' })
      const topics = await trainingRepository.findAllTopics()

      // 2. Clasificar qué topics son relevantes para el mensaje del usuario
      let matchedSlugs = []
      if (topics.length > 0) {
        matchedSlugs = await this._classifyTopics(ollamaUrl, userMessage, topics)
      }

      // 3. Consultar versículos relacionados a los topics detectados
      emit({ phase: 'searching' })
      let verses = []
      if (matchedSlugs.length > 0) {
        verses = await trainingRepository.findVersesByTopicSlugs(matchedSlugs)
      }

      // 4. Construir el prompt enriquecido con el contexto bíblico
      const finalPrompt = this._buildPrompt(userMessage, verses)

      // 5. Enviar a Ollama y transmitir la respuesta al cliente
      emit({ phase: 'generating' })
      await this._streamResponse(ollamaUrl, finalPrompt, res)
    } catch (err) {
      console.error('[ChatController] Error en pipeline:', err.message)
      res.write(`data: ${JSON.stringify({ error: 'Error interno del consejero' })}\n\n`)
      res.end()
    }
  }

  /**
   * Llama a Ollama (sin streaming) para que clasifique qué topics del catálogo
   * son relevantes para el mensaje del usuario.
   * @returns {Promise<string[]>} Array de slugs
   */
  async _classifyTopics (ollamaUrl, userMessage, topics) {
    const topicList = topics
      .map(t => `- ${t.slug}: ${t.name}${t.description ? ` (${t.description})` : ''}`)
      .join('\n')

    const classificationPrompt =
      `Eres un clasificador de temas bíblicos. Analiza el siguiente mensaje y determina cuáles de los temas listados son relevantes para responder con contexto bíblico apropiado.

Mensaje del usuario: "${userMessage}"

Temas disponibles:
${topicList}

Responde ÚNICAMENTE con un objeto JSON válido con este formato exacto:
{"topics": ["slug1", "slug2"]}

Si ningún tema es relevante responde: {"topics": []}
No incluyas texto adicional, solo el JSON.`

    try {
      const response = await fetch(`${ollamaUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: OLLAMA_MODEL,
          prompt: classificationPrompt,
          stream: false,
          format: 'json'
        })
      })

      if (!response.ok) return []

      const data = await response.json()
      const parsed = JSON.parse(data.response)
      return Array.isArray(parsed.topics) ? parsed.topics : []
    } catch {
      return []
    }
  }

  /**
   * Ensambla el prompt final con el system prompt de Hope,
   * los versículos encontrados y la pregunta del usuario.
   */
  _buildPrompt (userMessage, verses) {
    let prompt = SYSTEM_PROMPT + '\n\n'

    if (verses.length > 0) {
      prompt += 'Versículos bíblicos relevantes para tu respuesta:\n'
      for (const verse of verses) {
        prompt += `- ${verse.reference} (${verse.version}): "${verse.text}"\n`
      }
      prompt += '\n'
    }

    prompt += `Usuario: ${userMessage}`
    return prompt
  }

  /**
   * Envía el prompt a Ollama con streaming y reenvía cada token al cliente via SSE.
   */
  async _streamResponse (ollamaUrl, prompt, res) {
    let ollamaResponse
    try {
      ollamaResponse = await fetch(`${ollamaUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: OLLAMA_MODEL,
          prompt,
          stream: true
        })
      })
    } catch {
      res.write(`data: ${JSON.stringify({ error: 'No se pudo conectar con Ollama' })}\n\n`)
      return res.end()
    }

    const reader = ollamaResponse.body.getReader()
    const decoder = new TextDecoder()

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        for (const line of chunk.split('\n').filter(Boolean)) {
          try {
            const json = JSON.parse(line)
            res.write(`data: ${JSON.stringify({ token: json.response, done: json.done })}\n\n`)
          } catch {}
        }
      }
    } finally {
      res.end()
    }
  }
}

module.exports = new ChatController()
