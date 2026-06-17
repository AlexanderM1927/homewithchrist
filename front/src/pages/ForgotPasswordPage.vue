<template>
  <q-page class="recovery-page flex flex-center q-pa-md">
    <q-card class="recovery-card q-pa-lg">
      <q-card-section class="text-center q-pb-sm">
        <q-avatar size="72px" color="primary" text-color="white" class="q-mb-md">
          <q-icon name="lock_reset" size="38px" />
        </q-avatar>
        <div class="text-h5 text-weight-bold text-primary">{{ $t('forgotPassword.title') }}</div>
        <div class="text-body2 text-grey-6 q-mt-sm">{{ $t('forgotPassword.subtitle') }}</div>
      </q-card-section>

      <q-card-section>
        <q-form @submit.prevent="onSubmit" class="q-gutter-md">
          <q-input
            v-model="email"
            :label="$t('forgotPassword.email')"
            outlined
            type="email"
            maxlength="120"
            :rules="[
              val => !!val || $t('forgotPassword.emailRequired'),
              val => /.+@.+\..+/.test(val) || $t('forgotPassword.invalidEmail')
            ]"
            lazy-rules
          >
            <template #prepend>
              <q-icon name="email" />
            </template>
          </q-input>

          <q-banner v-if="successMsg" class="text-positive" dense rounded>
            {{ successMsg }}
          </q-banner>
          <q-banner v-if="errorMsg" class="text-negative" dense rounded>
            {{ errorMsg }}
          </q-banner>

          <q-btn
            type="submit"
            :label="$t('forgotPassword.submit')"
            color="primary"
            class="full-width"
            unelevated
            :loading="loading"
          />

          <q-btn
            flat
            no-caps
            color="primary"
            :label="$t('forgotPassword.backToLogin')"
            class="full-width"
            to="/login"
          />
        </q-form>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import authService from 'src/services/AuthService'

const { t } = useI18n()

const email = ref('')
const loading = ref(false)
const errorMsg = ref('')
const successMsg = ref('')

async function onSubmit() {
  errorMsg.value = ''
  successMsg.value = ''
  loading.value = true

  try {
    const data = await authService.forgotPassword({ email: email.value.trim() })
    successMsg.value = data.message || t('forgotPassword.success')
  } catch (err) {
    errorMsg.value = err.message || t('forgotPassword.error')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.recovery-page {
  min-height: 100vh;
  background: #F4F0FA;
}

.recovery-card {
  width: 95%;
  max-width: 420px;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}
</style>
