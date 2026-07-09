import { SpeechRecognition } from '@capacitor-community/speech-recognition'
import { getRuntimePlatform } from 'src/composables/useRuntimePlatform'

class SpeechRecognitionService {
  constructor () {
    this.webRecognition = null
    this.nativeListenerHandles = []
    this.listening = false
  }

  isNativeSupported () {
    const runtimePlatform = getRuntimePlatform()
    return runtimePlatform.isCapacitor && runtimePlatform.isAndroid
  }

  getWebRecognitionConstructor () {
    if (typeof window === 'undefined') return null
    return window.SpeechRecognition || window.webkitSpeechRecognition || null
  }

  isWebSupported () {
    return Boolean(this.getWebRecognitionConstructor())
  }

  isSupported () {
    return this.isNativeSupported() || this.isWebSupported()
  }

  async getAvailability () {
    if (this.isNativeSupported()) {
      try {
        const { available } = await SpeechRecognition.available()
        return available === true
      } catch {
        return false
      }
    }

    return this.isWebSupported()
  }

  async ensurePermission () {
    if (this.isNativeSupported()) {
      const status = await SpeechRecognition.checkPermissions()
      if (status.speechRecognition === 'granted') return true

      const requestedStatus = await SpeechRecognition.requestPermissions()
      return requestedStatus.speechRecognition === 'granted'
    }

    return true
  }

  async isListening () {
    if (this.isNativeSupported()) {
      try {
        const { listening } = await SpeechRecognition.isListening()
        this.listening = listening === true
        return this.listening
      } catch {
        return this.listening
      }
    }

    return this.listening
  }

  async start ({ lang, prompt, onPartialResult, onStateChange, onError }) {
    if (this.isNativeSupported()) {
      await this.stop()

      const partialHandle = await SpeechRecognition.addListener('partialResults', ({ matches = [] }) => {
        const transcript = Array.isArray(matches) ? String(matches[0] || '').trim() : ''
        onPartialResult?.(transcript)
      })

      const listeningHandle = await SpeechRecognition.addListener('listeningState', ({ status }) => {
        this.listening = status === 'started'
        onStateChange?.(status)
      })

      this.nativeListenerHandles = [partialHandle, listeningHandle]
      this.listening = true

      await SpeechRecognition.start({
        language: lang,
        maxResults: 1,
        prompt,
        partialResults: true,
        popup: false
      })

      return
    }

    const WebSpeechRecognition = this.getWebRecognitionConstructor()
    if (!WebSpeechRecognition) {
      const error = new Error('speech_recognition_unavailable')
      error.code = 'speech_recognition_unavailable'
      throw error
    }

    await this.stop()

    const recognition = new WebSpeechRecognition()
    recognition.lang = lang
    recognition.continuous = false
    recognition.interimResults = true
    recognition.maxAlternatives = 1
    recognition.onstart = () => {
      this.listening = true
      onStateChange?.('started')
    }
    recognition.onend = () => {
      this.listening = false
      this.webRecognition = null
      onStateChange?.('stopped')
    }
    recognition.onerror = (event) => {
      const error = new Error(event?.error || 'speech_recognition_error')
      error.code = event?.error || 'speech_recognition_error'
      this.listening = false
      this.webRecognition = null
      onError?.(error)
      recognition.abort()
    }
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result?.[0]?.transcript || '')
        .join(' ')
        .trim()

      onPartialResult?.(transcript)
    }

    this.webRecognition = recognition
    recognition.start()
  }

  async stop () {
    if (this.isNativeSupported()) {
      try {
        await SpeechRecognition.stop()
      } catch {
        // Ignore stop failures when the recognizer is already inactive.
      }

      await this.removeNativeListeners()
      this.listening = false
      return
    }

    if (this.webRecognition) {
      this.webRecognition.onstart = null
      this.webRecognition.onresult = null
      this.webRecognition.onerror = null
      this.webRecognition.onend = null

      try {
        this.webRecognition.stop()
      } catch {
        // Ignore stop failures when the browser recognizer is already inactive.
      }

      this.webRecognition = null
    }

    this.listening = false
  }

  async removeNativeListeners () {
    await Promise.all(this.nativeListenerHandles.map(async handle => {
      try {
        await handle.remove()
      } catch {
        // Ignore listener cleanup failures.
      }
    }))

    this.nativeListenerHandles = []

    try {
      await SpeechRecognition.removeAllListeners()
    } catch {
      // Ignore plugin cleanup failures.
    }
  }
}

export default new SpeechRecognitionService()
