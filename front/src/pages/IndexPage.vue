<template>
  <q-page class="dashboard-bg">
    <!-- Header greeting -->
    <div class="dashboard-header q-px-md q-pt-lg q-pb-sm bg-white">
      <div class="row items-start justify-between no-wrap">
        <div>
          <div class="text-body2 text-grey-7">{{ $t('dashboard.greeting') }}</div>
          <div class="text-h5 text-weight-bold text-dark">
            {{ userName }} 💜
          </div>
          <div class="text-caption text-grey-6 q-mt-xs">{{ $t('dashboard.blessing') }}</div>
        </div>
        <q-btn flat round icon="person" color="dark" size="md" to="/profile" />
      </div>
    </div>

    <div class="q-px-md q-py-md q-gutter-y-md">

      <!-- Versículo del día -->
      <q-card flat bordered class="verse-card overflow-hidden">
        <q-card-section class="q-pa-none">
          <div class="row no-wrap">
            <div class="col q-pa-md">
              <div class="text-overline text-weight-bold text-primary q-mb-xs" style="font-size:10px; letter-spacing:1px;">
                {{ $t('dashboard.verse.label') }}
              </div>
              <div class="text-h6 text-weight-bold text-dark q-mb-xs">{{ dailyVerse.reference }}</div>
              <div class="text-body2 text-grey-8 q-mb-md" style="line-height:1.4;">
                {{ dailyVerse.text }}
              </div>
            </div>
            <div class="verse-img-wrap col-auto">
              <img
                src="/imgs/day-verse.avif"
                class="verse-img"
                :alt="$t('dashboard.verse.altImg')"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Racha + Estado de ánimo -->

      <!-- Consejero Espiritual IA -->
      <q-card flat class="counselor-card">
        <q-card-section class="q-pa-md">
          <div class="row items-center justify-between no-wrap">
            <div class="col">
              <div class="text-overline text-weight-bold text-white q-mb-xs" style="font-size:10px; letter-spacing:1px; opacity:0.85;">
                {{ $t('dashboard.counselor.label') }}
              </div>
              <div class="text-h6 text-weight-bold text-white q-mb-md" style="line-height:1.3;">
                {{ $t('dashboard.counselor.question') }}
              </div>
              <q-btn
                unelevated
                rounded
                color="white"
                text-color="primary"
                :label="$t('dashboard.counselor.cta')"
                size="sm"
                no-caps
                class="text-weight-bold"
                to="/advisor"
              />
            </div>
            <div class="q-ml-md">
              <q-avatar size="56px" color="white" text-color="primary" style="opacity:0.15; position:absolute;" />
              <q-icon name="chat_bubble" size="56px" color="white" style="opacity:0.2;" />
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Última entrada del diario -->
      <!--q-card flat bordered class="diary-card">
        <q-card-section class="q-pa-md">
          <div class="row items-center justify-between no-wrap">
            <div class="col">
              <div class="text-overline text-weight-bold text-primary q-mb-xs" style="font-size:10px; letter-spacing:1px;">
                {{ $t('dashboard.diary.label') }}
              </div>
              <div class="text-body2 text-dark q-mb-xs" style="line-height:1.4;">
                {{ $t('dashboard.diary.lastEntry') }}
              </div>
              <div class="text-caption text-grey-6">{{ $t('dashboard.diary.timestamp') }}</div>
            </div>
            <q-icon name="menu_book" size="40px" color="primary" class="q-ml-md" style="opacity:0.25;" />
          </div>
        </q-card-section>
      </q-card-->

    </div>
  </q-page>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from 'src/stores/auth'
import { useI18n } from 'vue-i18n'

const authStore = useAuthStore()
const { tm } = useI18n()

const userName = computed(() => authStore.user?.name || 'usuario')

const dailyVerse = computed(() => {
  const list = tm('dashboard.verse.list')
  return list[Math.floor(Math.random() * list.length)]
})
</script>

<style scoped>
.dashboard-bg {
  background-color: #F4F0FA;
  min-height: 100vh;
}

.dashboard-header {
  border-bottom: 1px solid #eeeeee;
}

.verse-card {
  background: #ffffff;
  border-radius: 16px !important;
  border-color: #e8e8e8;
}

.verse-img-wrap {
  width: 120px;
  flex-shrink: 0;
}

.verse-img {
  width: 120px;
  height: 100%;
  object-fit: cover;
  display: block;
  border-radius: 0 16px 16px 0;
}

.stat-card {
  border-radius: 16px !important;
  background: #ffffff;
  border-color: #e8e8e8;
}

.counselor-card {
  border-radius: 16px !important;
  background: linear-gradient(135deg, #7B2FBE 0%, #9C59D1 100%);
  position: relative;
  overflow: hidden;
}

.diary-card {
  border-radius: 16px !important;
  background: #ffffff;
  border-color: #e8e8e8;
}
</style>
