import { AndroidBiometryStrength, BiometricAuth, BiometryError, BiometryErrorType } from '@aparajita/capacitor-biometric-auth'
import { SecureStorage } from '@aparajita/capacitor-secure-storage'
import { getRuntimePlatform } from 'src/composables/useRuntimePlatform'

const STORAGE_KEY = 'auth.biometric.session'

class BiometricAuthService {
  isSupported() {
    const runtimePlatform = getRuntimePlatform()
    return runtimePlatform.isCapacitor && runtimePlatform.isAndroid
  }

  async getAvailability() {
    if (!this.isSupported()) {
      return { isAvailable: false, strongBiometryIsAvailable: false, deviceIsSecure: false }
    }

    return BiometricAuth.checkBiometry()
  }

  async isEnabled() {
    if (!this.isSupported()) return false
    const data = await this.loadSession()
    return Boolean(data?.biometricEnabled)
  }

  async saveSession(session) {
    if (!this.isSupported()) return
    await SecureStorage.set(STORAGE_KEY, session)
  }

  async loadSession() {
    if (!this.isSupported()) return null
    const data = await SecureStorage.get(STORAGE_KEY)
    return data && typeof data === 'object' ? data : null
  }

  async clearSession() {
    if (!this.isSupported()) return
    await SecureStorage.remove(STORAGE_KEY)
  }

  async authenticate() {
    if (!this.isSupported()) return false

    await BiometricAuth.authenticate({
      reason: 'Ingresa con tu biometria',
      cancelTitle: 'Cancelar',
      allowDeviceCredential: false,
      androidTitle: 'Ingreso biometrico',
      androidSubtitle: 'Confirma tu identidad para continuar',
      androidConfirmationRequired: false,
      androidBiometryStrength: AndroidBiometryStrength.strong
    })

    return true
  }

  isUserCancel(error) {
    return error instanceof BiometryError &&
      (error.code === BiometryErrorType.userCancel || error.code === BiometryErrorType.systemCancel)
  }
}

export default new BiometricAuthService()
