'use strict'
const { Router } = require('express')
const authMiddleware = require('../middlewares/authMiddleware')
const notificationController = require('../controllers/NotificationController')

const router = Router()

router.post('/device', authMiddleware, (req, res) => notificationController.registerDevice(req, res))
router.delete('/device', authMiddleware, (req, res) => notificationController.unregisterDevice(req, res))

module.exports = router
