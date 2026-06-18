import { API_BASE_URL } from 'src/boot/api'
import { getRuntimePlatform } from 'src/composables/useRuntimePlatform'

const RETRY_DELAYS_MS = [0, 1000, 3000]
const REQUEST_TIMEOUT_MS = 5000
const HEALTH_URL = `${API_BASE_URL.replace(/\/+$/, '')}/health`

function wait(ms) {
  return new Promise(resolve => window.setTimeout(resolve, ms))
}

class ApiReadinessService {
  constructor() {
    this.ready = false
    this.readinessPromise = null
  }

  isReady() {
    return this.ready
  }

  warmUp(options = {}) {
    if (!getRuntimePlatform().isNativeMobile) {
      this.ready = true
      return Promise.resolve(true)
    }

    if (this.ready && !options.force) return Promise.resolve(true)
    if (this.readinessPromise) return this.readinessPromise

    this.readinessPromise = this.checkWithRetries()
      .then(() => {
        this.ready = true
        return true
      })
      .catch((error) => {
        this.ready = false
        console.warn('API readiness check failed', {
          url: HEALTH_URL,
          platform: getRuntimePlatform().name,
          error: error?.message || String(error)
        })
        return false
      })
      .finally(() => {
        this.readinessPromise = null
      })

    return this.readinessPromise
  }

  async checkWithRetries() {
    let lastError = null

    for (const delay of RETRY_DELAYS_MS) {
      if (delay > 0) await wait(delay)

      try {
        await this.checkOnce()
        return
      } catch (error) {
        lastError = error
      }
    }

    throw lastError || new Error('API unavailable')
  }

  async checkOnce() {
    const controller = new AbortController()
    const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

    try {
      const response = await fetch(HEALTH_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        cache: 'no-store',
        signal: controller.signal
      })

      if (!response.ok) {
        throw new Error(`Health check returned ${response.status}`)
      }
    } finally {
      window.clearTimeout(timeoutId)
    }
  }
}

export default new ApiReadinessService()
