'use strict'
const { Chat, ChatMessage } = require('../models')
const trainingRepository = require('../repositories/TrainingRepository')

const MAIN_OLLAMA_MODEL = process.env.MAIN_OLLAMA_MODEL || 'gemma3:4b'
const SECONDARY_OLLAMA_MODEL = process.env.SECONDARY_OLLAMA_MODEL || 'qwen3:0.6b'

const SYSTEM_PROMPT = `Te llamas Hope, eres un asistente cristiano de acompanamiento espiritual.
Tus respuestas deben estar basadas en la Biblia, en la vida y ensenanzas de Jesus,
y en principios como amor, perdon, humildad, verdad, misericordia, fe y esperanza.

No inventes doctrina.
No reemplaces a un pastor, psicologo, medico o consejero profesional.
Responde con empatia, claridad y respeto.`

class ChatController {
  async getRecentChats (req, res) {
    const userId = req.user?.sub
    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 10)

    try {
      const chats = await Chat.findAll({
        where: { user_id: userId },
        order: [['updatedAt', 'DESC']],
        limit,
        include: [{
          model: ChatMessage,
          as: 'messages',
          attributes: ['content', 'createdAt'],
          order: [['message_order', 'DESC']],
          limit: 1,
          separate: true
        }]
      })

      return res.status(200).json({
        chats: chats.map(chat => ({
          chat_id: chat.chat_id,
          title: chat.title,
          updatedAt: chat.updatedAt,
          preview: chat.messages[0]?.content || ''
        }))
      })
    } catch (err) {
      return res.status(500).json({ message: err.message })
    }
  }

  async getChat (req, res) {
    const userId = req.user?.sub
    const chatId = Number(req.params.chatId)

    if (!Number.isInteger(chatId) || chatId <= 0) {
      return res.status(400).json({ message: 'chatId invalido' })
    }

    try {
      const chat = await Chat.findOne({
        where: { chat_id: chatId, user_id: userId },
        include: [{
          model: ChatMessage,
          as: 'messages',
          attributes: ['role', 'content', 'message_order'],
          order: [['message_order', 'ASC']],
          separate: true
        }]
      })

      if (!chat) {
        return res.status(404).json({ message: 'Chat no encontrado' })
      }

      return res.status(200).json({
        chat: {
          chat_id: chat.chat_id,
          title: chat.title,
          updatedAt: chat.updatedAt,
          messages: chat.messages.map(msg => ({
            role: msg.role,
            content: msg.content,
            message_order: msg.message_order
          }))
        }
      })
    } catch (err) {
      return res.status(500).json({ message: err.message })
    }
  }

  async chat (req, res) {
    const ollamaUrl = process.env.OLLAMA_URL
    const userId = req.user?.sub
    const userMessage = (req.body.prompt || '').trim()
    const requestChatId = Number(req.body.chatId)
    // history: array de { role: 'user'|'assistant', content: string } con los turnos anteriores
    const history = Array.isArray(req.body.history) ? req.body.history : []

    if (!userId) {
      return res.status(401).json({ message: 'Usuario no autenticado' })
    }

    if (!userMessage) {
      return res.status(400).json({ error: 'El mensaje es requerido' })
    }

    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')

    const emit = (data) => res.write(`data: ${JSON.stringify(data)}\n\n`)

    try {
      const chat = await this._resolveChat({
        userId,
        requestChatId,
        ollamaUrl,
        userMessage
      })

      emit({ chatId: chat.chat_id, title: chat.title })

      let nextOrder = await this._getNextMessageOrder(chat.chat_id)
      await ChatMessage.create({
        chat_id: chat.chat_id,
        role: 'user',
        content: userMessage,
        message_order: nextOrder
      })
      await this._touchChat(chat.chat_id)

      // 1. Obtener todos los topics activos de la BD
      emit({ phase: 'classifying' })
      const topics = await trainingRepository.findAllTopics()

      // 2. Clasificar que topics son relevantes para el mensaje del usuario
      let matchedSlugs = []
      if (topics.length > 0) {
        matchedSlugs = await this._classifyTopics(ollamaUrl, userMessage, topics)
      }

      // 3. Consultar versiculos relacionados a los topics detectados
      emit({ phase: 'searching' })
      let verses = []
      if (matchedSlugs.length > 0) {
        verses = await trainingRepository.findVersesByTopicSlugs(matchedSlugs)
      }

      // 4. Construir el array de mensajes con historial + contexto biblico en el mensaje actual
      const messages = this._buildMessages(userMessage, verses, history)

      // 5. Enviar a Ollama y transmitir la respuesta al cliente
      emit({ phase: 'generating' })
      const assistantContent = await this._streamResponse(ollamaUrl, messages, res)

      if (assistantContent) {
        nextOrder += 1
        await ChatMessage.create({
          chat_id: chat.chat_id,
          role: 'assistant',
          content: assistantContent,
          message_order: nextOrder
        })
      }
    } catch (err) {
      console.error('[ChatController] Error en pipeline:', err.message)
      res.write(`data: ${JSON.stringify({ error: 'Error interno del consejero' })}\n\n`)
      res.end()
    }
  }

  async _resolveChat ({ userId, requestChatId, ollamaUrl, userMessage }) {
    if (Number.isInteger(requestChatId) && requestChatId > 0) {
      const existingChat = await Chat.findOne({
        where: {
          chat_id: requestChatId,
          user_id: userId
        }
      })

      if (!existingChat) {
        throw new Error('Chat no encontrado para este usuario')
      }

      return existingChat
    }

    const title = await this._generateChatTitle(ollamaUrl, userMessage)
    return Chat.create({
      user_id: userId,
      title
    })
  }

  async _generateChatTitle (ollamaUrl, userMessage) {
    const fallback = userMessage.slice(0, 60) || 'Nuevo chat'

    if (!ollamaUrl) return fallback

    const prompt = `Genera un titulo corto (maximo 8 palabras) para este chat espiritual.
Devuelve solo el titulo, sin comillas ni puntuacion extra.

Mensaje del usuario: "${userMessage}"`

    try {
      const response = await fetch(`${ollamaUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: SECONDARY_OLLAMA_MODEL,
          prompt,
          stream: false
        })
      })

      if (!response.ok) return fallback

      const data = await response.json()
      const title = (data.response || '')
        .replace(/["'`]/g, '')
        .replace(/\s+/g, ' ')
        .trim()

      return title.slice(0, 120) || fallback
    } catch {
      return fallback
    }
  }

  async _getNextMessageOrder (chatId) {
    const latest = await ChatMessage.findOne({
      where: { chat_id: chatId },
      order: [['message_order', 'DESC']],
      attributes: ['message_order']
    })

    return (latest?.message_order || 0) + 1
  }

  async _touchChat (chatId) {
    await Chat.update(
      { updatedAt: new Date() },
      { where: { chat_id: chatId } }
    )
  }

  /**
   * Llama a Ollama (sin streaming) para que clasifique que topics del catalogo
   * son relevantes para el mensaje del usuario.
   * @returns {Promise<string[]>} Array de slugs
   */
  async _classifyTopics (ollamaUrl, userMessage, topics) {
    const topicList = topics
      .map(t => `- ${t.slug}: ${t.name}${t.description ? ` (${t.description})` : ''}`)
      .join('\n')

    const classificationPrompt =
      `Eres un clasificador de temas biblicos. Analiza el siguiente mensaje y determina cuales de los temas listados son relevantes para responder con contexto biblico apropiado.

Mensaje del usuario: "${userMessage}"

Temas disponibles:
${topicList}

Responde UNICAMENTE con un objeto JSON valido con este formato exacto:
{"topics": ["slug1", "slug2"]}

Si ningun tema es relevante responde: {"topics": []}
No incluyas texto adicional, solo el JSON.`

    try {
      const response = await fetch(`${ollamaUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: SECONDARY_OLLAMA_MODEL,
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
   * Construye el array de mensajes para /api/chat de Ollama.
   * Incluye: system prompt, historial de la conversacion y el mensaje actual
   * enriquecido con los versiculos encontrados.
   * @param {string} userMessage
   * @param {Array} verses
   * @param {Array<{role:string, content:string}>} history - turnos anteriores
   */
  _buildMessages (userMessage, verses, history) {
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT }
    ]

    // Historial de la conversacion (turnos anteriores)
    for (const turn of history) {
      if ((turn.role === 'user' || turn.role === 'assistant') && turn.content) {
        messages.push({ role: turn.role, content: turn.content })
      }
    }

    // Mensaje actual del usuario, enriquecido con contexto biblico si aplica
    let currentContent = userMessage
    if (verses.length > 0) {
      currentContent += '\n\n[Versiculos biblicos relevantes:]\n'
      for (const verse of verses) {
        currentContent += `- ${verse.reference} (${verse.version}): "${verse.text}"\n`
      }
    }
    messages.push({ role: 'user', content: currentContent })

    return messages
  }

  /**
   * Envia los mensajes a Ollama (/api/chat) con streaming y reenvia cada token al cliente via SSE.
   * @param {string} ollamaUrl
   * @param {Array<{role:string, content:string}>} messages
   * @param {import('express').Response} res
   * @returns {Promise<string|null>} Respuesta completa del asistente
   */
  async _streamResponse (ollamaUrl, messages, res) {
    let ollamaResponse
    try {
      ollamaResponse = await fetch(`${ollamaUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(60000),
        body: JSON.stringify({
          model: MAIN_OLLAMA_MODEL,
          messages,
          stream: true
        })
      })
    } catch {
      res.write(`data: ${JSON.stringify({ error: 'unavailable' })}\n\n`)
      res.end()
      return null
    }

    if (!ollamaResponse.ok || !ollamaResponse.body) {
      res.write(`data: ${JSON.stringify({ error: 'unavailable' })}\n\n`)
      res.end()
      return null
    }

    const reader = ollamaResponse.body.getReader()
    const decoder = new TextDecoder()
    let fullContent = ''

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        for (const line of chunk.split('\n').filter(Boolean)) {
          try {
            const json = JSON.parse(line)
            const token = json.message?.content ?? ''
            if (token) fullContent += token
            // /api/chat devuelve { message: { content }, done }
            res.write(`data: ${JSON.stringify({ token, done: json.done })}\n\n`)
          } catch {}
        }
      }
    } finally {
      res.end()
    }

    return fullContent || null
  }
}

module.exports = new ChatController()
