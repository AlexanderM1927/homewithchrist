'use strict'
const chatService = require('../services/ChatService')

class ChatController {
  async getRecentChats(req, res) {
    const userId = req.user?.sub
    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 10)

    try {
      const chats = await chatService.getRecentChats(userId, limit)
      return res.status(200).json({ chats })
    } catch (err) {
      return res.status(500).json({ message: err.message })
    }
  }

  async getChat(req, res) {
    const userId = req.user?.sub
    const chatId = Number(req.params.chatId)

    if (!Number.isInteger(chatId) || chatId <= 0) {
      return res.status(400).json({ message: 'chatId invalido' })
    }

    try {
      const chat = await chatService.getChat(userId, chatId)

      if (!chat) {
        return res.status(404).json({ message: 'Chat no encontrado' })
      }

      return res.status(200).json({ chat })
    } catch (err) {
      return res.status(500).json({ message: err.message })
    }
  }

  async chat(req, res) {
    const userId = req.user?.sub
    const userMessage = (req.body.prompt || '').trim()
    const requestChatId = Number(req.body.chatId)

    if (!userId) {
      return res.status(401).json({ message: 'Usuario no autenticado' })
    }

    if (!userMessage) {
      return res.status(400).json({ error: 'El mensaje es requerido' })
    }

    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')
    res.flushHeaders?.()

    const emit = data => res.write(`data: ${JSON.stringify(data)}\n\n`)
    const heartbeat = setInterval(() => {
      res.write(': keep-alive\n\n')
    }, 15000)

    try {
      await chatService.sendMessage({
        userId,
        requestChatId,
        userMessage,
        emit
      })
    } catch (err) {
      console.error('[ChatController] Error en pipeline:', err.message)
      emit({
        error: err.code === 'AI_UNAVAILABLE'
          ? 'unavailable'
          : err.code === 'AI_BUDGET_EXCEEDED'
            ? 'budget_exceeded'
            : 'Error interno del consejero'
      })
    } finally {
      clearInterval(heartbeat)
      res.end()
    }
  }
}

module.exports = new ChatController()
