'use strict'
const { Op } = require('sequelize')
const { DiaryEntry } = require('../models')

class DiaryRepository {
  async create({ userId, title, content, imagePath }) {
    return DiaryEntry.create({
      user_id: userId,
      title: title || null,
      content,
      image_path: imagePath || null
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

  async ensureShareToken(entryId, userId, token) {
    const entry = await this.findByIdAndUser(entryId, userId)
    if (!entry || entry.share_token) return entry

    await DiaryEntry.update(
      { share_token: token, shared_at: new Date() },
      { where: { diary_entry_id: entryId, user_id: userId, share_token: null } }
    )

    return this.findByIdAndUser(entryId, userId)
  }

  async findByShareToken(token) {
    return DiaryEntry.findOne({
      where: { share_token: token },
      attributes: ['title', 'content', 'image_path', 'createdAt', 'updatedAt']
    })
  }

  async updateByIdAndUser(entryId, userId, { title, content, imagePath }) {
    const entry = await this.findByIdAndUser(entryId, userId)

    if (!entry) {
      return null
    }

    return this.updateEntry(entry, { title, content, imagePath })
  }

  async updateEntry(entry, { title, content, imagePath }) {
    entry.title = title || null
    entry.content = content
    if (imagePath !== undefined) {
      entry.image_path = imagePath || null
    }

    return entry.save()
  }

  async deleteByIdAndUser(entryId, userId) {
    const entry = await this.findByIdAndUser(entryId, userId)

    if (!entry) {
      return null
    }

    await entry.destroy()
    return entry
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

  async findBySearchTermsForContext(userId, terms, limit = 20) {
    if (!terms || terms.length === 0) return []

    const matches = terms.flatMap(term => [
      { title: { [Op.like]: `%${term}%` } },
      { content: { [Op.like]: `%${term}%` } }
    ])

    return DiaryEntry.findAll({
      where: {
        user_id: userId,
        [Op.or]: matches
      },
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
