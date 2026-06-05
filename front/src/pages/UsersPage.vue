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
    users.value = data.users
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

onMounted(loadUsers)
</script>
