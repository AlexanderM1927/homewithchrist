import { defineBoot } from '#q-app/wrappers'
import { createI18n } from 'vue-i18n'
import messages from 'src/i18n'
import { getPreferredLocale, setPreferredLocale } from 'src/utils/locale'

export const i18n = createI18n({
  locale: setPreferredLocale(getPreferredLocale()),
  globalInjection: true,
  messages
})

export default defineBoot(({ app }) => {
  // Set i18n instance on app
  app.use(i18n)
})
