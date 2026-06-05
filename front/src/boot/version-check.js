export default async () => {
  try {
    const currentVersion = localStorage.getItem('app_version')

    const response = await fetch('/version.json?nocache=' + Date.now())

    const data = await response.json()

    if (currentVersion && currentVersion !== data.version) {
      localStorage.setItem('app_version', data.version)

      // limpia caches del navegador
      if ('caches' in window) {
        const keys = await caches.keys()

        await Promise.all(
          keys.map(key => caches.delete(key))
        )
      }

      window.location.reload()
    } else {
      localStorage.setItem('app_version', data.version)
    }
  } catch (error) {
    console.error('Version check failed', error)
  }
}