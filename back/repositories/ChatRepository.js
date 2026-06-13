'use strict'
const { sequelize, Chat, ChatMessage } = require('../models')

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

  async ensureShareToken(chatId, userId, token) {
    const chat = await this.findByIdAndUser(chatId, userId)
    if (!chat || chat.share_token) return chat

    await Chat.update(
      { share_token: token, shared_at: new Date() },
      { where: { chat_id: chatId, user_id: userId, share_token: null } }
    )

    return this.findByIdAndUser(chatId, userId)
  }

  async findByShareToken(token) {
    return Chat.findOne({
      where: { share_token: token },
      include: [{
        model: ChatMessage,
        as: 'messages',
        attributes: ['role', 'content', 'message_order'],
        order: [['message_order', 'ASC']],
        separate: true
      }]
    })
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

  async findRecentMessages(chatId, limit = 20) {
    const messages = await ChatMessage.findAll({
      where: { chat_id: chatId },
      attributes: ['role', 'content', 'message_order'],
      order: [['message_order', 'DESC']],
      limit: limit + 1
    })

    const chronological = messages.reverse()
    const completeTurns = []

    for (let index = 0; index < chronological.length - 1; index += 1) {
      const userMessage = chronological[index]
      const assistantMessage = chronological[index + 1]

      if (userMessage.role === 'user' && assistantMessage.role === 'assistant') {
        completeTurns.push(userMessage, assistantMessage)
        index += 1
      }
    }

    return completeTurns.slice(-limit)
  }

  async createTurn(chatId, userContent, assistantContent) {
    return sequelize.transaction(async transaction => {
      const chat = await Chat.findByPk(chatId, {
        transaction,
        lock: transaction.LOCK.UPDATE
      })
      if (!chat) {
        const error = new Error('Chat no encontrado')
        error.status = 404
        throw error
      }

      const latestOrder = await ChatMessage.max('message_order', {
        where: { chat_id: chatId },
        transaction
      })
      const firstMessageOrder = Number(latestOrder || 0) + 1

      await ChatMessage.bulkCreate([{
        chat_id: chatId,
        role: 'user',
        content: userContent,
        message_order: firstMessageOrder
      }, {
        chat_id: chatId,
        role: 'assistant',
        content: assistantContent,
        message_order: firstMessageOrder + 1
      }], { transaction })

      await chat.update({ updatedAt: new Date() }, { transaction })
    })
  }

  async touch(chatId) {
    return Chat.update(
      { updatedAt: new Date() },
      { where: { chat_id: chatId } }
    )
  }
}

module.exports = new ChatRepository()
