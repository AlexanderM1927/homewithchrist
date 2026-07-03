<template>
  <q-dialog :model-value="modelValue" maximized @update:model-value="emit('update:modelValue', $event)">
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
            :src="dailyVerseImageSrc"
            class="story-card-share__image"
            :alt="$t('dashboard.verse.altImg')"
          />
          <div class="story-card-share__overlay"></div>
          <div class="story-card-share__content">
            <div class="story-card-share__badge">{{ $t('dashboard.verse.label') }}</div>
            <div class="story-card-share__reference">{{ verse.reference }}</div>
            <div class="story-card-share__text">{{ verse.text }}</div>
          </div>
          <div class="story-card-share__footer">
            <div class="story-card-share__brand">Home With Christ</div>
            <div class="story-card-share__link">{{ publicAppUrlLabel }}</div>
          </div>
        </div>
      </q-card-section>

      <q-card-actions align="center" class="story-modal__actions">
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
        <q-btn
          outline
          color="white"
          icon="file_download"
          :label="$t('dashboard.verse.downloadStory')"
          :loading="storySharing"
          no-caps
          @click="downloadStoryImage"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, toRefs, unref } from 'vue'
import { Directory, Filesystem } from '@capacitor/filesystem'
import { Share } from '@capacitor/share'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { getRuntimePlatform } from 'src/composables/useRuntimePlatform'
import { getPublicAppBaseUrl } from 'src/utils/publicAppUrl'
import { getDailyVerseImage } from 'src/utils/dailyVerseImage'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  verse: {
    type: Object,
    default: () => ({ reference: '', text: '' })
  }
})

const emit = defineEmits(['update:modelValue'])

const { verse } = toRefs(props)
const $q = useQuasar()
const { t } = useI18n()
const publicAppUrl = getPublicAppBaseUrl()
const publicAppUrlLabel = publicAppUrl.replace(/^https?:\/\//, '')
const storySharing = ref(false)
const runtimePlatform = getRuntimePlatform()
const dailyVerseImageSrc = getDailyVerseImage()

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
  const currentVerse = unref(verse)
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
    const image = await loadImage(`${window.location.origin}${dailyVerseImageSrc}`)
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
  const referenceLines = wrapCanvasText(ctx, currentVerse.reference, 804)
  referenceLines.forEach((line, index) => {
    ctx.fillText(line, 138, 316 + (index * 84))
  })

  ctx.font = '48px sans-serif'
  const textStartY = 470 + ((referenceLines.length - 1) * 84)
  const textLines = wrapCanvasText(ctx, currentVerse.text, 804).slice(0, 16)
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

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      const result = String(reader.result || '')
      const [, base64 = ''] = result.split(',')
      if (base64) {
        resolve(base64)
        return
      }
      reject(new Error('blob_base64_conversion_failed'))
    }
    reader.onerror = () => reject(reader.error || new Error('blob_base64_conversion_failed'))
    reader.readAsDataURL(blob)
  })
}

async function shareStoryImageNatively(blob, currentVerse) {
  const fileName = `home-with-christ-versiculo-del-dia-${Date.now()}.png`
  const data = await blobToBase64(blob)

  await Filesystem.writeFile({
    path: fileName,
    data,
    directory: Directory.Cache,
    recursive: true
  })

  const { uri } = await Filesystem.getUri({
    path: fileName,
    directory: Directory.Cache
  })

  await Share.share({
    title: currentVerse.reference,
    url: uri,
    dialogTitle: t('dashboard.verse.shareStory')
  })
}

async function saveStoryImageNatively(blob) {
  const fileName = `home-with-christ-versiculo-del-dia-${Date.now()}.png`
  const data = await blobToBase64(blob)
  const permissionStatus = await Filesystem.checkPermissions()

  if (permissionStatus.publicStorage !== 'granted') {
    const requestedPermissionStatus = await Filesystem.requestPermissions()
    if (requestedPermissionStatus.publicStorage !== 'granted') {
      throw new Error('story_download_permission_denied')
    }
  }

  await Filesystem.writeFile({
    path: fileName,
    data,
    directory: Directory.Documents,
    recursive: true
  })
}

async function downloadStoryImage() {
  if (storySharing.value) return

  storySharing.value = true
  try {
    const blob = await createStoryImageBlob()

    if (runtimePlatform.isCapacitor && runtimePlatform.isAndroid) {
      await saveStoryImageNatively(blob)
    } else {
      saveBlob(blob)
    }

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
    const currentVerse = unref(verse)

    if (runtimePlatform.isCapacitor && runtimePlatform.isAndroid) {
      await shareStoryImageNatively(blob, currentVerse)
      return
    }

    const file = new File([blob], 'home-with-christ-versiculo-del-dia.png', { type: 'image/png' })
    const sharePayload = {
      title: currentVerse.reference,
      text: publicAppUrl,
      files: [file]
    }

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share(sharePayload)
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
</script>

<style scoped>
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
  padding: 0 18px 28px;
  display: flex;
  align-items: center;
}

@media (max-width: 420px) {
  .story-card-share__content {
    padding: 24px 20px 110px;
  }
}
</style>
