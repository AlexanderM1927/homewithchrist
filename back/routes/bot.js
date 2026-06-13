'use strict'
const { Router } = require('express')
const chatController = require('../controllers/ChatController')
const authMiddleware = require('../middlewares/authMiddleware')

const router = Router()

router.post('/guest-chat', (req, res) => chatController.guestChat(req, res))
router.post('/chat', authMiddleware, (req, res) => chatController.chat(req, res))
router.get('/chats', authMiddleware, (req, res) => chatController.getRecentChats(req, res))
router.get('/shared-chats/:token', (req, res) => chatController.getSharedChat(req, res))
router.post('/chats/:chatId/share', authMiddleware, (req, res) => chatController.shareChat(req, res))
router.get('/chats/:chatId', authMiddleware, (req, res) => chatController.getChat(req, res))

module.exports = router
