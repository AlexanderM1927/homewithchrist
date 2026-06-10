'use strict'
const trainingRepository = require('../repositories/TrainingRepository')

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

    if (page < 1 || limit < 1 || limit > 100) {
      return res.status(400).json({ message: 'Parámetros de paginación inválidos' })
    }

    try {
      const data = await trainingRepository.findVerses({ page, limit, search })
      return res.status(200).json(data)
    } catch (err) {
      return res.status(500).json({ message: err.message })
    }
  }
}

module.exports = new TrainingController()
