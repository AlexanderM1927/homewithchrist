'use strict'
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const sharp = require('sharp')
const diaryRepository = require('../repositories/DiaryRepository')

function deleteUploadedFile(file) {
  if (!file?.filename) return

  const filePath = path.join(process.cwd(), 'public', 'uploads', file.filename)
  fs.unlink(filePath, () => {})
}

function deleteStoredImage(imagePath) {
  if (!imagePath) return

  const filename = path.basename(imagePath)
  const filePath = path.join(process.cwd(), 'public', 'uploads', filename)
  fs.unlink(filePath, () => {})
}

async function convertUploadedImageToWebp(file) {
  if (!file?.path || !file.filename) return null

  const outputFilename = `${path.parse(file.filename).name}-optimized.webp`
  const outputPath = path.join(path.dirname(file.path), outputFilename)

  try {
    await sharp(file.path)
      .rotate()
      .resize({
        width: 1600,
        height: 1600,
        fit: 'inside',
        withoutEnlargement: true
      })
      .webp({
        quality: 80
      })
      .toFile(outputPath)
  } catch (err) {
    fs.unlink(outputPath, () => {})
    deleteUploadedFile(file)
    throw new Error('No se pudo procesar la imagen')
  }

  deleteUploadedFile(file)

  file.filename = outputFilename
  file.path = outputPath
  file.mimetype = 'image/webp'

  return `/uploads/${outputFilename}`
}

class DiaryController {
  async create(req, res) {
    const title = typeof req.body.title === 'string' ? req.body.title.trim() : ''
    const content = typeof req.body.content === 'string' ? req.body.content.trim() : ''

    if (!content) {
      deleteUploadedFile(req.file)
      return res.status(400).json({ message: 'El contenido es requerido' })
    }

    if (title.length > 150) {
      deleteUploadedFile(req.file)
      return res.status(400).json({ message: 'El titulo no puede superar 150 caracteres' })
    }

    try {
      const imagePath = req.file ? await convertUploadedImageToWebp(req.file) : null
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

  async share(req, res) {
    const entryId = Number(req.params.id)

    if (!Number.isInteger(entryId) || entryId <= 0) {
      return res.status(400).json({ message: 'Entrada invalida' })
    }

    try {
      const token = crypto.randomBytes(32).toString('hex')
      const entry = await diaryRepository.ensureShareToken(entryId, req.user.sub, token)

      if (!entry) return res.status(404).json({ message: 'Entrada no encontrada' })
      return res.status(200).json({ token: entry.share_token })
    } catch (err) {
      return res.status(500).json({ message: err.message })
    }
  }

  async getShared(req, res) {
    const token = String(req.params.token || '').toLowerCase()
    res.setHeader('Cache-Control', 'private, no-store')

    if (!/^[a-f0-9]{64}$/.test(token)) {
      return res.status(404).json({ message: 'Entrada compartida no encontrada' })
    }

    try {
      const entry = await diaryRepository.findByShareToken(token)
      if (!entry) return res.status(404).json({ message: 'Entrada compartida no encontrada' })
      return res.status(200).json({ entry })
    } catch (err) {
      return res.status(500).json({ message: err.message })
    }
  }

  async update(req, res) {
    const entryId = Number(req.params.id)
    const title = typeof req.body.title === 'string' ? req.body.title.trim() : ''
    const content = typeof req.body.content === 'string' ? req.body.content.trim() : ''

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
      const existingEntry = await diaryRepository.findByIdAndUser(entryId, req.user.sub)

      if (!existingEntry) {
        deleteUploadedFile(req.file)
        return res.status(404).json({ message: 'Entrada no encontrada' })
      }

      const previousImagePath = existingEntry.image_path
      const imagePath = req.file ? await convertUploadedImageToWebp(req.file) : undefined
      const entry = await diaryRepository.updateEntry(existingEntry, {
        title,
        content,
        imagePath
      })

      if (imagePath && previousImagePath && previousImagePath !== imagePath) {
        deleteStoredImage(previousImagePath)
      }

      return res.status(200).json({ entry })
    } catch (err) {
      deleteUploadedFile(req.file)
      return res.status(500).json({ message: err.message })
    }
  }

  async delete(req, res) {
    const entryId = Number(req.params.id)

    if (!Number.isInteger(entryId) || entryId <= 0) {
      return res.status(400).json({ message: 'Entrada invalida' })
    }

    try {
      const entry = await diaryRepository.deleteByIdAndUser(entryId, req.user.sub)

      if (!entry) {
        return res.status(404).json({ message: 'Entrada no encontrada' })
      }

      deleteStoredImage(entry.image_path)
      return res.status(200).json({ message: 'Entrada eliminada correctamente' })
    } catch (err) {
      return res.status(500).json({ message: err.message })
    }
  }
}

module.exports = new DiaryController()
