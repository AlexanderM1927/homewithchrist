<template>
  <q-page class="q-pa-md">
    <div class="text-h6 q-mb-md">{{ $t('training.title') }}</div>

    <q-form @submit.prevent="onSubmit" class="q-gutter-md">

      <!-- Categoría -->
      <q-select
        v-model="form.category"
        :options="categoryOptions"
        :label="$t('training.category')"
        outlined
        emit-value
        map-options
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
      <div class="row q-col-gutter-md">
        <div class="col-6">
          <q-input
            v-model.number="form.verse_start"
            :label="$t('training.verseStart')"
            type="number"
            min="1"
            outlined
            :rules="[val => !!val || $t('training.required')]"
          />
        </div>
        <div class="col-6">
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

    <q-list bordered separator v-if="entries.length">
      <q-item v-for="(entry, i) in entries" :key="i">
        <q-item-section>
          <q-item-label>
            <q-badge :label="entry.category" color="primary" class="q-mr-xs" />
            <strong>{{ entry.reference }}</strong>
            <span class="text-grey q-ml-xs">({{ entry.version }})</span>
          </q-item-label>
          <q-item-label caption lines="2">{{ entry.text }}</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-badge :label="$t('training.weightBadge', { weight: entry.weight })" color="secondary" />
        </q-item-section>
      </q-item>
    </q-list>

    <div v-else class="text-grey text-center q-mt-md">
      {{ $t('training.empty') }}
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const { t } = useI18n()

const saving = ref(false)
const entries = ref([])

const categoryOptions = computed(() => [
  { label: t('training.categories.oracion'), value: 'oracion' },
  { label: t('training.categories.perdon'), value: 'perdon' },
  { label: t('training.categories.ansiedad'), value: 'ansiedad' },
  { label: t('training.categories.relaciones'), value: 'relaciones' },
  { label: t('training.categories.culpa'), value: 'culpa' },
  { label: t('training.categories.biblia'), value: 'biblia' },
  { label: t('training.categories.decision'), value: 'decision' },
  { label: t('training.categories.crisis'), value: 'crisis' }
])

const versionOptions = [
  { label: 'RVR1960', value: 'RVR1960' },
  { label: 'NVI', value: 'NVI' },
  { label: 'LBLA', value: 'LBLA' },
  { label: 'DHH', value: 'DHH' },
  { label: 'RVC', value: 'RVC' }
]

function defaultForm () {
  return {
    category: null,
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
}

async function onSubmit () {
  saving.value = true
  try {
    // TODO: conectar con el backend cuando esté listo
    const entry = {
      ...form.value,
      reference: reference.value
    }
    entries.value.unshift(entry)
    $q.notify({ type: 'positive', message: t('training.saveSuccess') })
    resetForm()
  } catch (err) {
    $q.notify({ type: 'negative', message: err.message || t('training.saveError') })
  } finally {
    saving.value = false
  }
}
</script>
