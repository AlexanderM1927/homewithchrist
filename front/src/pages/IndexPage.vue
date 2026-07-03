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

      <q-dialog v-model="dailyVerseModalOpen" maximized>
        <q-card class="story-modal">
          <q-card-section class="story-modal__header row items-center justify-between">
            <div>
              <div class="text-overline text-weight-bold story-modal__eyebrow">
                {{ $t('dashboard.verse.storyLabel') }}
              </div>
              <div class="text-subtitle1 text-weight-bold">
                {{ $t('dashboard.verse.storySubtitle') }}
              </div>
            </div>
            <q-btn v-close-popup flat round dense icon="close" color="white" />
          </q-card-section>

          <q-card-section class="story-modal__body">
            <div class="story-card-share">
              <img
                src="/imgs/day-verse.avif"
                class="story-card-share__image"
                :alt="$t('dashboard.verse.altImg')"
              />
              <div class="story-card-share__overlay"></div>
              <div class="story-card-share__content">
                <div class="story-card-share__badge">{{ $t('dashboard.verse.label') }}</div>
                <div class="story-card-share__reference">{{ dailyVerse.reference }}</div>
                <div class="story-card-share__text">{{ dailyVerse.text }}</div>
              </div>
              <div class="story-card-share__footer">
                <div class="story-card-share__brand">Home With Christ</div>
                <div class="story-card-share__link">{{ publicAppUrlLabel }}</div>
              </div>
            </div>
          </q-card-section>

          <q-card-actions align="center" class="story-modal__actions">
            <q-btn
              outline
              color="white"
              icon="file_download"
              :label="$t('dashboard.verse.downloadStory')"
              :loading="storySharing"
              no-caps
              @click="downloadStoryImage"
            />
            <q-btn
              unelevated
              color="white"
              text-color="primary"
              icon="share"
              :label="$t('dashboard.verse.shareStory')"
              :loading="storySharing"
              no-caps
              @click="shareStoryImage"
            />
          </q-card-actions>
        </q-card>
      </q-dialog>

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

    </div>
  </q-page>
</template>

<script setup>
import { computed, onActivated, ref } from 'vue'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'src/stores/auth'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import diaryService from 'src/services/DiaryService'
import dailyVerseService from 'src/services/DailyVerseService'
import { getPublicAppBaseUrl } from 'src/utils/publicAppUrl'

const authStore = useAuthStore()
const router = useRouter()
const $q = useQuasar()
const { locale, t } = useI18n()
const latestDiaryEntry = ref(null)
const diaryLoading = ref(true)
const dailyVerse = ref({ reference: '', text: '' })
const dailyVerseLoading = ref(true)
const dailyVerseModalOpen = ref(false)
const storySharing = ref(false)

const userName = computed(() => authStore.user?.name || 'usuario')
const hasDailyVerse = computed(() => Boolean(dailyVerse.value.reference && dailyVerse.value.text))
const publicAppUrl = getPublicAppBaseUrl()
const publicAppUrlLabel = publicAppUrl.replace(/^https?:\/\//, '')

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

function wrapCanvasText(ctx, text, maxWidth) {
  const words = String(text || '').split(/\s+/).filter(Boolean)
  const lines = []
  let currentLine = ''

  words.forEach((word) => {
    const candidate = currentLine ? `${currentLine} ${word}` : word
    if (ctx.measureText(candidate).width <= maxWidth) {
      currentLine = candidate
      return
    }

    if (currentLine) lines.push(currentLine)
    currentLine = word
  })

  if (currentLine) lines.push(currentLine)
  return lines
}

function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.lineTo(x + width - radius, y)
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
  ctx.lineTo(x + width, y + height - radius)
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
  ctx.lineTo(x + radius, y + height)
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
  ctx.lineTo(x, y + radius)
  ctx.quadraticCurveTo(x, y, x + radius, y)
  ctx.closePath()
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.crossOrigin = 'anonymous'
    image.onload = () => resolve(image)
    image.onerror = reject
    image.src = src
  })
}

async function createStoryImageBlob() {
  const canvas = document.createElement('canvas')
  canvas.width = 1080
  canvas.height = 1920
  const ctx = canvas.getContext('2d')

  const backgroundGradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
  backgroundGradient.addColorStop(0, '#efe8ff')
  backgroundGradient.addColorStop(1, '#6422ab')
  ctx.fillStyle = backgroundGradient
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  try {
    const image = await loadImage(`${window.location.origin}/imgs/day-verse.avif`)
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height)
  } catch {
    ctx.fillStyle = '#7b2fbe'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }

  const overlayGradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
  overlayGradient.addColorStop(0, 'rgba(54, 22, 91, 0.22)')
  overlayGradient.addColorStop(1, 'rgba(34, 14, 57, 0.82)')
  ctx.fillStyle = overlayGradient
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = 'rgba(255, 255, 255, 0.14)'
  roundRect(ctx, 72, 88, 936, 1744, 56)
  ctx.fill()

  ctx.fillStyle = '#ffffff'
  ctx.font = '700 42px sans-serif'
  ctx.fillText(t('dashboard.verse.label').toUpperCase(), 138, 198)

  ctx.font = '700 76px sans-serif'
  const referenceLines = wrapCanvasText(ctx, dailyVerse.value.reference, 804)
  referenceLines.forEach((line, index) => {
    ctx.fillText(line, 138, 316 + (index * 84))
  })

  ctx.font = '48px sans-serif'
  const textStartY = 470 + ((referenceLines.length - 1) * 84)
  const textLines = wrapCanvasText(ctx, dailyVerse.value.text, 804).slice(0, 16)
  textLines.forEach((line, index) => {
    ctx.fillText(line, 138, textStartY + (index * 68))
  })

  ctx.fillStyle = 'rgba(255, 255, 255, 0.82)'
  ctx.font = '700 30px sans-serif'
  ctx.fillText('HOME WITH CHRIST', 138, 1684)

  ctx.fillStyle = '#d8a8ff'
  ctx.font = '32px sans-serif'
  ctx.fillText(publicAppUrlLabel, 138, 1738)

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob)
        return
      }
      reject(new Error('blob_generation_failed'))
    }, 'image/png')
  })
}

function saveBlob(blob) {
  const objectUrl = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = objectUrl
  link.download = 'home-with-christ-versiculo-del-dia.png'
  link.click()
  URL.revokeObjectURL(objectUrl)
}

async function downloadStoryImage() {
  if (storySharing.value) return

  storySharing.value = true
  try {
    const blob = await createStoryImageBlob()
    saveBlob(blob)
    $q.notify({ type: 'positive', message: t('dashboard.verse.storyDownloaded') })
  } catch {
    $q.notify({ type: 'negative', message: t('dashboard.verse.storyError') })
  } finally {
    storySharing.value = false
  }
}

async function shareStoryImage() {
  if (storySharing.value) return

  storySharing.value = true
  try {
    const blob = await createStoryImageBlob()
    const file = new File([blob], 'home-with-christ-versiculo-del-dia.png', { type: 'image/png' })

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        title: dailyVerse.value.reference,
        text: dailyVerse.value.text,
        files: [file]
      })
      return
    }

    saveBlob(blob)

    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(publicAppUrl)
    }

    $q.notify({ type: 'positive', message: t('dashboard.verse.storyFallback') })
  } catch (err) {
    if (err?.name !== 'AbortError') {
      $q.notify({ type: 'negative', message: t('dashboard.verse.storyError') })
    }
  } finally {
    storySharing.value = false
  }
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

.story-modal {
  min-height: 100dvh;
  background:
    radial-gradient(circle at top, rgba(255, 255, 255, 0.12), transparent 28%),
    linear-gradient(180deg, #5f259f 0%, #7b2fbe 48%, #3f1a68 100%);
  color: #ffffff;
}

.story-modal__header {
  padding: 18px 18px 8px;
}

.story-modal__eyebrow {
  font-size: 10px;
  letter-spacing: 1.6px;
  opacity: 0.82;
}

.story-modal__body {
  display: flex;
  justify-content: center;
  padding: 8px 18px 18px;
}

.story-card-share {
  position: relative;
  width: min(100%, 420px);
  aspect-ratio: 9 / 16;
  overflow: hidden;
  border-radius: 34px;
  background: #f4ecff;
  box-shadow: 0 24px 70px rgba(23, 7, 42, 0.38);
}

.story-card-share__image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.story-card-share__overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(63, 26, 104, 0.16) 0%, rgba(29, 21, 48, 0.82) 100%);
}

.story-card-share__content {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 28px 24px 120px;
  color: #ffffff;
}

.story-card-share__badge {
  align-self: flex-start;
  margin-bottom: 18px;
  padding: 8px 14px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(12px);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1.2px;
  text-transform: uppercase;
}

.story-card-share__reference {
  margin-bottom: 16px;
  font-size: clamp(1.6rem, 4vw, 2.15rem);
  line-height: 1.15;
  font-weight: 700;
  text-wrap: balance;
}

.story-card-share__text {
  font-size: clamp(1rem, 3.2vw, 1.18rem);
  line-height: 1.6;
  text-wrap: pretty;
}

.story-card-share__footer {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  padding: 18px 22px 24px;
  background: linear-gradient(180deg, rgba(29, 21, 48, 0) 0%, rgba(29, 21, 48, 0.9) 46%, rgba(29, 21, 48, 0.97) 100%);
}

.story-card-share__brand {
  margin-bottom: 6px;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.78);
}

.story-card-share__link {
  font-size: 0.8rem;
  color: #d8a8ff;
  word-break: break-word;
}

.story-modal__actions {
  gap: 12px;
  padding: 0 18px 28px;
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

@media (max-width: 420px) {
  .story-card-share__content {
    padding: 24px 20px 110px;
  }
}
</style>
