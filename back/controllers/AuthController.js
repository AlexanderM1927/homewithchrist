'use strict'
const authService = require('../services/AuthService')
const userRepository = require('../repositories/UserRepository')
const { resolveSupportedLocale } = require('../utils/locale')

const REFRESH_COOKIE_NAME = 'refresh_token'
const isProduction = process.env.NODE_ENV === 'production'
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días en ms
}
const CLEAR_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: COOKIE_OPTIONS.secure,
  sameSite: COOKIE_OPTIONS.sameSite
}

class AuthController {
  /**
   * POST /api/auth/login
   * Body: { phone, pin }
   */
  async login(req, res) {
    const { phone, pin, preferred_locale } = req.body

    if (!phone || !pin) {
      return res.status(400).json({ message: 'Teléfono y PIN son requeridos' })
    }
    if (!/^\d{4}$/.test(pin)) {
      return res.status(400).json({ message: 'El PIN debe ser de 4 dígitos' })
    }

    try {
      const { accessToken, refreshToken, user } = await authService.login({ phone, pin, preferred_locale })

      res.cookie(REFRESH_COOKIE_NAME, refreshToken, COOKIE_OPTIONS)

      return res.status(200).json({ accessToken, user })
    } catch (err) {
      return res.status(err.status || 500).json({ message: err.message })
    }
  }

  /**
   * POST /api/auth/register
   * Body: { name, email?, phone, pin }
   */
  async register(req, res) {
    const { name, email, phone, pin, preferred_locale } = req.body

    if (!name || !phone || !pin) {
      return res.status(400).json({ message: 'Nombre, teléfono y PIN son requeridos' })
    }
    if (name.trim().length < 2) {
      return res.status(400).json({ message: 'El nombre debe tener al menos 2 caracteres' })
    }
    if (!/^\d{4}$/.test(pin)) {
      return res.status(400).json({ message: 'El PIN debe ser de 4 dígitos' })
    }

    if (email && !/.+@.+\..+/.test(email)) {
      return res.status(400).json({ message: 'Correo invalido' })
    }

    try {
      const { accessToken, refreshToken, user } = await authService.register({
        name: name.trim(),
        email: email?.trim() || null,
        phone,
        pin,
        preferred_locale
      })

      res.cookie(REFRESH_COOKIE_NAME, refreshToken, COOKIE_OPTIONS)

      return res.status(201).json({ accessToken, user })
    } catch (err) {
      if (err.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({ message: 'El correo o teléfono ya está en uso' })
      }
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
      res.clearCookie(REFRESH_COOKIE_NAME, CLEAR_COOKIE_OPTIONS)
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

    res.clearCookie(REFRESH_COOKIE_NAME, CLEAR_COOKIE_OPTIONS)
    return res.status(200).json({ message: 'Sesión cerrada' })
  }

  /**
   * GET /api/auth/users  (solo admin)
   * Devuelve la lista de todos los usuarios con su rol.
   */
  async getUsers (req, res) {
    try {
      const users = await userRepository.findAll()
      return res.status(200).json({
        users: users.map(u => ({
          id: u.user_id,
          name: u.name,
          phone: u.phone,
          email: u.email,
          preferred_locale: u.preferred_locale,
          role: u.Role?.role_name,
          role_id: u.Role?.role_id
        }))
      })
    } catch (err) {
      return res.status(500).json({ message: err.message })
    }
  }

  /**
   * PUT /api/auth/users/:id/role  (solo admin)
   * Body: { role_id: number }
   */
  async updateUserRole (req, res) {
    const userId = req.params.id
    const { role_id } = req.body

    if (!role_id) {
      return res.status(400).json({ message: 'role_id es requerido' })
    }

    try {
      const user = await userRepository.updateRole(userId, role_id)
      if (!user) return res.status(404).json({ message: 'Usuario no encontrado' })
      return res.status(200).json({
        user: {
          id: user.user_id,
          name: user.name,
          role: user.Role?.role_name,
          role_id: user.Role?.role_id
        }
      })
    } catch (err) {
      return res.status(500).json({ message: err.message })
    }
  }

  /**
   * PUT /api/auth/users/:id/contact  (solo admin)
   * Actualiza correo y/o teléfono de un usuario.
   * Body: { email?, phone? }
   */
  async updateUserContact (req, res) {
    const userId = req.params.id
    const { email, phone } = req.body

    if (email === undefined && phone === undefined) {
      return res.status(400).json({ message: 'No se enviaron campos para actualizar' })
    }

    if (phone !== undefined && !/^\+?[\d\s\-()]{7,20}$/.test(phone)) {
      return res.status(400).json({ message: 'Número de teléfono inválido' })
    }

    try {
      const updatedUser = await userRepository.updateProfile(userId, { email, phone })
      if (!updatedUser) {
        return res.status(404).json({ message: 'Usuario no encontrado' })
      }

      return res.status(200).json({
        user: {
          id: updatedUser.user_id,
          email: updatedUser.email,
          phone: updatedUser.phone,
          preferred_locale: updatedUser.preferred_locale,
          role: updatedUser.Role?.role_name,
          role_id: updatedUser.Role?.role_id
        }
      })
    } catch (err) {
      if (err.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({ message: 'El correo o teléfono ya está en uso' })
      }
      return res.status(500).json({ message: err.message })
    }
  }

  /**
   * PUT /api/auth/profile
   * Actualiza nombre, email y teléfono del usuario autenticado.
   * Body: { name?, email?, phone? }
   */
  async updateProfile(req, res) {
    const userId = req.user.sub
    const { name, email, phone, preferred_locale } = req.body

    if (!name && !email && phone === undefined && preferred_locale === undefined) {
      return res.status(400).json({ message: 'No se enviaron campos para actualizar' })
    }

    // Validar teléfono si se envía
    if (phone !== undefined && !/^\+?[\d\s\-()]{7,20}$/.test(phone)) {
      return res.status(400).json({ message: 'Número de teléfono inválido' })
    }

    try {
      const updatedUser = await userRepository.updateProfile(userId, {
        name,
        email,
        phone,
        preferred_locale: preferred_locale !== undefined
          ? resolveSupportedLocale(preferred_locale)
          : undefined
      })
      return res.status(200).json({
        user: {
          id: updatedUser.user_id,
          name: updatedUser.name,
          email: updatedUser.email,
          phone: updatedUser.phone,
          preferred_locale: updatedUser.preferred_locale,
          role: updatedUser.Role?.role_name
        }
      })
    } catch (err) {
      // Violación de unique en email o phone
      if (err.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({ message: 'El correo o teléfono ya está en uso' })
      }
      return res.status(500).json({ message: err.message })
    }
  }

  /**
   * PUT /api/auth/password
   * Cambia el PIN del usuario autenticado.
   * Body: { currentPin, newPin }
   */
  async changePassword(req, res) {
    const userId = req.user.sub
    const { currentPin, newPin } = req.body

    if (!currentPin || !newPin) {
      return res.status(400).json({ message: 'La clave actual y la nueva clave son requeridas' })
    }
    if (!/^\d{4}$/.test(currentPin) || !/^\d{4}$/.test(newPin)) {
      return res.status(400).json({ message: 'La clave debe ser de 4 digitos' })
    }
    if (currentPin === newPin) {
      return res.status(400).json({ message: 'La nueva clave debe ser diferente a la actual' })
    }

    try {
      await authService.changePassword({ userId, currentPin, newPin })
      return res.status(200).json({ message: 'Clave actualizada correctamente' })
    } catch (err) {
      return res.status(err.status || 500).json({ message: err.message })
    }
  }
}

module.exports = new AuthController()
