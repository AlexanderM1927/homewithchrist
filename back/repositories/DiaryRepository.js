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

  async findByUser(userId, { limit, offset }) {
    return DiaryEntry.findAndCountAll({
      where: { user_id: userId },
      order: [
        ['createdAt', 'DESC'],
        ['diary_entry_id', 'DESC']
      ],
      limit,
      offset
    })
  }

  async findByIdAndUser(entryId, userId) {
    return DiaryEntry.findOne({
      where: {
        diary_entry_id: entryId,
        user_id: userId
      }
    })
  }

  async updateByIdAndUser(entryId, userId, { title, content }) {
    const entry = await this.findByIdAndUser(entryId, userId)

    if (!entry) {
      return null
    }

    entry.title = title || null
    entry.content = content

    return entry.save()
  }

  async findRecentForContext(userId, limit = 20) {
    return DiaryEntry.findAll({
      where: { user_id: userId },
      attributes: ['diary_entry_id', 'title', 'content', 'createdAt'],
      order: [
        ['createdAt', 'DESC'],
        ['diary_entry_id', 'DESC']
      ],
      limit
    })
  }
}

module.exports = new DiaryRepository()
