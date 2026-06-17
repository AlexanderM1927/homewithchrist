'use strict'
const chatService = require('../services/ChatService')
const { resolveSupportedLocale } = require('../utils/locale')

const GUEST_TRIAL_COOKIE = 'hope_guest_trial_used'
const GUEST_TRIAL_MAX_AGE = 365 * 24 * 60 * 60 * 1000

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

  async shareChat(req, res) {
    const userId = req.user?.sub
    const chatId = Number(req.params.chatId)

    if (!Number.isInteger(chatId) || chatId <= 0) {
      return res.status(400).json({ message: 'chatId invalido' })
    }

    try {
      const share = await chatService.shareChat(userId, chatId)
      if (!share) return res.status(404).json({ message: 'Chat no encontrado' })
      return res.status(200).json(share)
    } catch (err) {
      return res.status(500).json({ message: err.message })
    }
  }

  async getSharedChat(req, res) {
    const token = String(req.params.token || '').toLowerCase()
    res.setHeader('Cache-Control', 'private, no-store')

    if (!/^[a-f0-9]{64}$/.test(token)) {
      return res.status(404).json({ message: 'Chat compartido no encontrado' })
    }

    try {
      const chat = await chatService.getSharedChat(token)
      if (!chat) return res.status(404).json({ message: 'Chat compartido no encontrado' })
      return res.status(200).json({ chat })
    } catch (err) {
      return res.status(500).json({ message: err.message })
    }
  }

  async chat(req, res) {
    const userId = req.user?.sub
    const userMessage = (req.body.prompt || '').trim()
    const requestChatId = Number(req.body.chatId)
    const locale = resolveSupportedLocale(req.body.locale || req.user?.preferred_locale)

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
        locale,
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

  async guestChat(req, res) {
    const userMessage = (req.body.prompt || '').trim()
    const locale = resolveSupportedLocale(req.body.locale)

    if (req.cookies?.[GUEST_TRIAL_COOKIE] === '1') {
      return res.status(403).json({
        code: 'GUEST_TRIAL_USED',
        message: 'Inicia sesion para continuar conversando con Hope'
      })
    }

    if (!userMessage) {
      return res.status(400).json({ error: 'El mensaje es requerido' })
    }

    if (userMessage.length > 2000) {
      return res.status(400).json({ error: 'El mensaje no puede superar 2000 caracteres' })
    }

    res.cookie(GUEST_TRIAL_COOKIE, '1', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: GUEST_TRIAL_MAX_AGE
    })
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')
    res.flushHeaders?.()

    const emit = data => res.write(`data: ${JSON.stringify(data)}\n\n`)
    const heartbeat = setInterval(() => {
      res.write(': keep-alive\n\n')
    }, 15000)

    try {
      await chatService.sendGuestMessage({ userMessage, locale, emit })
    } catch (err) {
      console.error('[ChatController] Error en prueba publica:', err.message)
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
