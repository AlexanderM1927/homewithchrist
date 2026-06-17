import { computed } from 'vue'
import { Platform } from 'quasar'

function hasWindowFeature(featureName) {
  return typeof window !== 'undefined' && featureName in window
}

function hasNavigatorFeature(featureName) {
  return typeof navigator !== 'undefined' && featureName in navigator
}

export function getRuntimePlatform() {
  const isCapacitor = Platform.is.capacitor === true
  const isAndroid = Platform.is.android === true
  const isIos = Platform.is.ios === true
  const isNativeMobile = isCapacitor && (isAndroid || isIos)

  return {
    name: isCapacitor ? 'capacitor' : 'browser',
    isCapacitor,
    isBrowser: !isCapacitor,
    isAndroid,
    isIos,
    isNativeMobile,
    canUseNativeBiometrics: isCapacitor && isAndroid,
    canUseNativePush: isNativeMobile,
    canUseWebPush: !isCapacitor && hasWindowFeature('Notification') && hasNavigatorFeature('serviceWorker')
  }
}

export function useRuntimePlatform() {
  const runtimePlatform = computed(() => getRuntimePlatform())

  return {
    runtimePlatform,
    platformName: computed(() => runtimePlatform.value.name),
    isCapacitor: computed(() => runtimePlatform.value.isCapacitor),
    isBrowser: computed(() => runtimePlatform.value.isBrowser),
    isAndroid: computed(() => runtimePlatform.value.isAndroid),
    isIos: computed(() => runtimePlatform.value.isIos),
    isNativeMobile: computed(() => runtimePlatform.value.isNativeMobile),
    canUseNativeBiometrics: computed(() => runtimePlatform.value.canUseNativeBiometrics),
    canUseNativePush: computed(() => runtimePlatform.value.canUseNativePush),
    canUseWebPush: computed(() => runtimePlatform.value.canUseWebPush)
  }
}
