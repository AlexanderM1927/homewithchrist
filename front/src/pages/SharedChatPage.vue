<template>
  <q-page class="shared-chat-page column">
    <header class="shared-header bg-white q-px-md q-py-sm row items-center no-wrap">
      <q-avatar size="38px" class="q-mr-sm">
        <q-icon name="auto_awesome" color="primary" size="26px" />
      </q-avatar>
      <div>
        <div class="text-weight-bold text-dark" style="font-size:15px;">{{ $t('advisor.title') }}</div>
        <div class="text-caption text-grey-6">{{ chat?.title || $t('sharedChat.readOnly') }}</div>
      <q-chip color="grey-3" text-color="grey-8" icon="visibility" :label="$t('sharedChat.readOnly')" />

      </div>
      <q-space />
      <q-btn
        v-if="authStore.isAuthenticated"
        flat
        color="primary"
        icon="chat"
        :label="$t('nav.advisor')"
        @click="router.push('/advisor')"
      />
      <q-btn
        v-if="!authStore.isAuthenticated"
        flat
        color="primary"
        :label="$t('welcome.login')"
        @click="router.push('/login')"
      />
    </header>

    <main class="messages-area col q-px-md q-py-lg">
      <div v-if="loading" class="column items-center justify-center col">
        <q-spinner color="primary" size="42px" />
        <div class="text-grey-7 q-mt-md">{{ $t('sharedChat.loading') }}</div>
      </div>

      <div v-else-if="error" class="column items-center justify-center col text-center q-px-lg">
        <q-icon name="link_off" color="grey-6" size="56px" />
        <div class="text-h6 text-weight-bold q-mt-md">{{ $t('sharedChat.notFoundTitle') }}</div>
        <div class="text-body2 text-grey-7 q-mt-sm">{{ $t('sharedChat.notFoundMessage') }}</div>
      </div>

      <template v-else>
        <div v-for="(msg, idx) in chat.messages" :key="idx" class="q-mb-sm">
          <div v-if="msg.role === 'user'" class="row justify-end">
            <div class="user-bubble q-px-md q-py-sm">{{ msg.content }}</div>
          </div>
          <div v-else class="row justify-start items-end q-gutter-x-xs">
            <q-avatar size="28px" class="ai-avatar">
              <q-icon name="auto_awesome" color="white" size="16px" />
            </q-avatar>
            <div class="ai-bubble q-px-md q-py-sm" v-html="formatMessage(msg.content)" />
          </div>
        </div>
      </template>
    </main>
  </q-page>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from 'src/stores/auth'
import chatService from 'src/services/ChatService'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const chat = ref(null)
const loading = ref(true)
const error = ref(false)

function formatMessage (text) {
  const escaped = String(text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  return escaped.split(/\n{2,}/).map(formatMessageBlock).join('')
}

function formatMessageBlock (block) {
  const lines = block.split('\n')
  const headingMatch = lines[0].trim().match(/^(#{1,3})\s+(.+)$/)

  if (headingMatch && lines.length === 1) {
    const level = headingMatch[1].length
    return `<h${level} class="ai-message-heading">${formatInlineMarkdown(headingMatch[2])}</h${level}>`
  }

  if (lines.every(line => /^\s*[-*]\s+/.test(line))) {
    const items = lines
      .map(line => line.replace(/^\s*[-*]\s+/, ''))
      .map(line => `<li>${formatInlineMarkdown(line)}</li>`)
      .join('')
    return `<ul class="ai-message-list">${items}</ul>`
  }

  return `<p class="ai-message-paragraph">${formatInlineMarkdown(lines.join('<br>'))}</p>`
}

function formatInlineMarkdown (text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, '$1<em>$2</em>')
}

onMounted(async () => {
  try {
    const data = await chatService.getSharedChat(route.params.token)
    chat.value = data.chat
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.shared-chat-page {
  background: #f8f5ff;
}

.shared-header {
  position: sticky;
  top: 0;
  z-index: 20;
  border-bottom: 1px solid #e0e0e0;
}

.messages-area {
  width: 100%;
  max-width: 760px;
  margin: 0 auto;
}

.user-bubble,
.ai-bubble {
  max-width: 75%;
  font-size: 14px;
  line-height: 1.5;
  word-break: break-word;
}

.user-bubble {
  background: #7B2FBE;
  color: white;
  border-radius: 18px 18px 4px 18px;
}

.ai-bubble {
  background: white;
  color: #1A1A2E;
  border-radius: 18px 18px 18px 4px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

.ai-bubble :deep(.ai-message-heading) { margin: 0 0 6px; font-size: 15px; line-height: 1.35; }
.ai-bubble :deep(h1.ai-message-heading) { font-size: 17px; }
.ai-bubble :deep(h2.ai-message-heading) { font-size: 16px; }
.ai-bubble :deep(.ai-message-paragraph) { margin: 0 0 8px; }
.ai-bubble :deep(.ai-message-paragraph:last-child),
.ai-bubble :deep(.ai-message-list:last-child),
.ai-bubble :deep(.ai-message-heading:last-child) { margin-bottom: 0; }
.ai-bubble :deep(.ai-message-list) { margin: 0 0 8px; padding-left: 18px; }

.ai-avatar {
  background: #7B2FBE;
  flex-shrink: 0;
  margin-bottom: 2px;
}
</style>
