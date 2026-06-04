'use strict'
const { Router } = require('express')
const authMiddleware = require('../middlewares/authMiddleware')
const trainingController = require('../controllers/TrainingController')

const router = Router()

/** Requiere que el usuario sea admin */
function adminMiddleware(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Acceso denegado: se requiere rol admin' })
  }
  next()
}

// GET /api/training/topics  — cualquier usuario autenticado puede listar temas
router.get('/topics', authMiddleware, (req, res) => trainingController.getTopics(req, res))

// POST /api/training/verses  — solo admin
router.post('/verses', authMiddleware, adminMiddleware, (req, res) => trainingController.createVerse(req, res))

// GET /api/training/verses  — solo admin
router.get('/verses', authMiddleware, adminMiddleware, (req, res) => trainingController.getVerses(req, res))

module.exports = router
