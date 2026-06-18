import { defineBoot } from '#q-app/wrappers'
import { getRuntimePlatform } from 'src/composables/useRuntimePlatform'
import apiReadinessService from 'src/services/ApiReadinessService'

function setBodyClass(className, enabled) {
  document.body.classList.toggle(className, enabled)
}

export default defineBoot(() => {
  if (process.env.SERVER) return

  const runtimePlatform = getRuntimePlatform()

  setBodyClass('capacitor', runtimePlatform.isCapacitor)
  setBodyClass('browser', runtimePlatform.isBrowser)
  setBodyClass('platform-android', runtimePlatform.isAndroid)
  setBodyClass('platform-ios', runtimePlatform.isIos)

  document.body.dataset.platform = runtimePlatform.name

  if (runtimePlatform.isNativeMobile) {
    void apiReadinessService.warmUp()
  }
})
