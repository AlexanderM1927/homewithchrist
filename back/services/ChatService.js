'use strict'
const chatRepository = require('../repositories/ChatRepository')
const trainingRepository = require('../repositories/TrainingRepository')
const aiProvider = require('./ai')

const SYSTEM_PROMPT = `Te llamas Hope, eres un asistente cristiano de acompanamiento espiritual.
Tus respuestas deben estar basadas en la Biblia, en la vida y ensenanzas de Jesus,
y en principios como amor, perdon, humildad, verdad, misericordia, fe y esperanza.

No inventes doctrina.
No reemplaces a un pastor, psicologo, medico o consejero profesional.
Responde con empatia, claridad y respeto.`

class ChatService {
  async getRecentChats(userId, limit) {
    const chats = await chatRepository.findRecentByUser(userId, limit)

    return chats.map(chat => ({
      chat_id: chat.chat_id,
      title: chat.title,
      updatedAt: chat.updatedAt,
      preview: chat.messages[0]?.content || ''
    }))
  }

  async getChat(userId, chatId) {
    const chat = await chatRepository.findByIdAndUser(chatId, userId, {
      includeMessages: true
    })

    if (!chat) return null

    return {
      chat_id: chat.chat_id,
      title: chat.title,
      updatedAt: chat.updatedAt,
      messages: chat.messages.map(message => ({
        role: message.role,
        content: message.content,
        message_order: message.message_order
      }))
    }
  }

  async sendMessage({ userId, requestChatId, userMessage, history, emit }) {
    const chat = await this._resolveChat(userId, requestChatId, userMessage)
    emit({ chatId: chat.chat_id, title: chat.title })

    let nextOrder = await chatRepository.getNextMessageOrder(chat.chat_id)
    await chatRepository.createMessage(chat.chat_id, 'user', userMessage, nextOrder)
    await chatRepository.touch(chat.chat_id)

    emit({ phase: 'classifying' })
    const topics = await trainingRepository.findAllTopics()
    const matchedSlugs = await aiProvider.classifyTopics(userMessage, topics)

    emit({ phase: 'searching' })
    const verses = matchedSlugs.length > 0
      ? await trainingRepository.findVersesByTopicSlugs(matchedSlugs)
      : []

    emit({ phase: 'generating' })
    const messages = this._buildMessages(userMessage, verses, history)
    const assistantContent = await aiProvider.streamChat(messages, emit)

    if (assistantContent) {
      nextOrder += 1
      await chatRepository.createMessage(
        chat.chat_id,
        'assistant',
        assistantContent,
        nextOrder
      )
      await chatRepository.touch(chat.chat_id)
    }
  }

  async _resolveChat(userId, requestChatId, userMessage) {
    if (Number.isInteger(requestChatId) && requestChatId > 0) {
      const chat = await chatRepository.findByIdAndUser(requestChatId, userId)

      if (!chat) {
        const error = new Error('Chat no encontrado para este usuario')
        error.status = 404
        throw error
      }

      return chat
    }

    const title = await aiProvider.generateTitle(userMessage)
    return chatRepository.create(userId, title)
  }

  _buildMessages(userMessage, verses, history) {
    const messages = [{ role: 'system', content: SYSTEM_PROMPT }]

    for (const turn of history) {
      if ((turn.role === 'user' || turn.role === 'assistant') && turn.content) {
        messages.push({ role: turn.role, content: turn.content })
      }
    }

    let currentContent = userMessage
    if (verses.length > 0) {
      currentContent += '\n\n[Versiculos biblicos relevantes:]\n'
      for (const verse of verses) {
        currentContent += `- ${verse.reference} (${verse.version}): "${verse.text}"\n`
      }
    }

    messages.push({ role: 'user', content: currentContent })
    return messages
  }
}

module.exports = new ChatService()
