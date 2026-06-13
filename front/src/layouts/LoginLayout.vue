<template>
  <q-layout view="hHh lpR fFf">
    <q-page-container>
      <router-view />
    </q-page-container>
    <app-bottom-navigation v-if="showBottomNavigation" />
  </q-layout>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppBottomNavigation from 'src/components/AppBottomNavigation.vue'

const route = useRoute()

const showBottomNavigation = computed(() => (
  route.path === '/welcome' ||
  route.path.startsWith('/shared-chat/') ||
  route.path.startsWith('/shared-diary/')
))
</script>
