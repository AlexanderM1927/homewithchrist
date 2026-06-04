import { defineStore } from 'pinia'
import authService from 'src/services/AuthService'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    /** Access token en memoria (NO en localStorage) */
    accessToken: null,
    /** Datos básicos del usuario */
    user: null,
    /** True una vez que se intentó renovar la sesión al arrancar (evita bucle infinito) */
    sessionChecked: false
  }),

  getters: {
    isAuthenticated: (state) => !!state.accessToken,
    isAdmin: (state) => state.user?.role === 'admin'
  },

  actions: {
    /**
     * Llama al backend para hacer login o registro automático.
     * @param {{ name: string, phone: string, pin: string }} credentials
     */
    async login({ name, phone, pin }) {
      const data = await authService.login({ name, phone, pin })
      this.accessToken = data.accessToken
      this.user = data.user
    },

    /**
     * Pide un nuevo access token usando el refresh token de la cookie HttpOnly.
     * Lo llama el interceptor de api.js automáticamente.
     * @returns {Promise<string>} El nuevo access token
     */
    async refresh() {
      const data = await authService.refresh()
      this.accessToken = data.accessToken
      if (data.user) this.user = data.user
      this.sessionChecked = true
      return data.accessToken
    },

    /**
     * Intenta renovar la sesión una única vez al arrancar la app.
     * Llamado desde el guard del router.
     */
    async checkSession() {
      if (this.sessionChecked) return
      this.sessionChecked = true
      try {
        const data = await authService.refresh()
        this.accessToken = data.accessToken
        if (data.user) this.user = data.user
      } catch {
        // No hay sesión activa — normal si el usuario no ha iniciado sesión
      }
    },

    /**
     * Cierra sesión: invalida el refresh token en el servidor y limpia el estado.
     */
    async logout() {
      try {
        await authService.logout()
      } catch {
        // Continuar aunque falle el servidor
      } finally {
        this.accessToken = null
        this.user = null
      }
    }
  }
})
