'use strict'
const chatRepository = require('../repositories/ChatRepository')
const trainingRepository = require('../repositories/TrainingRepository')
const trainingReflectionRepository = require('../repositories/TrainingReflectionRepository')
const bibleService = require('./BibleService')
const aiProvider = require('./ai')

const REFLECTION_CONTEXT_LIMIT = 6
const REFLECTION_CONTENT_LIMIT = 1500
const FALLBACK_TOPIC_LIMIT = 5
const FALLBACK_VERSE_LIMIT = 6
const SEMANTIC_BIBLE_LIMIT = 8
const BIBLE_CONTEXT_VERSION = process.env.BIBLE_CONTEXT_VERSION || 'CEE'
const SEARCH_TERM_LIMIT = 8
const CHAT_HISTORY_LIMIT = 20

const SEARCH_STOP_WORDS = new Set([
  'como', 'para', 'pero', 'porque', 'cuando', 'donde', 'sobre', 'quiero',
  'necesito', 'ayuda', 'ayudame', 'estoy', 'tengo', 'siento', 'hacer',
  'this', 'that', 'with', 'from', 'about', 'what', 'when', 'where', 'need',
  'help', 'please', 'the', 'and', 'for', 'you', 'are'
])

const SYSTEM_PROMPT = `Te llamas Hope, eres un asistente cristiano de acompanamiento espiritual.
Tus respuestas deben estar basadas en la Biblia, en la vida y ensenanzas de Jesus,
y en principios como amor, perdon, humildad, verdad, misericordia, fe y esperanza.

Prioridad de fuentes:
1. Biblia y versiculos relacionados con temas por administradores.
2. Reflexiones relacionadas con temas y aprobadas por administradores.
3. Historial de conversacion.

No inventes doctrina.
Cuando uses pasajes biblicos del contexto, cita libro, capitulo y versiculo.
No inventes citas biblicas. Si los pasajes recuperados no responden bien la pregunta, dilo con honestidad.
No reemplaces a un pastor, psicologo, medico o consejero profesional.
No uses las notas privadas ni el diario de los usuarios como fuente o contexto.
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

  async sendMessage({ userId, requestChatId, userMessage, emit }) {
    const chat = await this._resolveChat(userId, requestChatId, userMessage)
    emit({ chatId: chat.chat_id, title: chat.title })

    const history = await chatRepository.findRecentMessages(chat.chat_id, CHAT_HISTORY_LIMIT)

    const assistantContent = await this._generateResponse({
      userMessage,
      history,
      emit,
      metadata: { userId }
    })

    if (assistantContent) {
      await chatRepository.createTurn(
        chat.chat_id,
        userMessage,
        assistantContent
      )
    }
  }

  async sendGuestMessage({ userMessage, emit }) {
    await this._generateResponse({
      userMessage,
      history: [],
      emit,
      metadata: { guest: true }
    })
  }

  async _generateResponse({ userMessage, history, emit, metadata }) {

    emit({ phase: 'classifying' })
    const topics = await trainingRepository.findAllTopics()
    const matchedSlugs = await aiProvider.classifyTopics(userMessage, topics)
    const searchTerms = this._extractSearchTerms(userMessage)
    const fallbackSlugs = matchedSlugs.length === 0
      ? await trainingRepository.findTopicSlugsBySearchTerms(searchTerms, FALLBACK_TOPIC_LIMIT)
      : []
    const trainingSlugs = this._uniqueValues([...matchedSlugs, ...fallbackSlugs])

    emit({ phase: 'searching' })
    const semanticVerses = await bibleService.findRelevantVerses(userMessage, {
      limit: SEMANTIC_BIBLE_LIMIT,
      version: BIBLE_CONTEXT_VERSION
    })
    const topicVerses = trainingSlugs.length > 0
      ? await trainingRepository.findVersesByTopicSlugs(trainingSlugs)
      : []
    const fallbackVerses = topicVerses.length === 0
      ? await this._findFallbackBibleVerses(searchTerms, FALLBACK_VERSE_LIMIT)
      : []
    const verses = topicVerses.length > 0
      ? this._uniqueBy([...topicVerses, ...semanticVerses, ...fallbackVerses], 'id')
      : this._uniqueBy([...semanticVerses, ...fallbackVerses], 'id')

    let reflections = await trainingReflectionRepository.findByTopicSlugs(
      trainingSlugs,
      REFLECTION_CONTEXT_LIMIT
    )
    if (reflections.length === 0) {
      reflections = await trainingReflectionRepository.findBySearchTerms(
        searchTerms,
        REFLECTION_CONTEXT_LIMIT
      )
    }

    emit({ phase: 'generating' })
    const messages = this._buildMessages(userMessage, verses, reflections, history)
    return aiProvider.streamChat(messages, emit, metadata)
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

  async _findFallbackBibleVerses(searchTerms, limit) {
    const bibleVerses = await bibleService.findVersesBySearchTerms(searchTerms, {
      limit,
      version: BIBLE_CONTEXT_VERSION
    })
    if (bibleVerses.length > 0) return bibleVerses

    return trainingRepository.findVersesBySearchTerms(searchTerms, limit)
  }

  _buildMessages(userMessage, verses, reflections, history) {
    const messages = [{ role: 'system', content: SYSTEM_PROMPT }]

    for (const turn of history) {
      if ((turn.role === 'user' || turn.role === 'assistant') && turn.content) {
        messages.push({ role: turn.role, content: turn.content })
      }
    }

    let currentContent = userMessage
    if (verses.length > 0) {
      currentContent += '\n\n[FUENTE PRIORITARIA - Pasajes biblicos recuperados para esta pregunta:]\n'
      for (const verse of verses) {
        currentContent += `- ${verse.reference} (${verse.version}): "${verse.text}"\n`
      }
    }

    if (reflections.length > 0) {
      currentContent += '\n\n[FUENTE APROBADA - Reflexiones de entrenamiento relacionadas con esta pregunta:]\n'
      for (const reflection of reflections) {
        const topic = reflection.Topic?.name || reflection.Topic?.slug || 'Tema general'
        const content = reflection.message.slice(0, REFLECTION_CONTENT_LIMIT)
        currentContent += `- Tema ${topic}: ${content}\n`
      }
    }

    messages.push({ role: 'user', content: currentContent })
    return messages
  }

  _extractSearchTerms(text) {
    return this._uniqueValues(
      String(text || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .match(/[a-z0-9]{4,}/g) || []
    )
      .filter(term => !SEARCH_STOP_WORDS.has(term))
      .slice(0, SEARCH_TERM_LIMIT)
  }

  _uniqueValues(values) {
    return [...new Set(values.filter(Boolean))]
  }

  _uniqueBy(items, key) {
    const seen = new Set()
    return items.filter(item => {
      const value = item?.[key]
      if (!value || seen.has(value)) return false
      seen.add(value)
      return true
    })
  }
}

module.exports = new ChatService()
