const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8004/api'

class ApiService {
  constructor(prefix = '') {
    this.prefix = prefix
  }

  async _request(path, options = {}) {
    const { useAuthStore } = await import('src/stores/auth')
    const authStore = useAuthStore()
    const { _skipRetry, ...fetchOptions } = options

    const isFormData = fetchOptions.body instanceof FormData
    const headers = {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(fetchOptions.headers || {})
    }

    if (authStore.accessToken) {
      headers.Authorization = `Bearer ${authStore.accessToken}`
    }

    const url = `${BASE_URL}${this.prefix}${path}`
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
      credentials: 'include'
    })

    if (response.status === 401 && !_skipRetry) {
      try {
        await authStore.refresh()
        return this._request(path, { ...options, _skipRetry: true })
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
      throw err
    }

    return data ?? {}
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
