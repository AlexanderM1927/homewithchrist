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

          <q-form v-if="editing" ref="editFormRef" class="q-gutter-md" @submit="saveChanges">
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
import { nextTick, reactive, ref, watch } from 'vue'
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
  content: ''
})

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
  editing.value = true
}

async function cancelEditing() {
  editing.value = false
  await nextTick()
  editFormRef.value?.resetValidation()
}

async function saveChanges() {
  if (!entry.value || !form.content.trim()) return

  saving.value = true
  try {
    const data = await diaryService.updateEntry(entry.value.diary_entry_id, {
      title: form.title.trim(),
      content: form.content.trim()
    })
    entry.value = data.entry
    editing.value = false
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
</style>
