import { defineRouter } from '#q-app/wrappers'
import { createRouter, createMemoryHistory, createWebHistory, createWebHashHistory } from 'vue-router'
import routes from './routes'

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
    // Importación diferida para evitar que el store se acceda antes de que Pinia esté listo
    const { useAuthStore } = await import('src/stores/auth')
    const authStore = useAuthStore(store)

    // Intenta renovar la sesión UNA sola vez por carga de página (evita bucle infinito)
    await authStore.checkSession()

    if (!authStore.isAuthenticated && to.path !== '/login') {
      return '/login'
    }
    if (authStore.isAuthenticated && to.path === '/login') {
      return '/'
    }
  })

  return Router
})
