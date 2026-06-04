<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <router-view />
    </q-page-container>

    <q-footer bordered class="bg-white text-dark">
      <q-tabs
        v-model="activeTab"
        align="justify"
        active-color="primary"
        indicator-color="transparent"
      >
        <q-tab name="inicio" icon="home" :label="$t('nav.home')" />
        <q-tab name="versiculo" icon="menu_book" :label="$t('nav.verse')" />
        <q-tab name="logout" icon="logout" :label="$t('nav.logout')" class="text-negative" @click="logout" />
      </q-tabs>
    </q-footer>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const activeTab = ref('inicio')

function logout () {
  localStorage.removeItem('hwc_user')
  router.push('/login')
}
</script>

<style scoped>
.q-footer {
  border-top: 1px solid #e0e0e0;
}
</style>
