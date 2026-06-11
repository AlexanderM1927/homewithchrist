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

            <div class="verses-list">
              <div
                v-for="verse in displayedVerses"
                :key="verse.id"
                class="verse-row"
              >
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
import { computed, onActivated, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuasar } from 'quasar'
import bibleService from 'src/services/BibleService'

const $q = useQuasar()
const { t } = useI18n()

const versions = ref([])
const books = ref([])
const filteredBooks = ref([])
const chapters = ref([])
const verses = ref([])
const searchResults = ref([])
const selectedVersion = ref('')
const selectedBook = ref('')
const selectedChapter = ref(null)
const searchText = ref('')
const loadingVersions = ref(false)
const loadingBooks = ref(false)
const loadingChapters = ref(false)
const loadingVerses = ref(false)
const searching = ref(false)
const initialized = ref(false)

const normalizedSearch = computed(() => searchText.value?.trim() || '')
const showingSearch = computed(() => normalizedSearch.value.length >= 2)
const displayedVerses = computed(() => showingSearch.value ? searchResults.value : verses.value)

const versionOptions = computed(() => versions.value.map(version => ({ label: version, value: version })))
const filteredBookOptions = computed(() => filteredBooks.value.map(book => ({ label: book, value: book })))
const chapterOptions = computed(() => chapters.value.map(chapter => ({ label: String(chapter), value: chapter })))

function filterBooks(value, update) {
  update(() => {
    const needle = value.toLowerCase()
    filteredBooks.value = books.value.filter(book => book.toLowerCase().includes(needle))
  })
}

async function initialize() {
  if (initialized.value) return

  loadingVersions.value = true
  try {
    versions.value = await bibleService.getVersions()
    selectedVersion.value = versions.value[0] || ''
    await loadBooks()
    initialized.value = true
  } catch {
    $q.notify({ type: 'negative', message: t('bible.loadError') })
  } finally {
    loadingVersions.value = false
  }
}

async function handleVersionChange() {
  await loadBooks()
  if (showingSearch.value) await searchVerses()
}

async function loadBooks() {
  loadingBooks.value = true
  try {
    books.value = await bibleService.getBooks(selectedVersion.value)
    filteredBooks.value = [...books.value]
    selectedBook.value = books.value[0] || ''
    await loadChapters()
  } catch {
    $q.notify({ type: 'negative', message: t('bible.loadError') })
  } finally {
    loadingBooks.value = false
  }
}

async function handleBookChange() {
  await loadChapters()
}

async function loadChapters() {
  if (!selectedBook.value) return

  loadingChapters.value = true
  try {
    chapters.value = await bibleService.getChapters({
      book: selectedBook.value,
      version: selectedVersion.value
    })
    selectedChapter.value = chapters.value[0] || null
    await loadVerses()
  } catch {
    $q.notify({ type: 'negative', message: t('bible.loadError') })
  } finally {
    loadingChapters.value = false
  }
}

async function loadVerses() {
  if (!selectedBook.value || !selectedChapter.value) return

  loadingVerses.value = true
  try {
    verses.value = await bibleService.getVerses({
      book: selectedBook.value,
      chapter: selectedChapter.value,
      version: selectedVersion.value
    })
  } catch {
    $q.notify({ type: 'negative', message: t('bible.loadError') })
  } finally {
    loadingVerses.value = false
  }
}

async function handleSearchChange() {
  if (!showingSearch.value) {
    searchResults.value = []
    return
  }

  await searchVerses()
}

async function searchVerses() {
  searching.value = true
  try {
    searchResults.value = await bibleService.search({
      query: normalizedSearch.value,
      version: selectedVersion.value
    })
  } catch {
    $q.notify({ type: 'negative', message: t('bible.searchError') })
  } finally {
    searching.value = false
  }
}

function clearSearch() {
  searchText.value = ''
  searchResults.value = []
}

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

.verses-list {
  display: grid;
  gap: 14px;
}

.verse-row {
  display: grid;
  grid-template-columns: minmax(42px, auto) 1fr;
  gap: 12px;
  align-items: start;
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
  .verse-row {
    grid-template-columns: 36px 1fr;
    gap: 10px;
  }
}
</style>
