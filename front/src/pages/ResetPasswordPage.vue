<template>
  <q-page class="reset-password-page flex flex-center q-pa-md">
    <q-card class="reset-password-card q-pa-lg">
      <q-card-section class="text-center q-pb-sm">
        <q-avatar size="72px" color="primary" text-color="white" class="q-mb-md">
          <q-icon name="password" size="38px" />
        </q-avatar>
        <div class="text-h5 text-weight-bold text-primary">{{ $t('resetPassword.title') }}</div>
        <div class="text-body2 text-grey-6 q-mt-sm">{{ $t('resetPassword.subtitle') }}</div>
      </q-card-section>

      <q-card-section>
        <q-form v-if="token" @submit.prevent="onSave" class="q-gutter-lg">
          <div class="pin-field">
            <div class="pin-label-row">
              <div class="text-caption text-grey-7">{{ $t('resetPassword.newPin') }}</div>
              <q-btn
                flat
                round
                dense
                size="sm"
                :icon="showNewPin ? 'visibility_off' : 'visibility'"
                @click="showNewPin = !showNewPin"
              />
            </div>
            <div class="row justify-center q-gutter-sm">
              <input
                v-for="(_, i) in 4"
                :key="`new-${i}`"
                :ref="el => setPinRef('newPin', i, el)"
                v-model="pins.newPin[i]"
                :type="showNewPin ? 'tel' : 'password'"
                inputmode="numeric"
                maxlength="1"
                class="pin-box"
                @input="onPinInput('newPin', i, $event)"
                @keydown="onPinKeydown('newPin', i, $event)"
                @paste="onPinPaste('newPin', $event)"
              />
            </div>
          </div>

          <div class="pin-field">
            <div class="pin-label-row">
              <div class="text-caption text-grey-7">{{ $t('resetPassword.confirmPin') }}</div>
              <q-btn
                flat
                round
                dense
                size="sm"
                :icon="showConfirmPin ? 'visibility_off' : 'visibility'"
                @click="showConfirmPin = !showConfirmPin"
              />
            </div>
            <div class="row justify-center q-gutter-sm">
              <input
                v-for="(_, i) in 4"
                :key="`confirm-${i}`"
                :ref="el => setPinRef('confirmPin', i, el)"
                v-model="pins.confirmPin[i]"
                :type="showConfirmPin ? 'tel' : 'password'"
                inputmode="numeric"
                maxlength="1"
                class="pin-box"
                @input="onPinInput('confirmPin', i, $event)"
                @keydown="onPinKeydown('confirmPin', i, $event)"
                @paste="onPinPaste('confirmPin', $event)"
              />
            </div>
          </div>

          <q-banner v-if="errorMsg" class="text-negative" dense rounded>
            {{ errorMsg }}
          </q-banner>

          <q-btn
            type="submit"
            :label="$t('resetPassword.save')"
            color="primary"
            class="full-width"
            unelevated
            :loading="saving"
          />
        </q-form>

        <q-banner v-else class="text-negative q-mb-md" dense rounded>
          {{ $t('resetPassword.missingToken') }}
        </q-banner>

        <q-btn
          flat
          no-caps
          color="primary"
          :label="$t('resetPassword.backToLogin')"
          class="full-width q-mt-md"
          to="/login"
        />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuasar } from 'quasar'
import { useRoute, useRouter } from 'vue-router'
import authService from 'src/services/AuthService'

const { t } = useI18n()
const $q = useQuasar()
const route = useRoute()
const router = useRouter()

const token = computed(() => route.query.token || '')
const saving = ref(false)
const showNewPin = ref(false)
const showConfirmPin = ref(false)
const errorMsg = ref('')
const pins = ref({
  newPin: ['', '', '', ''],
  confirmPin: ['', '', '', '']
})
const pinRefs = ref({
  newPin: [],
  confirmPin: []
})

const form = computed(() => ({
  newPin: pins.value.newPin.join(''),
  confirmPin: pins.value.confirmPin.join('')
}))

function setPinRef(field, index, el) {
  if (el) pinRefs.value[field][index] = el
}

function onPinInput(field, index, event) {
  const value = event.target.value.replace(/\D/g, '')
  pins.value[field][index] = value ? value[value.length - 1] : ''
  event.target.value = pins.value[field][index]
  errorMsg.value = ''

  if (pins.value[field][index] && index < 3) {
    pinRefs.value[field][index + 1]?.focus()
  }
}

function onPinKeydown(field, index, event) {
  if (event.key === 'Backspace' && !pins.value[field][index] && index > 0) {
    pinRefs.value[field][index - 1]?.focus()
  }
}

function onPinPaste(field, event) {
  const text = (event.clipboardData || window.clipboardData).getData('text').replace(/\D/g, '').slice(0, 4)
  event.preventDefault()
  text.split('').forEach((char, i) => {
    pins.value[field][i] = char
  })
  errorMsg.value = ''
  const nextEmpty = text.length < 4 ? text.length : 3
  pinRefs.value[field][nextEmpty]?.focus()
}

function validateForm() {
  if (!/^\d{4}$/.test(form.value.newPin) || !/^\d{4}$/.test(form.value.confirmPin)) {
    errorMsg.value = t('resetPassword.pinInvalid')
    return false
  }
  if (form.value.newPin !== form.value.confirmPin) {
    errorMsg.value = t('resetPassword.pinMismatch')
    return false
  }
  return true
}

async function onSave() {
  errorMsg.value = ''
  if (!validateForm()) return

  saving.value = true
  try {
    await authService.resetPassword({
      token: token.value,
      newPin: form.value.newPin
    })
    $q.notify({ type: 'positive', message: t('resetPassword.saveSuccess') })
    await router.push('/login')
  } catch (err) {
    errorMsg.value = err.message || t('resetPassword.saveError')
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.reset-password-page {
  min-height: 100vh;
  background: #F4F0FA;
}

.reset-password-card {
  width: 95%;
  max-width: 420px;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.pin-label-row {
  min-height: 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 248px;
  margin: 0 auto 4px;
}

.pin-box {
  width: 56px;
  height: 56px;
  border: 1.5px solid #d0d0d0;
  border-radius: 12px;
  text-align: center;
  font-size: 1.5rem;
  font-weight: 600;
  color: #1a1a2e;
  background: #fff;
  outline: none;
  transition: border-color 0.2s;
  caret-color: transparent;
}

.pin-box:focus {
  border-color: var(--q-primary, #7c3aed);
  box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.15);
}
</style>
