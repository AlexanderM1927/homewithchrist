import ApiService from 'src/boot/api'

/**
 * AuthService — encapsula todas las llamadas HTTP relacionadas con autenticación.
 * El store (src/stores/auth.js) consume este servicio y gestiona el estado resultante.
 */
class AuthService extends ApiService {
  constructor() {
    super('/auth')
  }

  /**
   * Inicia sesión (o registra automáticamente si el usuario no existe).
   * @param {{ name: string, phone: string, pin: string }} credentials
   * @returns {Promise<{ accessToken: string, user: object }>}
   */
  login(credentials) {
    return this.post('/login', credentials, { _skipRetry: true })
  }

  /**
   * Solicita un nuevo access token usando el refresh token de la cookie HttpOnly.
   * Usa _skipRetry para no entrar en el interceptor de auto-refresh (evita bucle infinito).
   * @returns {Promise<{ accessToken: string }>}
   */
  refresh() {
    return this.post('/refresh', undefined, { _skipRetry: true })
  }

  /**
   * Cierra sesión: invalida el refresh token en el servidor y limpia la cookie.
   * @returns {Promise<void>}
   */
  logout() {
    return this.post('/logout', undefined, { _skipRetry: true })
  }
}

export default new AuthService()
