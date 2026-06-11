'use strict'
const { Op, fn, col } = require('sequelize')
const { Verse } = require('../models')

const verseAttributes = ['id', 'book', 'chapter', 'verse_start', 'verse_end', 'reference', 'text', 'version']
const canonicalBooks = [
  ['genesis', 'génesis'],
  ['exodo', 'éxodo', 'exodus'],
  ['levitico', 'levítico', 'leviticus'],
  ['numeros', 'números', 'numbers'],
  ['deuteronomio', 'deuteronomy'],
  ['josue', 'josué', 'joshua'],
  ['jueces', 'judges'],
  ['rut', 'ruth'],
  ['1 samuel', 'i samuel'],
  ['2 samuel', 'ii samuel'],
  ['1 reyes', 'i reyes', '1 kings'],
  ['2 reyes', 'ii reyes', '2 kings'],
  ['1 cronicas', '1 crónicas', 'i cronicas', 'i crónicas', '1 chronicles'],
  ['2 cronicas', '2 crónicas', 'ii cronicas', 'ii crónicas', '2 chronicles'],
  ['esdras', 'ezra'],
  ['nehemias', 'nehemías', 'nehemiah'],
  ['ester', 'esther'],
  ['job'],
  ['salmos', 'psalms'],
  ['proverbios', 'proverbs'],
  ['eclesiastes', 'eclesiastés', 'ecclesiastes'],
  ['cantares', 'song of songs', 'song of solomon'],
  ['isaias', 'isaías', 'isaiah'],
  ['jeremias', 'jeremías', 'jeremiah'],
  ['lamentaciones', 'lamentations'],
  ['ezequiel', 'ezekiel'],
  ['daniel'],
  ['oseas', 'hosea'],
  ['joel'],
  ['amos', 'amós'],
  ['abdias', 'abdías', 'obadiah'],
  ['jonas', 'jonás', 'jonah'],
  ['miqueas', 'micah'],
  ['nahum', 'naum'],
  ['habacuc', 'habakkuk'],
  ['sofonias', 'sofonías', 'zephaniah'],
  ['hageo', 'haggai'],
  ['zacarias', 'zacarías', 'zechariah'],
  ['malaquias', 'malaquías', 'malachi'],
  ['mateo', 'matthew'],
  ['marcos', 'mark'],
  ['lucas', 'luke'],
  ['juan', 'john'],
  ['hechos', 'acts'],
  ['romanos', 'romans'],
  ['1 corintios', 'i corintios', '1 corinthians'],
  ['2 corintios', 'ii corintios', '2 corinthians'],
  ['galatas', 'gálatas', 'galatians'],
  ['efesios', 'ephesians'],
  ['filipenses', 'philippians'],
  ['colosenses', 'colossians'],
  ['1 tesalonicenses', 'i tesalonicenses', '1 thessalonians'],
  ['2 tesalonicenses', 'ii tesalonicenses', '2 thessalonians'],
  ['1 timoteo', 'i timoteo', '1 timothy'],
  ['2 timoteo', 'ii timoteo', '2 timothy'],
  ['tito', 'titus'],
  ['filemon', 'filemón', 'philemon'],
  ['hebreos', 'hebrews'],
  ['santiago', 'james'],
  ['1 pedro', 'i pedro', '1 peter'],
  ['2 pedro', 'ii pedro', '2 peter'],
  ['1 juan', 'i juan', '1 john'],
  ['2 juan', 'ii juan', '2 john'],
  ['3 juan', 'iii juan', '3 john'],
  ['judas', 'jude'],
  ['apocalipsis', 'revelation']
]
const bookOrder = new Map(canonicalBooks.flatMap((aliases, index) => aliases.map(alias => [normalizeBook(alias), index])))

class BibleRepository {
  async findVersions() {
    const rows = await Verse.findAll({
      where: { is_active: true },
      attributes: [
        'version',
        [fn('COUNT', col('id')), 'verseCount']
      ],
      group: ['version'],
      raw: true
    })

    return rows
      .filter(row => row.version)
      .sort((a, b) => Number(b.verseCount) - Number(a.verseCount) || a.version.localeCompare(b.version))
      .map(row => row.version)
  }

  async findBooks(version) {
    const rows = await Verse.findAll({
      where: this.buildBaseWhere(version),
      attributes: [
        'book',
        [fn('MIN', col('id')), 'firstVerseId']
      ],
      group: ['book'],
      order: [[fn('MIN', col('id')), 'ASC']],
      raw: true
    })

    return rows
      .sort((a, b) => {
        const aOrder = getBookOrder(a.book)
        const bOrder = getBookOrder(b.book)
        if (aOrder !== bOrder) return aOrder - bOrder
        return Number(a.firstVerseId) - Number(b.firstVerseId)
      })
      .map(row => row.book)
  }

  async findChapters({ book, version }) {
    const rows = await Verse.findAll({
      where: {
        ...this.buildBaseWhere(version),
        book
      },
      attributes: ['chapter'],
      group: ['chapter'],
      order: [['chapter', 'ASC']],
      raw: true
    })

    return rows.map(row => row.chapter)
  }

  async findChapterVerses({ book, chapter, version }) {
    return Verse.findAll({
      where: {
        ...this.buildBaseWhere(version),
        book,
        chapter
      },
      attributes: verseAttributes,
      order: [['verse_start', 'ASC'], ['id', 'ASC']]
    })
  }

  async search({ query, version, limit = 30 }) {
    const trimmedQuery = query.trim()

    return Verse.findAll({
      where: {
        ...this.buildBaseWhere(version),
        [Op.or]: [
          { reference: { [Op.like]: `%${trimmedQuery}%` } },
          { book: { [Op.like]: `%${trimmedQuery}%` } },
          { text: { [Op.like]: `%${trimmedQuery}%` } }
        ]
      },
      attributes: verseAttributes,
      order: [['book', 'ASC'], ['chapter', 'ASC'], ['verse_start', 'ASC']],
      limit
    })
  }

  buildBaseWhere(version) {
    return {
      is_active: true,
      ...(version ? { version } : {})
    }
  }
}

function normalizeBook(book) {
  return book
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

function getBookOrder(book) {
  return bookOrder.get(normalizeBook(book)) ?? Number.MAX_SAFE_INTEGER
}

module.exports = new BibleRepository()
