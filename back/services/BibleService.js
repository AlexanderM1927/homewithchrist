'use strict'
const crypto = require('crypto')
const { Op } = require('sequelize')
const { sequelize, Verse, TopicVerse, VerseEmbedding, DailyVerse, User } = require('../models')
const aiProvider = require('./ai')
const { parseRvr1960Pdf } = require('./bible/Rvr1960PdfParser')
const { parseJerusalemPdf } = require('./bible/JerusalemPdfParser')

const DEFAULT_SEMANTIC_LIMIT = 8
const DEFAULT_EMBEDDING_BATCH_SIZE = 50
const SUPPORTED_BOOKS = [
  'Genesis', 'Exodo', 'Levitico', 'Numeros', 'Deuteronomio', 'Josue', 'Jueces', 'Rut',
  '1 Samuel', '2 Samuel', '1 Reyes', '2 Reyes', '1 Cronicas', '2 Cronicas', 'Esdras',
  'Nehemias', 'Tobias', 'Judit', 'Ester', '1 Macabeos', '2 Macabeos', 'Job', 'Salmos',
  'Proverbios', 'Eclesiastes', 'Cantar de los Cantares', 'Sabiduria', 'Eclesiastico',
  'Isaias', 'Jeremias', 'Lamentaciones', 'Baruc', 'Ezequiel', 'Daniel', 'Oseas', 'Joel',
  'Amos', 'Abdias', 'Jonas', 'Miqueas', 'Nahum', 'Habacuc', 'Sofonias', 'Ageo', 'Zacarias',
  'Malaquias', 'Mateo', 'Marcos', 'Lucas', 'Juan', 'Hechos', 'Romanos', '1 Corintios',
  '2 Corintios', 'Galatas', 'Efesios', 'Filipenses', 'Colosenses', '1 Tesalonicenses',
  '2 Tesalonicenses', '1 Timoteo', '2 Timoteo', 'Tito', 'Filemon', 'Hebreos', 'Santiago',
  '1 Pedro', '2 Pedro', '1 Juan', '2 Juan', '3 Juan', 'Judas', 'Apocalipsis'
]

const BOOK_ALIASES = new Map(SUPPORTED_BOOKS.map(book => [normalizeText(book), book]))
const BOOK_ABBREVIATIONS = new Map(Object.entries({
  Abd: 'Abdias',
  Ag: 'Ageo',
  Am: 'Amos',
  Ap: 'Apocalipsis',
  Bar: 'Baruc',
  Cant: 'Cantar de los Cantares',
  Col: 'Colosenses',
  Dan: 'Daniel',
  Dt: 'Deuteronomio',
  Ecl: 'Eclesiastes',
  Eclo: 'Eclesiastico',
  Ef: 'Efesios',
  Esd: 'Esdras',
  Est: 'Ester',
  Ex: 'Exodo',
  Ez: 'Ezequiel',
  Flm: 'Filemon',
  Flp: 'Filipenses',
  Gal: 'Galatas',
  Gen: 'Genesis',
  Hab: 'Habacuc',
  Hch: 'Hechos',
  Heb: 'Hebreos',
  Is: 'Isaias',
  Jds: 'Judas',
  Jdt: 'Judit',
  Jer: 'Jeremias',
  Jl: 'Joel',
  Jn: 'Juan',
  Job: 'Job',
  Jon: 'Jonas',
  Jos: 'Josue',
  Jue: 'Jueces',
  Lam: 'Lamentaciones',
  Lc: 'Lucas',
  Lev: 'Levitico',
  Mal: 'Malaquias',
  Mc: 'Marcos',
  Miq: 'Miqueas',
  Mt: 'Mateo',
  Nah: 'Nahum',
  Neh: 'Nehemias',
  Num: 'Numeros',
  Os: 'Oseas',
  Prov: 'Proverbios',
  Rom: 'Romanos',
  Rut: 'Rut',
  Sab: 'Sabiduria',
  Sal: 'Salmos',
  Sant: 'Santiago',
  Sof: 'Sofonias',
  Tit: 'Tito',
  Tob: 'Tobias',
  Zac: 'Zacarias'
}).map(([abbr, book]) => [normalizeText(abbr), book]))

const NUMBERED_ABBREVIATIONS = [
  ['1 Sam', '1 Samuel'],
  ['2 Sam', '2 Samuel'],
  ['1 Re', '1 Reyes'],
  ['2 Re', '2 Reyes'],
  ['1 Cron', '1 Cronicas'],
  ['2 Cron', '2 Cronicas'],
  ['1 Mac', '1 Macabeos'],
  ['2 Mac', '2 Macabeos'],
  ['1 Cor', '1 Corintios'],
  ['2 Cor', '2 Corintios'],
  ['1 Tes', '1 Tesalonicenses'],
  ['2 Tes', '2 Tesalonicenses'],
  ['1 Tim', '1 Timoteo'],
  ['2 Tim', '2 Timoteo'],
  ['1 Pe', '1 Pedro'],
  ['2 Pe', '2 Pedro'],
  ['1 Jn', '1 Juan'],
  ['2 Jn', '2 Juan'],
  ['3 Jn', '3 Juan']
].map(([abbr, book]) => [normalizeText(abbr), book])

class BibleService {
  async importVersesFromPdf({ pdfPath, version = 'BJ', createdBy = null, replace = false }) {
    const fs = require('fs/promises')
    const buffer = await fs.readFile(pdfPath)
    const normalizedVersion = String(version).toUpperCase().replace(/[^A-Z0-9]/g, '')
    let verses
    let warnings = []

    if (normalizedVersion === 'RVR1960') {
      const result = await parseRvr1960Pdf(buffer, version)
      if (result.issues.length > 0) {
        const error = new Error(`La validacion del PDF RVR1960 fallo:\n- ${result.issues.join('\n- ')}`)
        error.code = 'BIBLE_IMPORT_INVALID'
        throw error
      }
      verses = result.verses
    } else if (normalizedVersion.startsWith('BJ')) {
      const result = await parseJerusalemPdf(buffer, version)
      if (result.issues.length > 0) {
        const error = new Error(`La validacion del PDF Biblia de Jerusalen fallo:\n- ${result.issues.join('\n- ')}`)
        error.code = 'BIBLE_IMPORT_INVALID'
        throw error
      }
      verses = result.verses
      warnings = result.warnings
    } else {
      const pdfParse = require('pdf-parse')
      const parsed = await pdfParse(buffer)
      verses = this._parseVerses(parsed.text, version)
    }

    if (verses.length === 0) {
      const error = new Error('No se encontraron versiculos en el PDF. Revisa el formato del texto extraido.')
      error.code = 'BIBLE_IMPORT_EMPTY'
      throw error
    }

    const importResult = await sequelize.transaction(async transaction => {
      const existingVerses = await Verse.findAll({
        where: { version },
        attributes: ['id', 'book', 'chapter', 'verse_start'],
        raw: true,
        transaction
      })
      const beforeCount = existingVerses.length
      const now = new Date()
      const rows = verses.map(verse => ({
        ...verse,
        created_by: createdBy,
        updated_by: createdBy,
        is_active: true,
        createdAt: now,
        updatedAt: now
      }))

      await Verse.bulkCreate(rows, {
        updateOnDuplicate: ['verse_end', 'reference', 'text', 'is_active', 'updated_by', 'updatedAt'],
        transaction
      })

      if (replace && existingVerses.length > 0) {
        const importedKeys = new Set(verses.map(verse => verseKey(verse)))
        const obsoleteIds = existingVerses
          .filter(verse => !importedKeys.has(verseKey(verse)))
          .map(verse => verse.id)
        if (obsoleteIds.length > 0) {
          await Verse.destroy({ where: { id: obsoleteIds }, transaction })
        }
      }

      const afterCount = await Verse.count({ where: { version }, transaction })
      const created = Math.max(afterCount - beforeCount, 0)
      return {
        imported: afterCount,
        created,
        updated: Math.max(verses.length - created, 0)
      }
    })

    return {
      parsed: verses.length,
      ...importResult,
      version,
      warnings
    }
  }

  async updateVerse({ id, text, userId }) {
    const verse = await Verse.findOne({ where: { id, is_active: true } })
    if (!verse) return null

    const reference = formatVerseReference(verse)
    const embeddingText = `${reference} (${verse.version}): ${text}`
    const semanticContentChanged = verse.reference !== reference || verse.text !== text
    let embeddingData = null

    if (semanticContentChanged) {
      if (!aiProvider.canEmbed()) {
        const error = new Error('No se puede corregir el versiculo porque el servicio de embeddings no esta disponible')
        error.status = 503
        throw error
      }

      const result = await aiProvider.generateEmbeddingsWithMetadata([embeddingText])
      embeddingData = {
        provider: result.provider,
        model: result.model,
        embedding: result.embeddings[0],
        text_hash: sha256(embeddingText)
      }
    }

    const updatedVerse = await sequelize.transaction(async transaction => {
      const currentVerse = await Verse.findOne({
        where: { id, is_active: true },
        transaction,
        lock: transaction.LOCK.UPDATE
      })
      if (!currentVerse) return null

      await currentVerse.update({
        reference,
        text,
        updated_by: userId
      }, { transaction })

      if (embeddingData) {
        await VerseEmbedding.destroy({
          where: { verse_id: id },
          transaction
        })
        await VerseEmbedding.create({
          verse_id: id,
          ...embeddingData
        }, { transaction })
      }

      return Verse.findByPk(id, {
        include: [{
          model: User,
          as: 'modifier',
          attributes: ['user_id', 'name'],
          required: false
        }],
        transaction
      })
    })

    return updatedVerse
  }

  async replaceImportedVersion({ sourceVersion, targetVersion }) {
    if (!sourceVersion || !targetVersion || sourceVersion === targetVersion) {
      const error = new Error('Las versiones de origen y destino deben ser diferentes.')
      error.code = 'BIBLE_REPLACE_INVALID'
      throw error
    }

    return sequelize.transaction(async transaction => {
      const targetCount = await Verse.count({
        where: { version: targetVersion, is_active: true },
        transaction
      })
      if (targetCount === 0) {
        const error = new Error(`No hay versículos importados para la versión ${targetVersion}.`)
        error.code = 'BIBLE_REPLACE_TARGET_EMPTY'
        throw error
      }

      const topicLinks = await TopicVerse.findAll({
        include: [{ model: Verse, where: { version: sourceVersion }, required: true }],
        transaction
      })
      let migratedTopicLinks = 0

      for (const link of topicLinks) {
        const sourceVerse = link.Verse
        const targetVerse = await Verse.findOne({
          where: {
            version: targetVersion,
            book: sourceVerse.book,
            chapter: sourceVerse.chapter,
            verse_start: { [Op.lte]: sourceVerse.verse_start },
            [Op.or]: [
              { verse_end: null, verse_start: sourceVerse.verse_start },
              { verse_end: { [Op.gte]: sourceVerse.verse_start } }
            ]
          },
          transaction
        })
        if (!targetVerse) {
          throw new Error(`No se encontró equivalencia en ${targetVersion} para ${sourceVerse.reference}.`)
        }

        const duplicate = await TopicVerse.findOne({
          where: { topic_id: link.topic_id, verse_id: targetVerse.id },
          transaction
        })
        if (duplicate) {
          await link.destroy({ transaction })
        } else {
          await link.update({ verse_id: targetVerse.id }, { transaction })
        }
        migratedTopicLinks += 1
      }

      const dailyVerses = await DailyVerse.findAll({ transaction })
      let updatedDailyVerses = 0
      for (const dailyVerse of dailyVerses) {
        const targetVerse = await Verse.findOne({
          where: { version: targetVersion, reference: dailyVerse.reference },
          transaction
        })
        if (!targetVerse) continue
        await dailyVerse.update({ text: targetVerse.text }, { transaction })
        updatedDailyVerses += 1
      }

      const deletedSourceVerses = await Verse.destroy({
        where: { version: sourceVersion },
        transaction
      })

      return {
        sourceVersion,
        targetVersion,
        targetCount,
        migratedTopicLinks,
        updatedDailyVerses,
        deletedSourceVerses
      }
    })
  }

  async generateMissingEmbeddings({
    version = null,
    batchSize = DEFAULT_EMBEDDING_BATCH_SIZE,
    limit = null
  } = {}) {
    const embeddingIdentity = this._embeddingIdentity()
    const where = { is_active: true }
    if (version) where.version = version

    const verses = await Verse.findAll({
      where,
      include: [
        {
          model: VerseEmbedding,
          as: 'embeddings',
          required: false,
          where: embeddingIdentity
        }
      ],
      order: [['id', 'ASC']],
      limit: limit || undefined
    })

    let created = 0
    let skipped = 0
    let pending = []

    for (const verse of verses) {
      const text = this._embeddingText(verse)
      const textHash = sha256(text)
      const current = verse.embeddings?.[0]

      if (current && current.text_hash === textHash) {
        skipped += 1
        continue
      }

      pending.push({ verse, text, textHash })

      if (pending.length >= batchSize) {
        created += await this._createEmbeddingBatch(pending)
        pending = []
        console.log(`[BibleService] Embeddings generados: ${created}`)
      }
    }

    if (pending.length > 0) {
      created += await this._createEmbeddingBatch(pending)
    }

    return { created, skipped, ...embeddingIdentity }
  }

  async findRelevantVerses(userMessage, { limit = DEFAULT_SEMANTIC_LIMIT, version = null } = {}) {
    if (!userMessage || !aiProvider.canEmbed()) return []

    try {
      const queryEmbeddingResult = await aiProvider.generateEmbeddingsWithMetadata([userMessage])
      const queryEmbedding = queryEmbeddingResult.embeddings[0]
      const where = { is_active: true }
      if (version) where.version = version

      const rows = await this._getEmbeddingRows(where, {
        provider: queryEmbeddingResult.provider,
        model: queryEmbeddingResult.model
      })

      return rows
        .map(row => ({
          verse: row.verse,
          score: cosineSimilarity(queryEmbedding, row.embedding)
        }))
        .filter(item => Number.isFinite(item.score))
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(item => item.verse)
    } catch (err) {
      console.error('[BibleService] No se pudo buscar por embeddings:', err.message)
      return []
    }
  }

  async findVersesBySearchTerms(terms, { limit = 8, version = null } = {}) {
    if (!terms || terms.length === 0) return []

    const matches = terms.flatMap(term => [
      { reference: { [Op.like]: `%${term}%` } },
      { book: { [Op.like]: `%${term}%` } },
      { text: { [Op.like]: `%${term}%` } }
    ])
    const where = {
      is_active: true,
      [Op.or]: matches
    }
    if (version) where.version = version

    return Verse.findAll({
      where,
      order: [['book', 'ASC'], ['chapter', 'ASC'], ['verse_start', 'ASC']],
      limit
    })
  }

  _parseVerses(rawText, version) {
    const lines = String(rawText || '')
      .replace(/\r/g, '\n')
      .split('\n')
      .map(cleanPdfLine)
      .filter(Boolean)

    const verses = []
    let currentBook = null
    let currentChapter = null
    let currentVerse = null
    let currentText = []
    let expectingChapter = false

    const flushVerse = () => {
      if (!currentBook || !currentChapter || !currentVerse || currentText.length === 0) return

      const text = cleanVerseText(currentText.join(' '))
      if (text.length < 2) return

      verses.push({
        book: currentBook,
        chapter: currentChapter,
        verse_start: currentVerse,
        verse_end: null,
        reference: `${currentBook} ${currentChapter}:${currentVerse}`,
        text,
        version
      })
    }

    for (const line of lines) {
      if (currentBook === 'Apocalipsis' && currentChapter === 22 && currentVerse === 21 && /^\*/.test(line)) {
        flushVerse()
        break
      }

      const boundaryBook = detectEditorialBoundary(line)
      if (boundaryBook !== undefined) {
        flushVerse()
        currentBook = boundaryBook
        currentChapter = null
        currentVerse = null
        currentText = []
        expectingChapter = false
        continue
      }

      const psalmChapter = detectPsalmChapter(line)
      if (psalmChapter) {
        flushVerse()
        currentBook = 'Salmos'
        currentChapter = psalmChapter
        currentVerse = null
        currentText = []
        expectingChapter = false
        continue
      }

      const bookMarker = detectBookMarker(line)
      if (bookMarker) {
        flushVerse()
        currentBook = bookMarker.book
        currentChapter = null
        currentVerse = null
        currentText = []
        expectingChapter = bookMarker.expectsChapter
        continue
      }

      const chapterNumber = parsePlainNumber(line)
      if (expectingChapter && chapterNumber) {
        flushVerse()
        currentChapter = chapterNumber
        currentVerse = null
        currentText = []
        expectingChapter = false
        continue
      }

      const book = detectBookTitle(line) || detectBookTitleStart(line)
      if (book) {
        flushVerse()
        currentBook = book
        currentChapter = null
        currentVerse = null
        currentText = []
        expectingChapter = false
        continue
      }

      const chapterMatch = line.match(/^(?:capitulo|cap\.?)\s+(\d+)\b/i)
      if (chapterMatch && currentBook) {
        flushVerse()
        currentChapter = Number(chapterMatch[1])
        currentVerse = null
        currentText = []
        expectingChapter = false
        continue
      }

      if (!currentBook || !currentChapter) continue

      const verseNumber = parseVerseNumber(line)
      if (verseNumber) {
        flushVerse()
        currentVerse = verseNumber
        currentText = []
        continue
      }

      const inlineVerse = line.match(/^(\d{1,3})(?:[a-z])?\*?\s+(.+)$/i)
      if (inlineVerse) {
        flushVerse()
        currentVerse = Number(inlineVerse[1])
        currentText = [inlineVerse[2]]
        continue
      }

      if (currentVerse && !isLikelyNonVerseLine(line)) {
        currentText.push(line)
      }
    }

    flushVerse()
    return verses
  }

  _embeddingText(verse) {
    return `${verse.reference} (${verse.version}): ${verse.text}`
  }

  async _createEmbeddingBatch(items) {
    const result = await aiProvider.generateEmbeddingsWithMetadata(items.map(item => item.text))
    const rows = items.map((item, index) => ({
      verse_id: item.verse.id,
      provider: result.provider,
      model: result.model,
      embedding: result.embeddings[index],
      text_hash: item.textHash
    }))

    await VerseEmbedding.bulkCreate(rows, {
      updateOnDuplicate: ['embedding', 'text_hash']
    })

    return rows.length
  }

  async _getEmbeddingRows(verseWhere, embeddingIdentity = this._embeddingIdentity()) {
    const rows = await VerseEmbedding.findAll({
      where: embeddingIdentity,
      include: [
        {
          model: Verse,
          required: true,
          where: verseWhere
        }
      ]
    })
    return rows.map(row => ({
      embedding: row.embedding,
      verse: row.Verse
    }))
  }

  _embeddingIdentity() {
    if (typeof aiProvider.getEmbeddingIdentity === 'function') {
      return aiProvider.getEmbeddingIdentity()
    }

    return {
      provider: 'ollama',
      model: aiProvider.embeddingModel
    }
  }
}

function detectBookTitle(line) {
  const normalized = normalizeText(line.replace(/^\d+\s+/, ''))
  return BOOK_ALIASES.get(normalized) || null
}

function detectBookTitleStart(line) {
  const normalized = normalizeText(line)
  for (const book of SUPPORTED_BOOKS) {
    const normalizedBook = normalizeText(book)
    if (normalized.startsWith(`${normalizedBook} `)) return book
  }

  return null
}

function detectPsalmChapter(line) {
  const match = normalizeText(line).match(/(?:^|\s)salmo\s+(\d{1,3})(?:\s|$|\*)/)
  return match ? Number(match[1]) : null
}

function detectBookMarker(line) {
  const normalized = normalizeText(line)
  for (const [abbr, book] of NUMBERED_ABBREVIATIONS) {
    if (normalized === abbr) return { book, expectsChapter: true }
  }

  const book = BOOK_ABBREVIATIONS.get(normalized)
  return book ? { book, expectsChapter: true } : null
}

function cleanPdfLine(line) {
  return String(line || '')
    .replace(/\s+/g, ' ')
    .replace(/\u00a0/g, ' ')
    .trim()
}

function verseKey(verse) {
  return `${verse.book}\u0000${verse.chapter}\u0000${verse.verse_start}`
}

function formatVerseReference(verse) {
  const end = verse.verse_end && verse.verse_end !== verse.verse_start
    ? `-${verse.verse_end}`
    : ''
  return `${verse.book} ${verse.chapter}:${verse.verse_start}${end}`
}

function cleanVerseText(text) {
  return removeEditorialTail(cleanPdfLine(text))
    .replace(/^[,.;:\-]+/, '')
    .trim()
}

function removeEditorialTail(text) {
  const boundaries = [
    'Este libro, también conocido como Sirácida',
    'Además de los cuarenta y seis libros del AT'
  ]

  let result = text
  for (const boundary of boundaries) {
    const index = normalizeText(result).indexOf(normalizeText(boundary))
    if (index >= 0) result = result.slice(0, index).trim()
  }

  return result
}

function isLikelyNonVerseLine(line) {
  if (/^\*/.test(line)) return true
  if (/^\d+[,:]\s/.test(line)) return true
  if (/^[A-ZÁÉÍÓÚÜÑ0-9\s,.;:()\-]+$/.test(line) && line.length < 90) return true
  if (/^\|/.test(line)) return true
  return false
}

function detectEditorialBoundary(line) {
  const normalized = normalizeText(line)
  if (normalized.startsWith('este libro tambien conocido como siracida')) return 'Eclesiastico'
  if (normalized.startsWith('ademas de los cuarenta y seis libros del at')) return null
  return undefined
}

function parsePlainNumber(line) {
  return /^\d{1,3}$/.test(line) ? Number(line) : null
}

function parseVerseNumber(line) {
  const match = line.match(/^(\d{1,3})(?:[a-z])?\*?$/i)
  return match ? Number(match[1]) : null
}

function normalizeText(text) {
  return String(text || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

function sha256(text) {
  return crypto.createHash('sha256').update(text).digest('hex')
}

function cosineSimilarity(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return null

  let dot = 0
  let normA = 0
  let normB = 0
  for (let i = 0; i < a.length; i += 1) {
    dot += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }

  if (normA === 0 || normB === 0) return null
  return dot / (Math.sqrt(normA) * Math.sqrt(normB))
}

module.exports = new BibleService()
