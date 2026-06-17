import { defineBoot } from '#q-app/wrappers'

function getStoredVersion() {
  try {
    return localStorage.getItem('app_version')
  } catch {
    return null
  }
}

function setStoredVersion(version) {
  try {
    localStorage.setItem('app_version', version)
  } catch {
    // Storage can be unavailable in private/restricted browser contexts.
  }
}

async function runVersionCheck() {
  try {
    const currentVersion = getStoredVersion()

    const response = await fetch('/version.json?nocache=' + Date.now())
    if (!response.ok) return

    const bodyText = await response.text()
    if (!bodyText || !bodyText.trim()) return

    const sanitizedText = bodyText
      .replace(/^\uFEFF/, '')
      .replace(/^\)\]\}',?\n/, '')
      .trim()

    let data
    try {
      data = JSON.parse(sanitizedText)
    } catch {
      console.warn('Version check skipped: invalid version payload')
      return
    }

    const nextVersion = typeof data.version === 'string' ? data.version.trim() : ''
    if (!nextVersion) return

    if (currentVersion && currentVersion !== nextVersion) {
      setStoredVersion(nextVersion)

      // limpia caches del navegador
      if ('caches' in window) {
        const keys = await caches.keys()

        await Promise.all(
          keys.map(key => caches.delete(key))
        )
      }

      window.location.reload()
    } else {
      setStoredVersion(nextVersion)
    }
  } catch (error) {
    console.error('Version check failed', error)
  }
}

function scheduleVersionCheck() {
  const callback = () => {
    void runVersionCheck()
  }

  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(callback, { timeout: 3000 })
    return
  }

  window.setTimeout(callback, 0)
}

export default defineBoot(() => {
  scheduleVersionCheck()
})
