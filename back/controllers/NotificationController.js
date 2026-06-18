'use strict'
const pushNotificationRepository = require('../repositories/PushNotificationRepository')

class NotificationController {
  async registerDevice(req, res) {
    const token = String(req.body?.token || '').trim()
    const platform = String(req.body?.platform || 'android').trim().toLowerCase()

    if (!req.user.sid) {
      return res.status(400).json({ message: 'La sesion no permite registrar notificaciones' })
    }

    if (token.length < 20 || token.length > 512) {
      return res.status(400).json({ message: 'Token de notificaciones invalido' })
    }

    if (!['android', 'ios'].includes(platform)) {
      return res.status(400).json({ message: 'Plataforma de notificaciones invalida' })
    }

    try {
      await pushNotificationRepository.registerToken({
        userId: req.user.sub,
        sessionId: req.user.sid,
        token,
        platform
      })
      return res.status(204).send()
    } catch (error) {
      return res.status(500).json({ message: error.message })
    }
  }

  async unregisterDevice(req, res) {
    const token = String(req.body?.token || '').trim()
    if (!token) {
      return res.status(400).json({ message: 'Token de notificaciones requerido' })
    }

    try {
      await pushNotificationRepository.disableToken({
        userId: req.user.sub,
        token
      })
      return res.status(204).send()
    } catch (error) {
      return res.status(500).json({ message: error.message })
    }
  }
}

module.exports = new NotificationController()
