import { defineBoot } from '#q-app/wrappers'
import { watch } from 'vue'
import { i18n } from './i18n'
import { applyRouteSeo } from 'src/utils/seo'

export default defineBoot(({ router }) => {
  const syncSeo = (route = router.currentRoute.value) => {
    applyRouteSeo(route, i18n.global.locale.value)
  }

  router.afterEach((to) => {
    syncSeo(to)
  })

  watch(() => i18n.global.locale.value, () => {
    syncSeo()
  })

  syncSeo()
})
