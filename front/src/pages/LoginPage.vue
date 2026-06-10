<template>
  <q-page class="login-page flex flex-center">
    <q-card class="login-card q-pa-lg">
      <q-card-section class="text-center q-pb-sm">
        <div class="text-h5 text-weight-bold text-primary">Home With Christ</div>
        <div class="text-subtitle2 text-grey-6 q-mt-xs">{{ modeSubtitle }}</div>
        <div class="q-mt-sm">
          <q-select
            v-model="locale"
            :options="languageOptions"
            emit-value
            map-options
            outlined
            dense
            class="language-select"
            hide-bottom-space
          />
        </div>
      </q-card-section>

      <q-card-section class="q-pt-md">
        <div class="auth-switch q-mb-md">
          <q-btn
            :outline="!isLogin"
            :unelevated="isLogin"
            color="primary"
            icon="login"
            :label="$t('login.loginTab')"
            no-caps
            class="auth-switch-btn"
            @click="switchMode('login')"
          />
          <q-btn
            :outline="!isRegister"
            :unelevated="isRegister"
            color="primary"
            icon="person_add"
            :label="$t('login.registerTab')"
            no-caps
            class="auth-switch-btn"
            @click="switchMode('register')"
          />
        </div>

        <q-form @submit.prevent="handleSubmit" class="q-gutter-md">
          <div class="name-field" v-if="isRegister">
            <div class="text-caption text-grey-7 q-mb-xs">{{ $t('login.name') }}</div>
            <div class="">
              <q-input
                v-model="name"
                :label="$t('login.name')"
                outlined
                maxlength="40"
                counter
                :rules="[
                  val => !!val || $t('login.nameRequired'),
                  val => val.trim().length >= 2 || $t('login.nameMin')
                ]"
                lazy-rules
              >
                <template #prepend>
                  <q-icon name="person" />
                </template>
              </q-input>
            </div>
          </div>

          <div class="phone-field">
            <div class="text-caption text-grey-7 q-mb-xs">{{ $t('login.phone') }}</div>
            <div class="row no-wrap items-start q-gutter-x-sm">
              <q-select
                v-model="selectedCountry"
                :options="countries"
                outlined
                dense
                option-value="code"
                class="country-select"
                :display-value="`${selectedCountry.code} ${selectedCountry.dial}`"
                :rules="[val => !!val || '']"
                hide-bottom-space
                popup-content-class="country-popup"
              >
                <template #option="scope">
                  <q-item v-bind="scope.itemProps">
                    <q-item-section avatar>
                      <span class="country-code">{{ scope.opt.code }}</span>
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>{{ scope.opt.name }}</q-item-label>
                      <q-item-label caption>{{ scope.opt.dial }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>

              <q-input
                v-model="phoneNumber"
                outlined
                dense
                class="col"
                :placeholder="$t('login.phone')"
                type="tel"
                :rules="[
                  val => !!val || $t('login.phoneRequired'),
                  val => /^\d{6,15}$/.test(val) || $t('login.phoneInvalid')
                ]"
                lazy-rules
              />
            </div>
          </div>

          <div class="pin-field">
            <div class="text-caption text-grey-7 q-mb-xs">{{ $t('login.pin') }}</div>
            <div class="row justify-center q-gutter-sm">
              <input
                v-for="(_, i) in 4"
                :key="i"
                :ref="el => { if (el) pinRefs[i] = el }"
                v-model="pinDigits[i]"
                type="tel"
                inputmode="numeric"
                maxlength="1"
                class="pin-box"
                @input="onPinInput(i, $event)"
                @keydown="onPinKeydown(i, $event)"
                @paste="onPinPaste($event)"
              />
            </div>
          </div>

          <div class="q-pt-sm">
            <q-banner v-if="errorMsg" class="text-negative q-mb-sm" dense rounded>
              <div>{{ errorMsg }}</div>
              <template v-if="showRegisterInvite" #action>
                <q-btn
                  flat
                  dense
                  no-caps
                  color="primary"
                  :label="$t('login.goToRegister')"
                  @click="switchMode('register')"
                />
              </template>
            </q-banner>

            <q-btn
              type="submit"
              :label="submitLabel"
              color="primary"
              class="full-width"
              size="md"
              unelevated
              :loading="loading"
            />

            <div class="mode-helper text-center q-mt-md">
              <span class="text-grey-7">{{ helperText }}</span>
              <q-btn
                flat
                dense
                no-caps
                color="primary"
                :label="helperActionLabel"
                class="q-ml-xs"
                @click="switchMode(isRegister ? 'login' : 'register')"
              />
            </div>
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'src/stores/auth'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const authStore = useAuthStore()
const { locale, t } = useI18n()

const mode = ref('login')
const name = ref('')
const phoneNumber = ref('')
const loading = ref(false)
const pinDigits = ref(['', '', '', ''])
const pinRefs = ref([])
const errorMsg = ref('')
const showRegisterInvite = ref(false)

const isLogin = computed(() => mode.value === 'login')
const isRegister = computed(() => mode.value === 'register')
const modeSubtitle = computed(() => isRegister.value ? t('login.registerSubtitle') : t('login.subtitle'))
const submitLabel = computed(() => isRegister.value ? t('login.registerSubmit') : t('login.submit'))
const helperText = computed(() => isRegister.value ? t('login.hasAccount') : t('login.noAccount'))
const helperActionLabel = computed(() => isRegister.value ? t('login.goToLogin') : t('login.goToRegister'))

const languageOptions = [
  { label: 'Espanol', value: 'es-ES' },
  { label: 'English', value: 'en-US' }
]

function switchMode(nextMode) {
  mode.value = nextMode
  errorMsg.value = ''
  showRegisterInvite.value = false
}

function onPinInput(index, event) {
  const val = event.target.value.replace(/\D/g, '')
  pinDigits.value[index] = val ? val[val.length - 1] : ''
  event.target.value = pinDigits.value[index]
  if (pinDigits.value[index] && index < 3) {
    pinRefs.value[index + 1]?.focus()
  }
}

function onPinKeydown(index, event) {
  if (event.key === 'Backspace' && !pinDigits.value[index] && index > 0) {
    pinRefs.value[index - 1]?.focus()
  }
}

function onPinPaste(event) {
  const text = (event.clipboardData || window.clipboardData).getData('text').replace(/\D/g, '').slice(0, 4)
  event.preventDefault()
  text.split('').forEach((char, i) => {
    pinDigits.value[i] = char
  })
  const nextEmpty = text.length < 4 ? text.length : 3
  pinRefs.value[nextEmpty]?.focus()
}

const countries = [
  { name: 'Colombia', dial: '+57', code: 'CO' },
  { name: 'Mexico', dial: '+52', code: 'MX' },
  { name: 'Argentina', dial: '+54', code: 'AR' },
  { name: 'Chile', dial: '+56', code: 'CL' },
  { name: 'Peru', dial: '+51', code: 'PE' },
  { name: 'Ecuador', dial: '+593', code: 'EC' },
  { name: 'Venezuela', dial: '+58', code: 'VE' },
  { name: 'Bolivia', dial: '+591', code: 'BO' },
  { name: 'Paraguay', dial: '+595', code: 'PY' },
  { name: 'Uruguay', dial: '+598', code: 'UY' },
  { name: 'Costa Rica', dial: '+506', code: 'CR' },
  { name: 'Panama', dial: '+507', code: 'PA' },
  { name: 'Guatemala', dial: '+502', code: 'GT' },
  { name: 'Honduras', dial: '+504', code: 'HN' },
  { name: 'El Salvador', dial: '+503', code: 'SV' },
  { name: 'Nicaragua', dial: '+505', code: 'NI' },
  { name: 'Republica Dominicana', dial: '+1', code: 'DO' },
  { name: 'Cuba', dial: '+53', code: 'CU' },
  { name: 'Espana', dial: '+34', code: 'ES' },
  { name: 'Estados Unidos', dial: '+1', code: 'US' }
]

const selectedCountry = ref(countries[0])

async function handleSubmit() {
  const pin = pinDigits.value.join('')
  if (pin.length < 4) {
    return
  }

  errorMsg.value = ''
  showRegisterInvite.value = false
  loading.value = true

  try {
    const fullPhone = `${selectedCountry.value.dial}${phoneNumber.value}`
    if (isRegister.value) {
      await authStore.register({ name: name.value.trim(), phone: fullPhone, pin })
    } else {
      await authStore.login({ phone: fullPhone, pin })
    }
    await router.push('/')
  } catch (err) {
    errorMsg.value = err.message || t('login.error')
    showRegisterInvite.value = !isRegister.value && err.status === 404
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: #F4F0FA;
}

.login-card {
  width: 95%;
  max-width: 420px;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.auth-switch {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.auth-switch-btn {
  min-height: 44px;
  border-radius: 8px;
  font-weight: 700;
}

.mode-helper {
  min-height: 32px;
}

.country-select {
  width: 130px;
  flex-shrink: 0;
}

.country-code {
  display: inline-flex;
  width: 32px;
  height: 24px;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  background: #F4F0FA;
  color: var(--q-primary, #7c3aed);
  font-size: 0.75rem;
  font-weight: 700;
}

.language-select {
  max-width: 160px;
  margin: 0 auto;
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
