'use strict'
const crypto = require('crypto')
const { Op } = require('sequelize')
const { DailyVerse, User } = require('../models')

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

  getDailyOffset({ count, dateKey, userId = null }) {
    if (!count) return 0

    const seed = userId ? `${dateKey}:${userId}` : dateKey
    const hash = crypto.createHash('sha256').update(seed).digest()
    return hash.readUInt32BE(0) % count
  }

  async countDailyVerses() {
    return DailyVerse.count()
  }

  async listDailyVersesOrdered() {
    return DailyVerse.findAll({
      attributes: ['id', 'reference', 'text'],
      order: [['id', 'ASC']]
    })
  }

  getVerseForUserFromList({ verses, dateKey = new Date().toISOString().slice(0, 10), userId = null }) {
    if (!Array.isArray(verses) || verses.length === 0) return null

    const offset = this.getDailyOffset({
      count: verses.length,
      dateKey,
      userId
    })

    return verses[offset] || null
  }

  async findToday(dateKey = new Date().toISOString().slice(0, 10), userId = null, countOverride = null) {
    const count = Number.isInteger(countOverride) ? countOverride : await this.countDailyVerses()
    if (!count) return null

    const offset = this.getDailyOffset({ count, dateKey, userId })

    return DailyVerse.findOne({
      attributes: ['id', 'reference', 'text'],
      order: [['id', 'ASC']],
      offset
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
