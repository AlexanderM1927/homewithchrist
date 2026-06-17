<template>
  <q-footer bordered class="bg-white text-dark">
    <q-tabs
      v-model="activeTab"
      align="justify"
      active-color="primary"
      indicator-color="transparent"
      :disable="logoutLoading"
      @update:model-value="onTabChange"
    >
      <q-tab v-if="authStore.isAuthenticated" name="index" icon="home" :label="$t('nav.home')" />
      <q-tab name="advisor" icon="chat" :label="$t('nav.advisor')" />
      <q-tab name="bible" icon="menu_book" :label="$t('nav.bible')" />
      <q-tab v-if="authStore.isAuthenticated" name="diary" icon="book" :label="$t('nav.diary')" />
      <q-tab v-if="authStore.isAdmin" name="admin" icon="admin_panel_settings" :label="$t('nav.admin')" />
      <q-tab
        v-if="authStore.isAuthenticated"
        name="logout"
        :icon="logoutLoading ? 'sync' : 'logout'"
        :label="$t('nav.logout')"
        class="text-negative"
        :class="{ 'logout-loading': logoutLoading }"
        :disable="logoutLoading"
        @click="logout"
      />
    </q-tabs>
  </q-footer>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from 'src/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const logoutLoading = ref(false)

const routeToTab = {
  '/': 'index',
  '/welcome': 'advisor',
  '/advisor': 'advisor',
  '/bible': 'bible',
  '/diary': 'diary',
  '/admin': 'admin',
  '/training': 'admin',
  '/users': 'admin',
  '/daily-verses': 'admin'
}

function tabForPath (path) {
  if (path.startsWith('/diary/')) return 'diary'
  if (path.startsWith('/shared-chat/')) return 'advisor'
  if (path.startsWith('/shared-diary/')) return 'diary'
  return routeToTab[path] ?? (authStore.isAuthenticated ? 'index' : 'advisor')
}

const activeTab = ref(tabForPath(route.path))

watch(() => route.path, (path) => {
  activeTab.value = tabForPath(path)
})

const tabRoutes = {
  index: '/',
  advisor: '/advisor',
  bible: '/bible',
  diary: '/diary',
  admin: '/admin'
}

function onTabChange (tab) {
  if (tab === 'advisor' && !authStore.isAuthenticated) {
    router.push('/welcome')
    return
  }
  if (tabRoutes[tab]) router.push(tabRoutes[tab])
}

async function logout () {
  if (logoutLoading.value) return

  logoutLoading.value = true
  try {
    await authStore.logout()
    await router.push('/login')
  } finally {
    logoutLoading.value = false
  }
}
</script>

<style scoped>
.q-footer {
  border-top: 1px solid #e0e0e0;
  padding-bottom: var(--app-safe-area-bottom);
}

.q-tabs {
  min-height: 56px;
}

.logout-loading :deep(.q-icon) {
  animation: logout-spin 0.9s linear infinite;
}

@keyframes logout-spin {
  to { transform: rotate(360deg); }
}
</style>
