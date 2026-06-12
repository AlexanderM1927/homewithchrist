'use strict'

const PDFJS_PATH = 'pdf-parse/lib/pdf.js/v1.10.88/build/pdf.js'
const EXPECTED_VERSE_COUNT = 31104

const BOOKS = [
  'Genesis', 'Exodo', 'Levitico', 'Numeros', 'Deuteronomio', 'Josue', 'Jueces', 'Rut',
  '1 Samuel', '2 Samuel', '1 Reyes', '2 Reyes', '1 Cronicas', '2 Cronicas', 'Esdras',
  'Nehemias', 'Ester', 'Job', 'Salmos', 'Proverbios', 'Eclesiastes', 'Cantar de los Cantares',
  'Isaias', 'Jeremias', 'Lamentaciones', 'Ezequiel', 'Daniel', 'Oseas', 'Joel', 'Amos',
  'Abdias', 'Jonas', 'Miqueas', 'Nahum', 'Habacuc', 'Sofonias', 'Ageo', 'Zacarias',
  'Malaquias', 'Mateo', 'Marcos', 'Lucas', 'Juan', 'Hechos', 'Romanos', '1 Corintios',
  '2 Corintios', 'Galatas', 'Efesios', 'Filipenses', 'Colosenses', '1 Tesalonicenses',
  '2 Tesalonicenses', '1 Timoteo', '2 Timoteo', 'Tito', 'Filemon', 'Hebreos', 'Santiago',
  '1 Pedro', '2 Pedro', '1 Juan', '2 Juan', '3 Juan', 'Judas', 'Apocalipsis'
]

const TITLE_ALIASES = new Map([
  ['genesis', 'Genesis'], ['exodo', 'Exodo'], ['levitico', 'Levitico'], ['numeros', 'Numeros'],
  ['deuteronomio', 'Deuteronomio'], ['josue', 'Josue'], ['jueces', 'Jueces'], ['rut', 'Rut'],
  ['i samuel', '1 Samuel'], ['ii samuel', '2 Samuel'], ['i reyes', '1 Reyes'], ['ii reyes', '2 Reyes'],
  ['i cronicas', '1 Cronicas'], ['ii cronicas', '2 Cronicas'], ['esdras', 'Esdras'],
  ['nehemias', 'Nehemias'], ['ester', 'Ester'], ['job', 'Job'], ['salmos', 'Salmos'],
  ['proverbios', 'Proverbios'], ['eclesiastes', 'Eclesiastes'],
  ['cantar de los cantares', 'Cantar de los Cantares'], ['isaias', 'Isaias'],
  ['jeremias', 'Jeremias'], ['lamentaciones', 'Lamentaciones'], ['ezequiel', 'Ezequiel'],
  ['daniel', 'Daniel'], ['oseas', 'Oseas'], ['joel', 'Joel'], ['amos', 'Amos'], ['abdias', 'Abdias'],
  ['jonas', 'Jonas'], ['miqueas', 'Miqueas'], ['nahum', 'Nahum'], ['habacuc', 'Habacuc'],
  ['sofonias', 'Sofonias'], ['hageo', 'Ageo'], ['zacarias', 'Zacarias'], ['malaquias', 'Malaquias'],
  ['mateo', 'Mateo'], ['marcos', 'Marcos'], ['lucas', 'Lucas'], ['juan', 'Juan'],
  ['hechos', 'Hechos'], ['romanos', 'Romanos'], ['i corintios', '1 Corintios'],
  ['ii corintios', '2 Corintios'], ['galatas', 'Galatas'], ['efesios', 'Efesios'],
  ['filipenses', 'Filipenses'], ['colosenses', 'Colosenses'],
  ['i tesalonicenses', '1 Tesalonicenses'], ['ii tesalonicenses', '2 Tesalonicenses'],
  ['i timoteo', '1 Timoteo'], ['ii timoteo', '2 Timoteo'], ['tito', 'Tito'], ['filemon', 'Filemon'],
  ['hebreos', 'Hebreos'], ['santiago', 'Santiago'], ['i pedro', '1 Pedro'], ['ii pedro', '2 Pedro'],
  ['i juan', '1 Juan'], ['ii juan', '2 Juan'], ['iii juan', '3 Juan'], ['judas', 'Judas'],
  ['el apocalipsis', 'Apocalipsis'], ['apocalipsis', 'Apocalipsis']
])

const TITLE_PATTERNS = [
  [/primer libro de samuel/, '1 Samuel'], [/segundo libro de samuel/, '2 Samuel'],
  [/primer libro de los reyes/, '1 Reyes'], [/segundo libro de los reyes/, '2 Reyes'],
  [/primer libro de cronicas/, '1 Cronicas'], [/segundo libro de cronicas/, '2 Cronicas'],
  [/lamentaciones de jeremias/, 'Lamentaciones'], [/santo evangelio .*san mateo/, 'Mateo'],
  [/santo evangelio .*san marcos/, 'Marcos'], [/santo evangelio .*san lucas/, 'Lucas'],
  [/santo evangelio .*san juan/, 'Juan'], [/primera .*corintios/, '1 Corintios'],
  [/segunda .*corintios/, '2 Corintios'], [/primera .*tesalonicenses/, '1 Tesalonicenses'],
  [/segunda .*tesalonicenses/, '2 Tesalonicenses'], [/primera .*timoteo/, '1 Timoteo'],
  [/segunda .*timoteo/, '2 Timoteo'], [/primera .*san pedro/, '1 Pedro'],
  [/segunda .*san pedro/, '2 Pedro'], [/primera .*san juan/, '1 Juan'],
  [/segunda .*san juan/, '2 Juan'], [/tercera .*san juan/, '3 Juan'], [/san judas/, 'Judas']
]

async function parseRvr1960Pdf(buffer, version = 'RVR1960') {
  installPdfDocumentStub()
  const pdfjs = require(PDFJS_PATH)
  const document = await pdfjs.getDocument({
    data: new Uint8Array(buffer),
    disableFontFace: true
  })
  const verses = []
  const issues = []
  let currentBook = null
  let currentChapter = null
  let currentVerse = null
  let currentText = ''
  let psalmHeadingFonts = new Set()

  const flushVerse = () => {
    if (!currentBook || !currentChapter || !currentVerse) return
    const text = cleanVerseText(currentText)
    if (!text) return
    verses.push({
      book: currentBook,
      chapter: currentChapter,
      verse_start: currentVerse,
      verse_end: null,
      reference: `${currentBook} ${currentChapter}:${currentVerse}`,
      text,
      version
    })
    currentText = ''
  }

  const startVerse = (chapter, verse, text = '') => {
    flushVerse()
    if (currentChapter === chapter && currentVerse && verse !== currentVerse + 1) {
      issues.push(`${currentBook} ${chapter}: salto de ${currentVerse} a ${verse}`)
    }
    currentChapter = chapter
    currentVerse = verse
    currentText = text
  }

  for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
    const page = await document.getPage(pageNumber)
    const [content, operatorList] = await Promise.all([
      page.getTextContent(),
      page.getOperatorList()
    ])
    applyOperatorSpacing(content.items, operatorList, pdfjs.OPS)
    const title = detectBookTitle(content.items)

    if (title) {
      flushVerse()
      currentBook = title
      currentChapter = null
      currentVerse = null
      currentText = ''
      psalmHeadingFonts = new Set()
    }

    if (!currentBook) continue

    for (const line of buildBodyLines(content.items, content.styles)) {
      const chapterMarkers = line.markers.filter(marker => marker.type === 'chapter')
      const verseMarkers = line.markers.filter(marker => marker.type === 'verse')

      if (currentBook === 'Salmos' && chapterMarkers.length > 0 &&
          (line.hasMonospaceText || isPsalmHeading(line.text))) {
        flushVerse()
        currentChapter = chapterMarkers[0].number
        currentVerse = null
        currentText = ''
        psalmHeadingFonts = new Set(line.textFonts)
        continue
      }

      if (currentBook === 'Salmos' && currentChapter && !currentVerse &&
          chapterMarkers.length === 0 && verseMarkers.length === 0) {
        const continuesHeading = line.textFonts.length > 0 &&
          line.textFonts.every(font => psalmHeadingFonts.has(font))
        if (continuesHeading) continue
        psalmHeadingFonts = new Set()
      }

      let lineChapter = currentChapter
      const markers = [...chapterMarkers, ...verseMarkers]
        .sort((a, b) => a.x - b.x)
        .map(marker => {
          if (marker.type === 'chapter') {
            lineChapter = marker.number
            return { chapter: lineChapter, verse: 1 }
          }
          return { chapter: lineChapter, verse: marker.number }
        })

      if (markers.length === 0) {
        currentText = appendText(currentText, line.text)
        continue
      }

      if (!currentVerse && currentChapter && currentText && markers[0]?.verse > 1) {
        currentVerse = 1
      }

      const segments = splitVerseSegments(line.text, markers, {
        currentText,
        currentChapter,
        currentVerse
      })
      const continuationCount = Math.max(segments.length - markers.length, 0)

      if (continuationCount > 0 && !currentVerse && currentChapter) {
        currentVerse = 1
      }

      for (let index = 0; index < continuationCount; index += 1) {
        currentText = appendText(currentText, segments[index])
      }

      markers.forEach((marker, index) => {
        const segment = segments[continuationCount + index] || ''
        startVerse(marker.chapter, marker.verse, segment)
      })
    }
  }

  flushVerse()
  repairHyphenatedPageBreaks(verses)
  validateResult(verses, issues)
  return { verses, issues, expectedVerseCount: EXPECTED_VERSE_COUNT }
}

function detectBookTitle(items) {
  const titleText = normalizeText(items
    .filter(item => Number(item.height) > 13)
    .map(item => item.str)
    .join(' '))

  for (const [pattern, book] of TITLE_PATTERNS) {
    if (pattern.test(titleText)) return book
  }

  for (const item of items) {
    if (Number(item.height) < 18) continue
    const book = TITLE_ALIASES.get(normalizeText(item.str))
    if (book) return book
  }
  return null
}

function applyOperatorSpacing(items, operatorList, ops) {
  const textOperatorIds = new Set([ops.showText, ops.showSpacedText])
  const candidates = operatorList.fnArray
    .map((operatorId, index) => textOperatorIds.has(operatorId)
      ? renderOperatorText(operatorList.argsArray[index])
      : '')
    .filter(Boolean)

  let candidateIndex = 0
  for (const item of items) {
    const target = compactText(item.str)
    if (!target) continue

    for (let index = candidateIndex; index < Math.min(candidateIndex + 30, candidates.length); index += 1) {
      if (compactText(candidates[index]) !== target) continue
      if (/\s{2,}/.test(candidates[index])) item.str = candidates[index]
      candidateIndex = index + 1
      break
    }
  }
}

function renderOperatorText(args) {
  const values = []
  collectOperatorValues(args, values)
  const spaces = values
    .filter(value => typeof value === 'number' && value <= -100)
    .map(value => Math.abs(value))
    .sort((a, b) => a - b)
  let verseGapThreshold = Infinity

  for (let index = 1; index < spaces.length; index += 1) {
    if (spaces[index] / spaces[index - 1] >= 1.5) {
      verseGapThreshold = (spaces[index] + spaces[index - 1]) / 2
    }
  }

  let result = ''
  for (const value of values) {
    if (typeof value === 'number') {
      if (value <= -100) result += Math.abs(value) >= verseGapThreshold ? '  ' : ' '
      continue
    }
    result += normalizePdfGlyph(value)
  }

  return result.trim()
}

function collectOperatorValues(value, result) {
  if (Array.isArray(value)) {
    value.forEach(item => collectOperatorValues(item, result))
    return
  }
  if (typeof value === 'number') {
    result.push(value)
    return
  }
  if (value?.unicode) result.push(value.unicode)
}

function compactText(text) {
  return normalizePdfGlyph(String(text || '')).replace(/\s+/g, '')
}

function normalizePdfGlyph(text) {
  return String(text || '')
    .replace(/ﬁ/g, 'fi')
    .replace(/ﬂ/g, 'fl')
    .replace(/ĳ/g, 'ij')
}

function installPdfDocumentStub() {
  if (typeof global.document !== 'undefined') return

  const styleSheet = {
    cssRules: [],
    insertRule() { this.cssRules.push(true) }
  }
  const head = { appendChild() {} }
  const element = () => ({
    sheet: styleSheet,
    style: {},
    setAttribute() {},
    appendChild() {}
  })

  global.document = {
    createElement(tag) {
      if (tag === 'canvas') {
        return {
          getContext: () => ({
            fillText() {},
            getImageData: () => ({ data: [0, 0, 0, 255] })
          })
        }
      }
      return element()
    },
    documentElement: { getElementsByTagName: () => [head] },
    body: { appendChild() {}, removeChild() {} }
  }
}

function buildBodyLines(items, styles = {}) {
  const dropCap = items.find(item => Number(item.height) > 30 && /^[A-ZÁÉÍÓÚÜÑ]$/i.test(String(item.str || '').trim()))
  const bodyItems = items
    .map(item => ({
      text: String(item.str || '').trim(),
      x: Number(item.transform?.[4] || 0),
      y: Number(item.transform?.[5] || 0),
      height: Number(item.height || 0),
      font: item.fontName
    }))
    .filter(item => item.text && item.y < 560 && item.y > 20 && item.height <= 13)

  const grouped = new Map()
  for (const item of bodyItems) {
    const key = Math.round(item.y)
    if (!grouped.has(key)) grouped.set(key, [])
    grouped.get(key).push(item)
  }

  const lines = [...grouped.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([, lineItems]) => {
      const textItems = lineItems.filter(item => item.height >= 10 && !/^\d{1,3}$/.test(item.text))
      const markerItems = lineItems.filter(item => /^\d{1,3}$/.test(item.text) && item.height <= 12)
      const text = textItems.sort((a, b) => a.x - b.x).map(item => item.text).join(' ')
      const markers = markerItems.map(item => ({
        number: Number(item.text),
        type: item.height >= 10 ? 'chapter' : 'verse',
        x: item.x
      }))
      const hasMonospaceText = textItems.some(item => styles[item.font]?.fontFamily === 'monospace')
      const textFonts = [...new Set(textItems.map(item => item.font))]
      return { text, markers, hasMonospaceText, textFonts }
    })
    .filter(line => line.text || line.markers.length > 0)

  if (dropCap && lines.length > 0) {
    lines[0].text = `${String(dropCap.str).trim()}${lines[0].text}`
  }

  return lines
}

function splitVerseSegments(text, markers, state) {
  const markerCount = markers.length
  const { currentText, currentChapter, currentVerse } = state
  const value = String(text || '')
  const segments = value.split(/\s{2,}/).map(part => part.trim()).filter(Boolean)
  if (segments.length > markerCount) return segments

  const sentenceSegments = value
    .split(/(?<=[.!?;:])\s+(?=[A-ZÁÉÍÓÚÜÑ¿¡]|[Yy]\s)/)
    .map(part => part.trim())
    .filter(Boolean)
  const previousLooksIncomplete = currentText && !/[.!?;:,)]$/.test(currentText.trim())
  const needsImplicitFirstVerse = !currentVerse && currentChapter && markers[0]?.verse > 1
  if (sentenceSegments.length > markerCount && (previousLooksIncomplete || needsImplicitFirstVerse)) {
    return sentenceSegments
  }
  if (needsImplicitFirstVerse) return distributeText(value, markerCount + 1)
  if (segments.length === markerCount) return segments
  if (sentenceSegments.length >= markerCount) return sentenceSegments

  if (markers[0]?.verse === 1 && markers[0]?.chapter) {
    return [...sentenceSegments, ...Array(markerCount - sentenceSegments.length).fill('')]
  }

  return distributeText(value, markerCount)
}

function distributeText(text, count) {
  const parts = String(text || '')
    .split(/(?<=[,;:.!?])\s+/)
    .map(part => part.trim())
    .filter(Boolean)

  if (parts.length < count) {
    const words = String(text || '').trim().split(/\s+/).filter(Boolean)
    return distributeParts(words, count, ' ')
  }

  return distributeParts(parts, count, ' ')
}

function distributeParts(parts, count, separator) {
  const result = []
  let offset = 0
  let remainingLength = parts.reduce((sum, part) => sum + part.length, 0)

  for (let group = 0; group < count; group += 1) {
    const groupsLeft = count - group
    const maxEnd = parts.length - (groupsLeft - 1)
    const target = remainingLength / groupsLeft
    let end = offset + 1
    let length = parts[offset]?.length || 0

    if (groupsLeft === 1) {
      end = parts.length
    }

    while (end < maxEnd && length + separator.length + parts[end].length <= target) {
      length += separator.length + parts[end].length
      end += 1
    }

    const value = parts.slice(offset, end).join(separator)
    result.push(value)
    remainingLength -= value.length
    offset = end
  }

  return result
}

function appendText(current, next) {
  const value = String(next || '').trim()
  if (!value) return current
  if (!current) return value
  if (current.endsWith('-')) return `${current.slice(0, -1)}${value}`
  return `${current} ${value}`
}

function cleanVerseText(text) {
  return String(text || '')
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.;:!?])/g, '$1')
    .trim()
}

function isPsalmHeading(text) {
  return /^(?:salmo|c[aá]ntico|oraci[oó]n|masquil|mictam|al m[uú]sico|plegaria|de david\b)/i
    .test(String(text || '').trim())
}

function validateResult(verses, issues) {
  if (verses.length !== EXPECTED_VERSE_COUNT) {
    issues.push(`Total detectado: ${verses.length}; esperado: ${EXPECTED_VERSE_COUNT}`)
  }

  const foundBooks = new Set(verses.map(verse => verse.book))
  for (const book of BOOKS) {
    if (!foundBooks.has(book)) issues.push(`Libro no detectado: ${book}`)
  }
}

function repairHyphenatedPageBreaks(verses) {
  for (let index = 0; index < verses.length - 1; index += 1) {
    const verse = verses[index]
    const nextVerse = verses[index + 1]
    if (!verse.text.endsWith('-')) continue

    const boundary = nextVerse.text.match(/^(.+?\bSelah\b)\s+(.+)$/)
    if (!boundary) continue

    verse.text = `${verse.text.slice(0, -1)}${boundary[1]}`
    nextVerse.text = boundary[2]
  }
}

function normalizeText(text) {
  return String(text || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

module.exports = { parseRvr1960Pdf, EXPECTED_VERSE_COUNT }
