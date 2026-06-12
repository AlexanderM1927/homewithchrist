<template>
  <q-page class="training-page q-pa-md">
    <div class="training-container">
      <div class="flex items-center q-mb-md q-gutter-sm">
        <q-btn flat round dense icon="arrow_back" @click="$router.push('/admin')" />
        <div>
          <div class="text-h6">{{ $t('training.title') }}</div>
          <div class="text-caption text-grey-7">{{ $t('training.subtitle') }}</div>
        </div>
      </div>

      <q-card flat bordered class="panel-card q-mb-lg">
        <q-card-section class="q-gutter-y-md">
          <div class="row q-col-gutter-sm">
            <div class="col-12 col-md-4">
              <q-select
                v-model="form.topicId"
                :options="topicOptions"
                :label="$t('training.category')"
                outlined
                emit-value
                map-options
                :loading="loadingTopics"
              />
            </div>
            <div class="col-12 col-sm-4 col-md-2">
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
            <div class="col-12 col-sm-5 col-md-4">
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
            <div class="col-12 col-sm-3 col-md-2">
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

          <div>
            <div class="text-caption q-mb-xs">
              {{ $t('training.weight') }}: <strong>{{ form.weight }}</strong>
            </div>
            <q-slider v-model="form.weight" :min="1" :max="10" :step="1" snap label color="primary" />
          </div>

          <div class="row q-col-gutter-sm items-end">
            <div class="col-6 col-sm-3">
              <q-input v-model.number="rangeStart" type="number" min="1" outlined dense :label="$t('training.verseStart')" />
            </div>
            <div class="col-6 col-sm-3">
              <q-input v-model.number="rangeEnd" type="number" min="1" outlined dense :label="$t('training.verseEnd')" />
            </div>
            <div class="col-12 col-sm-auto">
              <q-btn flat color="primary" icon="done_all" :label="$t('training.selectRange')" @click="selectRange" />
            </div>
            <div class="col-12 col-sm-auto">
              <q-btn flat color="grey-7" :label="$t('training.clearSelection')" @click="selectedVerseIds = []" />
            </div>
          </div>
        </q-card-section>
      </q-card>

      <q-card flat bordered class="panel-card q-mb-lg">
        <q-card-section class="row items-center justify-between q-gutter-sm">
          <div>
            <div class="text-subtitle1 text-weight-medium">
              {{ selectedBook }} {{ selectedChapter || '' }}
            </div>
            <div class="text-caption text-grey-7">
              {{ $t('training.selectedCount', { count: selectedVerseIds.length }) }}
            </div>
          </div>
          <q-btn
            color="primary"
            unelevated
            icon="link"
            :label="$t('training.associate')"
            :loading="saving"
            :disable="!canAssociate"
            @click="associateSelected"
          />
        </q-card-section>

        <q-separator />

        <div v-if="loadingChapterVerses" class="row justify-center q-pa-xl">
          <q-spinner color="primary" size="36px" />
        </div>
        <q-card-section v-else-if="chapterVerses.length === 0" class="text-center text-grey-7 q-pa-xl">
          {{ $t('training.noChapterVerses') }}
        </q-card-section>
        <q-list v-else separator>
          <q-item v-for="verse in chapterVerses" :key="verse.id" tag="label" clickable>
            <q-item-section avatar top>
              <q-checkbox v-model="selectedVerseIds" :val="verse.id" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-weight-medium">{{ verse.reference }}</q-item-label>
              <q-item-label caption class="verse-text">{{ verse.text }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card>

      <div class="text-subtitle1 q-mb-sm">{{ $t('training.history') }}</div>
      <TableFilters
        v-model:search="filters.search"
        :search-label="$t('tableFilters.search')"
        :search-placeholder="$t('training.searchPlaceholder')"
        v-model:select-value="filters.createdBy"
        :select-options="userFilterOptions"
        :select-label="$t('training.createdBy')"
        :select-placeholder="$t('training.allCreators')"
        :select-loading="loadingUsers"
        :clear-label="$t('tableFilters.clear')"
        @change="onFiltersChange"
        @clear="onFiltersClear"
      />

      <q-table
        :rows="relations.rows"
        :columns="tableColumns"
        :loading="loadingRelations"
        :rows-per-page-options="[10, 20, 50]"
        v-model:pagination="pagination"
        row-key="id"
        flat
        bordered
        @request="onTableRequest"
      >
        <template #body-cell-reference="props">
          <q-td :props="props">{{ props.row.Verse?.reference }}</q-td>
        </template>
        <template #body-cell-version="props">
          <q-td :props="props">{{ props.row.Verse?.version }}</q-td>
        </template>
        <template #body-cell-topic="props">
          <q-td :props="props"><q-badge color="primary" :label="props.row.Topic?.name" /></q-td>
        </template>
        <template #body-cell-createdBy="props">
          <q-td :props="props">{{ props.row.creator?.name || '-' }}</q-td>
        </template>
        <template #body-cell-text="props">
          <q-td :props="props">
            <span>{{ truncate(props.row.Verse?.text) }}</span>
            <q-tooltip max-width="360px">{{ props.row.Verse?.text }}</q-tooltip>
          </q-td>
        </template>
        <template #body-cell-actions="props">
          <q-td :props="props" class="q-gutter-xs">
            <q-btn flat round dense icon="edit" color="primary" @click="openEdit(props.row)" />
            <q-btn flat round dense icon="delete" color="negative" @click="confirmDelete(props.row)" />
          </q-td>
        </template>
        <template #no-data>
          <div class="text-grey text-center full-width q-py-md">{{ $t('training.empty') }}</div>
        </template>
      </q-table>
    </div>

    <q-dialog v-model="editDialog">
      <q-card style="min-width: min(420px, 90vw)">
        <q-card-section>
          <div class="text-h6">{{ $t('training.editRelation') }}</div>
          <div class="text-caption text-grey-7">{{ editingRelation?.Verse?.reference }} · {{ editingRelation?.Topic?.name }}</div>
        </q-card-section>
        <q-card-section class="q-gutter-md">
          <div>{{ $t('training.weight') }}: <strong>{{ editForm.weight }}</strong></div>
          <q-slider v-model="editForm.weight" :min="1" :max="10" snap label color="primary" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat v-close-popup :label="$t('training.cancel')" />
          <q-btn color="primary" unelevated :label="$t('training.saveChanges')" :loading="updating" @click="saveEdit" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuasar } from 'quasar'
import trainingService from 'src/services/TrainingService'
import bibleService from 'src/services/BibleService'
import authService from 'src/services/AuthService'
import TableFilters from 'src/components/TableFilters.vue'

const $q = useQuasar()
const { t } = useI18n()

const loadingTopics = ref(false)
const loadingVersions = ref(false)
const loadingBooks = ref(false)
const loadingChapters = ref(false)
const loadingChapterVerses = ref(false)
const loadingRelations = ref(false)
const loadingUsers = ref(false)
const saving = ref(false)
const updating = ref(false)

const topics = ref([])
const versions = ref([])
const books = ref([])
const filteredBooks = ref([])
const chapters = ref([])
const chapterVerses = ref([])
const selectedVersion = ref('')
const selectedBook = ref('')
const selectedChapter = ref(null)
const selectedVerseIds = ref([])
const rangeStart = ref(null)
const rangeEnd = ref(null)

const form = ref({ topicId: null, weight: 5 })
const relations = ref({ rows: [], total: 0 })
const pagination = ref({ page: 1, rowsPerPage: 10, rowsNumber: 0 })
const filters = ref({ search: '', createdBy: null })
const userFilterOptions = ref([])

const editDialog = ref(false)
const editingRelation = ref(null)
const editForm = ref({ weight: 5 })

const topicOptions = computed(() => topics.value.map(topic => ({ label: topic.name, value: topic.id })))
const versionOptions = computed(() => versions.value.map(version => ({ label: version, value: version })))
const bookOptions = computed(() => filteredBooks.value.map(book => ({ label: book, value: book })))
const chapterOptions = computed(() => chapters.value.map(chapter => ({ label: String(chapter), value: chapter })))
const canAssociate = computed(() => form.value.topicId && selectedVerseIds.value.length > 0)

const tableColumns = computed(() => [
  { name: 'reference', label: t('training.reference'), field: row => row.Verse?.reference, align: 'left' },
  { name: 'version', label: t('training.version'), field: row => row.Verse?.version, align: 'left' },
  { name: 'topic', label: t('training.category'), field: row => row.Topic?.name, align: 'left' },
  { name: 'weight', label: t('training.weight'), field: 'weight', align: 'center' },
  { name: 'createdBy', label: t('training.createdBy'), field: row => row.creator?.name, align: 'left' },
  { name: 'text', label: t('training.text'), field: row => row.Verse?.text, align: 'left' },
  { name: 'actions', label: t('training.actions'), field: 'id', align: 'right' }
])

onMounted(async () => {
  await Promise.all([loadTopics(), loadUsers(), loadRelations(), initializeBible()])
})

async function loadTopics() {
  loadingTopics.value = true
  try {
    topics.value = await trainingService.getTopics()
  } catch {
    $q.notify({ type: 'negative', message: t('training.loadTopicsError') })
  } finally {
    loadingTopics.value = false
  }
}

async function initializeBible() {
  loadingVersions.value = true
  try {
    versions.value = await bibleService.getVersions()
    selectedVersion.value = versions.value.includes('RVR1960') ? 'RVR1960' : versions.value[0] || ''
    await loadBooks()
  } catch {
    $q.notify({ type: 'negative', message: t('bible.loadError') })
  } finally {
    loadingVersions.value = false
  }
}

async function loadBooks() {
  if (!selectedVersion.value) return
  loadingBooks.value = true
  selectedVerseIds.value = []
  try {
    books.value = await bibleService.getBooks(selectedVersion.value)
    filteredBooks.value = [...books.value]
    selectedBook.value = books.value[0] || ''
    await loadChapters()
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
  selectedVerseIds.value = []
  try {
    chapters.value = await bibleService.getChapters({ book: selectedBook.value, version: selectedVersion.value })
    selectedChapter.value = chapters.value[0] || null
    await loadChapterVerses()
  } finally {
    loadingChapters.value = false
  }
}

async function loadChapterVerses() {
  if (!selectedBook.value || !selectedChapter.value) return
  loadingChapterVerses.value = true
  selectedVerseIds.value = []
  rangeStart.value = null
  rangeEnd.value = null
  try {
    chapterVerses.value = await bibleService.getVerses({
      book: selectedBook.value,
      chapter: selectedChapter.value,
      version: selectedVersion.value
    })
  } finally {
    loadingChapterVerses.value = false
  }
}

function selectRange() {
  const start = Math.min(Number(rangeStart.value), Number(rangeEnd.value || rangeStart.value))
  const end = Math.max(Number(rangeStart.value), Number(rangeEnd.value || rangeStart.value))
  if (!start) return
  selectedVerseIds.value = chapterVerses.value
    .filter(verse => verse.verse_start >= start && verse.verse_start <= end)
    .map(verse => verse.id)
}

async function associateSelected() {
  saving.value = true
  try {
    await trainingService.associateVerses({
      topic_id: form.value.topicId,
      verse_ids: selectedVerseIds.value,
      weight: form.value.weight
    })
    $q.notify({ type: 'positive', message: t('training.saveSuccess') })
    selectedVerseIds.value = []
    await loadRelations(1, pagination.value.rowsPerPage)
  } catch (err) {
    $q.notify({ type: 'negative', message: err.message || t('training.saveError') })
  } finally {
    saving.value = false
  }
}

async function loadUsers() {
  loadingUsers.value = true
  try {
    const data = await authService.getUsers()
    userFilterOptions.value = data.users
      .filter(user => user.role === 'admin' || user.role_id === 3)
      .map(user => ({ label: user.name || user.phone || `#${user.id}`, value: user.id }))
  } finally {
    loadingUsers.value = false
  }
}

async function loadRelations(page = 1, limit = pagination.value.rowsPerPage) {
  loadingRelations.value = true
  try {
    const data = await trainingService.getTopicVerses({
      page,
      limit,
      search: filters.value.search,
      createdBy: filters.value.createdBy
    })
    relations.value = data
    pagination.value = { ...pagination.value, page: data.page, rowsNumber: data.total }
  } catch {
    $q.notify({ type: 'negative', message: t('training.loadVersesError') })
  } finally {
    loadingRelations.value = false
  }
}

function onTableRequest({ pagination: next }) {
  pagination.value.rowsPerPage = next.rowsPerPage
  loadRelations(next.page, next.rowsPerPage)
}

function onFiltersChange() {
  loadRelations(1, pagination.value.rowsPerPage)
}

function onFiltersClear() {
  filters.value = { search: '', createdBy: null }
  loadRelations(1, pagination.value.rowsPerPage)
}

function openEdit(row) {
  editingRelation.value = row
  editForm.value = { weight: row.weight }
  editDialog.value = true
}

async function saveEdit() {
  updating.value = true
  try {
    await trainingService.updateTopicVerse(editingRelation.value.id, editForm.value)
    editDialog.value = false
    $q.notify({ type: 'positive', message: t('training.updateSuccess') })
    await loadRelations(pagination.value.page, pagination.value.rowsPerPage)
  } catch (err) {
    $q.notify({ type: 'negative', message: err.message || t('training.updateError') })
  } finally {
    updating.value = false
  }
}

function confirmDelete(row) {
  $q.dialog({
    title: t('training.deleteTitle'),
    message: t('training.deleteMessage', { reference: row.Verse?.reference, topic: row.Topic?.name }),
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await trainingService.deleteTopicVerse(row.id)
      $q.notify({ type: 'positive', message: t('training.deleteSuccess') })
      await loadRelations(pagination.value.page, pagination.value.rowsPerPage)
    } catch (err) {
      $q.notify({ type: 'negative', message: err.message || t('training.deleteError') })
    }
  })
}

function truncate(value = '') {
  return value.length > 80 ? `${value.slice(0, 80)}...` : value
}
</script>

<style scoped>
.training-page { background: #f4f0fa; min-height: 100vh; }
.training-container { width: 100%; max-width: 1050px; margin: 0 auto; }
.panel-card { border-radius: 16px; border-color: #e5dcef; }
.verse-text { white-space: normal; line-height: 1.55; font-size: 0.95rem; }
</style>
