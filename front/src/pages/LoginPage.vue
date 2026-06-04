<template>
  <q-page class="login-page flex flex-center">
    <q-card class="login-card q-pa-lg">
      <q-card-section class="text-center q-pb-sm">
        <div class="text-h5 text-weight-bold text-primary">Home With Christ</div>
        <div class="text-subtitle2 text-grey-6 q-mt-xs">Ingresa tus datos para continuar</div>
      </q-card-section>

      <q-card-section class="q-pt-md">
        <q-form @submit.prevent="handleLogin" class="q-gutter-md">

          <!-- Nombre -->
          <q-input
            v-model="name"
            label="Nombre"
            outlined
            maxlength="15"
            counter
            :rules="[
              val => !!val || 'El nombre es requerido',
              val => val.length >= 2 || 'Mínimo 2 caracteres'
            ]"
            lazy-rules
          >
            <template #prepend>
              <q-icon name="person" />
            </template>
          </q-input>

          <!-- Celular con indicativo de país -->
          <div class="phone-field">
            <div class="text-caption text-grey-7 q-mb-xs">Número de celular</div>
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
                placeholder="Número de celular"
                type="tel"
                :rules="[
                  val => !!val || 'El número es requerido',
                  val => /^\d{6,15}$/.test(val) || 'Ingresa un número válido'
                ]"
                lazy-rules
              />
            </div>
          </div>

          <!-- Botón ingresar -->
          <div class="q-pt-sm">
            <q-btn
              type="submit"
              label="Ingresar"
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

const router = useRouter()

const name = ref('')
const phoneNumber = ref('')
const loading = ref(false)

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
  loading.value = true
  try {
    const fullPhone = `${selectedCountry.value.dial}${phoneNumber.value}`
    const userData = {
      name: name.value,
      phone: fullPhone,
      countryCode: selectedCountry.value.code,
      countryDial: selectedCountry.value.dial,
      phoneNumber: phoneNumber.value
    }
    localStorage.setItem('hwc_user', JSON.stringify(userData))
    await router.push('/')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a237e 0%, #283593 50%, #3949ab 100%);
}

.login-card {
  width: 100%;
  max-width: 420px;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.country-select {
  width: 130px;
  flex-shrink: 0;
}
</style>
