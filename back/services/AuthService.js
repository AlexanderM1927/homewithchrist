'use strict'
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const userRepository = require('../repositories/UserRepository')
const emailService = require('./EmailService')
const passwordResetEmail = require('./emailTemplates/passwordResetEmail')
const { resolveSupportedLocale } = require('../utils/locale')

const ACCESS_TOKEN_EXPIRY = '15m'
const REFRESH_TOKEN_EXPIRY = '7d'
const PASSWORD_RESET_TOKEN_EXPIRY = '20m'
const SALT_ROUNDS = 12
const SUPPORT_EMAIL = 'hwc@alexanderm.co'

function generateAccessToken(payload) {
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY })
}

function generateRefreshToken(payload) {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY })
}

function getPasswordResetSecret() {
  return process.env.JWT_RESET_SECRET || process.env.JWT_ACCESS_SECRET
}

function passwordFingerprint(password) {
  return crypto.createHash('sha256').update(password).digest('hex')
}

function getFrontendBaseUrl(requestOrigin) {
  if (process.env.FRONTEND_URL) return process.env.FRONTEND_URL
  if (process.env.APP_URL) return process.env.APP_URL

  const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean)

  if (requestOrigin && allowedOrigins.includes(requestOrigin)) return requestOrigin
  return allowedOrigins[0] || 'http://localhost:9000'
}

function buildResetUrl(token, requestOrigin) {
  const url = new URL('/reset-password', getFrontendBaseUrl(requestOrigin))
  url.searchParams.set('token', token)
  return url.toString()
}

class AuthService {
  async issueSession(user) {
    const tokenPayload = {
      sub: user.user_id,
      name: user.name,
      phone: user.phone,
      role: user.Role?.role_name || 'user',
      preferred_locale: user.preferred_locale || 'es-ES'
    }

    const accessToken = generateAccessToken(tokenPayload)
    const refreshToken = generateRefreshToken({ sub: user.user_id })

    const hashedRefresh = await bcrypt.hash(refreshToken, 10)
    await userRepository.saveRefreshToken(user.user_id, hashedRefresh)

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.user_id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.Role?.role_name || 'user',
        preferred_locale: user.preferred_locale || 'es-ES'
      }
    }
  }

  /**
   * Registra un usuario nuevo.
   * @param {{ name: string, email?: string|null, phone: string, pin: string }} data
   * @returns {Promise<{ accessToken: string, refreshToken: string, user: object }>}
   */
  async register({ name, email, phone, pin, preferred_locale }) {
    const existingUser = await userRepository.findByPhone(phone)

    if (existingUser) {
      const err = new Error('Este telefono ya esta registrado. Inicia sesion.')
      err.status = 409
      throw err
    }

    if (email) {
      const existingEmail = await userRepository.findByEmail(email)
      if (existingEmail) {
        const err = new Error('Este correo ya esta registrado.')
        err.status = 409
        throw err
      }
    }

    const hashedPin = await bcrypt.hash(pin, SALT_ROUNDS)
    await userRepository.create({
      name,
      email,
      phone,
      password: hashedPin,
      preferred_locale: resolveSupportedLocale(preferred_locale)
    })
    const user = await userRepository.findByPhone(phone)

    return this.issueSession(user)
  }

  /**
   * Inicia sesion con una cuenta existente.
   * @param {{ phone: string, pin: string }} data
   * @returns {Promise<{ accessToken: string, refreshToken: string, user: object }>}
   */
  async login({ phone, pin, preferred_locale }) {
    let user = await userRepository.findByPhone(phone)

    if (!user) {
      const err = new Error('No encontramos una cuenta con ese telefono. Registrate para continuar.')
      err.status = 404
      throw err
    }

    const valid = await bcrypt.compare(pin, user.password)
    if (!valid) {
      const err = new Error('Credenciales invalidas')
      err.status = 401
      throw err
    }

    if (!user.preferred_locale && preferred_locale) {
      user = await userRepository.updateProfile(user.user_id, {
        preferred_locale: resolveSupportedLocale(preferred_locale)
      })
    }

    return this.issueSession(user)
  }

  /**
   * Rota el access token usando el refresh token de la cookie.
   * @param {string} refreshToken
   * @returns {Promise<{ accessToken: string }>}
   */
  async refresh(refreshToken) {
    let payload
    try {
      payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET)
    } catch {
      const err = new Error('Refresh token invalido o expirado')
      err.status = 401
      throw err
    }

    const user = await userRepository.findById(payload.sub)
    if (!user || !user.refresh_token) {
      const err = new Error('Sesion no encontrada')
      err.status = 401
      throw err
    }

    const valid = await bcrypt.compare(refreshToken, user.refresh_token)
    if (!valid) {
      const err = new Error('Refresh token no valido')
      err.status = 401
      throw err
    }

    return this.issueSession(user)
  }

  /**
   * Cierra sesion: invalida el refresh token en DB y limpia la cookie.
   * @param {string} refreshToken
   */
  async logout(refreshToken) {
    try {
      const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET)
      await userRepository.saveRefreshToken(payload.sub, null)
    } catch {
      // Si el token ya expiro, no hay nada que invalidar
    }
  }

  /**
   * Cambia el PIN del usuario.
   * La opcion requireCurrentPin permite reutilizar este flujo en recuperacion de cuenta.
   * @param {{ userId: number, currentPin?: string, newPin: string, requireCurrentPin?: boolean }} data
   */
  async changePassword({ userId, currentPin, newPin, requireCurrentPin = true }) {
    const user = await userRepository.findById(userId)
    if (!user) {
      const err = new Error('Usuario no encontrado')
      err.status = 404
      throw err
    }

    if (requireCurrentPin) {
      const valid = await bcrypt.compare(currentPin, user.password)
      if (!valid) {
        const err = new Error('La clave actual no es correcta')
        err.status = 401
        throw err
      }
    }

    const hashedPin = await bcrypt.hash(newPin, SALT_ROUNDS)
    await userRepository.updatePassword(userId, hashedPin)
  }

  /**
   * Envia un enlace temporal para recuperar la clave de una cuenta.
   * @param {{ email: string, requestOrigin?: string }} data
   */
  async requestPasswordReset({ email, requestOrigin }) {
    const user = await userRepository.findByEmail(email)

    if (!user) {
      const err = new Error(`El correo no esta vinculado a ninguna cuenta. Si necesitas recuperar una cuenta en especifico, envia un correo a ${SUPPORT_EMAIL}.`)
      err.status = 404
      throw err
    }

    const token = jwt.sign(
      {
        sub: user.user_id,
        purpose: 'password_reset',
        password_fingerprint: passwordFingerprint(user.password)
      },
      getPasswordResetSecret(),
      { expiresIn: PASSWORD_RESET_TOKEN_EXPIRY }
    )

    const resetUrl = buildResetUrl(token, requestOrigin)
    await emailService.sendMail({
      to: user.email,
      ...passwordResetEmail({ user, resetUrl })
    })
  }

  /**
   * Restablece la clave usando el token enviado por correo.
   * @param {{ token: string, newPin: string }} data
   */
  async resetPassword({ token, newPin }) {
    let payload
    try {
      payload = jwt.verify(token, getPasswordResetSecret())
    } catch {
      const err = new Error('El enlace de recuperacion es invalido o expiro')
      err.status = 401
      throw err
    }

    if (payload.purpose !== 'password_reset') {
      const err = new Error('El enlace de recuperacion es invalido')
      err.status = 401
      throw err
    }

    const user = await userRepository.findById(payload.sub)
    if (!user || passwordFingerprint(user.password) !== payload.password_fingerprint) {
      const err = new Error('El enlace de recuperacion ya no es valido')
      err.status = 401
      throw err
    }

    const hashedPin = await bcrypt.hash(newPin, SALT_ROUNDS)
    await userRepository.updatePassword(user.user_id, hashedPin)
    await userRepository.saveRefreshToken(user.user_id, null)
  }
}

module.exports = new AuthService()
