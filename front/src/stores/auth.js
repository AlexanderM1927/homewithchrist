import { defineStore } from 'pinia'
import authService from 'src/services/AuthService'
import biometricAuthService from 'src/services/BiometricAuthService'
import { i18n } from 'src/boot/i18n'
import { getPreferredLocale, setPreferredLocale } from 'src/utils/locale'
import { getRuntimePlatform } from 'src/composables/useRuntimePlatform'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    accessToken: null,
    refreshToken: null,
    user: null,
    sessionChecked: false
  }),

  getters: {
    isAuthenticated: (state) => !!state.accessToken,
    isAdmin: (state) => state.user?.role === 'admin'
  },

  actions: {
    isMobileRefreshSessionError(err) {
      return err?.status === 401
    },

    async clearBiometricSessionWithFallback() {
      await this.clearSessionState()
      await biometricAuthService.clearSession()
    },

    async login({ phone, pin }) {
      const preferred_locale = getPreferredLocale()
      const runtimePlatform = getRuntimePlatform()
      const data = runtimePlatform.canUseNativeBiometrics
        ? await authService.mobileLogin({
          phone,
          pin,
          preferred_locale,
          device_name: 'Android Capacitor'
        })
        : await authService.login({ phone, pin, preferred_locale })

      this.accessToken = data.accessToken
      this.refreshToken = data.refreshToken || null
      this.user = data.user
      this.applyPreferredLocale(data.user?.preferred_locale || preferred_locale)

      if (runtimePlatform.canUseNativeBiometrics && data.refreshToken) {
        await this.persistMobileSession(data.refreshToken)
      }
    },

    async register({ name, email, phone, pin }) {
      const preferred_locale = getPreferredLocale()
      const runtimePlatform = getRuntimePlatform()
      const data = runtimePlatform.canUseNativeBiometrics
        ? await authService.mobileRegister({
          name,
          email,
          phone,
          pin,
          preferred_locale,
          device_name: 'Android Capacitor'
        })
        : await authService.register({ name, email, phone, pin, preferred_locale })

      this.accessToken = data.accessToken
      this.refreshToken = data.refreshToken || null
      this.user = data.user
      this.applyPreferredLocale(data.user?.preferred_locale || preferred_locale)

      if (runtimePlatform.canUseNativeBiometrics && data.refreshToken) {
        await this.persistMobileSession(data.refreshToken)
      }
    },

    async refresh() {
      const runtimePlatform = getRuntimePlatform()
      const data = runtimePlatform.canUseNativeBiometrics
        ? await this.refreshMobileSession({ allowStoredSession: true })
        : await authService.refresh()

      this.accessToken = data.accessToken
      if (data.refreshToken) this.refreshToken = data.refreshToken
      if (data.user) this.user = data.user
      if (data.user?.preferred_locale) this.applyPreferredLocale(data.user.preferred_locale)
      this.sessionChecked = true
      return data.accessToken
    },

    async checkSession() {
      if (this.sessionChecked) return
      this.sessionChecked = true

      const runtimePlatform = getRuntimePlatform()
      try {
        if (runtimePlatform.canUseNativeBiometrics && await biometricAuthService.isEnabled()) {
          return
        }

        const data = runtimePlatform.canUseNativeBiometrics
          ? await this.refreshMobileSession({ allowStoredSession: true })
          : await authService.refresh()

        this.accessToken = data.accessToken
        if (data.refreshToken) this.refreshToken = data.refreshToken
        if (data.user) {
          this.user = data.user
          if (data.user.preferred_locale) this.applyPreferredLocale(data.user.preferred_locale)
        }
      } catch {
        // Sin sesion activa al arrancar
      }
    },

    async logout() {
      const runtimePlatform = getRuntimePlatform()
      try {
        if (runtimePlatform.canUseNativeBiometrics) {
          await authService.mobileLogout(this.refreshToken)
        } else {
          await authService.logout()
        }
      } catch {
        // Continuar aunque falle el servidor
      } finally {
        await this.clearSessionState()
        await biometricAuthService.clearSession()
      }
    },

    async refreshMobileSession({ allowStoredSession = false } = {}) {
      let refreshToken = this.refreshToken
      let storedSession = null

      if (!refreshToken && allowStoredSession) {
        storedSession = await biometricAuthService.loadSession()
        refreshToken = storedSession?.refreshToken || null
      }

      if (!refreshToken) {
        const err = new Error('No hay sesion activa')
        err.status = 401
        throw err
      }

      try {
        const data = await authService.mobileRefresh(refreshToken)
        this.refreshToken = data.refreshToken
        await this.persistMobileSession(data.refreshToken, storedSession?.biometricEnabled === true)
        return data
      } catch (err) {
        if (this.isMobileRefreshSessionError(err)) {
          await this.clearBiometricSessionWithFallback()
          const expiredSessionError = new Error(i18n.global.t('login.biometricSessionExpired'))
          expiredSessionError.status = 401
          expiredSessionError.code = 'BIOMETRIC_SESSION_EXPIRED'
          throw expiredSessionError
        }

        throw err
      }
    },

    async persistMobileSession(refreshToken, biometricEnabled = null) {
      const currentSession = await biometricAuthService.loadSession()
      await biometricAuthService.saveSession({
        refreshToken,
        biometricEnabled: biometricEnabled ?? currentSession?.biometricEnabled === true,
        enabledAt: currentSession?.enabledAt || null,
        updatedAt: new Date().toISOString()
      })
    },

    async enableBiometricLogin() {
      if (!this.refreshToken) return
      await biometricAuthService.saveSession({
        refreshToken: this.refreshToken,
        biometricEnabled: true,
        enabledAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
    },

    async loginWithBiometrics() {
      await biometricAuthService.authenticate()
      const data = await this.refreshMobileSession({ allowStoredSession: true })
      this.accessToken = data.accessToken
      this.refreshToken = data.refreshToken
      if (data.user) {
        this.user = data.user
        if (data.user.preferred_locale) this.applyPreferredLocale(data.user.preferred_locale)
      }
      this.sessionChecked = true
      return data
    },

    async hasBiometricLoginEnabled() {
      return biometricAuthService.isEnabled()
    },

    async getBiometricAvailability() {
      return biometricAuthService.getAvailability()
    },

    async clearSessionState() {
      this.accessToken = null
      this.refreshToken = null
      this.user = null
      this.sessionChecked = true
    },

    async updateProfile(data) {
      const result = await authService.updateProfile(data)
      if (result.user) this.user = result.user
      if (result.user?.preferred_locale) this.applyPreferredLocale(result.user.preferred_locale)
      return result
    },

    async changePassword(data) {
      return authService.changePassword(data)
    },

    async deleteAccount() {
      const result = await authService.deleteAccount()
      await this.clearSessionState()
      await biometricAuthService.clearSession()
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
