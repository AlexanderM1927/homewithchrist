'use strict'
const trainingReflectionRepository = require('../repositories/TrainingReflectionRepository')

function parsePayload(body) {
  return {
    topicId: Number(body.topic_id),
    message: String(body.message || '').trim()
  }
}

function validatePayload({ topicId, message }) {
  if (!Number.isInteger(topicId) || topicId < 1 || !message) {
    return 'El tema y el mensaje son requeridos'
  }
  if (message.length > 10000) return 'El mensaje no puede superar 10000 caracteres'
  return null
}

class TrainingReflectionController {
  async getAll(req, res) {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 20
    const search = String(req.query.search || '').trim()
    const createdBy = req.query.createdBy ? parseInt(req.query.createdBy) : null

    if (page < 1 || limit < 1 || limit > 100) {
      return res.status(400).json({ message: 'Parametros de paginacion invalidos' })
    }
    if (req.query.createdBy && (!Number.isInteger(createdBy) || createdBy < 1)) {
      return res.status(400).json({ message: 'Parametro createdBy invalido' })
    }

    try {
      const data = await trainingReflectionRepository.findAll({ page, limit, search, createdBy })
      return res.status(200).json(data)
    } catch (err) {
      return res.status(500).json({ message: err.message })
    }
  }

  async create(req, res) {
    const payload = parsePayload(req.body)
    const validationError = validatePayload(payload)
    if (validationError) return res.status(400).json({ message: validationError })

    try {
      const reflection = await trainingReflectionRepository.create({
        ...payload,
        userId: req.user.sub
      })
      if (!reflection) return res.status(404).json({ message: 'El tema seleccionado no existe o esta inactivo' })
      return res.status(201).json(reflection)
    } catch (err) {
      return res.status(500).json({ message: err.message })
    }
  }

  async update(req, res) {
    const id = Number(req.params.id)
    const payload = parsePayload(req.body)
    const validationError = validatePayload(payload)
    if (!Number.isInteger(id) || id < 1 || validationError) {
      return res.status(400).json({ message: validationError || 'Id invalido' })
    }

    try {
      const result = await trainingReflectionRepository.update(id, payload)
      if (result.status === 'not_found') return res.status(404).json({ message: 'Reflexion no encontrada' })
      if (result.status === 'topic_not_found') return res.status(404).json({ message: 'El tema seleccionado no existe o esta inactivo' })
      return res.status(200).json(result.reflection)
    } catch (err) {
      return res.status(500).json({ message: err.message })
    }
  }

  async delete(req, res) {
    const id = Number(req.params.id)
    if (!Number.isInteger(id) || id < 1) return res.status(400).json({ message: 'Id invalido' })

    try {
      const deleted = await trainingReflectionRepository.deleteById(id)
      if (!deleted) return res.status(404).json({ message: 'Reflexion no encontrada' })
      return res.status(204).send()
    } catch (err) {
      return res.status(500).json({ message: err.message })
    }
  }
}

module.exports = new TrainingReflectionController()
