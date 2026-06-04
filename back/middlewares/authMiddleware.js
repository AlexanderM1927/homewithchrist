'use strict'
const jwt = require('jsonwebtoken')

/**
 * Middleware que verifica el Access Token en el header Authorization.
 * Uso: router.get('/ruta-protegida', authMiddleware, controller)
 */
function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization']
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token de acceso requerido' })
  }

  const token = authHeader.slice(7)
  try {
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET)
    req.user = payload
    next()
  } catch {
    return res.status(401).json({ message: 'Token inválido o expirado' })
  }
}

module.exports = authMiddleware
