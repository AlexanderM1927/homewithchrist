<template>
  <q-page class="q-pa-md">
    <!-- Header con botón volver -->
    <div class="flex items-center q-mb-md q-gutter-sm">
      <q-btn flat round dense icon="arrow_back" @click="$router.push('/admin')" />
      <div class="text-h6">{{ $t('users.title') }}</div>
    </div>

    <q-table
      :rows="users"
      :columns="columns"
      :loading="loading"
      row-key="id"
      flat
      bordered
      :rows-per-page-options="[10, 25, 50]"
    >
      <template #body-cell-phone="props">
        <q-td :props="props">
          <q-input
            v-model="props.row.phoneDraft"
            dense
            outlined
            style="min-width: 170px"
            :loading="savingId === props.row.id"
            :disable="savingId === props.row.id"
            @blur="saveContactField(props.row, 'phone')"
            @keyup.enter="saveContactField(props.row, 'phone')"
          />
        </q-td>
      </template>

      <template #body-cell-email="props">
        <q-td :props="props">
          <q-input
            v-model="props.row.emailDraft"
            dense
            outlined
            style="min-width: 220px"
            :loading="savingId === props.row.id"
            :disable="savingId === props.row.id"
            @blur="saveContactField(props.row, 'email')"
            @keyup.enter="saveContactField(props.row, 'email')"
          />
        </q-td>
      </template>

      <!-- Columna de rol con selector inline -->
      <template #body-cell-role="props">
        <q-td :props="props">
          <q-select
            v-model="props.row.role_id"
            :options="roleOptions"
            emit-value
            map-options
            dense
            outlined
            style="min-width: 140px"
            :loading="savingId === props.row.id"
            @update:model-value="changeRole(props.row)"
          />
        </q-td>
      </template>

      <template #no-data>
        <div class="text-grey text-center full-width q-py-md">{{ $t('users.empty') }}</div>
      </template>
    </q-table>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuasar } from 'quasar'
import authService from 'src/services/AuthService'

const $q = useQuasar()
const { t } = useI18n()

const loading = ref(false)
const savingId = ref(null)
const users = ref([])

const roleOptions = [
  { label: 'user',      value: 1 },
  { label: 'moderator', value: 2 },
  { label: 'admin',     value: 3 }
]

const columns = computed(() => [
  { name: 'id',    label: t('users.id'),    field: 'id',    align: 'left', sortable: true },
  { name: 'name',  label: t('users.name'),  field: 'name',  align: 'left', sortable: true },
  { name: 'phone', label: t('users.phone'), field: 'phone', align: 'left', sortable: false },
  { name: 'email', label: t('users.email'), field: 'email', align: 'left', sortable: false },
  { name: 'role',  label: t('users.role'),  field: 'role',  align: 'left', sortable: true }
])

async function loadUsers () {
  loading.value = true
  try {
    const data = await authService.getUsers()
    users.value = data.users.map(user => ({
      ...user,
      phoneDraft: user.phone || '',
      emailDraft: user.email || ''
    }))
  } catch {
    $q.notify({ type: 'negative', message: t('users.loadError') })
  } finally {
    loading.value = false
  }
}

async function changeRole (user) {
  savingId.value = user.id
  try {
    const data = await authService.updateUserRole(user.id, user.role_id)
    user.role = data.user.role
    $q.notify({ type: 'positive', message: t('users.updateSuccess') })
  } catch {
    $q.notify({ type: 'negative', message: t('users.updateError') })
    // revertir visualmente recargando
    await loadUsers()
  } finally {
    savingId.value = null
  }
}

async function saveContactField (user, field) {
  const draftKey = field === 'phone' ? 'phoneDraft' : 'emailDraft'
  const originalValue = user[field] || ''
  const draftValue = (user[draftKey] || '').trim()

  if (draftValue === originalValue) return

  savingId.value = user.id
  try {
    const payload = { [field]: draftValue }
    const data = await authService.updateUserContact(user.id, payload)

    user.phone = data.user.phone || ''
    user.email = data.user.email || ''
    user.phoneDraft = user.phone
    user.emailDraft = user.email

    $q.notify({ type: 'positive', message: t('users.contactUpdateSuccess') })
  } catch (err) {
    user[draftKey] = originalValue
    $q.notify({ type: 'negative', message: err.message || t('users.contactUpdateError') })
  } finally {
    savingId.value = null
  }
}

onMounted(loadUsers)
</script>
