export default async () => {
  try {
    const currentVersion = localStorage.getItem('app_version')

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
      localStorage.setItem('app_version', nextVersion)

      // limpia caches del navegador
      if ('caches' in window) {
        const keys = await caches.keys()

        await Promise.all(
          keys.map(key => caches.delete(key))
        )
      }

      window.location.reload()
    } else {
      localStorage.setItem('app_version', nextVersion)
    }
  } catch (error) {
    console.error('Version check failed', error)
  }
}
