'use strict'

const DEFAULT_LOCALE = 'es-ES'

function resolveSupportedLocale(locale) {
  const value = String(locale || '').toLowerCase()

  if (value.startsWith('en')) return 'en-US'
  if (value.startsWith('es')) return 'es-ES'

  return DEFAULT_LOCALE
}

function localeInstruction(locale) {
  const preferredLocale = resolveSupportedLocale(locale)

  if (preferredLocale === 'en-US') {
    return 'Respond always in English unless the user explicitly asks for another language.'
  }

  return 'Responde siempre en espanol, salvo que el usuario pida explicitamente otro idioma.'
}

module.exports = {
  DEFAULT_LOCALE,
  resolveSupportedLocale,
  localeInstruction
}
