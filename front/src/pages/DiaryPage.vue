<template>
  <q-page class="diary-page q-pa-md">
    <div class="diary-container">
      <div class="q-mb-md">
        <div class="text-h5 text-weight-bold text-dark">{{ $t('diary.title') }}</div>
        <div class="text-body2 text-grey-7">{{ $t('diary.subtitle') }}</div>
      </div>

      <q-card flat bordered class="entry-card q-mb-lg">
        <q-card-section>
          <q-form class="q-gutter-md" @submit="saveEntry">
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
          <q-card-section>
            <div v-if="entry.title" class="entry-title text-subtitle1 text-weight-bold q-mb-xs">
              {{ entry.title }}
            </div>
            <div class="entry-content text-body2 text-grey-9">{{ getContentPreview(entry.content) }}</div>
            <div class="text-caption text-grey-6 q-mt-md">{{ formatDate(entry.createdAt) }}</div>
            <div v-if="entry.content.length > 100" class="row justify-end q-mt-sm">
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
import { onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuasar } from 'quasar'
import diaryService from 'src/services/DiaryService'

const $q = useQuasar()
const { t, locale } = useI18n()

const entries = ref([])
const loading = ref(true)
const saving = ref(false)
const page = ref(1)
const totalPages = ref(1)
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

function getContentPreview(content) {
  if (content.length <= 100) return content
  return `${content.slice(0, 97)}...`
}

async function loadEntries(requestedPage = page.value) {
  loading.value = true
  try {
    const data = await diaryService.getEntries(requestedPage)
    entries.value = data.entries
    page.value = data.pagination.page
    totalPages.value = Math.max(data.pagination.totalPages, 1)
  } catch {
    $q.notify({ type: 'negative', message: t('diary.loadError') })
  } finally {
    loading.value = false
  }
}

async function saveEntry() {
  if (!form.content.trim()) return

  saving.value = true
  try {
    await diaryService.createEntry({
      title: form.title.trim(),
      content: form.content.trim()
    })
    form.title = ''
    form.content = ''
    await loadEntries(1)
    $q.notify({ type: 'positive', message: t('diary.saveSuccess') })
  } catch (err) {
    $q.notify({ type: 'negative', message: err.message || t('diary.saveError') })
  } finally {
    saving.value = false
  }
}

onMounted(loadEntries)
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
