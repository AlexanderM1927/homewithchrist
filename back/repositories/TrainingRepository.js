'use strict'
const { Op } = require('sequelize')
const { Topic, Verse, TopicVerse, User } = require('../models')

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

  /**
   * Devuelve versículos activos asociados a los topics cuyo slug esté en la lista,
   * ordenados por peso descendente (mayor relevancia primero).
   * @param {string[]} slugs
   * @param {number} limit
   */
  async findVersesByTopicSlugs(slugs, limit = 12) {
    if (!slugs || slugs.length === 0) return []

    return Verse.findAll({
      where: { is_active: true },
      include: [
        {
          model: Topic,
          where: { slug: { [Op.in]: slugs }, is_active: true },
          through: { attributes: ['weight'] },
          required: true
        }
      ],
      order: [[Topic, TopicVerse, 'weight', 'DESC']],
      limit
    })
  }

  async findTopicSlugsBySearchTerms(terms, limit = 5) {
    if (!terms || terms.length === 0) return []

    const matches = terms.flatMap(term => [
      { name: { [Op.like]: `%${term}%` } },
      { slug: { [Op.like]: `%${term}%` } },
      { description: { [Op.like]: `%${term}%` } }
    ])

    const topics = await Topic.findAll({
      where: {
        is_active: true,
        [Op.or]: matches
      },
      attributes: ['slug'],
      limit
    })

    return topics.map(topic => topic.slug)
  }

  async findVersesBySearchTerms(terms, limit = 6) {
    if (!terms || terms.length === 0) return []

    const matches = terms.flatMap(term => [
      { reference: { [Op.like]: `%${term}%` } },
      { book: { [Op.like]: `%${term}%` } },
      { text: { [Op.like]: `%${term}%` } }
    ])

    return Verse.findAll({
      where: {
        is_active: true,
        [Op.or]: matches
      },
      include: [
        {
          model: Topic,
          where: { is_active: true },
          through: { attributes: ['weight'] },
          required: false
        }
      ],
      order: [[Topic, TopicVerse, 'weight', 'DESC']],
      limit
    })
  }

  /** Lista versículos con sus temas, paginados */
  async findVerses({ page = 1, limit = 20, search = '', createdBy = null } = {}) {
    const offset = (page - 1) * limit
    const trimmedSearch = search.trim()
    const where = { is_active: true }

    if (createdBy) {
      where.created_by = createdBy
    }

    if (trimmedSearch) {
      where[Op.or] = [
        { reference: { [Op.like]: `%${trimmedSearch}%` } },
        { book: { [Op.like]: `%${trimmedSearch}%` } },
        { version: { [Op.like]: `%${trimmedSearch}%` } },
        { text: { [Op.like]: `%${trimmedSearch}%` } },
        { '$Topics.name$': { [Op.like]: `%${trimmedSearch}%` } },
        { '$Topics.slug$': { [Op.like]: `%${trimmedSearch}%` } }
      ]
    }

    const { count, rows } = await Verse.findAndCountAll({
      where,
      include: [{
        model: Topic,
        where: { is_active: true },
        through: { attributes: ['weight', 'notes'] },
        attributes: ['id', 'name', 'slug'],
        required: false
      }, {
        model: User,
        as: 'creator',
        attributes: ['user_id', 'name'],
        required: false
      }],
      ...(trimmedSearch ? { distinct: true, subQuery: false } : {}),
      order: [['createdAt', 'DESC']],
      limit,
      offset
    })
    return { total: count, page, limit, rows }
  }
}

module.exports = new TrainingRepository()
