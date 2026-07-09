import { TextToSpeech } from '@capacitor-community/text-to-speech'
import { QueueStrategy } from '@capacitor-community/text-to-speech'
import { getRuntimePlatform } from 'src/composables/useRuntimePlatform'

class SpeechService {
  isNativeSupported () {
    const runtimePlatform = getRuntimePlatform()
    return runtimePlatform.isCapacitor && runtimePlatform.isAndroid
  }

  isWebSupported () {
    return typeof window !== 'undefined' &&
      'speechSynthesis' in window &&
      typeof SpeechSynthesisUtterance !== 'undefined'
  }

  isSupported () {
    return this.isNativeSupported() || this.isWebSupported()
  }

  isRecoverableNativeError (error) {
    const normalizedMessage = String(error?.message || '').toLowerCase()
    return error?.code === 'unsupported_language' ||
      normalizedMessage.includes('not yet initialized') ||
      normalizedMessage.includes('not available on this device') ||
      normalizedMessage.includes('language is not supported')
  }

  async isNativeLanguageAvailable (lang) {
    try {
      const resolvedLanguage = await this.resolveNativeLanguage(lang)
      return Boolean(resolvedLanguage)
    } catch {
      return false
    }
  }

  async getAvailability (lang) {
    if (this.isNativeSupported()) {
      try {
        const { languages = [] } = await TextToSpeech.getSupportedLanguages()
        if (!Array.isArray(languages) || languages.length === 0) {
          return false
        }

        if (!lang) return true
        return await this.isNativeLanguageAvailable(lang)
      } catch {
        return false
      }
    }

    return this.isWebSupported()
  }

  async resolveNativeLanguage (lang) {
    const normalizedLanguage = String(lang || '').trim()
    if (!normalizedLanguage) return null

    const { supported } = await TextToSpeech.isLanguageSupported({ lang: normalizedLanguage })
    if (supported) return normalizedLanguage

    const languagePrefix = normalizedLanguage.split('-')[0]?.toLowerCase()
    if (!languagePrefix) return null

    const { languages = [] } = await TextToSpeech.getSupportedLanguages()
    const normalizedLanguages = languages.map(language => String(language || '').trim()).filter(Boolean)

    const prefixMatch = normalizedLanguages.find(language => (
      language.toLowerCase() === languagePrefix ||
      language.toLowerCase().startsWith(`${languagePrefix}-`)
    ))

    return prefixMatch || null
  }

  async speak ({ text, lang, rate = 1, pitch = 1 }) {
    if (this.isNativeSupported()) {
      const resolvedLanguage = await this.resolveNativeLanguage(lang)
      if (!resolvedLanguage) {
        const error = new Error('unsupported_language')
        error.code = 'unsupported_language'
        throw error
      }

      await TextToSpeech.speak({
        text,
        lang: resolvedLanguage,
        rate,
        pitch,
        volume: 1,
        queueStrategy: QueueStrategy.Flush
      })
      return
    }

    if (!this.isWebSupported()) {
      const error = new Error('speech_unavailable')
      error.code = 'speech_unavailable'
      throw error
    }

    await new Promise((resolve, reject) => {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = lang
      utterance.rate = rate
      utterance.pitch = pitch
      utterance.onend = () => resolve()
      utterance.onerror = () => reject(new Error('speech_error'))
      window.speechSynthesis.speak(utterance)
    })
  }

  async stop () {
    if (this.isNativeSupported()) {
      await TextToSpeech.stop()
      return
    }

    if (this.isWebSupported()) {
      window.speechSynthesis.cancel()
    }
  }

  async openInstall () {
    if (!this.isNativeSupported()) return
    await TextToSpeech.openInstall()
  }
}

export default new SpeechService()
