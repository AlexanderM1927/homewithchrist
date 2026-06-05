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
      <!--div class="row q-gutter-x-md">
        <q-card flat bordered class="col stat-card">
          <q-card-section class="q-pa-md">
            <div class="text-overline text-weight-bold text-grey-6" style="font-size:10px; letter-spacing:1px;">
              {{ $t('dashboard.streak.label') }}
            </div>
            <div class="row items-center q-gutter-x-xs q-mt-xs">
              <span style="font-size:28px;">🔥</span>
              <span class="text-h4 text-weight-bold text-dark">12</span>
            </div>
            <div class="text-caption text-grey-7">{{ $t('dashboard.streak.days') }}</div>
            <div class="text-caption text-grey-6 q-mt-xs">{{ $t('dashboard.streak.encouragement') }}</div>
          </q-card-section>
        </q-card>

        <q-card flat bordered class="col stat-card">
          <q-card-section class="q-pa-md">
            <div class="text-overline text-weight-bold text-grey-6" style="font-size:10px; letter-spacing:1px;">
              {{ $t('dashboard.mood.label') }}
            </div>
            <div class="row items-center q-gutter-x-xs q-mt-xs">
              <span style="font-size:22px;">😊</span>
              <span class="text-subtitle1 text-weight-bold text-dark">{{ $t('dashboard.mood.value') }}</span>
            </div>
          </q-card-section>
        </q-card>
      </div-->

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
      <q-card flat bordered class="diary-card">
        <q-card-section class="q-pa-md">
          <div class="row items-center justify-between no-wrap">
            <div class="col">
              <div class="text-overline text-weight-bold text-primary q-mb-xs" style="font-size:10px; letter-spacing:1px;">
                {{ $t('dashboard.diary.label') }}
              </div>
              <q-skeleton v-if="diaryLoading" type="text" width="85%" />
              <template v-else>
                <div class="text-body2 text-dark q-mb-xs" style="line-height:1.4;">
                  {{ latestDiaryEntry ? getDiaryPreview(latestDiaryEntry) : $t('dashboard.diary.empty') }}
                </div>
                <div v-if="latestDiaryEntry" class="text-caption text-grey-6">
                  {{ formatDiaryDate(latestDiaryEntry.createdAt) }}
                </div>
              </template>
            </div>
            <q-icon name="menu_book" size="40px" color="primary" class="q-ml-md" style="opacity:0.25;" />
          </div>
        </q-card-section>
      </q-card>

    </div>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useAuthStore } from 'src/stores/auth'
import { useI18n } from 'vue-i18n'
import diaryService from 'src/services/DiaryService'

const authStore = useAuthStore()
const { locale, tm } = useI18n()
const latestDiaryEntry = ref(null)
const diaryLoading = ref(true)

const userName = computed(() => authStore.user?.name || 'usuario')

const dailyVerse = computed(() => {
  const list = tm('dashboard.verse.list')
  return list[Math.floor(Math.random() * list.length)]
})

function formatDiaryDate(date) {
  return new Intl.DateTimeFormat(locale.value, {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(date))
}

function getDiaryPreview(entry) {
  if (entry.title) return entry.title
  if (entry.content.length <= 100) return entry.content
  return `${entry.content.slice(0, 97)}...`
}

async function loadLatestDiaryEntry() {
  try {
    const data = await diaryService.getEntries()
    latestDiaryEntry.value = data.entries[0] || null
  } catch {
    latestDiaryEntry.value = null
  } finally {
    diaryLoading.value = false
  }
}

onMounted(loadLatestDiaryEntry)
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
