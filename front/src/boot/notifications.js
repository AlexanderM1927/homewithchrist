import { defineBoot } from '#q-app/wrappers'
import { Notify } from 'quasar'
import { watch } from 'vue'
import { useAuthStore } from 'src/stores/auth'
import notificationService from 'src/services/NotificationService'

export default defineBoot(({ router, store }) => {
  if (!notificationService.isSupported()) return

  const authStore = useAuthStore(store)

  notificationService.onNotificationReceived((notification) => {
    Notify.create({
      type: 'positive',
      icon: 'auto_stories',
      message: notification.title || 'Versiculo del dia',
      caption: notification.body || '',
      timeout: 8000,
      actions: [
        {
          label: 'Ver',
          color: 'white',
          handler: () => router.push('/')
        }
      ]
    })
  })

  notificationService.onNotificationAction(() => {
    router.push('/')
  })

  watch(
    () => authStore.isAuthenticated,
    (isAuthenticated) => {
      if (isAuthenticated) {
        notificationService.registerCurrentDevice().catch((error) => {
          console.error('No se pudieron activar las notificaciones push:', error)
        })
      }
    },
    { immediate: true }
  )
})
