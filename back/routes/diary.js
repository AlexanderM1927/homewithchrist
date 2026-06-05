'use strict'
const express = require('express')
const diaryController = require('../controllers/DiaryController')
const authMiddleware = require('../middlewares/authMiddleware')

const router = express.Router()

router.get('/', authMiddleware, (req, res) => diaryController.getAll(req, res))
router.post('/', authMiddleware, (req, res) => diaryController.create(req, res))

module.exports = router
