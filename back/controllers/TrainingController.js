'use strict'
const trainingRepository = require('../repositories/TrainingRepository')
const bibleService = require('../services/BibleService')

class TrainingController {
  /**
   * GET /api/training/topics
   * Devuelve la lista de temas activos para el selector del frontend.
   */
  async getTopics(req, res) {
    try {
      const topics = await trainingRepository.findAllTopics()
      return res.status(200).json(topics)
    } catch (err) {
      return res.status(500).json({ message: err.message })
    }
  }

  /**
   * POST /api/training/verses
   * Crea un versículo y lo asocia a un tema.
   * Body: { topic_id, book, chapter, verse_start, verse_end, reference, text, version, weight, notes }
   */
  async createVerse(req, res) {
    const { topic_id, book, chapter, verse_start, verse_end, reference, text, version, weight, notes } = req.body

    if (!topic_id || !book || !chapter || !verse_start || !text || !version) {
      return res.status(400).json({ message: 'Faltan campos requeridos: topic_id, book, chapter, verse_start, text, version' })
    }

    try {
      const result = await trainingRepository.createVerseWithTopic({
        topic_id,
        book,
        chapter,
        verse_start,
        verse_end,
        reference,
        text,
        version,
        weight,
        notes,
        userId: req.user.sub
      })
      return res.status(201).json(result)
    } catch (err) {
      return res.status(500).json({ message: err.message })
    }
  }

  /**
   * GET /api/training/verses?page=1&limit=20&search=amor
   * Lista versículos con sus temas asociados.
   */
  async getVerses(req, res) {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 20
    const search = (req.query.search || '').trim()
    const createdBy = req.query.createdBy ? parseInt(req.query.createdBy) : null

    if (page < 1 || limit < 1 || limit > 100) {
      return res.status(400).json({ message: 'Parámetros de paginación inválidos' })
    }

    if (req.query.createdBy && (!Number.isInteger(createdBy) || createdBy < 1)) {
      return res.status(400).json({ message: 'Parametro createdBy invalido' })
    }

    try {
      const data = await trainingRepository.findVerses({ page, limit, search, createdBy })
      return res.status(200).json(data)
    } catch (err) {
      return res.status(500).json({ message: err.message })
    }
  }

  async getChapterVerses(req, res) {
    const book = String(req.query.book || '').trim()
    const version = String(req.query.version || '').trim()
    const chapter = Number(req.query.chapter)
    const modifiedBy = req.query.modifiedBy ? Number(req.query.modifiedBy) : null

    if (req.query.modifiedBy && (!Number.isInteger(modifiedBy) || modifiedBy < 1)) {
      return res.status(400).json({ message: 'El administrador seleccionado no es valido' })
    }
    if (!modifiedBy && (!book || !version || !Number.isInteger(chapter) || chapter < 1)) {
      return res.status(400).json({ message: 'Selecciona un administrador o indica libro, version y capitulo' })
    }

    try {
      const verses = await trainingRepository.findChapterVerses({
        book: modifiedBy ? null : book,
        version: modifiedBy ? null : version,
        chapter: modifiedBy ? null : chapter,
        modifiedBy
      })
      return res.status(200).json(verses)
    } catch (err) {
      return res.status(500).json({ message: err.message })
    }
  }

  async updateVerse(req, res) {
    const id = Number(req.params.id)
    const text = String(req.body.text || '').trim()

    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ message: 'Id invalido' })
    }
    if (!text) {
      return res.status(400).json({ message: 'El texto del versiculo es requerido' })
    }
    if (text.length > 700) {
      return res.status(400).json({ message: 'El texto del versiculo no puede superar 700 caracteres' })
    }

    try {
      const verse = await bibleService.updateVerse({
        id,
        text,
        userId: req.user.sub
      })
      if (!verse) return res.status(404).json({ message: 'Versiculo no encontrado' })
      return res.status(200).json(verse)
    } catch (err) {
      return res.status(err.status || 500).json({ message: err.message })
    }
  }

  async createTopicVerses(req, res) {
    const topicId = Number(req.body.topic_id)
    const verseIds = [...new Set((req.body.verse_ids || []).map(Number))]
    const weight = Number(req.body.weight ?? 5)

    if (!Number.isInteger(topicId) || topicId < 1 || verseIds.length === 0 ||
        verseIds.some(id => !Number.isInteger(id) || id < 1)) {
      return res.status(400).json({ message: 'topic_id y verse_ids son requeridos' })
    }
    if (verseIds.length > 200) {
      return res.status(400).json({ message: 'Puedes relacionar hasta 200 versiculos por operacion' })
    }
    if (!Number.isInteger(weight) || weight < 1 || weight > 10) {
      return res.status(400).json({ message: 'El peso debe ser un entero entre 1 y 10' })
    }

    try {
      const result = await trainingRepository.associateVersesWithTopic({
        topicId,
        verseIds,
        weight,
        userId: req.user.sub
      })
      return res.status(201).json(result)
    } catch (err) {
      return res.status(err.status || 500).json({ message: err.message })
    }
  }

  async getTopicVerses(req, res) {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 20
    const search = String(req.query.search || '').trim()
    const createdBy = req.query.createdBy ? parseInt(req.query.createdBy) : null

    if (page < 1 || limit < 1 || limit > 100) {
      return res.status(400).json({ message: 'Parametros de paginacion invalidos' })
    }

    try {
      const data = await trainingRepository.findTopicVerses({ page, limit, search, createdBy })
      return res.status(200).json(data)
    } catch (err) {
      return res.status(500).json({ message: err.message })
    }
  }

  async updateTopicVerse(req, res) {
    const id = Number(req.params.id)
    const weight = Number(req.body.weight)
    if (!Number.isInteger(id) || id < 1 || !Number.isInteger(weight) || weight < 1 || weight > 10) {
      return res.status(400).json({ message: 'Datos invalidos' })
    }

    try {
      const result = await trainingRepository.updateTopicVerse(id, { weight })
      if (!result) return res.status(404).json({ message: 'Relacion no encontrada' })
      return res.status(200).json(result)
    } catch (err) {
      return res.status(500).json({ message: err.message })
    }
  }

  async deleteTopicVerse(req, res) {
    const id = Number(req.params.id)
    if (!Number.isInteger(id) || id < 1) return res.status(400).json({ message: 'Id invalido' })

    try {
      const deleted = await trainingRepository.deleteTopicVerse(id)
      if (!deleted) return res.status(404).json({ message: 'Relacion no encontrada' })
      return res.status(200).json({ deleted: true })
    } catch (err) {
      return res.status(500).json({ message: err.message })
    }
  }
}

module.exports = new TrainingController()
