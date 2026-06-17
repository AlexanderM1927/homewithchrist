<template>
  <q-page class="q-pa-md">
    <div class="flex items-center q-mb-md q-gutter-sm">
      <q-btn flat round dense icon="arrow_back" @click="$router.push('/admin')" />
      <div class="text-h6">{{ $t('dailyVerses.title') }}</div>
    </div>

    <q-form ref="formRef" @submit.prevent="onSubmit" class="q-gutter-y-md">
      <q-input
        v-model="form.reference"
        :label="$t('dailyVerses.reference')"
        outlined
        :rules="[val => !!val || $t('dailyVerses.required')]"
      />

      <q-input
        v-model="form.text"
        :label="$t('dailyVerses.text')"
        type="textarea"
        outlined
        autogrow
        rows="3"
        :rules="[val => !!val || $t('dailyVerses.required')]"
      />

      <div class="row q-gutter-sm q-mt-sm">
        <q-btn
          type="submit"
          :label="$t('dailyVerses.save')"
          color="primary"
          unelevated
          :loading="saving"
        />
        <q-btn
          :label="$t('dailyVerses.clear')"
          flat
          @click="resetForm"
        />
      </div>
    </q-form>

    <q-separator class="q-my-lg" />
    <div class="text-subtitle1 q-mb-sm">{{ $t('dailyVerses.history') }}</div>

    <TableFilters
      v-model:search="filters.search"
      :search-label="$t('tableFilters.search')"
      :search-placeholder="$t('dailyVerses.searchPlaceholder')"
      v-model:select-value="filters.createdBy"
      :select-options="userFilterOptions"
      :select-label="$t('dailyVerses.createdBy')"
      :select-placeholder="$t('dailyVerses.allCreators')"
      :select-loading="loadingUsers"
      :clear-label="$t('tableFilters.clear')"
      @change="onFiltersChange"
      @clear="onFiltersClear"
    />

    <q-table
      :rows="dailyVerses.rows"
      :columns="tableColumns"
      :loading="loading"
      :rows-per-page-options="[10, 20, 50]"
      v-model:pagination="pagination"
      row-key="id"
      flat
      bordered
      @request="onTableRequest"
    >
      <template #body-cell-text="props">
        <q-td :props="props">
          <span>{{ truncateText(props.row.text) }}</span>
          <q-tooltip v-if="props.row.text.length > 90" max-width="320px">{{ props.row.text }}</q-tooltip>
        </q-td>
      </template>

      <template #body-cell-createdBy="props">
        <q-td :props="props">
          {{ props.row.creator?.name || '-' }}
        </q-td>
      </template>

      <template #body-cell-actions="props">
        <q-td :props="props">
          <q-btn
            flat
            round
            dense
            color="negative"
            icon="delete"
            :loading="deletingId === props.row.id"
            :disable="deletingId !== null"
            @click="confirmDelete(props.row)"
          />
        </q-td>
      </template>

      <template #no-data>
        <div class="text-grey text-center full-width q-py-md">{{ $t('dailyVerses.empty') }}</div>
      </template>
    </q-table>
  </q-page>
</template>

<script setup>
import { computed, nextTick, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuasar } from 'quasar'
import dailyVerseService from 'src/services/DailyVerseService'
import authService from 'src/services/AuthService'
import TableFilters from 'src/components/TableFilters.vue'

const $q = useQuasar()
const { t } = useI18n()

const formRef = ref(null)
const saving = ref(false)
const loading = ref(false)
const loadingUsers = ref(false)
const deletingId = ref(null)
const dailyVerses = ref({ rows: [], total: 0 })
const pagination = ref({ page: 1, rowsPerPage: 10, rowsNumber: 0 })
const filters = ref({ search: '', createdBy: null })
const userFilterOptions = ref([])
const form = ref(defaultForm())

const tableColumns = computed(() => [
  { name: 'reference', label: t('dailyVerses.reference'), field: 'reference', align: 'left', sortable: false },
  { name: 'text', label: t('dailyVerses.text'), field: 'text', align: 'left', sortable: false },
  { name: 'createdBy', label: t('dailyVerses.createdBy'), field: row => row.creator?.name || '', align: 'left', sortable: false },
  { name: 'actions', label: t('dailyVerses.actions'), field: 'actions', align: 'right', sortable: false }
])

function defaultForm() {
  return {
    reference: '',
    text: ''
  }
}

function resetForm() {
  form.value = defaultForm()
  nextTick(() => formRef.value?.resetValidation())
}

function truncateText(text) {
  return text.length > 90 ? `${text.slice(0, 90)}...` : text
}

async function loadDailyVerses(page = 1, limit = pagination.value.rowsPerPage) {
  loading.value = true
  try {
    const data = await dailyVerseService.getVerses({
      page,
      limit,
      search: filters.value.search,
      createdBy: filters.value.createdBy
    })
    dailyVerses.value = data
    pagination.value.rowsNumber = data.total
    pagination.value.page = data.page
  } catch {
    $q.notify({ type: 'negative', message: t('dailyVerses.loadError') })
  } finally {
    loading.value = false
  }
}

function onTableRequest({ pagination: p }) {
  pagination.value.rowsPerPage = p.rowsPerPage
  loadDailyVerses(p.page, p.rowsPerPage)
}

function onFiltersChange() {
  loadDailyVerses(1, pagination.value.rowsPerPage)
}

function onFiltersClear() {
  filters.value.search = ''
  filters.value.createdBy = null
}

async function loadUsers() {
  loadingUsers.value = true
  try {
    const data = await authService.getUsers()
    userFilterOptions.value = data.users
      .filter(user => user.role === 'admin' || user.role_id === 3)
      .map(user => ({
        label: user.name || user.phone || `#${user.id}`,
        value: user.id
      }))
  } catch {
    $q.notify({ type: 'negative', message: t('users.loadError') })
  } finally {
    loadingUsers.value = false
  }
}

async function onSubmit() {
  saving.value = true
  try {
    await dailyVerseService.createVerse({
      reference: form.value.reference.trim(),
      text: form.value.text.trim()
    })
    $q.notify({ type: 'positive', message: t('dailyVerses.saveSuccess') })
    resetForm()
    await loadDailyVerses(1, pagination.value.rowsPerPage)
  } catch (err) {
    $q.notify({ type: 'negative', message: err.message || t('dailyVerses.saveError') })
  } finally {
    saving.value = false
  }
}

function confirmDelete(row) {
  $q.dialog({
    title: t('dailyVerses.deleteTitle'),
    message: t('dailyVerses.deleteMessage', { reference: row.reference }),
    cancel: true,
    persistent: true,
    ok: {
      label: t('dailyVerses.deleteConfirm'),
      color: 'negative',
      flat: true
    }
  }).onOk(() => deleteVerse(row))
}

async function deleteVerse(row) {
  deletingId.value = row.id
  try {
    await dailyVerseService.deleteVerse(row.id)
    $q.notify({ type: 'positive', message: t('dailyVerses.deleteSuccess') })
    await loadDailyVerses(pagination.value.page, pagination.value.rowsPerPage)
  } catch (err) {
    $q.notify({ type: 'negative', message: err.message || t('dailyVerses.deleteError') })
  } finally {
    deletingId.value = null
  }
}

onMounted(() => {
  loadUsers()
  loadDailyVerses()
})
</script>
