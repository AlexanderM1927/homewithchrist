'use strict'
const { Router } = require('express')
const authMiddleware = require('../middlewares/authMiddleware')
const adminMiddleware = require('../middlewares/adminMiddleware')
const controller = require('../controllers/TrainingReflectionController')

const router = Router()

router.get('/', authMiddleware, adminMiddleware, (req, res) => controller.getAll(req, res))
router.post('/', authMiddleware, adminMiddleware, (req, res) => controller.create(req, res))
router.put('/:id', authMiddleware, adminMiddleware, (req, res) => controller.update(req, res))
router.delete('/:id', authMiddleware, adminMiddleware, (req, res) => controller.delete(req, res))

module.exports = router
