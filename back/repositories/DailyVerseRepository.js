'use strict'
const { Op } = require('sequelize')
const { sequelize, DailyVerse } = require('../models')

class DailyVerseRepository {
  async findAll({ page = 1, limit = 20, search = '' } = {}) {
    const offset = (page - 1) * limit
    const trimmedSearch = search.trim()
    const where = {}

    if (trimmedSearch) {
      where[Op.or] = [
        { reference: { [Op.like]: `%${trimmedSearch}%` } },
        { text: { [Op.like]: `%${trimmedSearch}%` } }
      ]
    }

    const { count, rows } = await DailyVerse.findAndCountAll({
      where,
      attributes: ['id', 'reference', 'text', 'createdAt', 'updatedAt'],
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

  async create({ reference, text }) {
    return DailyVerse.create({ reference, text })
  }

  async deleteById(id) {
    return DailyVerse.destroy({ where: { id } })
  }
}

module.exports = new DailyVerseRepository()
