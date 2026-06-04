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
        <q-tab v-if="authStore.isAdmin" name="training" icon="model_training" :label="$t('nav.training')" />
        <q-tab name="logout" icon="logout" :label="$t('nav.logout')" class="text-negative" @click="logout" />
      </q-tabs>
    </q-footer>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'src/stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const activeTab = ref('index')

const tabRoutes = {
  index: '/',
  advisor: '/advisor',
  training: '/training'
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
