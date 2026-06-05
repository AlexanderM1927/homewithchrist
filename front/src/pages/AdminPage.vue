<template>
  <q-page class="q-pa-md">
    <div class="text-h6 q-mb-lg">{{ $t('admin.title') }}</div>

    <div class="row q-gutter-md">
      <q-card
        v-for="option in adminOptions"
        :key="option.key"
        class="admin-card col-12 col-sm-5 cursor-pointer"
        flat
        bordered
        @click="$router.push(option.route)"
      >
        <q-card-section class="flex items-center q-gutter-md">
          <q-icon :name="option.icon" size="2.5rem" color="primary" />
          <div>
            <div class="text-subtitle1 text-weight-medium">{{ $t(option.labelKey) }}</div>
            <div class="text-caption text-grey">{{ $t(option.descKey) }}</div>
          </div>
          <q-space />
          <q-icon name="chevron_right" color="grey" />
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
const adminOptions = [
  {
    key: 'training',
    icon: 'model_training',
    labelKey: 'admin.options.training.label',
    descKey: 'admin.options.training.desc',
    route: '/training'
  },
  {
    key: 'users',
    icon: 'manage_accounts',
    labelKey: 'admin.options.users.label',
    descKey: 'admin.options.users.desc',
    route: '/users'
  }
]
</script>

<style scoped>
.admin-card {
  transition: box-shadow 0.2s;
}
.admin-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}
</style>
