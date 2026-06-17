import { defineStore } from 'pinia'
import authService from 'src/services/AuthService'
import { i18n } from 'src/boot/i18n'
import { getPreferredLocale, setPreferredLocale } from 'src/utils/locale'

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
     * Llama al backend para iniciar sesión.
     * @param {{ phone: string, pin: string }} credentials
     */
    async login({ phone, pin }) {
      const preferred_locale = getPreferredLocale()
      const data = await authService.login({ phone, pin, preferred_locale })
      this.accessToken = data.accessToken
      this.user = data.user
      this.applyPreferredLocale(data.user?.preferred_locale || preferred_locale)
    },

    /**
     * Llama al backend para registrar una cuenta nueva.
     * @param {{ name: string, phone: string, pin: string }} credentials
     */
    async register({ name, phone, pin }) {
      const preferred_locale = getPreferredLocale()
      const data = await authService.register({ name, phone, pin, preferred_locale })
      this.accessToken = data.accessToken
      this.user = data.user
      this.applyPreferredLocale(data.user?.preferred_locale || preferred_locale)
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
      if (data.user?.preferred_locale) this.applyPreferredLocale(data.user.preferred_locale)
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
        if (data.user) {
          this.user = data.user
          if (data.user.preferred_locale) this.applyPreferredLocale(data.user.preferred_locale)
        }
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
    },

    /**
     * Actualiza el perfil del usuario (nombre, email, teléfono).
     * @param {{ name?: string, email?: string, phone?: string }} data
     */
    async updateProfile(data) {
      const result = await authService.updateProfile(data)
      if (result.user) this.user = result.user
      if (result.user?.preferred_locale) this.applyPreferredLocale(result.user.preferred_locale)
      return result
    },

    applyPreferredLocale(locale) {
      const preferredLocale = setPreferredLocale(locale)
      if (typeof i18n.global.locale === 'object') {
        i18n.global.locale.value = preferredLocale
      } else {
        i18n.global.locale = preferredLocale
      }
      if (this.user) this.user.preferred_locale = preferredLocale
      return preferredLocale
    }
  }
})
