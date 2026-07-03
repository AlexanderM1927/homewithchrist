import { computed } from 'vue'
import { Platform } from 'quasar'

function hasWindowFeature(featureName) {
  return typeof window !== 'undefined' && featureName in window
}

function hasNavigatorFeature(featureName) {
  return typeof navigator !== 'undefined' && featureName in navigator
}

function matchesDisplayMode(mode) {
  return hasWindowFeature('matchMedia') && window.matchMedia(`(display-mode: ${mode})`).matches
}

export function getRuntimePlatform() {
  const isCapacitor = Platform.is.capacitor === true
  const isAndroid = Platform.is.android === true
  const isIos = Platform.is.ios === true
  const isNativeMobile = isCapacitor && (isAndroid || isIos)
  const isStandaloneDisplayMode = matchesDisplayMode('standalone')
  const isIosHomeScreen = !isCapacitor && isIos && hasNavigatorFeature('standalone') && window.navigator.standalone === true
  const isStandaloneWebApp = !isCapacitor && (isStandaloneDisplayMode || isIosHomeScreen)

  return {
    name: isCapacitor ? 'capacitor' : 'browser',
    isCapacitor,
    isBrowser: !isCapacitor,
    isAndroid,
    isIos,
    isNativeMobile,
    isStandaloneWebApp,
    isHomeScreenApp: isStandaloneWebApp,
    isIosHomeScreen,
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
    isStandaloneWebApp: computed(() => runtimePlatform.value.isStandaloneWebApp),
    isHomeScreenApp: computed(() => runtimePlatform.value.isHomeScreenApp),
    isIosHomeScreen: computed(() => runtimePlatform.value.isIosHomeScreen),
    canUseNativeBiometrics: computed(() => runtimePlatform.value.canUseNativeBiometrics),
    canUseNativePush: computed(() => runtimePlatform.value.canUseNativePush),
    canUseWebPush: computed(() => runtimePlatform.value.canUseWebPush)
  }
}
