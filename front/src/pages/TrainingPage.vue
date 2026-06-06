<template>
  <q-page class="q-pa-md">
    <!-- Header con botón volver -->
    <div class="flex items-center q-mb-md q-gutter-sm">
      <q-btn flat round dense icon="arrow_back" @click="$router.push('/admin')" />
      <div class="text-h6">{{ $t('training.title') }}</div>
    </div>

    <q-form ref="formRef" @submit.prevent="onSubmit" class="q-gutter-md">

      <!-- Categoría -->
      <q-select
        v-model="form.category"
        :options="categoryOptions"
        :label="$t('training.category')"
        outlined
        emit-value
        map-options
        :loading="loadingTopics"
        :rules="[val => !!val || $t('training.required')]"
      />

      <!-- Libro -->
      <q-input
        v-model="form.book"
        :label="$t('training.book')"
        outlined
        :rules="[val => !!val || $t('training.required')]"
      />

      <!-- Capítulo -->
      <q-input
        v-model.number="form.chapter"
        :label="$t('training.chapter')"
        type="number"
        min="1"
        outlined
        :rules="[val => !!val || $t('training.required')]"
      />

      <!-- Versículos -->
      <div class="row" style="gap: 8px">
        <div class="col">
          <q-input
            v-model.number="form.verse_start"
            :label="$t('training.verseStart')"
            type="number"
            min="1"
            outlined
            :rules="[val => !!val || $t('training.required')]"
          />
        </div>
        <div class="col">
          <q-input
            v-model.number="form.verse_end"
            :label="$t('training.verseEnd')"
            type="number"
            min="1"
            outlined
            :rules="[val => !!val || $t('training.required')]"
          />
        </div>
      </div>

      <!-- Versión -->
      <q-select
        v-model="form.version"
        :options="versionOptions"
        :label="$t('training.version')"
        outlined
        emit-value
        map-options
        :rules="[val => !!val || $t('training.required')]"
      />

      <!-- Texto del versículo -->
      <q-input
        v-model="form.text"
        :label="$t('training.text')"
        type="textarea"
        outlined
        autogrow
        rows="3"
        :rules="[val => !!val || $t('training.required')]"
      />

      <!-- Peso (relevancia del versículo para el tema) -->
      <div>
        <div class="text-caption q-mb-xs">{{ $t('training.weight') }}: <strong>{{ form.weight }}</strong></div>
        <q-slider
          v-model="form.weight"
          :min="1"
          :max="10"
          :step="1"
          snap
          label
          color="primary"
        />
        <div class="row justify-between text-caption text-grey">
          <span>{{ $t('training.weightLow') }}</span>
          <span>{{ $t('training.weightHigh') }}</span>
        </div>
      </div>

      <!-- Acciones -->
      <div class="row q-gutter-sm q-mt-sm">
        <q-btn
          type="submit"
          :label="$t('training.save')"
          color="primary"
          unelevated
          :loading="saving"
        />
        <q-btn
          :label="$t('training.clear')"
          flat
          @click="resetForm"
        />
      </div>

    </q-form>

    <!-- Historial de entradas -->
    <q-separator class="q-my-lg" />
    <div class="text-subtitle1 q-mb-sm">{{ $t('training.history') }}</div>

    <q-table
      :rows="verses.rows"
      :columns="tableColumns"
      :loading="loadingVerses"
      :rows-per-page-options="[10, 20, 50]"
      v-model:pagination="pagination"
      row-key="id"
      flat
      bordered
      @request="onTableRequest"
    >
      <template #body-cell-topics="props">
        <q-td :props="props">
          <q-badge
            v-for="topic in props.row.Topics"
            :key="topic.id"
            :label="topic.name"
            color="primary"
            class="q-mr-xs"
          />
        </q-td>
      </template>

      <template #body-cell-text="props">
        <q-td :props="props">
          <span>{{ props.row.text.length > 80 ? props.row.text.slice(0, 80) + '…' : props.row.text }}</span>
          <q-tooltip v-if="props.row.text.length > 80" max-width="300px">{{ props.row.text }}</q-tooltip>
        </q-td>
      </template>

      <template #body-cell-weight="props">
        <q-td :props="props">
          <q-badge
            v-for="(weight, index) in getTopicWeights(props.row)"
            :key="`${weight}-${index}`"
            :label="weight"
            color="secondary"
          />
        </q-td>
      </template>

      <template #no-data>
        <div class="text-grey text-center full-width q-py-md">{{ $t('training.empty') }}</div>
      </template>
    </q-table>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuasar } from 'quasar'
import trainingService from 'src/services/TrainingService'

const $q = useQuasar()
const { t } = useI18n()

const formRef = ref(null)
const saving = ref(false)
const loadingTopics = ref(false)
const loadingVerses = ref(false)

const verses = ref({ rows: [], total: 0 })
const pagination = ref({ page: 1, rowsPerPage: 10, rowsNumber: 0 })

const tableColumns = computed(() => [
  { name: 'reference', label: t('training.reference'), field: 'reference', align: 'left', sortable: false },
  { name: 'version',   label: t('training.version'),   field: 'version',   align: 'left', sortable: false },
  { name: 'topics',    label: t('training.topics'),    field: 'Topics',    align: 'left', sortable: false },
  { name: 'weight',    label: t('training.weight'),    field: row => getTopicWeights(row).join(', '), align: 'left', sortable: false },
  { name: 'text',      label: t('training.text'),      field: 'text',      align: 'left', sortable: false }
])

// Topics cargados desde el backend
const categoryOptions = ref([])

async function loadTopics() {
  loadingTopics.value = true
  try {
    const topics = await trainingService.getTopics()
    categoryOptions.value = topics.map(t => ({ label: t.name, value: t.id }))
  } catch {
    $q.notify({ type: 'negative', message: t('training.loadTopicsError') })
  } finally {
    loadingTopics.value = false
  }
}

onMounted(() => {
  loadTopics()
  loadVerses()
})

async function loadVerses (page = 1, limit = pagination.value.rowsPerPage) {
  loadingVerses.value = true
  try {
    const data = await trainingService.getVerses({ page, limit })
    verses.value = data
    pagination.value.rowsNumber = data.total
    pagination.value.page = data.page
  } catch {
    $q.notify({ type: 'negative', message: t('training.loadVersesError') })
  } finally {
    loadingVerses.value = false
  }
}

function onTableRequest ({ pagination: p }) {
  pagination.value.rowsPerPage = p.rowsPerPage
  loadVerses(p.page, p.rowsPerPage)
}

function getTopicWeights (row) {
  return row.Topics
    ?.map(topic => topic.TopicVerse?.weight)
    .filter(weight => weight !== undefined && weight !== null) || []
}

const versionOptions = [
  { label: 'RVR1960', value: 'RVR1960' },
  { label: 'NVI', value: 'NVI' },
  { label: 'LBLA', value: 'LBLA' },
  { label: 'DHH', value: 'DHH' },
  { label: 'RVC', value: 'RVC' }
]

function defaultForm () {
  return {
    category: null,  // topic_id (number)
    book: '',
    chapter: null,
    verse_start: null,
    verse_end: null,
    version: 'RVR1960',
    text: '',
    weight: 5
  }
}

const form = ref(defaultForm())

const reference = computed(() => {
  const { book, chapter, verse_start, verse_end } = form.value
  if (!book || !chapter) return ''
  const verses = verse_start
    ? verse_end && verse_end !== verse_start
      ? `${verse_start}-${verse_end}`
      : `${verse_start}`
    : ''
  return verses ? `${book} ${chapter}:${verses}` : `${book} ${chapter}`
})

function resetForm () {
  form.value = defaultForm()
  nextTick(() => formRef.value?.resetValidation())
}

async function onSubmit () {
  saving.value = true
  try {
    const payload = {
      topic_id: form.value.category,
      book: form.value.book,
      chapter: form.value.chapter,
      verse_start: form.value.verse_start,
      verse_end: form.value.verse_end || null,
      reference: reference.value,
      text: form.value.text,
      version: form.value.version,
      weight: form.value.weight
    }
    await trainingService.createVerse(payload)
    $q.notify({ type: 'positive', message: t('training.saveSuccess') })
    resetForm()
    await loadVerses(1, pagination.value.rowsPerPage)
  } catch (err) {
    $q.notify({ type: 'negative', message: err.message || t('training.saveError') })
  } finally {
    saving.value = false
  }
}
</script>
