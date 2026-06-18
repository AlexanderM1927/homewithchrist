'use strict'
const dailyVerseRepository = require('../repositories/DailyVerseRepository')
const { DEFAULT_TIME_ZONE, getZonedDateTime } = require('../utils/zonedDate')

class DailyVerseController {
  async getAll(req, res) {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 20
    const search = (req.query.search || '').trim()
    const createdBy = req.query.createdBy ? parseInt(req.query.createdBy) : null

    if (page < 1 || limit < 1 || limit > 100) {
      return res.status(400).json({ message: 'Parametros de paginacion invalidos' })
    }

    if (req.query.createdBy && (!Number.isInteger(createdBy) || createdBy < 1)) {
      return res.status(400).json({ message: 'Parametro createdBy invalido' })
    }

    try {
      const data = await dailyVerseRepository.findAll({ page, limit, search, createdBy })
      return res.status(200).json(data)
    } catch (err) {
      return res.status(500).json({ message: err.message })
    }
  }

  async getToday(req, res) {
    try {
      const timeZone = process.env.DAILY_VERSE_NOTIFICATION_TIME_ZONE || DEFAULT_TIME_ZONE
      const verse = await dailyVerseRepository.findToday(getZonedDateTime(timeZone).date)

      if (!verse) {
        return res.status(404).json({ message: 'No hay versiculos del dia disponibles' })
      }

      return res.status(200).json(verse)
    } catch (err) {
      return res.status(500).json({ message: err.message })
    }
  }

  async create(req, res) {
    const reference = (req.body.reference || '').trim()
    const text = (req.body.text || '').trim()

    if (!reference || !text) {
      return res.status(400).json({ message: 'La referencia y el texto son requeridos' })
    }

    try {
      const verse = await dailyVerseRepository.create({ reference, text, userId: req.user.sub })
      return res.status(201).json(verse)
    } catch (err) {
      return res.status(500).json({ message: err.message })
    }
  }

  async delete(req, res) {
    const id = parseInt(req.params.id)

    if (!id) {
      return res.status(400).json({ message: 'Versiculo invalido' })
    }

    try {
      const deleted = await dailyVerseRepository.deleteById(id)

      if (!deleted) {
        return res.status(404).json({ message: 'Versiculo no encontrado' })
      }

      return res.status(204).send()
    } catch (err) {
      return res.status(500).json({ message: err.message })
    }
  }
}

module.exports = new DailyVerseController()
