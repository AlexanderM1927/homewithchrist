'use strict'
const pdfParse = require('pdf-parse')

const BOUNDARY_TITLES = {
  Salmos: 'LOS\tSALMOS',
  'Cantar de los Cantares': 'CANTAR\tDE\tLOS\tCANTARES',
  Lamentaciones: 'LAMENTACIONES',
  Eclesiastico: 'ECLESIASTICO',
  '1 Tesalonicenses': 'PRIMERA\tEPISTOLA\tA\tLOS\tTESALONICENSES',
  '2 Tesalonicenses': 'SEGUNDA\tEPISTOLA\tA\tLOS\tTESALONICENSES'
}

const BOOKS = [
  ['Genesis', 'Gn\t1\nGENESIS', 50],
  ['Exodo', 'Ex\t1\nEXODO', 40],
  ['Levitico', 'Lv\t1\nLEVITICO', 27],
  ['Numeros', 'Nm\t1\nNUMEROS', 36],
  ['Deuteronomio', 'Dt\t1\nDEUTERONOMIO', 34],
  ['Josue', 'Jos\t1\nJOSUE', 24],
  ['Jueces', 'Jc\t1\nJUECES', 21],
  ['Rut', 'Rt\t1\nRUT', 4],
  ['1 Samuel', '1\tS\t1\nSAMUEL', 31],
  ['2 Samuel', '2\tS\t1\nLIBRO\tSEGUNDO\tDE\tSAMUEL', 24],
  ['1 Reyes', '1\tR\t1\nREYES', 22],
  ['2 Reyes', '2\tR\t1\nLIBRO\tSEGUNDO\tDE\tLOS\tREYES', 25],
  ['1 Cronicas', '1\tCro\t1\nLOS\tLIBROS\tDE\tLAS\tCRONICAS', 29],
  ['2 Cronicas', '2\tCro\t1\nLIBRO\tSEGUNDO\tDE\tLAS\tCRONICAS', 36],
  ['Esdras', 'Esd\t1\nEL\tLIBRO\tDE\tESDRAS', 10],
  ['Nehemias', 'Ne\t1\nEL\tLIBRO\tDE\tNEHEMIAS', 13],
  ['Tobias', 'Tb\t1\nTOBIAS', 14],
  ['Judit', 'Jdt\t1\nJUDIT', 16],
  ['Ester', 'Est\t1\nESTER', 10],
  ['1 Macabeos', '1\tM\t1\nLIBRO\tPRIMERO\tDE\tLOS\tMACABEOS', 16],
  ['2 Macabeos', '2\tM\t1\nLIBRO\tSEGUNDO\tDE\tLOS\tMACABEOS', 15],
  ['Salmos', 'LOS\tSALMOS\nSALMO\t1*\n', 150, true],
  ['Cantar de los Cantares', 'Ct\t1\n', 8],
  ['Lamentaciones', 'Lm\t1\n', 5],
  ['Job', 'Jb\t1\nJOB', 42],
  ['Proverbios', 'Pr\t1\nPROVERBIOS', 31],
  ['Eclesiastes', 'Qo\t1\nECLESIASTES', 12],
  ['Sabiduria', 'Sb\t1\nLIBRO\tDE\tLA\tSABIDURIA', 19],
  ['Eclesiastico', 'I.\tEl\tcamino\thacia\tla\tsabiduria\nOrigen\tdivino\tde\tla\tsabiduria*.\n', 51, false, 'Si'],
  ['Isaias', 'Is\t1\nISAIAS', 66],
  ['Jeremias', 'Jr\t1\nJEREMIAS', 52],
  ['Baruc', 'Ba\t1\nBARUC', 6],
  ['Ezequiel', 'Ez\t1\nEZEQUIEL', 48],
  ['Daniel', 'Dn\t1\nDANIEL', 14],
  ['Oseas', 'Os\t1\nOSEAS', 14],
  ['Joel', 'Jl\t1\nJOEL', 4],
  ['Amos', 'Am\t1\nAMOS', 9],
  ['Abdias', '\nABDIAS\nTitulo\ty\tprologo.', 1],
  ['Jonas', 'Jon\t1\nJONAS', 4],
  ['Miqueas', 'Mi\t1\nMIQUEAS', 7],
  ['Nahum', 'Na\t1\nNAHUM', 3],
  ['Habacuc', 'Ha\t1\nHABACUC', 3],
  ['Sofonias', 'So\t1\nSOFONIAS', 3],
  ['Ageo', 'Ag\t1\nAGEO', 2],
  ['Zacarias', 'Za\t1\nZACARIAS', 14],
  ['Malaquias', 'Ml\t1\nMALAQUIAS', 3],
  ['Mateo', 'Mt\t1\nEVANGELIO\tSEGUN\tSAN\tMATEO', 28],
  ['Marcos', 'Mc\t1\nEVANGELIO\tSEGUN\tSAN\tMARCOS', 16],
  ['Lucas', 'Lc\t1\nEVANGELIO\tSEGUN\tSAN\tLUCAS', 24],
  ['Juan', 'Jn\t1\nEVANGELIO\tSEGUN\tSAN\tJUAN', 21],
  ['Hechos', 'Hch\t1\nHECHOS\tDE\tLOS\tAPOSTOLES', 28],
  ['Romanos', 'Rm\t1\nEPISTOLA\tA\tLOS\tROMANOS', 16],
  ['1 Corintios', '1\tCo\t1\nPRIMERA\tEPISTOLA\tA\tLOS\tCORINTIOS', 16],
  ['2 Corintios', '2\tCo\t1\nSEGUNDA\tEPISTOLA\tA\tLOS\tCORINTIOS', 13],
  ['Galatas', 'Ga\t1\nEPISTOLA\tA\tLOS\tGALATAS', 6],
  ['Efesios', 'Ef\t1\nEPISTOLA\tA\tLOS\tEFESIOS', 6],
  ['Filipenses', 'Flp\t1\nEPISTOLA\tA\tLOS\tFILIPENSES', 4],
  ['Colosenses', 'Col\t1\nEPISTOLA\tA\tLOS\tCOLOSENSES', 4],
  ['1 Tesalonicenses', '1\tTs\t1\nPRIMERA\tEPISTOLA\tA\tLOS', 5],
  ['2 Tesalonicenses', '2\tTs\t1\nSEGUNDA\tEPISTOLA\tA\tLOS', 3],
  ['1 Timoteo', '1\tTm\t1\nPRIMERA\tEPISTOLA\tA\tTIMOTEO', 6],
  ['2 Timoteo', '2\tTm\t1\nSEGUNDA\tEPISTOLA\tA\tTIMOTEO', 4],
  ['Tito', 'Tt\t1\nEPISTOLA\tA\tTITO', 3],
  ['Filemon', '\nEPISTOLA\tA\tFILEMON\nSaludo.', 1],
  ['Hebreos', 'Hb\t1\nEPISTOLA\tA\tLOS\tHEBREOS', 13],
  ['Santiago', 'St\t1\nEPISTOLA\tDE\tSANTIAGO', 5],
  ['1 Pedro', '1\tP\t1\nPRIMERA\tEPISTOLA\tDE\tSAN\tPEDRO', 5],
  ['2 Pedro', '2\tP\t1\nSEGUNDA\tEPISTOLA\tDE\tSAN\tPEDRO', 3],
  ['1 Juan', '1\tJn\t1\nPRIMERA\tEPISTOLA\tDE\tSAN\tJUAN', 5],
  ['2 Juan', '\nSEGUNDA\tEPISTOLA\tDE\tSAN\tJUAN\nSaludo.', 1],
  ['3 Juan', '\nTERCERA\tEPISTOLA\tDE\tSAN\tJUAN\nSaludo.', 1],
  ['Judas', '\nEPISTOLA\tDE\tSAN\tJUDAS\nSaludo.', 1],
  ['Apocalipsis', 'Ap\t1\nAPOCALIPSIS', 22]
]

async function parseJerusalemPdf(buffer, version = 'BJ') {
  const parsed = await pdfParse(buffer)
  return parseJerusalemText(parsed.text, version)
}

function parseJerusalemText(rawText, version = 'BJ') {
  const text = String(rawText || '').replace(/\r/g, '')
  const matchingText = normalizeForMatching(text)
  const starts = findBookStarts(matchingText)
  const verses = []
  const issues = []
  const warnings = []

  starts.forEach((entry, index) => {
    const next = starts[index + 1]
    const boundaryOffset = next
      ? matchingText.indexOf(`\n${next.boundaryTitle}\n`, entry.offset + entry.marker.length)
      : -1
    const end = boundaryOffset >= 0 && boundaryOffset < next.offset
      ? boundaryOffset
      : next?.offset || text.length
    const segment = text.slice(entry.offset + entry.marker.length, end)
    const bookVerses = parseBookSegment(segment, entry, version)
    verses.push(...bookVerses)
    validateBook(entry, bookVerses, issues, warnings)
  })

  return {
    verses,
    issues,
    warnings,
    bookCount: starts.length,
    detectedBooks: starts.map(({ book, header }) => ({ book, header }))
  }
}

function findBookStarts(text) {
  let cursor = 0
  return BOOKS.map(([book, marker, chapters, psalms, headerOverride]) => {
    const offset = text.indexOf(marker, cursor)
    if (offset < 0) throw new Error(`No se encontro el inicio de ${book} en el PDF de Jerusalén`)
    cursor = offset + marker.length
    const header = headerOverride || marker.match(/(?:^|\n)((?:[1-3]\t)?[A-Za-z]+)\t1\n/)?.[1] || null
    const boundaryTitle = BOUNDARY_TITLES[book] || marker
      .split('\n')
      .find(line => line && !/\d/.test(line) && line === line.toUpperCase())
    return { book, marker, chapters, psalms: Boolean(psalms), header, boundaryTitle, offset }
  })
}

function parseBookSegment(segment, config, version) {
  let source = config.book === 'Apocalipsis'
    ? segment.split(/\nAP[ÉE]NDICES\n/)[0]
    : segment
  source = config.psalms
    ? source.replace(/\nSALMO\t(\d{1,3})\*?(?:\t[^\n]*)?\n/g, '\n__CHAPTER__$1\n')
    : source
  if (config.header) {
    const headerPattern = new RegExp(`\\n${escapeRegex(config.header)}\\t(\\d{1,3})(?:\\t[^\\n]*)?\\n`, 'g')
    source = source.replace(headerPattern, '\n__PAGE__$1\n')
  }

  const markerPattern = /^(?:__CHAPTER__(\d{1,3})|__PAGE__(\d{1,3})|(\d{1,3})(?:-(\d{1,3}))?([a-z])?)\n[\t ]*/gm
  const markers = []
  let match

  while ((match = markerPattern.exec(source))) {
    markers.push({
      chapter: match[1] ? Number(match[1]) : null,
      pageChapter: match[2] ? Number(match[2]) : null,
      verse: match[3] ? Number(match[3]) : null,
      verseEnd: match[4] ? Number(match[4]) : null,
      suffix: match[5] || '',
      start: match.index,
      contentStart: markerPattern.lastIndex
    })
  }

  const verses = new Map()
  let chapter = 1
  let hasVersesInChapter = false
  let lastVerseHadSuffix = false
  let maxVerseSeen = 0
  let finished = false
  const pendingChapters = []

  markers.forEach((marker, index) => {
    if (finished) return
    if (marker.chapter) {
      chapter = marker.chapter
      hasVersesInChapter = false
      lastVerseHadSuffix = false
      maxVerseSeen = 0
      return
    }
    if (marker.pageChapter) {
      if (marker.pageChapter > chapter && !pendingChapters.includes(marker.pageChapter)) {
        pendingChapters.push(marker.pageChapter)
      }
      return
    }

    const esterAdditionContinues = config.book === 'Ester' && chapter === 1 && lastVerseHadSuffix
    const pendingChapter = pendingChapters.find(value => value > chapter)
    const startsNewChapter = pendingChapter || (!marker.suffix && !esterAdditionContinues)
    if (marker.verse === 1 && hasVersesInChapter && startsNewChapter) {
      chapter = pendingChapter || chapter + 1
      while (pendingChapters.length > 0 && pendingChapters[0] <= chapter) pendingChapters.shift()
      hasVersesInChapter = false
      lastVerseHadSuffix = false
      maxVerseSeen = 0
    }
    if (chapter > config.chapters) return
    if (chapter === config.chapters && maxVerseSeen > 0 && marker.verse < maxVerseSeen && !marker.suffix) {
      finished = true
      return
    }
    if (maxVerseSeen > 0 && marker.verse > maxVerseSeen + 20) return

    const nextStart = findVerseContentEnd(markers, index, source.length)
    const rawVerseText = source.slice(marker.contentStart, nextStart)
    const text = cleanVerseText(rawVerseText)
    if (!text) return

    const key = `${chapter}:${marker.verse}`
    const current = verses.get(key)
    if (current) {
      current.text = `${current.text} ${text}`.trim()
      current._rawText = `${current._rawText}\n${rawVerseText}`
      current.verse_end = Math.max(current.verse_end || current.verse_start, marker.verseEnd || marker.verse)
      current.reference = formatReference(config.book, chapter, current.verse_start, current.verse_end)
    } else {
      verses.set(key, {
        book: config.book,
        chapter,
        verse_start: marker.verse,
        verse_end: marker.verseEnd,
        reference: formatReference(config.book, chapter, marker.verse, marker.verseEnd),
        text,
        _rawText: rawVerseText,
        version
      })
    }
    hasVersesInChapter = true
    lastVerseHadSuffix = Boolean(marker.suffix)
    maxVerseSeen = Math.max(maxVerseSeen, marker.verseEnd || marker.verse)
  })

  const rows = [...verses.values()].sort((a, b) => a.chapter - b.chapter || a.verse_start - b.verse_start)
  const finalRows = rows.filter(verse => verse.chapter === config.chapters)
  const finalVerse = finalRows[finalRows.length - 1]
  if (finalVerse) finalVerse.text = cleanVerseText(trimEditorialTail(finalVerse._rawText))
  rows.forEach(verse => delete verse._rawText)
  return rows
}

function validateBook(config, verses, issues, warnings) {
  if (verses.length === 0) {
    issues.push(`${config.book}: no se detectaron versículos`)
    return
  }

  const chapters = new Map()
  for (const verse of verses) {
    if (!chapters.has(verse.chapter)) chapters.set(verse.chapter, [])
    const end = verse.verse_end || verse.verse_start
    for (let number = verse.verse_start; number <= end; number += 1) {
      chapters.get(verse.chapter).push(number)
    }
  }

  if (chapters.size !== config.chapters) {
    issues.push(`${config.book}: ${chapters.size} capítulos detectados; esperados ${config.chapters}`)
  }

  for (let chapter = 1; chapter <= config.chapters; chapter += 1) {
    const numbers = chapters.has(chapter)
      ? [...new Set(chapters.get(chapter))].sort((a, b) => a - b)
      : null
    if (!numbers) {
      issues.push(`${config.book} ${chapter}: capítulo ausente`)
      continue
    }
    for (let index = 1; index < numbers.length; index += 1) {
      if (numbers[index] !== numbers[index - 1] + 1) {
        warnings.push(`${config.book} ${chapter}: numeración editorial de ${numbers[index - 1]} a ${numbers[index]}`)
      }
    }
  }
}

function formatReference(book, chapter, verseStart, verseEnd) {
  const range = verseEnd && verseEnd !== verseStart ? `${verseStart}-${verseEnd}` : verseStart
  return `${book} ${chapter}:${range}`
}

function findVerseContentEnd(markers, index, fallback) {
  const next = markers[index + 1]
  if (!next) return fallback
  if (!next.pageChapter) return next.start

  const following = markers.slice(index + 2).find(marker => !marker.pageChapter)
  if (following?.verse && following.verse !== 1) return following.start
  return next.start
}

function trimEditorialTail(text) {
  const match = String(text || '').match(/\n\n(?=[A-ZÁÉÍÓÚÜÑ][A-ZÁÉÍÓÚÜÑ0-9ºª.,;:'"()\-\t ]{4,}\n)/)
  return match ? text.slice(0, match.index) : text
}

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function normalizeForMatching(text) {
  return String(text || '')
    .replace(/\r/g, '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function cleanVerseText(text) {
  return String(text || '')
    .replace(/\n__PAGE__\d{1,3}\n/g, '\n')
    .replace(/\n(?:[1-3]\t)?[A-Za-z]+\t\d{1,3}\n/g, '\n')
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.;:!?])/g, '$1')
    .replace(/^\*+\.?\s*/, '')
    .trim()
}

module.exports = { parseJerusalemPdf, parseJerusalemText }
