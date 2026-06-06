'use strict'
const fs = require('fs')
const path = require('path')
const diaryRepository = require('../repositories/DiaryRepository')

function deleteUploadedFile(file) {
  if (!file?.filename) return

  const filePath = path.join(process.cwd(), 'public', 'uploads', file.filename)
  fs.unlink(filePath, () => {})
}

class DiaryController {
  async create(req, res) {
    const title = typeof req.body.title === 'string' ? req.body.title.trim() : ''
    const content = typeof req.body.content === 'string' ? req.body.content.trim() : ''
    const imagePath = req.file ? `/uploads/${req.file.filename}` : null

    if (!content) {
      deleteUploadedFile(req.file)
      return res.status(400).json({ message: 'El contenido es requerido' })
    }

    if (title.length > 150) {
      deleteUploadedFile(req.file)
      return res.status(400).json({ message: 'El titulo no puede superar 150 caracteres' })
    }

    try {
      const entry = await diaryRepository.create({
        userId: req.user.sub,
        title,
        content,
        imagePath
      })
      return res.status(201).json({ entry })
    } catch (err) {
      deleteUploadedFile(req.file)
      return res.status(500).json({ message: err.message })
    }
  }

  async getAll(req, res) {
    const requestedPage = Number(req.query.page)
    const page = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1
    const limit = 10
    const offset = (page - 1) * limit

    try {
      const { count, rows: entries } = await diaryRepository.findByUser(
        req.user.sub,
        { limit, offset }
      )

      return res.status(200).json({
        entries,
        pagination: {
          page,
          limit,
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      })
    } catch (err) {
      return res.status(500).json({ message: err.message })
    }
  }

  async getOne(req, res) {
    const entryId = Number(req.params.id)

    if (!Number.isInteger(entryId) || entryId <= 0) {
      return res.status(400).json({ message: 'Entrada invalida' })
    }

    try {
      const entry = await diaryRepository.findByIdAndUser(entryId, req.user.sub)

      if (!entry) {
        return res.status(404).json({ message: 'Entrada no encontrada' })
      }

      return res.status(200).json({ entry })
    } catch (err) {
      return res.status(500).json({ message: err.message })
    }
  }

  async update(req, res) {
    const entryId = Number(req.params.id)
    const title = typeof req.body.title === 'string' ? req.body.title.trim() : ''
    const content = typeof req.body.content === 'string' ? req.body.content.trim() : ''
    const imagePath = req.file ? `/uploads/${req.file.filename}` : undefined

    if (!Number.isInteger(entryId) || entryId <= 0) {
      deleteUploadedFile(req.file)
      return res.status(400).json({ message: 'Entrada invalida' })
    }

    if (!content) {
      deleteUploadedFile(req.file)
      return res.status(400).json({ message: 'El contenido es requerido' })
    }

    if (title.length > 150) {
      deleteUploadedFile(req.file)
      return res.status(400).json({ message: 'El titulo no puede superar 150 caracteres' })
    }

    try {
      const entry = await diaryRepository.updateByIdAndUser(entryId, req.user.sub, {
        title,
        content,
        imagePath
      })

      if (!entry) {
        deleteUploadedFile(req.file)
        return res.status(404).json({ message: 'Entrada no encontrada' })
      }

      return res.status(200).json({ entry })
    } catch (err) {
      deleteUploadedFile(req.file)
      return res.status(500).json({ message: err.message })
    }
  }
}

module.exports = new DiaryController()
