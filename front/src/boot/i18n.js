import { defineBoot } from '#q-app/wrappers'
import { createI18n } from 'vue-i18n'
import messages from 'src/i18n'

export const i18n = createI18n({
  locale: 'es-ES',
  globalInjection: true,
  messages
})

export default defineBoot(({ app }) => {
  // Set i18n instance on app
  app.use(i18n)
})
