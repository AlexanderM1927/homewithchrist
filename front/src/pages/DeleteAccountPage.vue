<template>
  <q-page class="delete-account-page q-pa-md">
    <div class="delete-account-content">
      <div class="row items-center q-mb-lg">
        <q-btn flat round icon="arrow_back" color="grey-7" to="/profile" />
        <div class="text-h6 text-weight-bold q-ml-sm">{{ $t('deleteAccount.title') }}</div>
      </div>

      <q-card flat bordered class="warning-card">
        <q-card-section class="column items-center text-center q-pa-lg">
          <q-avatar size="72px" color="red-1" text-color="negative" icon="warning_amber" />
          <div class="text-h6 text-weight-bold q-mt-md">{{ $t('deleteAccount.warningTitle') }}</div>
          <p class="text-body1 text-grey-8 q-mt-md q-mb-sm">
            {{ $t('deleteAccount.description') }}
          </p>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <div class="text-subtitle1 text-weight-bold text-negative q-mb-sm">
            <q-icon name="delete_outline" size="sm" class="q-mr-xs" />
            {{ $t('deleteAccount.deletedTitle') }}
          </div>

          <q-list dense>
            <q-item v-for="item in deletedItems" :key="item">
              <q-item-section avatar>
                <q-icon name="close" color="negative" />
              </q-item-section>
              <q-item-section>{{ item }}</q-item-section>
            </q-item>
          </q-list>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <div class="text-subtitle1 text-weight-bold text-positive q-mb-sm">
            <q-icon name="verified_user" size="sm" class="q-mr-xs" />
            {{ $t('deleteAccount.preservedTitle') }}
          </div>

          <q-list dense>
            <q-item v-for="item in preservedItems" :key="item">
              <q-item-section avatar>
                <q-icon name="check" color="positive" />
              </q-item-section>
              <q-item-section>{{ item }}</q-item-section>
            </q-item>
          </q-list>

          <q-banner rounded class="bg-green-1 text-green-10 q-mt-md">
            {{ $t('deleteAccount.sharedContentNote') }}
          </q-banner>
        </q-card-section>
      </q-card>

      <q-btn
        :label="$t('deleteAccount.action')"
        icon="delete_forever"
        color="negative"
        unelevated
        rounded
        no-caps
        class="full-width q-mt-xl"
        @click="confirmDialog = true"
      />
    </div>

    <q-dialog v-model="confirmDialog" persistent>
      <q-card class="confirm-card">
        <q-card-section class="row items-center">
          <q-avatar icon="delete_forever" color="negative" text-color="white" />
          <span class="text-h6 text-weight-bold q-ml-md">{{ $t('deleteAccount.confirmTitle') }}</span>
        </q-card-section>

        <q-card-section class="text-body1">
          {{ $t('deleteAccount.confirmMessage') }}
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn
            v-close-popup
            flat
            no-caps
            :label="$t('deleteAccount.cancel')"
            :disable="deleting"
          />
          <q-btn
            unelevated
            no-caps
            color="negative"
            :label="$t('deleteAccount.confirm')"
            :loading="deleting"
            @click="onDeleteAccount"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'src/stores/auth'

const { t } = useI18n()
const $q = useQuasar()
const router = useRouter()
const authStore = useAuthStore()

const confirmDialog = ref(false)
const deleting = ref(false)
const deletedItems = [
  t('deleteAccount.deleted.account'),
  t('deleteAccount.deleted.diary'),
  t('deleteAccount.deleted.chats'),
  t('deleteAccount.deleted.sessions'),
  t('deleteAccount.deleted.usage')
]
const preservedItems = [
  t('deleteAccount.preserved.communityContent')
]

async function onDeleteAccount () {
  deleting.value = true

  try {
    await authStore.deleteAccount()
    confirmDialog.value = false
    $q.notify({ type: 'positive', message: t('deleteAccount.success') })
    await router.replace('/welcome')
  } catch (err) {
    $q.notify({ type: 'negative', message: err.message || t('deleteAccount.error') })
  } finally {
    deleting.value = false
  }
}
</script>

<style scoped>
.delete-account-page {
  min-height: 100vh;
  background-color: #F4F0FA;
}

.delete-account-content {
  width: 100%;
  max-width: 520px;
  margin: 0 auto;
}

.warning-card,
.confirm-card {
  border-radius: 18px;
}

.confirm-card {
  width: min(92vw, 480px);
}
</style>
