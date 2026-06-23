<template>
  <q-page class="diary-page q-pa-md">
    <div class="diary-container">
      <div class="q-mb-md">
        <div class="text-h5 text-weight-bold text-dark">{{ $t('diary.title') }}</div>
        <div class="text-body2 text-grey-7">{{ $t('diary.subtitle') }}</div>
      </div>

      <q-card flat bordered class="entry-card q-mb-lg">
        <q-card-section>
          <q-form ref="entryFormRef" class="q-gutter-y-md" @submit="saveEntry">
            <q-input
              v-model="form.title"
              outlined
              maxlength="150"
              :label="$t('diary.entryTitle')"
              :hint="$t('diary.optional')"
            />

            <q-input
              v-model="form.content"
              outlined
              autogrow
              type="textarea"
              :label="$t('diary.content')"
              :placeholder="$t('diary.contentPlaceholder')"
              :rules="[value => Boolean(value && value.trim()) || $t('diary.contentRequired')]"
            />

            <q-file
              v-model="form.image"
              outlined
              clearable
              accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
              :max-file-size="maxImageSizeBytes"
              :label="$t('diary.image')"
              :hint="$t('diary.imageHint')"
              @update:model-value="updateImagePreview"
              @clear="clearImagePreview"
              @rejected="notifyImageRejected"
            >
              <template #prepend>
                <q-icon name="image" />
              </template>
            </q-file>

            <q-img
              v-if="imagePreview"
              :src="imagePreview"
              :alt="$t('diary.imagePreview')"
              class="image-preview"
              fit="cover"
            />

            <div class="row justify-end">
              <q-btn
                unelevated
                rounded
                no-caps
                color="primary"
                icon="edit_note"
                type="submit"
                :label="$t('diary.save')"
                :loading="saving"
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>

      <div class="text-h6 text-weight-bold q-mb-sm">{{ $t('diary.myEntries') }}</div>

      <div v-if="loading" class="row justify-center q-py-xl">
        <q-spinner color="primary" size="36px" />
      </div>

      <q-card v-else-if="entries.length === 0" flat bordered class="empty-card text-center q-pa-xl">
        <q-icon name="menu_book" size="48px" color="primary" class="q-mb-sm" />
        <div class="text-body1 text-grey-7">{{ $t('diary.empty') }}</div>
      </q-card>

      <div v-else class="q-gutter-y-md">
        <q-card v-for="entry in entries" :key="entry.diary_entry_id" flat bordered class="entry-card">
          <q-img
            v-if="entry.image_path"
            :src="diaryService.getImageUrl(entry.image_path)"
            :alt="entry.title || $t('diary.imagePreview')"
            class="entry-thumb"
            fit="cover"
          />
          <q-card-section>
            <div v-if="entry.title" class="entry-title text-subtitle1 text-weight-bold q-mb-xs">
              {{ entry.title }}
            </div>
            <div class="entry-content text-body2 text-grey-9">{{ getContentPreview(entry.content) }}</div>
            <div class="text-caption text-grey-6 q-mt-md">{{ formatDate(entry.createdAt) }}</div>
            <div class="row justify-end q-mt-sm">
              <q-btn
                flat
                rounded
                no-caps
                color="primary"
                :label="$t('diary.seeMore')"
                :to="`/diary/${entry.diary_entry_id}`"
              />
            </div>
          </q-card-section>
        </q-card>

        <div v-if="totalPages > 1" class="row justify-center q-pt-sm">
          <q-pagination
            v-model="page"
            :max="totalPages"
            :max-pages="6"
            direction-links
            boundary-links
            color="primary"
            @update:model-value="loadEntries"
          />
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { nextTick, onActivated, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuasar } from 'quasar'
import diaryService from 'src/services/DiaryService'
import createLatestRequest from 'src/utils/createLatestRequest'

const $q = useQuasar()
const { t, locale } = useI18n()

const entries = ref([])
const loading = ref(true)
const saving = ref(false)
const page = ref(1)
const totalPages = ref(1)
const entryFormRef = ref(null)
const form = reactive({
  title: '',
  content: '',
  image: null
})
const imagePreview = ref('')
const maxImageSizeBytes = 5 * 1024 * 1024
const entriesRequest = createLatestRequest()

function formatDate(date) {
  return new Intl.DateTimeFormat(locale.value, {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(date))
}

function getContentPreview(content) {
  if (content.length <= 100) return content
  return `${content.slice(0, 97)}...`
}

function clearImagePreview() {
  if (imagePreview.value) {
    URL.revokeObjectURL(imagePreview.value)
  }
  imagePreview.value = ''
}

function updateImagePreview(file) {
  clearImagePreview()
  if (file) {
    if (file.size > maxImageSizeBytes) {
      form.image = null
      notifyImageRejected()
      return
    }
    imagePreview.value = URL.createObjectURL(file)
  }
}

function notifyImageRejected() {
  $q.notify({ type: 'negative', message: t('diary.imageTooLarge') })
}

async function loadEntries(requestedPage = page.value) {
  loading.value = true
  try {
    const result = await entriesRequest.run(signal => diaryService.getEntries(requestedPage, { signal }))
    if (result.status !== 'success') return
    const data = result.value
    entries.value = data.entries
    page.value = data.pagination.page
    totalPages.value = Math.max(data.pagination.totalPages, 1)
  } catch {
    $q.notify({ type: 'negative', message: t('diary.loadError') })
  } finally {
    if (!entriesRequest.isRunning()) {
      loading.value = false
    }
  }
}

async function saveEntry() {
  if (!form.content.trim()) return

  saving.value = true
  try {
    await diaryService.createEntry({
      title: form.title.trim(),
      content: form.content.trim(),
      image: form.image
    })
    form.title = ''
    form.content = ''
    form.image = null
    clearImagePreview()
    await nextTick()
    entryFormRef.value?.resetValidation()
    await loadEntries(1)
    $q.notify({ type: 'positive', message: t('diary.saveSuccess') })
  } catch (err) {
    $q.notify({ type: 'negative', message: err.message || t('diary.saveError') })
  } finally {
    saving.value = false
  }
}

onMounted(loadEntries)
onActivated(loadEntries)
onBeforeUnmount(clearImagePreview)
</script>

<style scoped>
.diary-page {
  min-height: 100vh;
  background: #f4f0fa;
}

.diary-container {
  width: 100%;
  max-width: 760px;
  margin: 0 auto;
}

.entry-card,
.empty-card {
  border-radius: 16px;
  border-color: #e5dcef;
  background: #fff;
}

.entry-thumb,
.image-preview {
  display: block;
  width: 100%;
  max-width: 100%;
  max-height: 280px;
  box-sizing: border-box;
}

.image-preview {
  border-radius: 12px;
  border: 1px solid #e5dcef;
}

.entry-thumb {
  border-radius: 16px 16px 0 0;
}

.entry-content {
  line-height: 1.6;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.entry-title {
  overflow-wrap: anywhere;
  word-break: break-word;
}
</style>
