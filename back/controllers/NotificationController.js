'use strict'
const pushNotificationRepository = require('../repositories/PushNotificationRepository')
const userSessionRepository = require('../repositories/UserSessionRepository')

class NotificationController {
  async registerDevice(req, res) {
    const token = String(req.body?.token || '').trim()

    if (!req.user.sid) {
      return res.status(400).json({ message: 'La sesion no permite registrar notificaciones' })
    }

    if (token.length < 20 || token.length > 512) {
      return res.status(400).json({ message: 'Token de notificaciones invalido' })
    }

    try {
      const session = await userSessionRepository.findActiveBySessionId(req.user.sid)

      if (!session || session.user_id !== req.user.sub) {
        return res.status(401).json({ message: 'Sesion no valida' })
      }

      if (!['android', 'ios'].includes(session.platform)) {
        return res.status(403).json({ message: 'Las notificaciones solo estan disponibles en la app movil' })
      }

      await pushNotificationRepository.registerToken({
        userId: req.user.sub,
        sessionId: req.user.sid,
        token,
        platform: session.platform
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
