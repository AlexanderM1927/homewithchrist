'use strict'
const { Chat, ChatMessage } = require('../models')

class ChatRepository {
  async findRecentByUser(userId, limit) {
    return Chat.findAll({
      where: { user_id: userId },
      order: [['updatedAt', 'DESC']],
      limit,
      include: [{
        model: ChatMessage,
        as: 'messages',
        attributes: ['content', 'createdAt'],
        order: [['message_order', 'DESC']],
        limit: 1,
        separate: true
      }]
    })
  }

  async findByIdAndUser(chatId, userId, { includeMessages = false } = {}) {
    const query = {
      where: {
        chat_id: chatId,
        user_id: userId
      }
    }

    if (includeMessages) {
      query.include = [{
        model: ChatMessage,
        as: 'messages',
        attributes: ['role', 'content', 'message_order'],
        order: [['message_order', 'ASC']],
        separate: true
      }]
    }

    return Chat.findOne(query)
  }

  async create(userId, title) {
    return Chat.create({
      user_id: userId,
      title
    })
  }

  async createMessage(chatId, role, content, messageOrder) {
    return ChatMessage.create({
      chat_id: chatId,
      role,
      content,
      message_order: messageOrder
    })
  }

  async getNextMessageOrder(chatId) {
    const latest = await ChatMessage.findOne({
      where: { chat_id: chatId },
      order: [['message_order', 'DESC']],
      attributes: ['message_order']
    })

    return (latest?.message_order || 0) + 1
  }

  async touch(chatId) {
    return Chat.update(
      { updatedAt: new Date() },
      { where: { chat_id: chatId } }
    )
  }
}

module.exports = new ChatRepository()
