const SUPPORTED_LOCALES = ['es-ES', 'en-US']
const DEFAULT_LOCALE = 'es-ES'
const STORAGE_KEY = 'hope_preferred_locale'

export function resolveSupportedLocale (locale) {
  const value = String(locale || '').toLowerCase()

  if (value.startsWith('en')) return 'en-US'
  if (value.startsWith('es')) return 'es-ES'

  return DEFAULT_LOCALE
}

export function detectDeviceLocale () {
  if (typeof navigator === 'undefined') return DEFAULT_LOCALE

  return resolveSupportedLocale(
    navigator.languages?.[0] ||
    navigator.language ||
    DEFAULT_LOCALE
  )
}

export function getStoredLocale () {
  if (typeof localStorage === 'undefined') return null

  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

export function getPreferredLocale () {
  return resolveSupportedLocale(getStoredLocale() || detectDeviceLocale())
}

export function setPreferredLocale (locale) {
  const resolvedLocale = resolveSupportedLocale(locale)
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, resolvedLocale)
    } catch {
      // Storage can be unavailable in private/restricted browser contexts.
    }
  }
  return resolvedLocale
}

export function getLocaleOptions () {
  return SUPPORTED_LOCALES.map(value => ({
    label: value === 'es-ES' ? 'Español' : 'English',
    value
  }))
}
