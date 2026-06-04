<template>
  <q-page class="profile-page q-pa-md">
    <!-- Header -->
    <div class="row items-center q-mb-lg">
      <q-btn flat round icon="arrow_back" color="grey-7" @click="$router.back()" />
      <div class="text-h6 text-weight-bold q-ml-sm">{{ $t('profile.title') }}</div>
    </div>

    <!-- Avatar -->
    <div class="column items-center q-mb-xl">
      <q-avatar size="80px" color="primary" text-color="white" class="q-mb-sm" style="font-size: 36px;">
        {{ initials }}
      </q-avatar>
      <div class="text-body2 text-grey-6">{{ $t('profile.subtitle') }}</div>
    </div>

    <q-form ref="formRef" @submit.prevent="onSave" class="q-gutter-md">

      <q-input
        v-model="form.name"
        :label="$t('profile.name')"
        outlined
        :rules="[val => !!val?.trim() || $t('profile.required')]"
      >
        <template #prepend>
          <q-icon name="person" color="primary" />
        </template>
      </q-input>

      <q-input
        v-model="form.email"
        :label="$t('profile.email')"
        type="email"
        outlined
        :rules="[val => !val || /.+@.+\..+/.test(val) || $t('profile.invalidEmail')]"
      >
        <template #prepend>
          <q-icon name="email" color="primary" />
        </template>
      </q-input>

      <q-input
        v-model="form.phone"
        :label="$t('profile.phone')"
        type="tel"
        outlined
        :rules="[val => !!val?.trim() || $t('profile.required')]"
      >
        <template #prepend>
          <q-icon name="phone" color="primary" />
        </template>
      </q-input>

      <q-btn
        type="submit"
        :label="$t('profile.save')"
        color="primary"
        unelevated
        rounded
        class="full-width q-mt-md"
        :loading="saving"
      />

    </q-form>
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'src/stores/auth'

const { t } = useI18n()
const $q = useQuasar()
const authStore = useAuthStore()

const formRef = ref(null)
const saving = ref(false)

const form = ref({
  name:  authStore.user?.name  || '',
  email: authStore.user?.email || '',
  phone: authStore.user?.phone || ''
})

const initials = computed(() => {
  const name = form.value.name || authStore.user?.name || '?'
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
})

async function onSave () {
  const valid = await formRef.value?.validate()
  if (!valid) return

  saving.value = true
  try {
    await authStore.updateProfile({
      name:  form.value.name.trim(),
      email: form.value.email.trim() || null,
      phone: form.value.phone.trim()
    })
    $q.notify({ type: 'positive', message: t('profile.saveSuccess') })
  } catch (err) {
    $q.notify({ type: 'negative', message: err.message || t('profile.saveError') })
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.profile-page {
  background-color: #F4F0FA;
  min-height: 100vh;
}
</style>
