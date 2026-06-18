<template>
  <q-page class="verse-corrections-page q-pa-md">
    <div class="page-container">
      <div class="flex items-center q-mb-md q-gutter-sm">
        <q-btn flat round dense icon="arrow_back" @click="$router.push('/admin')" />
        <div>
          <div class="text-h6">{{ $t('verseCorrections.title') }}</div>
          <div class="text-caption text-grey-7">{{ $t('verseCorrections.subtitle') }}</div>
        </div>
      </div>

      <q-card flat bordered class="panel-card q-mb-lg">
        <q-card-section>
          <div class="row q-col-gutter-sm">
            <div class="col-12 col-sm-4 col-md-3">
              <q-select
                v-model="selectedVersion"
                :options="versionOptions"
                :label="$t('training.version')"
                outlined
                emit-value
                map-options
                :loading="loadingVersions"
                @update:model-value="loadBooks"
              />
            </div>
            <div class="col-12 col-sm-5 col-md-6">
              <q-select
                v-model="selectedBook"
                :options="bookOptions"
                :label="$t('training.book')"
                outlined
                emit-value
                map-options
                use-input
                input-debounce="0"
                :loading="loadingBooks"
                @filter="filterBooks"
                @update:model-value="loadChapters"
              />
            </div>
            <div class="col-12 col-sm-3 col-md-3">
              <q-select
                v-model="selectedChapter"
                :options="chapterOptions"
                :label="$t('training.chapter')"
                outlined
                emit-value
                map-options
                :loading="loadingChapters"
                :disable="!selectedBook"
                @update:model-value="loadChapterVerses"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>

      <q-card flat bordered class="panel-card">
        <div v-if="loadingVerses" class="row justify-center q-pa-xl">
          <q-spinner color="primary" size="36px" />
        </div>
        <q-card-section v-else-if="verses.length === 0" class="text-center text-grey-7 q-pa-xl">
          {{ $t('verseCorrections.empty') }}
        </q-card-section>
        <q-list v-else separator>
          <q-item v-for="verse in verses" :key="verse.id">
            <q-item-section>
              <q-item-label class="text-weight-medium">{{ verse.reference }}</q-item-label>
              <q-item-label caption class="verse-text">{{ verse.text }}</q-item-label>
              <q-item-label v-if="verse.modifier" caption class="audit-text q-mt-xs">
                <q-icon name="history" size="14px" class="q-mr-xs" />
                {{ $t('verseCorrections.modifiedBy', {
                  name: verse.modifier.name,
                  date: formatModifiedAt(verse.updatedAt)
                }) }}
              </q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-btn
                flat
                round
                dense
                icon="edit"
                color="primary"
                :aria-label="$t('verseCorrections.edit')"
                @click="openEdit(verse)"
              />
            </q-item-section>
          </q-item>
        </q-list>
      </q-card>
    </div>

    <q-dialog v-model="editDialog">
      <q-card class="edit-card">
        <q-card-section>
          <div class="text-h6">{{ $t('verseCorrections.editTitle') }}</div>
          <div class="text-caption text-grey-7">
            {{ editingVerse?.book }} {{ editingVerse?.chapter }} · {{ editingVerse?.version }}
          </div>
        </q-card-section>
        <q-card-section class="q-gutter-md">
          <q-input
            :model-value="editingVerse?.reference"
            outlined
            readonly
            :label="$t('training.reference')"
            :hint="$t('verseCorrections.referenceHint')"
          />
          <q-input
            v-model="editForm.text"
            outlined
            autogrow
            type="textarea"
            maxlength="700"
            counter
            :label="$t('training.text')"
            :rules="[requiredRule]"
          />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat v-close-popup :label="$t('verseCorrections.cancel')" />
          <q-btn
            color="primary"
            unelevated
            :label="$t('verseCorrections.save')"
            :loading="saving"
            :disable="!canSave"
            @click="saveVerse"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuasar } from 'quasar'
import bibleService from 'src/services/BibleService'
import trainingService from 'src/services/TrainingService'

const $q = useQuasar()
const { t } = useI18n()

const loadingVersions = ref(false)
const loadingBooks = ref(false)
const loadingChapters = ref(false)
const loadingVerses = ref(false)
const saving = ref(false)
const versions = ref([])
const books = ref([])
const filteredBooks = ref([])
const chapters = ref([])
const verses = ref([])
const selectedVersion = ref('')
const selectedBook = ref('')
const selectedChapter = ref(null)
const editDialog = ref(false)
const editingVerse = ref(null)
const editForm = ref({ text: '' })

const versionOptions = computed(() => versions.value.map(version => ({ label: version, value: version })))
const bookOptions = computed(() => filteredBooks.value.map(book => ({ label: book, value: book })))
const chapterOptions = computed(() => chapters.value.map(chapter => ({ label: String(chapter), value: chapter })))
const canSave = computed(() => {
  const text = editForm.value.text.trim()
  return Boolean(text) && text.length <= 700
})
const requiredRule = value => Boolean(String(value || '').trim()) || t('verseCorrections.required')

onMounted(initializeBible)

async function initializeBible() {
  loadingVersions.value = true
  try {
    versions.value = await bibleService.getVersions()
    selectedVersion.value = versions.value.includes('BJ') ? 'BJ' : versions.value[0] || ''
    await loadBooks()
  } catch {
    notifyLoadError()
  } finally {
    loadingVersions.value = false
  }
}

async function loadBooks() {
  if (!selectedVersion.value) return
  loadingBooks.value = true
  verses.value = []
  try {
    books.value = await bibleService.getBooks(selectedVersion.value)
    filteredBooks.value = [...books.value]
    selectedBook.value = books.value[0] || ''
    await loadChapters()
  } catch {
    notifyLoadError()
  } finally {
    loadingBooks.value = false
  }
}

function filterBooks(value, update) {
  update(() => {
    const needle = value.toLowerCase()
    filteredBooks.value = books.value.filter(book => book.toLowerCase().includes(needle))
  })
}

async function loadChapters() {
  if (!selectedBook.value) return
  loadingChapters.value = true
  verses.value = []
  try {
    chapters.value = await bibleService.getChapters({
      book: selectedBook.value,
      version: selectedVersion.value
    })
    selectedChapter.value = chapters.value[0] || null
    await loadChapterVerses()
  } catch {
    notifyLoadError()
  } finally {
    loadingChapters.value = false
  }
}

async function loadChapterVerses() {
  if (!selectedBook.value || !selectedChapter.value) return
  loadingVerses.value = true
  try {
    verses.value = await trainingService.getChapterVerses({
      book: selectedBook.value,
      chapter: selectedChapter.value,
      version: selectedVersion.value
    })
  } catch {
    notifyLoadError()
  } finally {
    loadingVerses.value = false
  }
}

function openEdit(verse) {
  editingVerse.value = verse
  editForm.value = {
    text: verse.text
  }
  editDialog.value = true
}

async function saveVerse() {
  if (!canSave.value || !editingVerse.value) return
  saving.value = true
  try {
    const updated = await trainingService.updateVerse(editingVerse.value.id, {
      text: editForm.value.text.trim()
    })
    const index = verses.value.findIndex(verse => verse.id === updated.id)
    if (index >= 0) verses.value[index] = updated
    editDialog.value = false
    $q.notify({ type: 'positive', message: t('verseCorrections.saveSuccess') })
  } catch (err) {
    $q.notify({ type: 'negative', message: err.message || t('verseCorrections.saveError') })
  } finally {
    saving.value = false
  }
}

function notifyLoadError() {
  $q.notify({ type: 'negative', message: t('verseCorrections.loadError') })
}

function formatModifiedAt(value) {
  if (!value) return ''
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(value))
}
</script>

<style scoped>
.verse-corrections-page { background: #f4f0fa; min-height: 100vh; }
.page-container { width: 100%; max-width: 900px; margin: 0 auto; }
.panel-card { border-radius: 16px; border-color: #e5dcef; }
.verse-text { white-space: normal; line-height: 1.55; font-size: 0.95rem; }
.audit-text { color: #6d5b78; }
.edit-card { width: min(620px, 94vw); }
</style>
