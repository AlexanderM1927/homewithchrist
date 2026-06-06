'use strict'
const express = require('express')
const fs = require('fs')
const path = require('path')
const multer = require('multer')
const diaryController = require('../controllers/DiaryController')
const authMiddleware = require('../middlewares/authMiddleware')

const router = express.Router()
const uploadDir = path.join(process.cwd(), 'public', 'uploads')
const allowedImageTypes = new Set(['image/jpeg', 'image/png'])
const allowedImageExtensions = new Set(['.jpg', '.jpeg', '.png'])

fs.mkdirSync(uploadDir, { recursive: true })

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase()
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${extension}`
    cb(null, uniqueName)
  }
})

const uploadImage = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase()
    if (!allowedImageTypes.has(file.mimetype) || !allowedImageExtensions.has(extension)) {
      return cb(new Error('Solo se permiten imagenes JPG, JPEG o PNG'))
    }
    cb(null, true)
  }
}).single('image')

function handleImageUpload(req, res, next) {
  uploadImage(req, res, (err) => {
    if (!err) return next()

    if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'La imagen no puede superar 5 MB' })
    }

    return res.status(400).json({ message: err.message || 'No se pudo subir la imagen' })
  })
}

router.get('/', authMiddleware, (req, res) => diaryController.getAll(req, res))
router.get('/:id', authMiddleware, (req, res) => diaryController.getOne(req, res))
router.post('/', authMiddleware, handleImageUpload, (req, res) => diaryController.create(req, res))
router.put('/:id', authMiddleware, handleImageUpload, (req, res) => diaryController.update(req, res))

module.exports = router
