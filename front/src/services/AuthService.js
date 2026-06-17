import ApiService from 'src/boot/api'

/**
 * AuthService - encapsula todas las llamadas HTTP relacionadas con autenticacion.
 * El store (src/stores/auth.js) consume este servicio y gestiona el estado resultante.
 */
class AuthService extends ApiService {
  constructor() {
    super('/auth')
  }

  /**
   * Inicia sesion con una cuenta existente.
   * @param {{ phone: string, pin: string }} credentials
   * @returns {Promise<{ accessToken: string, user: object }>}
   */
  login(credentials) {
    return this.post('/login', credentials, { _skipRetry: true })
  }

  /**
   * Registra una cuenta nueva.
   * @param {{ name: string, phone: string, pin: string }} credentials
   * @returns {Promise<{ accessToken: string, user: object }>}
   */
  register(credentials) {
    return this.post('/register', credentials, { _skipRetry: true })
  }

  /**
   * Solicita un enlace para recuperar la clave.
   * @param {{ email: string }} data
   * @returns {Promise<{ message: string }>}
   */
  forgotPassword(data) {
    return this.post('/forgot-password', data, { _skipRetry: true })
  }

  /**
   * Restablece la clave usando el token enviado por correo.
   * @param {{ token: string, newPin: string }} data
   * @returns {Promise<{ message: string }>}
   */
  resetPassword(data) {
    return this.post('/reset-password', data, { _skipRetry: true })
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
   * Cierra sesion: invalida el refresh token en el servidor y limpia la cookie.
   * @returns {Promise<void>}
   */
  logout() {
    return this.post('/logout', undefined, { _skipRetry: true })
  }

  /**
   * Actualiza el perfil del usuario autenticado.
   * @param {{ name?: string, email?: string, phone?: string }} data
   * @returns {Promise<{ user: object }>}
   */
  updateProfile(data) {
    return this.put('/profile', data)
  }

  /**
   * Cambia el PIN del usuario autenticado.
   * @param {{ currentPin: string, newPin: string }} data
   * @returns {Promise<{ message: string }>}
   */
  changePassword(data) {
    return this.put('/password', data)
  }

  /**
   * Obtiene la lista de todos los usuarios (solo admin).
   * @returns {Promise<{ users: object[] }>}
   */
  getUsers () {
    return this.get('/users')
  }

  /**
   * Cambia el rol de un usuario (solo admin).
   * @param {number} userId
   * @param {number} roleId
   * @returns {Promise<{ user: object }>}
   */
  updateUserRole (userId, roleId) {
    return this.put(`/users/${userId}/role`, { role_id: roleId })
  }

  /**
   * Actualiza correo y/o telefono de un usuario (solo admin).
   * @param {number} userId
   * @param {{ email?: string, phone?: string }} data
   * @returns {Promise<{ user: object }>}
   */
  updateUserContact (userId, data) {
    return this.put(`/users/${userId}/contact`, data)
  }
}

export default new AuthService()
