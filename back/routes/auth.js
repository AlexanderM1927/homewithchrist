'use strict'
const { Router } = require('express')
const authController = require('../controllers/AuthController')
const authMiddleware = require('../middlewares/authMiddleware')
const adminMiddleware = require('../middlewares/adminMiddleware')

const router = Router()

router.post('/login', (req, res) => authController.login(req, res))
router.post('/register', (req, res) => authController.register(req, res))
router.post('/refresh', (req, res) => authController.refresh(req, res))
router.post('/logout', (req, res) => authController.logout(req, res))
router.put('/profile', authMiddleware, (req, res) => authController.updateProfile(req, res))
router.get('/users', authMiddleware, adminMiddleware, (req, res) => authController.getUsers(req, res))
router.put('/users/:id/role', authMiddleware, adminMiddleware, (req, res) => authController.updateUserRole(req, res))
router.put('/users/:id/contact', authMiddleware, adminMiddleware, (req, res) => authController.updateUserContact(req, res))

module.exports = router
