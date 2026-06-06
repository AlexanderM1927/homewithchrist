<template>
  <q-page class="diary-page q-pa-md">
    <div class="diary-container">
      <q-btn
        flat
        rounded
        no-caps
        color="primary"
        icon="arrow_back"
        :label="$t('diary.back')"
        class="q-mb-md"
        @click="router.back()"
      />

      <div v-if="loading" class="row justify-center q-py-xl">
        <q-spinner color="primary" size="36px" />
      </div>

      <q-card v-else-if="entry" flat bordered class="entry-card">
        <q-card-section>
          <div class="row items-center justify-between q-gutter-sm q-mb-md">
            <div class="text-caption text-grey-6">{{ formatDate(entry.createdAt) }}</div>
            <q-btn
              v-if="!editing"
              flat
              round
              color="primary"
              icon="edit"
              :aria-label="$t('diary.edit')"
              @click="startEditing"
            >
              <q-tooltip>{{ $t('diary.edit') }}</q-tooltip>
            </q-btn>
          </div>

          <q-form v-if="editing" ref="editFormRef" class="q-gutter-y-md" @submit="saveChanges">
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
              accept=".jpg,.jpeg,.png,image/jpeg,image/png"
              :max-file-size="maxImageSizeBytes"
              :label="$t('diary.image')"
              :hint="$t('diary.imageEditHint')"
              @update:model-value="updateImagePreview"
              @clear="clearImageSelection"
              @rejected="notifyImageRejected"
            >
              <template #prepend>
                <q-icon name="image" />
              </template>
            </q-file>

            <q-img
              v-if="displayImage"
              :src="displayImage"
              :alt="$t('diary.imagePreview')"
              class="entry-image"
              fit="cover"
            />

            <div class="row justify-end q-gutter-sm">
              <q-btn
                flat
                rounded
                no-caps
                color="grey-7"
                type="button"
                :label="$t('diary.cancel')"
                :disable="saving"
                @click="cancelEditing"
              />
              <q-btn
                unelevated
                rounded
                no-caps
                color="primary"
                icon="save"
                type="submit"
                :label="$t('diary.saveChanges')"
                :loading="saving"
              />
            </div>
          </q-form>

          <template v-else>
            <div v-if="entry.title" class="entry-title text-h5 text-weight-bold text-dark q-mb-md">
              {{ entry.title }}
            </div>
            <div class="entry-content text-body1 text-grey-9">{{ entry.content }}</div>
            <q-img
              v-if="entry.image_path"
              :src="diaryService.getImageUrl(entry.image_path)"
              :alt="entry.title || $t('diary.imagePreview')"
              class="entry-image q-mb-md"
              fit="cover"
            />
          </template>
        </q-card-section>
      </q-card>

      <q-card v-else flat bordered class="entry-card text-center q-pa-xl">
        <q-icon name="menu_book" size="48px" color="primary" class="q-mb-sm" />
        <div class="text-body1 text-grey-7">{{ $t('diary.entryNotFound') }}</div>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuasar } from 'quasar'
import { useRoute, useRouter } from 'vue-router'
import diaryService from 'src/services/DiaryService'

const $q = useQuasar()
const route = useRoute()
const router = useRouter()
const { t, locale } = useI18n()

const entry = ref(null)
const loading = ref(true)
const saving = ref(false)
const editing = ref(false)
const editFormRef = ref(null)
const form = reactive({
  title: '',
  content: '',
  image: null
})
const selectedImagePreview = ref('')
const maxImageSizeBytes = 5 * 1024 * 1024
const displayImage = computed(() => (
  selectedImagePreview.value || diaryService.getImageUrl(entry.value?.image_path)
))

function formatDate(date) {
  return new Intl.DateTimeFormat(locale.value, {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(date))
}

async function loadEntry(entryId) {
  if (!entryId) return

  loading.value = true
  try {
    const data = await diaryService.getEntry(entryId)
    entry.value = data.entry
    editing.value = false
  } catch {
    entry.value = null
    editing.value = false
    $q.notify({ type: 'negative', message: t('diary.entryNotFound') })
  } finally {
    loading.value = false
  }
}

function startEditing() {
  form.title = entry.value?.title || ''
  form.content = entry.value?.content || ''
  form.image = null
  clearImagePreview()
  editing.value = true
}

function clearImagePreview() {
  if (selectedImagePreview.value) {
    URL.revokeObjectURL(selectedImagePreview.value)
  }
  selectedImagePreview.value = ''
}

function clearImageSelection() {
  form.image = null
  clearImagePreview()
}

function updateImagePreview(file) {
  clearImagePreview()
  if (file) {
    if (file.size > maxImageSizeBytes) {
      form.image = null
      notifyImageRejected()
      return
    }
    selectedImagePreview.value = URL.createObjectURL(file)
  }
}

function notifyImageRejected() {
  $q.notify({ type: 'negative', message: t('diary.imageTooLarge') })
}

async function cancelEditing() {
  editing.value = false
  form.image = null
  clearImagePreview()
  await nextTick()
  editFormRef.value?.resetValidation()
}

async function saveChanges() {
  if (!entry.value || !form.content.trim()) return

  saving.value = true
  try {
    const data = await diaryService.updateEntry(entry.value.diary_entry_id, {
      title: form.title.trim(),
      content: form.content.trim(),
      image: form.image
    })
    entry.value = data.entry
    editing.value = false
    form.image = null
    clearImagePreview()
    await nextTick()
    editFormRef.value?.resetValidation()
    $q.notify({ type: 'positive', message: t('diary.updateSuccess') })
  } catch (err) {
    $q.notify({ type: 'negative', message: err.message || t('diary.updateError') })
  } finally {
    saving.value = false
  }
}

watch(() => route.params.id, (entryId) => {
  if (entryId) loadEntry(entryId)
}, { immediate: true })

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

.entry-card {
  border-radius: 16px;
  border-color: #e5dcef;
  background: #fff;
}

.entry-content {
  line-height: 1.7;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.entry-title {
  overflow-wrap: anywhere;
  word-break: break-word;
}

.entry-image {
  display: block;
  width: 100%;
  max-width: 100%;
  max-height: 360px;
  box-sizing: border-box;
  border-radius: 12px;
  border: 1px solid #e5dcef;
}
</style>
