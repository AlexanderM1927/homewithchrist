'use strict'
const { Topic, Verse, TopicVerse } = require('../models')

class TrainingRepository {
  /** Devuelve todos los temas activos */
  async findAllTopics() {
    return Topic.findAll({
      where: { is_active: true },
      order: [['name', 'ASC']]
    })
  }

  /**
   * Crea un versículo y lo asocia al tema indicado en una sola transacción.
   * @param {{ book, chapter, verse_start, verse_end, reference, text, version, topic_id, weight, notes, userId }} data
   */
  async createVerseWithTopic({ book, chapter, verse_start, verse_end, reference, text, version, topic_id, weight, notes, userId }) {
    const verse = await Verse.create({
      book,
      chapter,
      verse_start,
      verse_end: verse_end || null,
      reference,
      text,
      version,
      is_active: true,
      created_by: userId,
      updated_by: userId
    })

    const topicVerse = await TopicVerse.create({
      topic_id,
      verse_id: verse.id,
      weight: weight ?? 5,
      notes: notes || null,
      created_by: userId
    })

    return { verse, topicVerse }
  }

  /** Lista versículos con sus temas, paginados */
  async findVerses({ page = 1, limit = 20 } = {}) {
    const offset = (page - 1) * limit
    const { count, rows } = await Verse.findAndCountAll({
      where: { is_active: true },
      include: [{ model: Topic, through: { attributes: ['weight', 'notes'] }, attributes: ['id', 'name', 'slug'] }],
      order: [['createdAt', 'DESC']],
      limit,
      offset
    })
    return { total: count, page, limit, rows }
  }
}

module.exports = new TrainingRepository()
