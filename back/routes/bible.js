'use strict'
const { Router } = require('express')
const bibleController = require('../controllers/BibleController')

const router = Router()

router.get('/versions', (req, res) => bibleController.getVersions(req, res))
router.get('/books', (req, res) => bibleController.getBooks(req, res))
router.get('/chapters', (req, res) => bibleController.getChapters(req, res))
router.get('/verses', (req, res) => bibleController.getVerses(req, res))
router.get('/search', (req, res) => bibleController.search(req, res))

module.exports = router
