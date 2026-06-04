'use strict'
const { Router } = require('express')
const chatController = require('../controllers/ChatController')

const router = Router()

router.post('/chat', (req, res) => chatController.chat(req, res))

module.exports = router
