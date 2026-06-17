<template>
  <q-page class="change-password-page q-pa-md">
    <div class="row items-center q-mb-lg">
      <q-btn flat round icon="arrow_back" color="grey-7" @click="$router.back()" />
      <div class="text-h6 text-weight-bold q-ml-sm">{{ $t('changePassword.title') }}</div>
    </div>

    <div class="column items-center q-mb-xl">
      <q-avatar size="80px" color="primary" text-color="white" class="q-mb-sm">
        <q-icon name="lock_reset" size="42px" />
      </q-avatar>
      <div class="text-body2 text-grey-6 text-center">{{ $t('changePassword.subtitle') }}</div>
    </div>

    <q-form @submit.prevent="onSave" class="q-gutter-y-lg">
      <div class="pin-field">
        <div class="pin-label-row">
          <div class="text-caption text-grey-7">{{ $t('changePassword.currentPin') }}</div>
          <q-btn
            flat
            round
            dense
            size="sm"
            :icon="showCurrentPin ? 'visibility_off' : 'visibility'"
            @click="showCurrentPin = !showCurrentPin"
          />
        </div>
        <div class="row justify-center q-gutter-sm">
          <input
            v-for="(_, i) in 4"
            :key="`current-${i}`"
            :ref="el => setPinRef('currentPin', i, el)"
            v-model="pins.currentPin[i]"
            :type="showCurrentPin ? 'tel' : 'password'"
            inputmode="numeric"
            maxlength="1"
            class="pin-box"
            @input="onPinInput('currentPin', i, $event)"
            @keydown="onPinKeydown('currentPin', i, $event)"
            @paste="onPinPaste('currentPin', $event)"
          />
        </div>
      </div>

      <div class="pin-field">
        <div class="pin-label-row">
          <div class="text-caption text-grey-7">{{ $t('changePassword.newPin') }}</div>
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
          <div class="text-caption text-grey-7">{{ $t('changePassword.confirmPin') }}</div>
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
        :label="$t('changePassword.save')"
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
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'src/stores/auth'

const { t } = useI18n()
const $q = useQuasar()
const router = useRouter()
const authStore = useAuthStore()

const saving = ref(false)
const showCurrentPin = ref(false)
const showNewPin = ref(false)
const showConfirmPin = ref(false)
const errorMsg = ref('')
const pins = ref({
  currentPin: ['', '', '', ''],
  newPin: ['', '', '', ''],
  confirmPin: ['', '', '', '']
})
const pinRefs = ref({
  currentPin: [],
  newPin: [],
  confirmPin: []
})

const form = computed(() => ({
  currentPin: pins.value.currentPin.join(''),
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
  if (!/^\d{4}$/.test(form.value.currentPin) || !/^\d{4}$/.test(form.value.newPin) || !/^\d{4}$/.test(form.value.confirmPin)) {
    errorMsg.value = t('changePassword.pinInvalid')
    return false
  }
  if (form.value.currentPin === form.value.newPin) {
    errorMsg.value = t('changePassword.samePin')
    return false
  }
  if (form.value.newPin !== form.value.confirmPin) {
    errorMsg.value = t('changePassword.pinMismatch')
    return false
  }
  return true
}

async function onSave() {
  errorMsg.value = ''
  if (!validateForm()) return

  saving.value = true
  try {
    await authStore.changePassword({
      currentPin: form.value.currentPin,
      newPin: form.value.newPin
    })
    $q.notify({ type: 'positive', message: t('changePassword.saveSuccess') })
    await router.push('/profile')
  } catch (err) {
    $q.notify({ type: 'negative', message: err.message || t('changePassword.saveError') })
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.change-password-page {
  background-color: #F4F0FA;
  min-height: 100vh;
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
