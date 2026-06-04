'use strict'
const { Router } = require('express')
const authController = require('../controllers/AuthController')

const router = Router()

router.post('/login', (req, res) => authController.login(req, res))
router.post('/refresh', (req, res) => authController.refresh(req, res))
router.post('/logout', (req, res) => authController.logout(req, res))

module.exports = router
