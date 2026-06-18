import { API_BASE_URL } from 'src/boot/api'
import { getRuntimePlatform } from 'src/composables/useRuntimePlatform'

function normalizeBaseUrl(url) {
  return String(url || '').trim().replace(/\/+$/, '')
}

function getConfiguredPublicBaseUrl() {
  const configuredUrl = normalizeBaseUrl(import.meta.env.VITE_PUBLIC_APP_URL)
  if (configuredUrl) return configuredUrl

  if (getRuntimePlatform().isNativeMobile) {
    return normalizeBaseUrl(API_BASE_URL).replace(/\/api$/, '')
  }

  return window.location.origin
}

export function buildPublicAppUrl(routeLocation, router) {
  const resolvedRoute = router.resolve(routeLocation)
  const routePath = resolvedRoute.fullPath.startsWith('/')
    ? resolvedRoute.fullPath
    : `/${resolvedRoute.fullPath}`

  return new URL(routePath, `${getConfiguredPublicBaseUrl()}/`).href
}
