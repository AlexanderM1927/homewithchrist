<template>
  <q-page class="q-pa-md">
    <div class="flex items-center q-mb-md q-gutter-sm">
      <q-btn flat round dense icon="arrow_back" @click="$router.push('/admin')" />
      <div>
        <div class="text-h6">{{ $t('topics.title') }}</div>
        <div class="text-caption text-grey">{{ $t('topics.subtitle') }}</div>
      </div>
    </div>

    <q-form ref="formRef" class="q-gutter-y-md" @submit.prevent="onSubmit">
      <q-input
        v-model="form.name"
        :label="$t('topics.name')"
        outlined
        maxlength="100"
        :rules="[val => !!val?.trim() || $t('topics.required')]"
        @update:model-value="onNameChange"
      />
      <q-input
        v-model="form.slug"
        :label="$t('topics.slug')"
        outlined
        maxlength="100"
        :hint="$t('topics.slugHint')"
        @update:model-value="form.slugTouched = true"
      />
      <q-input
        v-model="form.description"
        :label="$t('topics.description')"
        type="textarea"
        outlined
        autogrow
        rows="4"
        maxlength="5000"
      />

      <div class="row q-gutter-sm">
        <q-btn type="submit" color="primary" unelevated :label="$t('topics.save')" :loading="saving" />
        <q-btn flat :label="$t('topics.clear')" @click="resetForm" />
      </div>
    </q-form>

    <q-separator class="q-my-lg" />
    <div class="text-subtitle1 q-mb-sm">{{ $t('topics.currentTopics') }}</div>

    <q-table
      :rows="topics.rows"
      :columns="columns"
      :loading="loading"
      v-model:pagination="pagination"
      row-key="id"
      flat
      bordered
      :rows-per-page-options="[5, 10, 20, 50]"
      @request="onTableRequest"
    >
      <template #body-cell-name="props">
        <q-td :props="props">
          <div class="text-weight-medium">{{ props.row.name }}</div>
          <div v-if="props.row.description" class="text-caption text-grey-7">{{ props.row.description }}</div>
        </q-td>
      </template>

      <template #body-cell-actions="props">
        <q-td :props="props" class="text-right">
          <q-btn
            flat
            round
            dense
            icon="delete"
            color="negative"
            :loading="deletingId === props.row.id"
            :disable="deletingId !== null"
            @click="confirmDelete(props.row)"
          />
        </q-td>
      </template>

      <template #no-data>
        <div class="text-grey text-center full-width q-py-md">{{ $t('topics.empty') }}</div>
      </template>
    </q-table>
  </q-page>
</template>

<script setup>
import { computed, nextTick, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuasar } from 'quasar'
import trainingService from 'src/services/TrainingService'
import createLatestRequest from 'src/utils/createLatestRequest'

const $q = useQuasar()
const { t } = useI18n()

const formRef = ref(null)
const loading = ref(false)
const saving = ref(false)
const deletingId = ref(null)
const topics = ref({ rows: [], total: 0 })
const pagination = ref({ page: 1, rowsPerPage: 10, rowsNumber: 0 })
const form = ref(defaultForm())
const topicsRequest = createLatestRequest()

const columns = computed(() => [
  { name: 'name', label: t('topics.name'), field: 'name', align: 'left' },
  { name: 'slug', label: t('topics.slug'), field: 'slug', align: 'left' },
  { name: 'actions', label: '', field: 'actions', align: 'right' }
])

function defaultForm() {
  return {
    name: '',
    slug: '',
    description: '',
    slugTouched: false
  }
}

function slugify(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

function resetForm() {
  form.value = defaultForm()
  nextTick(() => formRef.value?.resetValidation())
}

function onNameChange(value) {
  if (!form.value.slugTouched) {
    form.value.slug = slugify(value)
  }
}

async function loadTopics(page = 1, limit = pagination.value.rowsPerPage) {
  loading.value = true
  try {
    const result = await topicsRequest.run(signal => trainingService.getAdminTopics({ page, limit }, { signal }))
    if (result.status !== 'success') return
    const data = result.value
    topics.value = data
    pagination.value = {
      ...pagination.value,
      page: data.page,
      rowsPerPage: data.limit,
      rowsNumber: data.total
    }
  } catch {
    $q.notify({ type: 'negative', message: t('topics.loadError') })
  } finally {
    if (!topicsRequest.isRunning()) {
      loading.value = false
    }
  }
}

function onTableRequest({ pagination: tablePagination }) {
  loadTopics(tablePagination.page, tablePagination.rowsPerPage)
}

async function onSubmit() {
  saving.value = true
  try {
    await trainingService.createTopic({
      name: form.value.name.trim(),
      slug: form.value.slug.trim(),
      description: form.value.description.trim()
    })
    $q.notify({ type: 'positive', message: t('topics.saveSuccess') })
    resetForm()
    await loadTopics(1, pagination.value.rowsPerPage)
  } catch (err) {
    $q.notify({ type: 'negative', message: err.message || t('topics.saveError') })
  } finally {
    saving.value = false
  }
}

function confirmDelete(row) {
  $q.dialog({
    title: t('topics.deleteTitle'),
    message: t('topics.deleteMessage', { name: row.name }),
    cancel: true,
    persistent: true,
    ok: { label: t('topics.deleteConfirm'), color: 'negative', flat: true }
  }).onOk(() => deleteTopic(row.id))
}

async function deleteTopic(id) {
  deletingId.value = id
  try {
    await trainingService.deleteTopic(id)
    $q.notify({ type: 'positive', message: t('topics.deleteSuccess') })
    const targetPage = topics.value.rows.length === 1 && pagination.value.page > 1
      ? pagination.value.page - 1
      : pagination.value.page
    await loadTopics(targetPage, pagination.value.rowsPerPage)
  } catch (err) {
    $q.notify({ type: 'negative', message: err.message || t('topics.deleteError') })
  } finally {
    deletingId.value = null
  }
}

onMounted(() => {
  loadTopics()
})
</script>
