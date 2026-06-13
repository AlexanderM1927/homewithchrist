<template>
  <q-page class="shared-diary-page q-pa-md">
    <div class="shared-diary-container">
      <header class="row items-center q-mb-md">
        <q-icon name="book" color="primary" size="32px" class="q-mr-sm" />
        <div>
          <div class="text-h6 text-weight-bold">{{ $t('diary.title') }}</div>
          <q-chip dense color="grey-3" text-color="grey-8" icon="visibility" :label="$t('sharedDiary.readOnly')" />
        </div>
        <q-space />
        <q-btn
          v-if="authStore.isAuthenticated"
          flat
          color="primary"
          icon="book"
          :label="$t('nav.diary')"
          @click="router.push('/diary')"
        />
        <q-btn
          v-else
          flat
          color="primary"
          :label="$t('welcome.login')"
          @click="router.push('/login')"
        />
      </header>

      <div v-if="loading" class="column items-center q-py-xl">
        <q-spinner color="primary" size="42px" />
        <div class="text-grey-7 q-mt-md">{{ $t('sharedDiary.loading') }}</div>
      </div>

      <q-card v-else-if="error" flat bordered class="entry-card text-center q-pa-xl">
        <q-icon name="link_off" color="grey-6" size="56px" />
        <div class="text-h6 text-weight-bold q-mt-md">{{ $t('sharedDiary.notFoundTitle') }}</div>
        <div class="text-body2 text-grey-7 q-mt-sm">{{ $t('sharedDiary.notFoundMessage') }}</div>
      </q-card>

      <q-card v-else flat bordered class="entry-card">
        <q-card-section>
          <div class="text-caption text-grey-6 q-mb-md">{{ formatDate(entry.createdAt) }}</div>
          <div v-if="entry.title" class="entry-title text-h5 text-weight-bold q-mb-md">{{ entry.title }}</div>
          <div class="entry-content text-body1 text-grey-9">{{ entry.content }}</div>
          <q-img
            v-if="entry.image_path"
            :src="diaryService.getImageUrl(entry.image_path)"
            :alt="entry.title || $t('diary.imagePreview')"
            class="entry-image q-mt-md"
            fit="cover"
          />
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from 'src/stores/auth'
import diaryService from 'src/services/DiaryService'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const { locale } = useI18n()
const entry = ref(null)
const loading = ref(true)
const error = ref(false)

function formatDate(date) {
  return new Intl.DateTimeFormat(locale.value, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(date))
}

onMounted(async () => {
  try {
    const data = await diaryService.getSharedEntry(route.params.token)
    entry.value = data.entry
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.shared-diary-page { min-height: 100vh; background: #f4f0fa; }
.shared-diary-container { width: 100%; max-width: 760px; margin: 0 auto; }
.entry-card { border-radius: 16px; border-color: #e5dcef; background: #fff; }
.entry-title { overflow-wrap: anywhere; word-break: break-word; }
.entry-content { line-height: 1.7; white-space: pre-wrap; overflow-wrap: anywhere; }
.entry-image { width: 100%; max-height: 420px; border-radius: 12px; border: 1px solid #e5dcef; }
</style>
