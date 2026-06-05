'use strict'

/**
 * Middleware que verifica que el usuario autenticado tenga el rol 'admin'.
 * Debe usarse después de authMiddleware (que pone req.user en el request).
 */
function adminMiddleware (req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Acceso denegado: se requiere rol administrador' })
  }
  next()
}

module.exports = adminMiddleware
