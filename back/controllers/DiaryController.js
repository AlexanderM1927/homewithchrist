'use strict'
const diaryRepository = require('../repositories/DiaryRepository')

class DiaryController {
  async create(req, res) {
    const title = typeof req.body.title === 'string' ? req.body.title.trim() : ''
    const content = typeof req.body.content === 'string' ? req.body.content.trim() : ''

    if (!content) {
      return res.status(400).json({ message: 'El contenido es requerido' })
    }

    if (title.length > 150) {
      return res.status(400).json({ message: 'El título no puede superar 150 caracteres' })
    }

    try {
      const entry = await diaryRepository.create({
        userId: req.user.sub,
        title,
        content
      })
      return res.status(201).json({ entry })
    } catch (err) {
      return res.status(500).json({ message: err.message })
    }
  }

  async getAll(req, res) {
    try {
      const entries = await diaryRepository.findByUser(req.user.sub)
      return res.status(200).json({ entries })
    } catch (err) {
      return res.status(500).json({ message: err.message })
    }
  }
}

module.exports = new DiaryController()
