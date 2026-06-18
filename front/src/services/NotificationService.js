import { PushNotifications } from '@capacitor/push-notifications'
import ApiService from 'src/boot/api'
import { getRuntimePlatform } from 'src/composables/useRuntimePlatform'

class NotificationService extends ApiService {
  constructor() {
    super('/notifications')
    this.listenersReady = false
    this.registrationPromise = null
    this.currentToken = null
    this.notificationReceivedHandlers = new Set()
    this.notificationActionHandlers = new Set()
  }

  isSupported() {
    return getRuntimePlatform().canUseNativePush
  }

  async registerCurrentDevice() {
    if (!this.isSupported()) return false
    if (this.registrationPromise) return this.registrationPromise

    this.registrationPromise = this.performRegistration()
      .finally(() => {
        this.registrationPromise = null
      })

    return this.registrationPromise
  }

  async performRegistration() {
    await this.ensureListeners()

    let permission = await PushNotifications.checkPermissions()
    if (permission.receive === 'prompt') {
      permission = await PushNotifications.requestPermissions()
    }

    if (permission.receive !== 'granted') return false

    if (getRuntimePlatform().isAndroid) {
      await PushNotifications.createChannel({
        id: 'daily_verse',
        name: 'Versiculo del dia',
        description: 'Notificacion diaria con el versiculo del dia',
        importance: 4,
        visibility: 1,
        vibration: true
      })
    }

    await PushNotifications.register()
    return true
  }

  async ensureListeners() {
    if (this.listenersReady) return
    this.listenersReady = true

    await PushNotifications.addListener('registration', async ({ value }) => {
      this.currentToken = value
      try {
        await this.post('/device', { token: value })
      } catch (error) {
        console.error('No se pudo registrar el dispositivo para notificaciones:', error)
      }
    })

    await PushNotifications.addListener('registrationError', (error) => {
      console.error('Firebase no pudo registrar las notificaciones:', error)
    })

    await PushNotifications.addListener('pushNotificationReceived', (notification) => {
      this.notificationReceivedHandlers.forEach(handler => handler(notification))
    })

    await PushNotifications.addListener('pushNotificationActionPerformed', ({ notification }) => {
      this.notificationActionHandlers.forEach(handler => handler(notification))
    })
  }

  onNotificationReceived(handler) {
    this.notificationReceivedHandlers.add(handler)
    return () => this.notificationReceivedHandlers.delete(handler)
  }

  onNotificationAction(handler) {
    this.notificationActionHandlers.add(handler)
    return () => this.notificationActionHandlers.delete(handler)
  }
}

export default new NotificationService()
