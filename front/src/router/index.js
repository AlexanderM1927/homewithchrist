import { defineRouter } from '#q-app/wrappers'
import { Loading, QSpinnerGears } from 'quasar'
import { createRouter, createMemoryHistory, createWebHistory, createWebHashHistory } from 'vue-router'
import routes from './routes'

const CHUNK_RELOAD_KEY = 'chunk_reload_attempted'

function isChunkLoadError(error) {
  const message = error instanceof Error ? error.message : String(error)

  return /Failed to fetch dynamically imported module|Importing a module script failed|Loading chunk [\d]+ failed|Unable to preload CSS/i.test(message)
}

export default defineRouter(({ store }) => {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : (process.env.VUE_ROUTER_MODE === 'history' ? createWebHistory : createWebHashHistory)

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createHistory(process.env.VUE_ROUTER_BASE)
  })

  Router.beforeEach(async (to) => {
    Loading.show({
      delay: 150,
      spinner: QSpinnerGears,
      spinnerColor: 'primary',
      backgroundColor: 'white'
    })

    // Importación diferida para evitar que el store se acceda antes de que Pinia esté listo
    const { useAuthStore } = await import('src/stores/auth')
    const authStore = useAuthStore(store)

    // Intenta renovar la sesión UNA sola vez por carga de página (evita bucle infinito)
    await authStore.checkSession()

    if (!authStore.isAuthenticated && !to.meta.public) {
      return '/welcome'
    }
    if (authStore.isAuthenticated && (to.path === '/login' || to.path === '/welcome')) {
      return '/'
    }
    if (to.meta.requiresAdmin && !authStore.isAdmin) {
      return '/'
    }
  })

  Router.onError((error) => {
    Loading.hide()

    if (!isChunkLoadError(error)) return

    if (sessionStorage.getItem(CHUNK_RELOAD_KEY)) {
      sessionStorage.removeItem(CHUNK_RELOAD_KEY)
      return
    }

    sessionStorage.setItem(CHUNK_RELOAD_KEY, '1')
    window.location.reload()
  })

  Router.afterEach(() => {
    Loading.hide()
    sessionStorage.removeItem(CHUNK_RELOAD_KEY)
  })

  return Router
})
