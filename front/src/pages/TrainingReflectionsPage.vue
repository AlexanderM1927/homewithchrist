<template>
  <q-page class="q-pa-md">
    <div class="flex items-center q-mb-md q-gutter-sm">
      <q-btn flat round dense icon="arrow_back" @click="$router.push('/admin')" />
      <div>
        <div class="text-h6">{{ $t('trainingReflections.title') }}</div>
        <div class="text-caption text-grey">{{ $t('trainingReflections.subtitle') }}</div>
      </div>
    </div>

    <q-form ref="formRef" class="q-gutter-md" @submit.prevent="onSubmit">
      <q-select
        v-model="form.topicId"
        :options="topicOptions"
        :label="$t('trainingReflections.topic')"
        emit-value
        map-options
        outlined
        :loading="loadingTopics"
        :rules="[val => !!val || $t('trainingReflections.required')]"
      />
      <q-input
        v-model="form.message"
        :label="$t('trainingReflections.message')"
        type="textarea"
        outlined
        autogrow
        rows="6"
        maxlength="10000"
        counter
        :rules="[val => !!val?.trim() || $t('trainingReflections.required')]"
      />
      <div class="row q-gutter-sm">
        <q-btn type="submit" color="primary" unelevated :label="$t('trainingReflections.save')" :loading="saving" />
        <q-btn flat :label="$t('trainingReflections.clear')" @click="resetForm" />
      </div>
    </q-form>

    <q-separator class="q-my-lg" />
    <div class="text-subtitle1 q-mb-sm">{{ $t('trainingReflections.history') }}</div>

    <TableFilters
      v-model:search="filters.search"
      :search-label="$t('tableFilters.search')"
      :search-placeholder="$t('trainingReflections.searchPlaceholder')"
      v-model:select-value="filters.createdBy"
      :select-options="userFilterOptions"
      :select-label="$t('trainingReflections.createdBy')"
      :select-placeholder="$t('trainingReflections.allCreators')"
      :select-loading="loadingUsers"
      :clear-label="$t('tableFilters.clear')"
      @change="onFiltersChange"
      @clear="onFiltersClear"
    />

    <q-table
      :rows="reflections.rows"
      :columns="columns"
      :loading="loading"
      row-key="id"
      flat
      bordered
      :rows-per-page-options="[10, 20, 50]"
      v-model:pagination="pagination"
      @request="onTableRequest"
    >
      <template #body-cell-topic="props">
        <q-td :props="props"><q-badge color="primary" outline>{{ props.row.Topic?.name || '-' }}</q-badge></q-td>
      </template>
      <template #body-cell-message="props">
        <q-td :props="props">
          {{ truncate(props.row.message) }}
          <q-tooltip v-if="props.row.message.length > 120" max-width="420px">{{ props.row.message }}</q-tooltip>
        </q-td>
      </template>
      <template #body-cell-createdBy="props">
        <q-td :props="props">{{ props.row.creator?.name || '-' }}</q-td>
      </template>
      <template #body-cell-actions="props">
        <q-td :props="props">
          <q-btn flat round dense icon="edit" color="primary" @click="openEdit(props.row)" />
          <q-btn flat round dense icon="delete" color="negative" :loading="deletingId === props.row.id" @click="confirmDelete(props.row)" />
        </q-td>
      </template>
      <template #no-data>
        <div class="text-grey text-center full-width q-py-md">{{ $t('trainingReflections.empty') }}</div>
      </template>
    </q-table>

    <q-dialog v-model="editDialog">
      <q-card style="width: 640px; max-width: 92vw">
        <q-card-section class="text-h6">{{ $t('trainingReflections.editTitle') }}</q-card-section>
        <q-card-section class="q-gutter-md">
          <q-select v-model="editForm.topicId" :options="topicOptions" :label="$t('trainingReflections.topic')" emit-value map-options outlined />
          <q-input v-model="editForm.message" :label="$t('trainingReflections.message')" type="textarea" outlined autogrow rows="7" maxlength="10000" counter />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat v-close-popup :label="$t('trainingReflections.cancel')" />
          <q-btn color="primary" unelevated :label="$t('trainingReflections.update')" :loading="updating" @click="updateReflection" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { computed, nextTick, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuasar } from 'quasar'
import TableFilters from 'src/components/TableFilters.vue'
import authService from 'src/services/AuthService'
import trainingService from 'src/services/TrainingService'
import reflectionService from 'src/services/TrainingReflectionService'

const $q = useQuasar()
const { t } = useI18n()
const formRef = ref(null)
const form = ref({ topicId: null, message: '' })
const editForm = ref({ id: null, topicId: null, message: '' })
const reflections = ref({ rows: [], total: 0 })
const topicOptions = ref([])
const userFilterOptions = ref([])
const filters = ref({ search: '', createdBy: null })
const pagination = ref({ page: 1, rowsPerPage: 10, rowsNumber: 0 })
const loading = ref(false)
const loadingTopics = ref(false)
const loadingUsers = ref(false)
const saving = ref(false)
const updating = ref(false)
const deletingId = ref(null)
const editDialog = ref(false)

const columns = computed(() => [
  { name: 'topic', label: t('trainingReflections.topic'), field: row => row.Topic?.name || '', align: 'left' },
  { name: 'message', label: t('trainingReflections.message'), field: 'message', align: 'left' },
  { name: 'createdBy', label: t('trainingReflections.createdBy'), field: row => row.creator?.name || '', align: 'left' },
  { name: 'actions', label: t('trainingReflections.actions'), field: 'actions', align: 'right' }
])

function resetForm() {
  form.value = { topicId: null, message: '' }
  nextTick(() => formRef.value?.resetValidation())
}

function truncate(message) {
  return message.length > 120 ? `${message.slice(0, 120)}...` : message
}

async function loadReflections(page = 1, limit = pagination.value.rowsPerPage) {
  loading.value = true
  try {
    const data = await reflectionService.getReflections({ page, limit, ...filters.value })
    reflections.value = data
    pagination.value = { ...pagination.value, page: data.page, rowsNumber: data.total }
  } catch (err) {
    $q.notify({ type: 'negative', message: err.message || t('trainingReflections.loadError') })
  } finally {
    loading.value = false
  }
}

async function loadTopics() {
  loadingTopics.value = true
  try {
    const topics = await trainingService.getTopics()
    topicOptions.value = topics.map(topic => ({ label: topic.name, value: topic.id }))
  } catch {
    $q.notify({ type: 'negative', message: t('trainingReflections.loadTopicsError') })
  } finally {
    loadingTopics.value = false
  }
}

async function loadUsers() {
  loadingUsers.value = true
  try {
    const data = await authService.getUsers()
    userFilterOptions.value = data.users
      .filter(user => user.role === 'admin' || user.role_id === 3)
      .map(user => ({ label: user.name || user.phone, value: user.id }))
  } catch {
    $q.notify({ type: 'negative', message: t('trainingReflections.loadUsersError') })
  } finally {
    loadingUsers.value = false
  }
}

async function onSubmit() {
  saving.value = true
  try {
    await reflectionService.createReflection({ topic_id: form.value.topicId, message: form.value.message.trim() })
    $q.notify({ type: 'positive', message: t('trainingReflections.saveSuccess') })
    resetForm()
    await loadReflections(1)
  } catch (err) {
    $q.notify({ type: 'negative', message: err.message || t('trainingReflections.saveError') })
  } finally {
    saving.value = false
  }
}

function openEdit(row) {
  editForm.value = { id: row.id, topicId: row.topic_id, message: row.message }
  editDialog.value = true
}

async function updateReflection() {
  if (!editForm.value.topicId || !editForm.value.message.trim()) return
  updating.value = true
  try {
    await reflectionService.updateReflection(editForm.value.id, { topic_id: editForm.value.topicId, message: editForm.value.message.trim() })
    editDialog.value = false
    $q.notify({ type: 'positive', message: t('trainingReflections.updateSuccess') })
    await loadReflections(pagination.value.page)
  } catch (err) {
    $q.notify({ type: 'negative', message: err.message || t('trainingReflections.updateError') })
  } finally {
    updating.value = false
  }
}

function confirmDelete(row) {
  $q.dialog({
    title: t('trainingReflections.deleteTitle'),
    message: t('trainingReflections.deleteMessage'),
    cancel: true,
    persistent: true,
    ok: { label: t('trainingReflections.deleteConfirm'), color: 'negative', flat: true }
  }).onOk(() => deleteReflection(row.id))
}

async function deleteReflection(id) {
  deletingId.value = id
  try {
    await reflectionService.deleteReflection(id)
    $q.notify({ type: 'positive', message: t('trainingReflections.deleteSuccess') })
    await loadReflections(pagination.value.page)
  } catch (err) {
    $q.notify({ type: 'negative', message: err.message || t('trainingReflections.deleteError') })
  } finally {
    deletingId.value = null
  }
}

function onTableRequest({ pagination: value }) {
  pagination.value.rowsPerPage = value.rowsPerPage
  loadReflections(value.page, value.rowsPerPage)
}

function onFiltersChange() {
  loadReflections(1)
}

function onFiltersClear() {
  filters.value = { search: '', createdBy: null }
}

onMounted(() => {
  loadTopics()
  loadUsers()
  loadReflections()
})
</script>
