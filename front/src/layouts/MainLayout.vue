<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <router-view v-slot="{ Component }">
        <keep-alive>
          <component :is="Component" />
        </keep-alive>
      </router-view>
    </q-page-container>

    <q-footer bordered class="bg-white text-dark">
      <q-tabs
        v-model="activeTab"
        align="justify"
        active-color="primary"
        indicator-color="transparent"
        @update:model-value="onTabChange"
      >
        <q-tab name="index" icon="home" :label="$t('nav.home')" />
        <q-tab name="advisor" icon="chat" :label="$t('nav.advisor')" />
        <q-tab name="bible" icon="menu_book" :label="$t('nav.bible')" />
        <q-tab name="diary" icon="book" :label="$t('nav.diary')" />
        <q-tab v-if="authStore.isAdmin" name="admin" icon="admin_panel_settings" :label="$t('nav.admin')" />
        <q-tab name="logout" icon="logout" :label="$t('nav.logout')" class="text-negative" @click="logout" />
      </q-tabs>
    </q-footer>
  </q-layout>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from 'src/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const routeToTab = {
  '/': 'index',
  '/advisor': 'advisor',
  '/bible': 'bible',
  '/diary': 'diary',
  '/admin': 'admin',
  '/training': 'admin',
  '/users': 'admin'
}

const activeTab = ref(
  route.path.startsWith('/diary/') ? 'diary' : (routeToTab[route.path] ?? 'index')
)

watch(() => route.path, (path) => {
  activeTab.value = path.startsWith('/diary/') ? 'diary' : (routeToTab[path] ?? 'index')
})

const tabRoutes = {
  index: '/',
  advisor: '/advisor',
  bible: '/bible',
  diary: '/diary',
  admin: '/admin'
}

function onTabChange (tab) {
  if (tabRoutes[tab]) router.push(tabRoutes[tab])
}

async function logout () {
  await authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.q-footer {
  border-top: 1px solid #e0e0e0;
}
</style>
