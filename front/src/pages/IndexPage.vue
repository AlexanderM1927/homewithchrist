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
        <q-btn flat round icon="settings" color="dark" size="md" to="/profile" />
      </div>
    </div>

    <div class="q-px-md q-py-md q-gutter-y-md">

      <!-- Versículo del día -->
      <q-card
        flat
        bordered
        class="verse-card overflow-hidden"
        :class="{ 'verse-card--clickable': hasDailyVerse }"
        :tabindex="hasDailyVerse ? 0 : undefined"
        @click="openDailyVerseModal"
        @keydown.enter="openDailyVerseModal"
        @keydown.space.prevent="openDailyVerseModal"
      >
        <q-card-section class="q-pa-none">
          <div class="row no-wrap">
            <div class="col q-pa-md">
              <div class="text-overline text-weight-bold text-primary q-mb-xs" style="font-size:10px; letter-spacing:1px;">
                {{ $t('dashboard.verse.label') }}
              </div>
              <q-skeleton v-if="dailyVerseLoading" type="text" width="70%" class="q-mb-sm" />
              <q-skeleton v-if="dailyVerseLoading" type="text" width="95%" />
              <template v-else>
                <div class="text-h6 text-weight-bold text-dark q-mb-xs">{{ dailyVerse.reference }}</div>
                <div class="text-body2 text-grey-8 q-mb-md" style="line-height:1.4;">
                  {{ dailyVerse.text }}
                </div>
              </template>
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

      <DailyVerseStoryModal
        v-model="dailyVerseModalOpen"
        :verse="dailyVerse"
      />

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
      <q-card
        flat
        bordered
        class="diary-card"
        :class="{ 'diary-card--clickable': latestDiaryEntry }"
        :tabindex="latestDiaryEntry ? 0 : undefined"
        @click="openLatestDiaryEntry"
        @keydown.enter="openLatestDiaryEntry"
        @keydown.space.prevent="openLatestDiaryEntry"
      >
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

      <!-- Descarga iOS / Android -->
      <div v-if="showDownloadCards" class="row q-gutter-x-md">
        <q-card
          flat
          bordered
          class="col stat-card stat-card--clickable"
          tabindex="0"
          @click="openIosInstallModal"
          @keydown.enter="openIosInstallModal"
          @keydown.space.prevent="openIosInstallModal"
        >
          <q-card-section class="q-pa-md">
            <div class="row items-center no-wrap q-gutter-sm">
              <q-icon name="apple" size="24px" color="dark" />
              <div class="text-overline text-weight-bold text-grey-6" style="font-size:10px; letter-spacing:1px;">
                {{ $t('dashboard.download.ios') }}
              </div>
            </div>
          </q-card-section>
        </q-card>

        <q-card
          flat
          bordered
          class="col stat-card stat-card--clickable"
          tabindex="0"
          @click="openAndroidStore"
          @keydown.enter="openAndroidStore"
          @keydown.space.prevent="openAndroidStore"
        >
          <q-card-section class="q-pa-md">
            <div class="row items-center no-wrap q-gutter-sm">
              <q-icon name="android" size="24px" color="positive" />
              <div class="text-overline text-weight-bold text-grey-6" style="font-size:10px; letter-spacing:1px;">
                {{ $t('dashboard.download.android') }}
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <q-dialog v-model="iosInstallModalOpen">
        <q-card class="ios-install-modal">
          <q-card-section class="q-pb-sm">
            <div class="text-h6 text-weight-bold text-dark">
              {{ $t('dashboard.download.iosModal.title') }}
            </div>
            <div class="text-body2 text-grey-7 q-mt-sm">
              {{ $t('dashboard.download.iosModal.subtitle') }}
            </div>
          </q-card-section>

          <q-card-section class="q-pt-none">
            <ol class="ios-install-steps">
              <li
                v-for="step in iosInstallSteps"
                :key="step"
                class="text-body2 text-grey-8 q-mb-sm"
              >
                {{ step }}
              </li>
            </ol>
          </q-card-section>

          <q-card-actions align="right" class="q-pa-md q-pt-none">
            <q-btn
              flat
              no-caps
              color="primary"
              :label="$t('dashboard.download.iosModal.close')"
              @click="iosInstallModalOpen = false"
            />
          </q-card-actions>
        </q-card>
      </q-dialog>

    </div>
  </q-page>
</template>

<script setup>
import { computed, onActivated, ref } from 'vue'
import { useAuthStore } from 'src/stores/auth'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import DailyVerseStoryModal from 'src/components/DailyVerseStoryModal.vue'
import { getRuntimePlatform } from 'src/composables/useRuntimePlatform'
import diaryService from 'src/services/DiaryService'
import dailyVerseService from 'src/services/DailyVerseService'

const authStore = useAuthStore()
const router = useRouter()
const { locale, t } = useI18n()
const runtimePlatform = getRuntimePlatform()
const latestDiaryEntry = ref(null)
const diaryLoading = ref(true)
const dailyVerse = ref({ reference: '', text: '' })
const dailyVerseLoading = ref(true)
const dailyVerseModalOpen = ref(false)
const iosInstallModalOpen = ref(false)
const androidStoreUrl = 'https://play.google.com/store/apps/details?id=co.alexanderm.homewithchrist'

const userName = computed(() => authStore.user?.name || 'usuario')
const hasDailyVerse = computed(() => Boolean(dailyVerse.value.reference && dailyVerse.value.text))
const showDownloadCards = computed(() => !runtimePlatform.isCapacitor)
const iosInstallSteps = computed(() => ([
  t('dashboard.download.iosModal.steps.openInSafari'),
  t('dashboard.download.iosModal.steps.tapShare'),
  t('dashboard.download.iosModal.steps.selectAddToHome'),
  t('dashboard.download.iosModal.steps.confirm')
]))

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

function openLatestDiaryEntry() {
  if (!latestDiaryEntry.value) return
  router.push(`/diary/${latestDiaryEntry.value.diary_entry_id}`)
}

function openDailyVerseModal() {
  if (dailyVerseLoading.value || !hasDailyVerse.value) return
  dailyVerseModalOpen.value = true
}

function openIosInstallModal() {
  iosInstallModalOpen.value = true
}

function openAndroidStore() {
  window.open(androidStoreUrl, '_blank', 'noopener,noreferrer')
}

async function loadDailyVerse() {
  dailyVerseLoading.value = true
  try {
    dailyVerse.value = await dailyVerseService.getToday()
  } catch {
    dailyVerse.value = { reference: '', text: '' }
  } finally {
    dailyVerseLoading.value = false
  }
}

async function loadLatestDiaryEntry() {
  diaryLoading.value = true
  try {
    const data = await diaryService.getEntries()
    latestDiaryEntry.value = data.entries[0] || null
  } catch {
    latestDiaryEntry.value = null
  } finally {
    diaryLoading.value = false
  }
}

onActivated(() => {
  loadDailyVerse()
  loadLatestDiaryEntry()
})
</script>

<style scoped>
.dashboard-bg {
  background-color: #F4F0FA;
  min-height: 100dvh;
}

.dashboard-header {
  border-bottom: 1px solid #eeeeee;
}

.verse-card {
  background: #ffffff;
  border-radius: 16px !important;
  border-color: #e8e8e8;
}

.verse-card--clickable {
  cursor: pointer;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
}

.verse-card--clickable:hover,
.verse-card--clickable:focus {
  border-color: #7B2FBE;
  box-shadow: 0 6px 20px rgba(123, 47, 190, 0.16);
  outline: none;
  transform: translateY(-1px);
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

.stat-card--clickable {
  cursor: pointer;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
}

.stat-card--clickable:hover,
.stat-card--clickable:focus {
  border-color: #7B2FBE;
  box-shadow: 0 4px 14px rgba(123, 47, 190, 0.14);
  outline: none;
  transform: translateY(-1px);
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

.diary-card--clickable {
  cursor: pointer;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.diary-card--clickable:hover,
.diary-card--clickable:focus {
  border-color: #7B2FBE;
  box-shadow: 0 4px 14px rgba(123, 47, 190, 0.14);
  outline: none;
}

.ios-install-modal {
  width: min(92vw, 420px);
  border-radius: 20px;
}

.ios-install-steps {
  margin: 0;
  padding-left: 20px;
}

</style>
