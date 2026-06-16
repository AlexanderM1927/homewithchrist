<template>
  <q-page class="public-page">
    <div class="language-switch" aria-label="Language selector">
      <q-btn
        v-for="option in languageOptions"
        :key="option.value"
        :label="option.flag"
        :title="option.label"
        :aria-label="option.label"
        :color="locale === option.value ? 'primary' : 'white'"
        :text-color="locale === option.value ? 'white' : 'primary'"
        dense
        unelevated
        class="language-flag"
        @click="locale = option.value"
      />
    </div>

    <main class="public-content">
      <section class="public-header">
        <q-btn
          flat
          round
          icon="arrow_back"
          color="primary"
          :aria-label="$t('terms.back')"
          class="q-mb-md"
          @click="goBack"
        />
        <div class="text-overline text-primary text-weight-bold">Home With Christ</div>
        <h1>{{ $t('terms.title') }}</h1>
        <p class="last-updated">{{ $t('terms.lastUpdated') }}</p>
      </section>

      <section v-for="section in sections" :key="section.title">
        <h2>{{ section.title }}</h2>
        <p v-for="paragraph in section.paragraphs" :key="paragraph">{{ paragraph }}</p>
        <ul v-if="section.items.length">
          <li v-for="item in section.items" :key="item">{{ item }}</li>
        </ul>
      </section>
    </main>
  </q-page>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const { locale, t, tm } = useI18n()

const languageOptions = [
  { label: 'Espanol', value: 'es-ES', flag: '🇪🇸' },
  { label: 'English', value: 'en-US', flag: '🇺🇸' }
]

const sectionKeys = [
  'acceptance',
  'account',
  'use',
  'ai',
  'content',
  'availability',
  'changes',
  'contact'
]

const sections = computed(() => sectionKeys.map((key, index) => ({
  title: `${index + 1}. ${t(`terms.sections.${key}.title`)}`,
  paragraphs: tm(`terms.sections.${key}.paragraphs`),
  items: tm(`terms.sections.${key}.items`) || []
})))

function goBack() {
  if (window.history.length > 1) {
    router.back()
    return
  }

  router.push('/welcome')
}
</script>

<style scoped>
.public-page {
  min-height: 100vh;
  background: #f7f5fb;
  color: #1f1b2d;
}

.public-content {
  width: min(880px, calc(100% - 32px));
  margin: 0 auto;
  padding: 28px 0 48px;
}

.public-header {
  padding-bottom: 10px;
}

.language-switch {
  position: fixed;
  top: 18px;
  right: 18px;
  z-index: 2;
  display: flex;
  gap: 6px;
  padding: 5px;
  border: 1px solid rgba(124, 58, 237, 0.18);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 10px 30px rgba(43, 24, 69, 0.14);
}

.language-flag {
  width: 34px;
  min-height: 28px;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0;
}

h1 {
  margin: 6px 0 8px;
  font-size: clamp(2rem, 7vw, 3.2rem);
  line-height: 1.05;
  font-weight: 800;
}

h2 {
  margin: 32px 0 10px;
  font-size: 1.15rem;
  line-height: 1.25;
  font-weight: 800;
  color: #2b2142;
}

p,
li {
  font-size: 1rem;
  line-height: 1.7;
  color: #4d465d;
}

ul {
  margin: 10px 0 0;
  padding-left: 22px;
}

.last-updated {
  margin: 0;
  color: #746a88;
}
</style>
