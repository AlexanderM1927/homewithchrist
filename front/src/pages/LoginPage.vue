<template>
  <q-page class="login-page flex flex-center">
    <q-card class="login-card q-pa-lg">
      <q-card-section class="text-center q-pb-sm">
        <div class="text-h5 text-weight-bold text-primary">Home With Christ</div>
        <div class="text-subtitle2 text-grey-6 q-mt-xs">{{ $t('login.subtitle') }}</div>
      </q-card-section>

      <q-card-section class="q-pt-md">
        <q-form @submit.prevent="handleLogin" class="q-gutter-md">

          <!-- Nombre -->
          <q-input
            v-model="name"
            :label="$t('login.name')"
            outlined
            maxlength="15"
            counter
            :rules="[val => !val || val.length >= 2 || $t('login.nameMin')]"
            lazy-rules
          >
            <template #prepend>
              <q-icon name="person" />
            </template>
          </q-input>

          <!-- Celular con indicativo de país -->
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
                :display-value="`${selectedCountry.flag} ${selectedCountry.dial}`"
                :rules="[val => !!val || '']"
                hide-bottom-space
                popup-content-class="country-popup"
              >
                <template #option="scope">
                  <q-item v-bind="scope.itemProps">
                    <q-item-section avatar>
                      <span style="font-size: 1.4em">{{ scope.opt.flag }}</span>
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

          <!-- Clave de 4 dígitos -->
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

          <!-- Botón ingresar -->
          <div class="q-pt-sm">
            <q-banner v-if="errorMsg" class="text-negative q-mb-sm" dense rounded>
              {{ errorMsg }}
            </q-banner>
            <q-btn
              type="submit"
              :label="$t('login.submit')"
              color="primary"
              class="full-width"
              size="md"
              unelevated
              :loading="loading"
            />
          </div>

        </q-form>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'src/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const name = ref('')
const phoneNumber = ref('')
const loading = ref(false)
const pinDigits = ref(['', '', '', ''])
const pinRefs = ref([])
const errorMsg = ref('')

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
  { name: 'Colombia', dial: '+57', code: 'CO', flag: '🇨🇴' },
  { name: 'México', dial: '+52', code: 'MX', flag: '🇲🇽' },
  { name: 'Argentina', dial: '+54', code: 'AR', flag: '🇦🇷' },
  { name: 'Chile', dial: '+56', code: 'CL', flag: '🇨🇱' },
  { name: 'Perú', dial: '+51', code: 'PE', flag: '🇵🇪' },
  { name: 'Ecuador', dial: '+593', code: 'EC', flag: '🇪🇨' },
  { name: 'Venezuela', dial: '+58', code: 'VE', flag: '🇻🇪' },
  { name: 'Bolivia', dial: '+591', code: 'BO', flag: '🇧🇴' },
  { name: 'Paraguay', dial: '+595', code: 'PY', flag: '🇵🇾' },
  { name: 'Uruguay', dial: '+598', code: 'UY', flag: '🇺🇾' },
  { name: 'Costa Rica', dial: '+506', code: 'CR', flag: '🇨🇷' },
  { name: 'Panamá', dial: '+507', code: 'PA', flag: '🇵🇦' },
  { name: 'Guatemala', dial: '+502', code: 'GT', flag: '🇬🇹' },
  { name: 'Honduras', dial: '+504', code: 'HN', flag: '🇭🇳' },
  { name: 'El Salvador', dial: '+503', code: 'SV', flag: '🇸🇻' },
  { name: 'Nicaragua', dial: '+505', code: 'NI', flag: '🇳🇮' },
  { name: 'República Dominicana', dial: '+1', code: 'DO', flag: '🇩🇴' },
  { name: 'Cuba', dial: '+53', code: 'CU', flag: '🇨🇺' },
  { name: 'España', dial: '+34', code: 'ES', flag: '🇪🇸' },
  { name: 'Estados Unidos', dial: '+1', code: 'US', flag: '🇺🇸' },
]

const selectedCountry = ref(countries[0]) // Colombia por defecto

async function handleLogin() {
  const pin = pinDigits.value.join('')
  if (pin.length < 4) {
    return
  }
  errorMsg.value = ''
  loading.value = true
  try {
    const fullPhone = `${selectedCountry.value.dial}${phoneNumber.value}`
    await authStore.login({ name: name.value, phone: fullPhone, pin })
    await router.push('/')
  } catch (err) {
    errorMsg.value = err.message || 'Error al iniciar sesión'
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

.country-select {
  width: 130px;
  flex-shrink: 0;
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
