'use strict'
const { Router } = require('express')
const authMiddleware = require('../middlewares/authMiddleware')
const adminMiddleware = require('../middlewares/adminMiddleware')
const dailyVerseController = require('../controllers/DailyVerseController')

const router = Router()

router.get('/today', authMiddleware, (req, res) => dailyVerseController.getToday(req, res))
router.get('/', authMiddleware, adminMiddleware, (req, res) => dailyVerseController.getAll(req, res))
router.post('/', authMiddleware, adminMiddleware, (req, res) => dailyVerseController.create(req, res))
router.delete('/:id', authMiddleware, adminMiddleware, (req, res) => dailyVerseController.delete(req, res))

module.exports = router
