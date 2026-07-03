<template>
  <q-page class="bible-page q-pa-md">
    <div class="bible-container">
      <div class="q-mb-md">
        <div class="text-h5 text-weight-bold text-dark">{{ $t('bible.title') }}</div>
        <div class="text-body2 text-grey-7">{{ $t('bible.subtitle') }}</div>
      </div>

      <q-card flat bordered class="reader-card q-mb-md">
        <q-card-section class="q-gutter-y-md">
          <div class="row q-col-gutter-sm">
            <div class="col-12 col-sm-4">
              <q-select
                v-model="selectedVersion"
                outlined
                dense
                emit-value
                map-options
                :options="versionOptions"
                :label="$t('bible.version')"
                :loading="loadingVersions"
                @update:model-value="handleVersionChange"
              />
            </div>

            <div class="col-12 col-sm-5">
              <q-select
                v-model="selectedBook"
                outlined
                dense
                emit-value
                map-options
                use-input
                input-debounce="0"
                :options="filteredBookOptions"
                :label="$t('bible.book')"
                :loading="loadingBooks"
                @filter="filterBooks"
                @update:model-value="handleBookChange"
              />
            </div>

            <div class="col-12 col-sm-3">
              <q-select
                v-model="selectedChapter"
                outlined
                dense
                emit-value
                map-options
                :options="chapterOptions"
                :label="$t('bible.chapter')"
                :loading="loadingChapters"
                :disable="!selectedBook"
                @update:model-value="loadVerses"
              />
            </div>
          </div>

          <q-input
            v-model="searchText"
            outlined
            dense
            clearable
            debounce="350"
            :label="$t('bible.search')"
            :hint="$t('bible.searchHint')"
            @update:model-value="handleSearchChange"
            @clear="clearSearch"
          >
            <template #prepend>
              <q-icon name="search" />
            </template>
          </q-input>
        </q-card-section>
      </q-card>

      <div v-if="loadingVerses || searching" class="row justify-center q-py-xl">
        <q-spinner color="primary" size="36px" />
      </div>

      <q-card v-else-if="showingSearch && searchResults.length === 0" flat bordered class="empty-card text-center q-pa-xl">
        <q-icon name="search_off" size="44px" color="primary" class="q-mb-sm" />
        <div class="text-body1 text-grey-7">{{ $t('bible.noSearchResults') }}</div>
      </q-card>

      <q-card v-else-if="!showingSearch && verses.length === 0" flat bordered class="empty-card text-center q-pa-xl">
        <q-icon name="menu_book" size="44px" color="primary" class="q-mb-sm" />
        <div class="text-body1 text-grey-7">{{ $t('bible.empty') }}</div>
      </q-card>

      <div v-else class="q-gutter-y-md">
        <div v-if="showingSearch" class="text-subtitle2 text-grey-7">
          {{ $t('bible.resultsFor', { query: normalizedSearch }) }}
        </div>

        <q-card flat bordered class="reader-card">
          <q-card-section>
            <div v-if="!showingSearch" class="chapter-heading q-mb-md">
              <div class="text-h6 text-weight-bold text-dark">{{ selectedBook }} {{ selectedChapter }}</div>
              <div class="text-caption text-grey-6">{{ selectedVersion }}</div>
            </div>

            <div v-if="!showingSearch" class="selection-toolbar q-mb-md">
              <div>
                <div class="text-subtitle2 text-weight-medium text-dark">
                  {{ $t('bible.selectedCount', { count: selectedVerseNumbers.length }) }}
                </div>
                <div class="text-caption text-grey-6">{{ $t('bible.selectionHint') }}</div>
              </div>

              <div class="selection-toolbar__actions">
                <q-btn
                  flat
                  no-caps
                  color="primary"
                  icon="clear_all"
                  :label="$t('bible.clearSelection')"
                  :disable="selectedVerseNumbers.length === 0"
                  @click="clearVerseSelection"
                />
                <q-btn
                  unelevated
                  no-caps
                  color="primary"
                  icon="share"
                  :label="$t('bible.shareSelection')"
                  :disable="selectedVerseNumbers.length === 0"
                  @click="shareSelectedVerses"
                />
              </div>
            </div>

            <div class="verses-list">
              <div
                v-for="verse in displayedVerses"
                :key="verse.id"
                class="verse-row"
                :class="{
                  'verse-row--selected': !showingSearch && isVerseSelected(verse),
                  'verse-row--interactive': !showingSearch
                }"
                :tabindex="showingSearch ? -1 : 0"
                :role="showingSearch ? undefined : 'checkbox'"
                :aria-checked="showingSearch ? undefined : String(isVerseSelected(verse))"
                @click="!showingSearch && handleVerseRowClick(verse)"
                @keydown.enter.prevent="!showingSearch && handleVerseRowClick(verse)"
                @keydown.space.prevent="!showingSearch && handleVerseRowClick(verse)"
              >
                <q-checkbox
                  v-if="!showingSearch"
                  class="verse-checkbox"
                  color="primary"
                  :model-value="isVerseSelected(verse)"
                  @update:model-value="toggleVerseSelection(verse, $event)"
                />
                <div class="verse-number">
                  {{ showingSearch ? verse.reference : verse.verse_start }}
                </div>
                <div class="verse-text">{{ verse.text }}</div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { computed, onActivated, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuasar } from 'quasar'
import { useRoute, useRouter } from 'vue-router'
import bibleService from 'src/services/BibleService'
import createLatestRequest from 'src/utils/createLatestRequest'
import { buildPublicAppUrl } from 'src/utils/publicAppUrl'

const $q = useQuasar()
const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const versions = ref([])
const books = ref([])
const filteredBooks = ref([])
const chapters = ref([])
const verses = ref([])
const searchResults = ref([])
const selectedVersion = ref('')
const selectedBook = ref('')
const selectedChapter = ref(null)
const selectedVerseNumbers = ref([])
const searchText = ref('')
const loadingVersions = ref(false)
const loadingBooks = ref(false)
const loadingChapters = ref(false)
const loadingVerses = ref(false)
const searching = ref(false)
const initialized = ref(false)
const syncingRoute = ref(false)
const versionsRequest = createLatestRequest()
const booksRequest = createLatestRequest()
const chaptersRequest = createLatestRequest()
const versesRequest = createLatestRequest()
const searchRequest = createLatestRequest()

const normalizedSearch = computed(() => searchText.value?.trim() || '')
const showingSearch = computed(() => normalizedSearch.value.length >= 2)
const displayedVerses = computed(() => showingSearch.value ? searchResults.value : verses.value)

const versionOptions = computed(() => versions.value.map(version => ({
  label: version === 'BJ' ? 'Biblia de Jerusalén' : version,
  value: version
})))
const filteredBookOptions = computed(() => filteredBooks.value.map(book => ({ label: book, value: book })))
const chapterOptions = computed(() => chapters.value.map(chapter => ({ label: String(chapter), value: chapter })))

function filterBooks(value, update) {
  update(() => {
    const needle = value.toLowerCase()
    filteredBooks.value = books.value.filter(book => book.toLowerCase().includes(needle))
  })
}

function getRoutePreferences(query = route.query) {
  const chapter = Number.parseInt(String(query.chapter || ''), 10)
  return {
    version: String(query.version || '').trim(),
    book: String(query.book || '').trim(),
    chapter: Number.isInteger(chapter) && chapter > 0 ? chapter : null,
    verses: parseVerseSelection(String(query.verses || ''))
  }
}

function parseVerseSelection(value) {
  if (!value) return []

  const selected = new Set()
  for (const piece of value.split(',')) {
    const token = piece.trim()
    if (!token) continue

    const rangeMatch = token.match(/^(\d+)-(\d+)$/)
    if (rangeMatch) {
      const start = Number.parseInt(rangeMatch[1], 10)
      const end = Number.parseInt(rangeMatch[2], 10)
      const from = Math.min(start, end)
      const to = Math.max(start, end)
      for (let current = from; current <= to; current += 1) selected.add(current)
      continue
    }

    const verse = Number.parseInt(token, 10)
    if (Number.isInteger(verse) && verse > 0) selected.add(verse)
  }

  return [...selected].sort((a, b) => a - b)
}

function serializeVerseSelection(numbers) {
  if (!numbers.length) return ''

  const sorted = [...new Set(numbers)].sort((a, b) => a - b)
  const ranges = []
  let rangeStart = sorted[0]
  let previous = sorted[0]

  for (let index = 1; index < sorted.length; index += 1) {
    const current = sorted[index]
    if (current === previous + 1) {
      previous = current
      continue
    }

    ranges.push(rangeStart === previous ? `${rangeStart}` : `${rangeStart}-${previous}`)
    rangeStart = current
    previous = current
  }

  ranges.push(rangeStart === previous ? `${rangeStart}` : `${rangeStart}-${previous}`)
  return ranges.join(',')
}

function getAvailableVerseNumbers(verseRows = verses.value) {
  const available = new Set()
  verseRows.forEach(verse => {
    const start = Number(verse.verse_start)
    const end = Number(verse.verse_end || verse.verse_start)
    for (let current = start; current <= end; current += 1) {
      available.add(current)
    }
  })
  return available
}

function sanitizeSelectedVerseNumbers(numbers, verseRows = verses.value) {
  const available = getAvailableVerseNumbers(verseRows)
  return [...new Set(numbers)].filter(number => available.has(number)).sort((a, b) => a - b)
}

function isVerseSelected(verse) {
  const start = Number(verse.verse_start)
  const end = Number(verse.verse_end || verse.verse_start)
  return selectedVerseNumbers.value.some(number => number >= start && number <= end)
}

function setSelectedVerseNumbers(numbers) {
  selectedVerseNumbers.value = sanitizeSelectedVerseNumbers(numbers)
}

function toggleVerseSelection(verse, checked) {
  const start = Number(verse.verse_start)
  const end = Number(verse.verse_end || verse.verse_start)
  const current = new Set(selectedVerseNumbers.value)

  for (let number = start; number <= end; number += 1) {
    if (checked) current.add(number)
    else current.delete(number)
  }

  setSelectedVerseNumbers([...current])
  syncRouteQuery()
}

function handleVerseRowClick(verse) {
  toggleVerseSelection(verse, !isVerseSelected(verse))
}

function clearVerseSelection() {
  selectedVerseNumbers.value = []
  syncRouteQuery()
}

async function syncRouteQuery() {
  if (!initialized.value) return

  const nextQuery = {}
  if (selectedVersion.value) nextQuery.version = selectedVersion.value
  if (selectedBook.value) nextQuery.book = selectedBook.value
  if (selectedChapter.value) nextQuery.chapter = String(selectedChapter.value)

  const serializedSelection = serializeVerseSelection(selectedVerseNumbers.value)
  if (serializedSelection) nextQuery.verses = serializedSelection

  if (areQueriesEqual(nextQuery, route.query)) return

  syncingRoute.value = true
  try {
    await router.replace({ path: route.path, query: nextQuery })
  } finally {
    syncingRoute.value = false
  }
}

function areQueriesEqual(nextQuery, currentQuery) {
  const currentEntries = Object.entries(currentQuery)
    .filter(([, value]) => typeof value === 'string' && value.length > 0)
    .sort(([a], [b]) => a.localeCompare(b))
  const nextEntries = Object.entries(nextQuery)
    .filter(([, value]) => typeof value === 'string' && value.length > 0)
    .sort(([a], [b]) => a.localeCompare(b))

  if (currentEntries.length !== nextEntries.length) return false

  return nextEntries.every(([key, value], index) => {
    const [currentKey, currentValue] = currentEntries[index]
    return currentKey === key && currentValue === value
  })
}

async function initialize() {
  if (initialized.value) return

  loadingVersions.value = true
  try {
    const result = await versionsRequest.run(signal => bibleService.getVersions({ signal }))
    if (result.status !== 'success') return
    const nextVersions = result.value
    const preferences = getRoutePreferences()

    versions.value = nextVersions
    selectedVersion.value = nextVersions.includes(preferences.version)
      ? preferences.version
      : (nextVersions.includes('BJ') ? 'BJ' : nextVersions[0] || '')
    await loadBooks(preferences)
    initialized.value = true
    await syncRouteQuery()
  } catch {
    $q.notify({ type: 'negative', message: t('bible.loadError') })
  } finally {
    if (!versionsRequest.isRunning()) {
      loadingVersions.value = false
    }
  }
}

async function handleVersionChange() {
  await loadBooks()
  if (showingSearch.value) await searchVerses()
}

async function loadBooks(preferences = {}) {
  loadingBooks.value = true
  try {
    const result = await booksRequest.run(signal => bibleService.getBooks(selectedVersion.value, { signal }))
    if (result.status !== 'success') return
    const nextBooks = result.value

    books.value = nextBooks
    filteredBooks.value = [...nextBooks]
    selectedBook.value = nextBooks.includes(preferences.book) ? preferences.book : (nextBooks[0] || '')
    await loadChapters(preferences)
  } catch {
    $q.notify({ type: 'negative', message: t('bible.loadError') })
  } finally {
    if (!booksRequest.isRunning()) {
      loadingBooks.value = false
    }
  }
}

async function handleBookChange() {
  await loadChapters()
}

async function loadChapters(preferences = {}) {
  if (!selectedBook.value) return

  loadingChapters.value = true
  try {
    const result = await chaptersRequest.run(signal => bibleService.getChapters({
      book: selectedBook.value,
      version: selectedVersion.value
    }, { signal }))
    if (result.status !== 'success') return
    const nextChapters = result.value

    chapters.value = nextChapters
    selectedChapter.value = nextChapters.includes(preferences.chapter) ? preferences.chapter : (nextChapters[0] || null)
    await loadVerses(preferences)
  } catch {
    $q.notify({ type: 'negative', message: t('bible.loadError') })
  } finally {
    if (!chaptersRequest.isRunning()) {
      loadingChapters.value = false
    }
  }
}

async function loadVerses(preferences = {}) {
  if (!selectedBook.value || !selectedChapter.value) return

  loadingVerses.value = true
  try {
    const result = await versesRequest.run(signal => bibleService.getVerses({
      book: selectedBook.value,
      chapter: selectedChapter.value,
      version: selectedVersion.value
    }, { signal }))
    if (result.status !== 'success') return
    const nextVerses = result.value

    verses.value = nextVerses
    setSelectedVerseNumbers(preferences.verses || [])
    await syncRouteQuery()
  } catch {
    $q.notify({ type: 'negative', message: t('bible.loadError') })
  } finally {
    if (!versesRequest.isRunning()) {
      loadingVerses.value = false
    }
  }
}

async function handleSearchChange() {
  if (!showingSearch.value) {
    searchRequest.cancel()
    searching.value = false
    searchResults.value = []
    return
  }

  await searchVerses()
}

async function searchVerses() {
  searching.value = true
  try {
    const result = await searchRequest.run(signal => bibleService.search({
      query: normalizedSearch.value,
      version: selectedVersion.value
    }, { signal }))
    if (result.status !== 'success') return
    const results = result.value

    searchResults.value = results
  } catch {
    $q.notify({ type: 'negative', message: t('bible.searchError') })
  } finally {
    if (!searchRequest.isRunning()) {
      searching.value = false
    }
  }
}

function clearSearch() {
  searchRequest.cancel()
  searching.value = false
  searchText.value = ''
  searchResults.value = []
}

async function shareSelectedVerses() {
  if (selectedVerseNumbers.value.length === 0) return

  try {
    const url = buildPublicAppUrl({
      path: route.path,
      query: {
        version: selectedVersion.value,
        book: selectedBook.value,
        chapter: String(selectedChapter.value),
        verses: serializeVerseSelection(selectedVerseNumbers.value)
      }
    }, router)

    if (navigator.share) {
      await navigator.share({
        title: `${selectedBook.value} ${selectedChapter.value}`,
        text: t('bible.shareText'),
        url
      })
      return
    }

    await navigator.clipboard.writeText(url)
    $q.notify({ type: 'positive', message: t('bible.shareCopied') })
  } catch (err) {
    if (err?.name !== 'AbortError') {
      $q.notify({ type: 'negative', message: t('bible.shareError') })
    }
  }
}

watch(() => route.fullPath, async () => {
  if (!initialized.value || syncingRoute.value) return

  const preferences = getRoutePreferences()
  const selectionChanged = serializeVerseSelection(preferences.verses) !== serializeVerseSelection(selectedVerseNumbers.value)

  if (preferences.version && preferences.version !== selectedVersion.value) {
    selectedVersion.value = versions.value.includes(preferences.version) ? preferences.version : selectedVersion.value
    await loadBooks(preferences)
    return
  }

  if (preferences.book && preferences.book !== selectedBook.value) {
    selectedBook.value = books.value.includes(preferences.book) ? preferences.book : selectedBook.value
    await loadChapters(preferences)
    return
  }

  if (preferences.chapter && preferences.chapter !== selectedChapter.value) {
    selectedChapter.value = chapters.value.includes(preferences.chapter) ? preferences.chapter : selectedChapter.value
    await loadVerses(preferences)
    return
  }

  if (selectionChanged) setSelectedVerseNumbers(preferences.verses)
})

onActivated(initialize)
</script>

<style scoped>
.bible-page {
  min-height: 100vh;
  background: #f4f0fa;
}

.bible-container {
  width: 100%;
  max-width: 820px;
  margin: 0 auto;
}

.reader-card,
.empty-card {
  border-radius: 16px;
  border-color: #e5dcef;
  background: #fff;
}

.chapter-heading {
  border-bottom: 1px solid #eee8f5;
  padding-bottom: 12px;
}

.selection-toolbar {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
  padding: 14px 16px;
  border-radius: 14px;
  background: #f8f3fd;
  border: 1px solid #eadcf9;
}

.selection-toolbar__actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.verses-list {
  display: grid;
  gap: 14px;
}

.verse-row {
  display: grid;
  grid-template-columns: auto minmax(42px, auto) 1fr;
  gap: 12px;
  align-items: start;
  padding: 10px 12px;
  border-radius: 14px;
  transition: background-color 0.2s ease, box-shadow 0.2s ease;
}

.verse-row--interactive {
  cursor: pointer;
}

.verse-row--interactive:focus-visible {
  outline: 2px solid #7b2fbe;
  outline-offset: 2px;
}

.verse-row--selected {
  background: #faf5ff;
  box-shadow: inset 0 0 0 1px #eadcf9;
}

.verse-checkbox {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: 0;
  opacity: 0;
  pointer-events: none;
  overflow: hidden;
}

.verse-number {
  color: #7b2fbe;
  font-weight: 700;
  font-size: 0.85rem;
  line-height: 1.7;
  overflow-wrap: anywhere;
}

.verse-text {
  color: #2f2a36;
  line-height: 1.72;
  overflow-wrap: anywhere;
  white-space: pre-wrap;
}

@media (max-width: 599px) {
  .selection-toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .verse-row {
    grid-template-columns: auto 36px 1fr;
    gap: 10px;
  }
}
</style>
