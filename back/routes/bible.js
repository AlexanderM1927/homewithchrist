'use strict'
const { Router } = require('express')
const authMiddleware = require('../middlewares/authMiddleware')
const bibleController = require('../controllers/BibleController')

const router = Router()

router.get('/versions', authMiddleware, (req, res) => bibleController.getVersions(req, res))
router.get('/books', authMiddleware, (req, res) => bibleController.getBooks(req, res))
router.get('/chapters', authMiddleware, (req, res) => bibleController.getChapters(req, res))
router.get('/verses', authMiddleware, (req, res) => bibleController.getVerses(req, res))
router.get('/search', authMiddleware, (req, res) => bibleController.search(req, res))

module.exports = router
