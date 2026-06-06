/**
 * ApiService — clase base para todos los servicios HTTP.
 *
 * Características:
 * - Inyecta Authorization: Bearer <accessToken> automáticamente.
 * - Si el servidor responde 401, intenta refrescar el token una vez y reintenta.
 * - Envía cookies HttpOnly (refresh_token) con credentials: 'include'.
 *
 * Uso:
 *   import ApiService from 'src/boot/api'
 *   class MyService extends ApiService {
 *     getItems() { return this.get('/items') }
 *   }
 *   export default new MyService('/prefix')
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8004/api'

class ApiService {
  /**
   * @param {string} [prefix] - Prefijo de ruta que se antepone a todas las llamadas del servicio.
   *                            Ej: '/auth' → todas las rutas serán /auth/login, /auth/refresh, etc.
   */
  constructor(prefix = '') {
    this.prefix = prefix
  }

  async _request(path, options = {}) {
    // Importación diferida para evitar dependencia circular con el store
    const { useAuthStore } = await import('src/stores/auth')
    const authStore = useAuthStore()

    // Extraer flag interno antes de pasar options a fetch
    const { _skipRetry, ...fetchOptions } = options

    const isFormData = fetchOptions.body instanceof FormData
    const headers = {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(fetchOptions.headers || {})
    }

    if (authStore.accessToken) {
      headers['Authorization'] = `Bearer ${authStore.accessToken}`
    }

    const url = `${BASE_URL}${this.prefix}${path}`
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
      credentials: 'include'
    })

    // Si el access token expiró, intentamos refrescarlo una sola vez.
    // _skipRetry lo usan las llamadas internas (ej: /auth/refresh) para evitar bucle infinito.
    if (response.status === 401 && !_skipRetry) {
      try {
        await authStore.refresh()
        return this._request(path, { ...options, _skipRetry: true })
      } catch {
        authStore.accessToken = null
        authStore.user = null
        throw new Error('Sesión expirada')
      }
    }

    const data = await response.json()

    if (!response.ok) {
      const err = new Error(data.message || 'Error en la petición')
      err.status = response.status
      throw err
    }

    return data
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

// Instancia genérica para uso puntual sin prefijo (compatibilidad con código existente)
export const api = new ApiService()
