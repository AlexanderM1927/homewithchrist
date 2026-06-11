'use strict'
const bibleRepository = require('../repositories/BibleRepository')

class BibleController {
  async getVersions(req, res) {
    try {
      const versions = await bibleRepository.findVersions()
      return res.status(200).json(versions)
    } catch (err) {
      return res.status(500).json({ message: err.message })
    }
  }

  async getBooks(req, res) {
    try {
      const books = await bibleRepository.findBooks(req.query.version)
      return res.status(200).json(books)
    } catch (err) {
      return res.status(500).json({ message: err.message })
    }
  }

  async getChapters(req, res) {
    const { book, version } = req.query

    if (!book) {
      return res.status(400).json({ message: 'El libro es requerido' })
    }

    try {
      const chapters = await bibleRepository.findChapters({ book, version })
      return res.status(200).json(chapters)
    } catch (err) {
      return res.status(500).json({ message: err.message })
    }
  }

  async getVerses(req, res) {
    const { book, version } = req.query
    const chapter = parseInt(req.query.chapter)

    if (!book || !chapter) {
      return res.status(400).json({ message: 'El libro y el capitulo son requeridos' })
    }

    if (chapter < 1) {
      return res.status(400).json({ message: 'Capitulo invalido' })
    }

    try {
      const verses = await bibleRepository.findChapterVerses({ book, chapter, version })
      return res.status(200).json(verses)
    } catch (err) {
      return res.status(500).json({ message: err.message })
    }
  }

  async search(req, res) {
    const query = (req.query.q || '').trim()
    const limit = parseInt(req.query.limit) || 30

    if (query.length < 2) {
      return res.status(400).json({ message: 'La busqueda debe tener al menos 2 caracteres' })
    }

    if (limit < 1 || limit > 50) {
      return res.status(400).json({ message: 'Limite invalido' })
    }

    try {
      const verses = await bibleRepository.search({ query, version: req.query.version, limit })
      return res.status(200).json(verses)
    } catch (err) {
      return res.status(500).json({ message: err.message })
    }
  }
}

module.exports = new BibleController()
