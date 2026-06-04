'use strict'
const authService = require('../services/AuthService')

const REFRESH_COOKIE_NAME = 'refresh_token'
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días en ms
}

class AuthController {
  /**
   * POST /api/auth/login
   * Body: { name, phone, pin }
   */
  async login(req, res) {
    const { name, phone, pin } = req.body

    if (!phone || !pin) {
      return res.status(400).json({ message: 'Teléfono y PIN son requeridos' })
    }
    if (!/^\d{4}$/.test(pin)) {
      return res.status(400).json({ message: 'El PIN debe ser de 4 dígitos' })
    }

    try {
      const { accessToken, refreshToken, user } = await authService.login({ name, phone, pin })

      res.cookie(REFRESH_COOKIE_NAME, refreshToken, COOKIE_OPTIONS)

      return res.status(200).json({ accessToken, user })
    } catch (err) {
      return res.status(err.status || 500).json({ message: err.message })
    }
  }

  /**
   * POST /api/auth/refresh
   * Lee el refresh token desde la cookie HttpOnly
   */
  async refresh(req, res) {
    const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME]

    if (!refreshToken) {
      return res.status(401).json({ message: 'No hay sesión activa' })
    }

    try {
      const { accessToken, refreshToken: newRefreshToken, user } = await authService.refresh(refreshToken)

      res.cookie(REFRESH_COOKIE_NAME, newRefreshToken, COOKIE_OPTIONS)

      return res.status(200).json({ accessToken, user })
    } catch (err) {
      res.clearCookie(REFRESH_COOKIE_NAME)
      return res.status(err.status || 500).json({ message: err.message })
    }
  }

  /**
   * POST /api/auth/logout
   * Invalida el refresh token y limpia la cookie
   */
  async logout(req, res) {
    const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME]

    if (refreshToken) {
      await authService.logout(refreshToken)
    }

    res.clearCookie(REFRESH_COOKIE_NAME)
    return res.status(200).json({ message: 'Sesión cerrada' })
  }
}

module.exports = new AuthController()
