<template>
  <q-page class="advisor-page column">
    <!-- Header -->
    <div class="advisor-header bg-white q-px-md q-py-sm row items-center no-wrap" style="border-bottom: 1px solid #e0e0e0;">
      <q-btn
        v-if="messages.length > 0"
        flat
        round
        icon="arrow_back"
        color="grey-7"
        size="sm"
        class="q-mr-xs"
        @click="clearChat"
      />
      <q-avatar size="38px" class="q-mr-sm">
        <q-icon name="auto_awesome" color="primary" size="26px" />
      </q-avatar>
      <div>
        <div class="text-weight-bold text-dark" style="font-size:15px;">{{ $t('advisor.title') }}</div>
        <div class="text-caption text-grey-6">{{ $t('advisor.subtitle') }}</div>
      </div>
      <q-space />
      <q-btn flat round icon="history" color="grey-7" size="sm" />
    </div>

    <!-- Messages area -->
    <div ref="messagesContainer" class="messages-area col q-px-md q-py-md">
      <!-- Welcome bubble when empty -->
      <div v-if="messages.length === 0" class="column items-center justify-center full-height q-py-xl">
        <q-icon name="auto_awesome" color="primary" size="56px" class="q-mb-md" />
        <div class="text-h6 text-weight-bold text-dark text-center">{{ $t('advisor.welcomeTitle') }}</div>
        <div class="text-body2 text-grey-6 text-center q-mt-sm q-px-lg">
          {{ $t('advisor.welcomeDesc') }}
        </div>
        <div class="q-mt-xl q-gutter-y-sm full-width">
          <q-btn
            v-for="suggestion in suggestions"
            :key="suggestion"
            unelevated
            rounded
            outline
            color="primary"
            class="full-width text-left suggestion-btn"
            :label="suggestion"
            align="left"
            @click="sendSuggestion(suggestion)"
          />
        </div>
      </div>

      <!-- Messages list -->
      <div v-for="(msg, idx) in messages" :key="idx" class="q-mb-sm">
        <!-- User message -->
        <div v-if="msg.role === 'user'" class="row justify-end">
          <div class="user-bubble q-px-md q-py-sm">
            {{ msg.content }}
          </div>
        </div>

        <!-- AI message -->
        <div v-else class="row justify-start items-end q-gutter-x-xs">
          <q-avatar size="28px" class="ai-avatar">
            <q-icon name="auto_awesome" color="white" size="16px" />
          </q-avatar>
          <div class="ai-bubble q-px-md q-py-sm">
            <span v-if="msg.loading" class="phase-wrapper">
              <span class="typing-indicator"><span /><span /><span /></span>
              <span v-if="msg.phase" class="phase-label q-ml-xs">{{ $t(`advisor.phases.${msg.phase}`) }}</span>
            </span>
            <span v-else v-html="formatMessage(msg.content)" />
          </div>
        </div>
      </div>
    </div>

    <!-- Input area -->
    <div class="input-area bg-white q-px-md q-py-sm" style="border-top: 1px solid #e0e0e0;">
      <div class="row items-end no-wrap q-gutter-x-sm">
        <q-input
          v-model="inputText"
          autogrow
          outlined
          dense
          rounded
          :placeholder="$t('advisor.inputPlaceholder')"
          class="col"
          bg-color="grey-2"
          :input-style="{ maxHeight: '120px' }"
          @keydown.enter.exact.prevent="sendMessage"
        />
        <q-btn
          round
          unelevated
          color="primary"
          icon="send"
          :disable="!inputText.trim() || isLoading"
          @click="sendMessage"
        />
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, nextTick, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import chatService from 'src/services/ChatService'

const { t, tm } = useI18n()

function formatMessage (text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>')
}

const messagesContainer = ref(null)
const inputText = ref('')
const isLoading = ref(false)
const messages = ref([])

const suggestions = computed(() => tm('advisor.suggestions'))

async function scrollToBottom () {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

function sendSuggestion (text) {
  inputText.value = text
  sendMessage()
}

function clearChat () {
  messages.value = []
  inputText.value = ''
  isLoading.value = false
}

async function sendMessage () {
  const text = inputText.value.trim()
  if (!text || isLoading.value) return

  inputText.value = ''
  messages.value.push({ role: 'user', content: text })
  await scrollToBottom()

  // Construir historial de la conversación (todos los turnos completados, sin el que acabamos de agregar)
  const history = messages.value
    .slice(0, -1) // excluir el mensaje actual que acabamos de pushear
    .filter(m => !m.loading && m.content)
    .map(m => ({ role: m.role === 'ai' ? 'assistant' : 'user', content: m.content }))

  // Placeholder loading bubble
  isLoading.value = true
  messages.value.push({ role: 'ai', content: '', loading: true, phase: 'classifying' })
  await scrollToBottom()

  try {
    const lastMsg = messages.value[messages.value.length - 1]

    await chatService.chatStream(text, history, (token, done, phase) => {
      if (phase) {
        lastMsg.phase = phase
        scrollToBottom()
        return
      }
      if (lastMsg.loading) {
        lastMsg.loading = false
        lastMsg.phase = null
      }
      lastMsg.content += token
      scrollToBottom()
    })
  } catch (err) {
    const lastMsg = messages.value[messages.value.length - 1]
    lastMsg.loading = false
    lastMsg.content = err.message === 'unavailable'
      ? t('advisor.unavailableMessage')
      : t('advisor.errorMessage')
  } finally {
    isLoading.value = false
  }
  await scrollToBottom()
}
</script>

<style scoped>
.advisor-page {
  background: #f8f5ff;
  height: 100%;
}

.messages-area {
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.messages-area .full-height {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.user-bubble {
  background: #7B2FBE;
  color: white;
  border-radius: 18px 18px 4px 18px;
  max-width: 75%;
  font-size: 14px;
  line-height: 1.5;
  word-break: break-word;
}

.ai-bubble {
  background: white;
  color: #1A1A2E;
  border-radius: 18px 18px 18px 4px;
  max-width: 75%;
  font-size: 14px;
  line-height: 1.5;
  word-break: break-word;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
}

.ai-avatar {
  background: #7B2FBE;
  flex-shrink: 0;
  margin-bottom: 2px;
}

.suggestion-btn {
  justify-content: flex-start !important;
  text-transform: none;
  letter-spacing: 0;
  font-size: 13px;
}

/* Phase label */
.phase-wrapper {
  display: inline-flex;
  align-items: center;
}

.phase-label {
  font-size: 12px;
  color: #9C59D1;
  font-style: italic;
}

/* Typing dots animation */
.typing-indicator {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 4px;
}

.typing-indicator span {
  display: inline-block;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #9C59D1;
  animation: bounce 1.2s infinite ease-in-out;
}

.typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
.typing-indicator span:nth-child(3) { animation-delay: 0.4s; }

@keyframes bounce {
  0%, 80%, 100% { transform: scale(0.7); opacity: 0.5; }
  40%            { transform: scale(1);   opacity: 1;   }
}
</style>
