export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8004/api'

const DEFAULT_RETRY_DELAYS_MS = [400, 1200]
const RETRYABLE_GET_STATUS = new Set([408, 429, 502, 503, 504, 520, 522, 524])

function sleep(ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('The operation was aborted.', 'AbortError'))
      return
    }

    const timeoutId = setTimeout(() => {
      cleanup()
      resolve()
    }, ms)

    function onAbort() {
      cleanup()
      reject(new DOMException('The operation was aborted.', 'AbortError'))
    }

    function cleanup() {
      clearTimeout(timeoutId)
      signal?.removeEventListener('abort', onAbort)
    }

    signal?.addEventListener('abort', onAbort, { once: true })
  })
}

function isAbortError(err, signal) {
  return signal?.aborted || err?.name === 'AbortError'
}

class ApiService {
  constructor(prefix = '') {
    this.prefix = prefix
  }

  async _request(path, options = {}) {
    const { useAuthStore } = await import('src/stores/auth')
    const authStore = useAuthStore()
    const {
      _skipRetry,
      _skipAuthRetry,
      retryDelaysMs = DEFAULT_RETRY_DELAYS_MS,
      retryStatuses = RETRYABLE_GET_STATUS,
      retryNetworkErrors = true,
      ...fetchOptions
    } = options

    const isFormData = fetchOptions.body instanceof FormData
    const method = (fetchOptions.method || 'GET').toUpperCase()
    const headers = {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(fetchOptions.headers || {})
    }

    if (authStore.accessToken) {
      headers.Authorization = `Bearer ${authStore.accessToken}`
    }

    const url = `${API_BASE_URL}${this.prefix}${path}`
    const maxRetries = method === 'GET' ? retryDelaysMs.length : 0

    let attempt = 0

    while (true) {
      let response

      try {
        response = await fetch(url, {
          ...fetchOptions,
          headers,
          credentials: 'include'
        })
      } catch (err) {
        if (isAbortError(err, fetchOptions.signal)) {
          throw err
        }

        const canRetryNetworkError = method === 'GET' && retryNetworkErrors && attempt < maxRetries
        if (canRetryNetworkError) {
          await sleep(retryDelaysMs[attempt], fetchOptions.signal)
          attempt += 1
          continue
        }
        throw err
      }

      if (response.status === 401 && !(_skipAuthRetry || _skipRetry)) {
        try {
          await authStore.refresh()
          return this._request(path, {
            ...options,
            _skipAuthRetry: true,
            _skipRetry: true
          })
        } catch {
          await authStore.clearSessionState()
          throw new Error('Sesion expirada')
        }
      }

      const contentType = response.headers.get('content-type') || ''
      const responseText = await response.text()
      let data = null

      if (responseText && contentType.includes('application/json')) {
        try {
          data = JSON.parse(responseText)
        } catch {
          data = null
        }
      }

      if (!response.ok) {
        const fallbackMessages = {
          413: 'El archivo es demasiado grande. Usa una imagen de 5 MB o menos.'
        }
        const err = new Error(data?.message || fallbackMessages[response.status] || 'Error en la peticion')
        err.status = response.status

        const canRetryStatus = method === 'GET' && retryStatuses.has(response.status) && attempt < maxRetries
        if (canRetryStatus) {
          await sleep(retryDelaysMs[attempt], fetchOptions.signal)
          attempt += 1
          continue
        }

        throw err
      }

      return data ?? {}
    }
  }

  get(path, options) {
    return this._request(path, { method: 'GET', ...options })
  }

  post(path, body, options) {
    const isFormData = body instanceof FormData
    return this._request(path, {
      method: 'POST',
      body: body !== undefined ? (isFormData ? body : JSON.stringify(body)) : undefined,
      ...options
    })
  }

  put(path, body, options) {
    const isFormData = body instanceof FormData
    return this._request(path, {
      method: 'PUT',
      body: body !== undefined ? (isFormData ? body : JSON.stringify(body)) : undefined,
      ...options
    })
  }

  delete(path, options) {
    return this._request(path, { method: 'DELETE', ...options })
  }
}

export default ApiService
export const api = new ApiService()
