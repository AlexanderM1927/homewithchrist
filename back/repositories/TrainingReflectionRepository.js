'use strict'
const { Op } = require('sequelize')
const { TrainingReflection, Topic, User } = require('../models')

const includeRelations = [{
  model: Topic,
  where: { is_active: true },
  attributes: ['id', 'name', 'slug'],
  required: true
}, {
  model: User,
  as: 'creator',
  attributes: ['user_id', 'name'],
  required: false
}]

class TrainingReflectionRepository {
  async findAll({ page = 1, limit = 20, search = '', createdBy = null } = {}) {
    const where = {}
    const trimmedSearch = search.trim()
    if (createdBy) where.created_by = createdBy
    if (trimmedSearch) {
      where[Op.or] = [
        { message: { [Op.like]: `%${trimmedSearch}%` } },
        { '$Topic.name$': { [Op.like]: `%${trimmedSearch}%` } },
        { '$Topic.slug$': { [Op.like]: `%${trimmedSearch}%` } }
      ]
    }

    const { count, rows } = await TrainingReflection.findAndCountAll({
      where,
      include: includeRelations,
      distinct: true,
      subQuery: false,
      order: [['createdAt', 'DESC'], ['id', 'DESC']],
      limit,
      offset: (page - 1) * limit
    })

    return { total: count, page, limit, rows }
  }

  async create({ topicId, message, userId }) {
    const topic = await Topic.findOne({ where: { id: topicId, is_active: true } })
    if (!topic) return null

    return TrainingReflection.create({
      topic_id: topicId,
      message,
      created_by: userId
    })
  }

  async update(id, { topicId, message }) {
    const reflection = await TrainingReflection.findByPk(id)
    if (!reflection) return { status: 'not_found' }

    const topic = await Topic.findOne({ where: { id: topicId, is_active: true } })
    if (!topic) return { status: 'topic_not_found' }

    await reflection.update({ topic_id: topicId, message })
    return { status: 'updated', reflection }
  }

  async deleteById(id) {
    return TrainingReflection.destroy({ where: { id } })
  }

  async findByTopicSlugs(slugs, limit = 6) {
    if (!slugs?.length) return []

    return TrainingReflection.findAll({
      include: [{
        model: Topic,
        where: { slug: { [Op.in]: slugs }, is_active: true },
        attributes: ['id', 'name', 'slug'],
        required: true
      }],
      order: [['createdAt', 'DESC']],
      limit
    })
  }

  async findBySearchTerms(terms, limit = 4) {
    if (!terms?.length) return []

    return TrainingReflection.findAll({
      where: {
        [Op.or]: terms.map(term => ({ message: { [Op.like]: `%${term}%` } }))
      },
      include: [{
        model: Topic,
        where: { is_active: true },
        attributes: ['id', 'name', 'slug'],
        required: true
      }],
      order: [['createdAt', 'DESC']],
      limit
    })
  }
}

module.exports = new TrainingReflectionRepository()
