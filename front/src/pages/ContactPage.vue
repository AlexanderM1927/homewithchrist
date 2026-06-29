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
          :aria-label="$t('contact.back')"
          class="q-mb-md"
          @click="goBack"
        />
        <div class="text-overline text-primary text-weight-bold">Home With Christ</div>
        <h1>{{ $t('contact.title') }}</h1>
        <p class="intro">{{ $t('contact.subtitle') }}</p>
      </section>

      <section class="contact-list">
        <div v-for="item in contactItems" :key="item.title" class="contact-item">
          <q-icon :name="item.icon" color="primary" size="28px" />
          <div>
            <h2>{{ item.title }}</h2>
            <p>{{ item.description }}</p>
            <a v-if="item.href" :href="item.href">{{ item.value }}</a>
            <span v-else>{{ item.value }}</span>
          </div>
        </div>
      </section>
    </main>
  </q-page>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const { locale, t } = useI18n()
const contactEmail = 'admin@homewithchrist.com'

const languageOptions = [
  { label: 'Espanol', value: 'es-ES', flag: '🇪🇸' },
  { label: 'English', value: 'en-US', flag: '🇺🇸' }
]

const contactItems = computed(() => [
  {
    icon: 'mail',
    title: t('contact.email.title'),
    description: t('contact.email.description'),
    value: contactEmail,
    href: `mailto:${contactEmail}`
  },
  {
    icon: 'support_agent',
    title: t('contact.support.title'),
    description: t('contact.support.description'),
    value: t('contact.support.value')
  },
  {
    icon: 'verified_user',
    title: t('contact.privacy.title'),
    description: t('contact.privacy.description'),
    value: t('contact.privacy.value'),
    href: '/privacy-policy'
  }
])

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
  margin: 0 0 4px;
  font-size: 1.05rem;
  line-height: 1.25;
  font-weight: 800;
  color: #2b2142;
}

p,
span,
a {
  font-size: 1rem;
  line-height: 1.7;
  color: #4d465d;
}

a {
  color: var(--q-primary, #7c3aed);
  font-weight: 700;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

.intro {
  max-width: 680px;
  margin: 0;
}

.contact-list {
  display: grid;
  gap: 14px;
  margin-top: 28px;
}

.contact-item {
  display: grid;
  grid-template-columns: 34px minmax(0, 1fr);
  gap: 14px;
  padding: 18px 0;
  border-top: 1px solid rgba(43, 33, 66, 0.12);
}

.contact-item p {
  margin: 0;
}
</style>
