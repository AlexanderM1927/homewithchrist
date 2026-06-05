'use strict'
const { DiaryEntry } = require('../models')

class DiaryRepository {
  async create({ userId, title, content }) {
    return DiaryEntry.create({
      user_id: userId,
      title: title || null,
      content
    })
  }

  async findByUser(userId) {
    return DiaryEntry.findAll({
      where: { user_id: userId },
      order: [['createdAt', 'DESC']]
    })
  }
}

module.exports = new DiaryRepository()
