<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <router-view v-slot="{ Component }">
        <keep-alive>
          <component :is="Component" />
        </keep-alive>
      </router-view>
    </q-page-container>

    <app-bottom-navigation />
  </q-layout>
</template>

<script setup>
import AppBottomNavigation from 'src/components/AppBottomNavigation.vue'
</script>
