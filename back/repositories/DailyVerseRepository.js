'use strict'
const { Op } = require('sequelize')
const { sequelize, DailyVerse, User } = require('../models')

class DailyVerseRepository {
  async findAll({ page = 1, limit = 20, search = '', createdBy = null } = {}) {
    const offset = (page - 1) * limit
    const trimmedSearch = search.trim()
    const where = {}

    if (createdBy) {
      where.created_by = createdBy
    }

    if (trimmedSearch) {
      where[Op.or] = [
        { reference: { [Op.like]: `%${trimmedSearch}%` } },
        { text: { [Op.like]: `%${trimmedSearch}%` } }
      ]
    }

    const { count, rows } = await DailyVerse.findAndCountAll({
      where,
      attributes: ['id', 'reference', 'text', 'created_by', 'createdAt', 'updatedAt'],
      include: [{
        model: User,
        as: 'creator',
        attributes: ['user_id', 'name'],
        required: false
      }],
      order: [['createdAt', 'DESC'], ['id', 'DESC']],
      limit,
      offset
    })

    return { total: count, page, limit, rows }
  }

  async findToday() {
    return DailyVerse.findOne({
      attributes: ['id', 'reference', 'text'],
      order: sequelize.random()
    })
  }

  async create({ reference, text, userId }) {
    return DailyVerse.create({ reference, text, created_by: userId })
  }

  async deleteById(id) {
    return DailyVerse.destroy({ where: { id } })
  }
}

module.exports = new DailyVerseRepository()
