'use strict'
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const userRepository = require('../repositories/UserRepository')

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
  /**
   * Inicia sesión o crea el usuario si no existe.
   * @param {{ name: string, phone: string, pin: string }} data
   * @returns {Promise<{ accessToken: string, refreshToken: string, user: object }>}
   */
  async login({ name, phone, pin }) {
    let user = await userRepository.findByPhone(phone)

    if (!user) {
      // Crear nuevo usuario con el PIN hasheado como contraseña
      const hashedPin = await bcrypt.hash(pin, SALT_ROUNDS)
      user = await userRepository.create({ name, phone, password: hashedPin })
      // Recargar con Role incluido
      user = await userRepository.findByPhone(phone)
    } else {
      // Verificar contraseña
      const valid = await bcrypt.compare(pin, user.password)
      if (!valid) {
        const err = new Error('Credenciales inválidas')
        err.status = 401
        throw err
      }
    }

    const tokenPayload = {
      sub: user.user_id,
      name: user.name,
      phone: user.phone,
      role: user.Role?.role_name || 'user'
    }

    const accessToken = generateAccessToken(tokenPayload)
    const refreshToken = generateRefreshToken({ sub: user.user_id })

    // Guardar refresh token hasheado en DB
    const hashedRefresh = await bcrypt.hash(refreshToken, 10)
    await userRepository.saveRefreshToken(user.user_id, hashedRefresh)

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.user_id,
        name: user.name,
        phone: user.phone,
        role: user.Role?.role_name || 'user'
      }
    }
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
      const err = new Error('Refresh token inválido o expirado')
      err.status = 401
      throw err
    }

    const user = await userRepository.findById(payload.sub)
    if (!user || !user.refresh_token) {
      const err = new Error('Sesión no encontrada')
      err.status = 401
      throw err
    }

    // Validar que el refresh token coincida con el guardado en DB
    const valid = await bcrypt.compare(refreshToken, user.refresh_token)
    if (!valid) {
      const err = new Error('Refresh token no válido')
      err.status = 401
      throw err
    }

    const tokenPayload = {
      sub: user.user_id,
      name: user.name,
      phone: user.phone,
      role: user.Role?.role_name || 'user'
    }

    const newAccessToken = generateAccessToken(tokenPayload)
    const newRefreshToken = generateRefreshToken({ sub: user.user_id })

    // Rotar refresh token en DB
    const hashedRefresh = await bcrypt.hash(newRefreshToken, 10)
    await userRepository.saveRefreshToken(user.user_id, hashedRefresh)

    return { accessToken: newAccessToken, refreshToken: newRefreshToken }
  }

  /**
   * Cierra sesión: invalida el refresh token en DB y limpia la cookie.
   * @param {string} refreshToken
   */
  async logout(refreshToken) {
    try {
      const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET)
      await userRepository.saveRefreshToken(payload.sub, null)
    } catch {
      // Si el token ya expiró, no hay nada que invalidar
    }
  }
}

module.exports = new AuthService()
