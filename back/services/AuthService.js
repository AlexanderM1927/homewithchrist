'use strict'
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const userRepository = require('../repositories/UserRepository')
const { resolveSupportedLocale } = require('../utils/locale')

const ACCESS_TOKEN_EXPIRY = '15m'
const REFRESH_TOKEN_EXPIRY = '7d'
const SALT_ROUNDS = 12

function generateAccessToken(payload) {
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY })
}

function generateRefreshToken(payload) {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY })
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
}

module.exports = new AuthService()
