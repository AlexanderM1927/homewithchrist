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
      <q-avatar size="38px">
        <q-icon name="auto_awesome" color="primary" size="26px" />
      </q-avatar>
      <div class="advisor-header-title col">
        <div class="text-weight-bold text-dark" style="font-size:15px;">{{ $t('advisor.title') }}</div>
        <div class="text-caption text-grey-6">{{ currentChatTitle || $t('advisor.subtitle') }}</div>
      </div>
      <q-btn
        v-if="guestMode"
        flat
        dense
        no-caps
        color="primary"
        :label="$t('welcome.login')"
        class="guest-login-btn"
        @click="goToLogin"
      />
      <template v-else>
        <q-btn
          v-if="currentChatId"
          flat
          round
          icon="share"
          color="grey-7"
          size="sm"
          :loading="sharing"
          :aria-label="$t('advisor.share')"
          @click="shareCurrentChat"
        >
          <q-tooltip>{{ $t('advisor.share') }}</q-tooltip>
        </q-btn>
        <q-btn flat round icon="history" color="grey-7" size="sm" @click="openHistoryModal" />
      </template>
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
        <div v-else class="ai-message-stack column items-start">
          <div class="message-row row justify-start items-end">
            <q-avatar size="28px" class="ai-avatar">
              <q-icon name="auto_awesome" color="white" size="16px" />
            </q-avatar>
            <div class="ai-bubble q-px-md q-py-sm" :class="{ 'ai-bubble-loading': msg.loading }">
              <span v-if="msg.loading" class="phase-wrapper">
                <span class="typing-indicator"><span /><span /><span /></span>
                <span v-if="msg.phase" class="phase-label q-ml-xs">{{ $t(`advisor.phases.${msg.phase}`) }}</span>
              </span>
              <span v-else v-html="formatMessage(msg.content)" />
            </div>
          </div>
          <q-btn
            v-if="speechSupported && !msg.loading && msg.content"
            flat
            dense
            round
            size="sm"
            color="grey-7"
            class="message-audio-btn q-mt-xs"
            :icon="speakingMessageIndex === idx ? 'stop' : 'volume_up'"
            :aria-label="speakingMessageIndex === idx ? $t('advisor.stopAudio') : $t('advisor.listenAudio')"
            @click="toggleSpeech(msg, idx)"
          >
            <q-tooltip>{{ speakingMessageIndex === idx ? $t('advisor.stopAudio') : $t('advisor.listenAudio') }}</q-tooltip>
          </q-btn>
        </div>
      </div>
    </div>

    <!-- Input area -->
    <div class="input-area bg-white q-px-md q-py-sm" style="border-top: 1px solid #e0e0e0;">
      <div class="input-row row items-end no-wrap">
        <q-input
          v-model="inputText"
          type="textarea"
          autogrow
          outlined
          dense
          rounded
          :placeholder="$t('advisor.inputPlaceholder')"
          class="col"
          bg-color="grey-2"
          :input-style="{ maxHeight: '120px' }"
          @keydown="onMessageKeydown"
        />
        <q-btn
          round
          unelevated
          color="primary"
          icon="send"
          class="send-btn"
          :disable="!inputText.trim() || isLoading"
          @click="sendMessage"
        />
      </div>
    </div>

    <!-- Chat history modal -->
    <q-dialog v-model="historyModalOpen" position="bottom" @hide="onHistoryDialogHide">
      <q-card class="history-modal-card">
        <q-card-section class="row items-center q-pb-sm">
          <div class="text-subtitle1 text-weight-bold">{{ $t('advisor.historyTitle') }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-separator />

        <q-card-section class="q-pa-none">
          <q-list separator>
            <q-item v-if="historyLoading">
              <q-item-section>{{ $t('advisor.loadingHistory') }}</q-item-section>
            </q-item>

            <q-item v-else-if="chatHistory.length === 0">
              <q-item-section>{{ $t('advisor.emptyHistory') }}</q-item-section>
            </q-item>

            <q-item
              v-for="chat in chatHistory"
              v-else
              :key="chat.chat_id"
              clickable
              :disable="loadingChatId !== null"
              @click="selectChat(chat.chat_id)"
            >
              <q-item-section>
                <q-item-label lines="1">{{ chat.title }}</q-item-label>
                <q-item-label caption lines="1">{{ chat.preview || '-' }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-spinner v-if="loadingChatId === chat.chat_id" color="primary" size="24px" />
                <q-item-label v-else caption>{{ formatDate(chat.updatedAt) }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="loginModalOpen">
      <q-card class="login-modal-card q-pa-sm">
        <q-card-section class="text-center">
          <q-icon name="lock" color="primary" size="44px" class="q-mb-sm" />
          <div class="text-h6 text-weight-bold">{{ $t('welcome.limitTitle') }}</div>
          <div class="text-body2 text-grey-7 q-mt-sm">{{ $t('welcome.limitMessage') }}</div>
        </q-card-section>
        <q-card-actions vertical class="q-px-md q-pb-md q-gutter-y-sm">
          <q-btn unelevated color="primary" :label="$t('welcome.createAccount')" @click="goToRegister" />
          <q-btn flat color="primary" :label="$t('welcome.login')" @click="goToLogin" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, nextTick, computed, onMounted, onUnmounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import chatService from 'src/services/ChatService'
import speechService from 'src/services/SpeechService'
import { buildPublicAppUrl } from 'src/utils/publicAppUrl'
import createLatestRequest from 'src/utils/createLatestRequest'

const props = defineProps({
  guestMode: {
    type: Boolean,
    default: false
  }
})

const { t, tm, locale } = useI18n()
const router = useRouter()
const $q = useQuasar()
const guestMode = computed(() => props.guestMode)
const recentChatsRequest = createLatestRequest()

function formatMessage (text) {
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  return escaped
    .split(/\n{2,}/)
    .map(formatMessageBlock)
    .join('')
}

function formatMessageBlock (block) {
  const lines = block.split('\n')
  const firstLine = lines[0].trim()
  const headingMatch = firstLine.match(/^(#{1,3})\s+(.+)$/)

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

function formatDate (date) {
  try {
    return new Date(date).toLocaleDateString(locale.value, {
      day: '2-digit',
      month: 'short'
    })
  } catch {
    return ''
  }
}

const messagesContainer = ref(null)
const inputText = ref('')
const isLoading = ref(false)
const messages = ref([])

const historyModalOpen = ref(false)
const historyLoading = ref(false)
const loadingChatId = ref(null)
const chatHistory = ref([])
const loginModalOpen = ref(false)

const currentChatId = ref(null)
const currentChatTitle = ref('')
const pendingScrollAfterHistoryClose = ref(false)
const sharing = ref(false)
const speakingMessageIndex = ref(null)
let mobileScrollTimer = null
let speechPlaybackToken = 0
let speechSupportRetryTimer = null
let speechSupportRefreshToken = 0

function getGuestTrialUsed () {
  try {
    return localStorage.getItem('hope_guest_trial_used') === '1'
  } catch {
    return false
  }
}

function setGuestTrialUsed () {
  try {
    localStorage.setItem('hope_guest_trial_used', '1')
  } catch {
    // Storage can be unavailable in private/restricted browser contexts.
  }
}

const suggestions = computed(() => tm('advisor.suggestions'))
const speechSupported = ref(false)

function getSpeechLanguage () {
  return locale.value?.startsWith('es') ? 'es-ES' : 'en-US'
}

function normalizeSpeechText (text) {
  return text
    .replace(/#{1,3}\s+/g, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, '$1$2')
    .replace(/^\s*[-*]\s+/gm, '')
    .replace(/\s+/g, ' ')
    .trim()
}

async function stopSpeech () {
  speechPlaybackToken += 1
  if (!speechSupported.value) {
    speakingMessageIndex.value = null
    return
  }

  try {
    await speechService.stop()
  } catch {
    // Ignore stop failures to keep the UI responsive.
  }

  speakingMessageIndex.value = null
}

async function refreshSpeechSupport () {
  const refreshToken = ++speechSupportRefreshToken
  const isSupported = await speechService.getAvailability(getSpeechLanguage())
  if (refreshToken !== speechSupportRefreshToken) return isSupported

  speechSupported.value = isSupported
  return isSupported
}

function clearSpeechSupportRetry () {
  clearTimeout(speechSupportRetryTimer)
  speechSupportRetryTimer = null
}

async function refreshSpeechSupportWithRetry (retries = 6, delay = 800) {
  clearSpeechSupportRetry()

  const isSupported = await refreshSpeechSupport()
  if (isSupported || !speechService.isNativeSupported() || retries <= 0) return

  speechSupportRetryTimer = setTimeout(() => {
    refreshSpeechSupportWithRetry(retries - 1, delay)
  }, delay)
}

async function toggleSpeech (message, index) {
  if (!message?.content) return

  if (!speechSupported.value) {
    $q.notify({ type: 'warning', message: t('advisor.audioUnavailable') })
    return
  }

  if (speakingMessageIndex.value === index) {
    await stopSpeech()
    return
  }

  await stopSpeech()
  const playbackToken = ++speechPlaybackToken
  speakingMessageIndex.value = index

  try {
    await speechService.speak({
      text: normalizeSpeechText(message.content),
      lang: getSpeechLanguage(),
      rate: 1,
      pitch: 1
    })
  } catch (err) {
    if (playbackToken !== speechPlaybackToken) return

    if (speechService.isRecoverableNativeError(err)) {
      try {
        await speechService.openInstall()
      } catch {
        // Best-effort prompt on Android when TTS data is missing.
      }
      $q.notify({ type: 'warning', message: t('advisor.audioUnavailable') })
      await refreshSpeechSupport()
      return
    }

    $q.notify({ type: 'negative', message: t('advisor.audioError') })
  } finally {
    if (playbackToken === speechPlaybackToken) {
      speakingMessageIndex.value = null
    }
  }
}

async function scrollToBottom () {
  await nextTick()
  const container = messagesContainer.value
  if (container) {
    container.scrollTop = container.scrollHeight
  }
}

function forceScrollToBottom (retries = 12, delay = 40) {
  scrollToBottom().then(() => {
    const container = messagesContainer.value
    if (!container) return

    const isContainerAtBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - 2
    const isPageAtBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2
    if ((!isContainerAtBottom || !isPageAtBottom) && retries > 0) {
      setTimeout(() => forceScrollToBottom(retries - 1, delay), delay)
    }
  })
}

function keepWelcomeInputVisible () {
  if (!guestMode.value || !$q.platform.is.mobile) return

  clearTimeout(mobileScrollTimer)
  mobileScrollTimer = setTimeout(() => forceScrollToBottom(15, 45), 0)
}

function onHistoryDialogHide () {
  if (!pendingScrollAfterHistoryClose.value) return
  pendingScrollAfterHistoryClose.value = false
  forceScrollToBottom(15, 45)
}

function sendSuggestion (text) {
  inputText.value = text
  sendMessage()
}

function onMessageKeydown (event) {
  if (event.key !== 'Enter' || event.shiftKey || event.isComposing || $q.platform.is.mobile) return

  event.preventDefault()
  sendMessage()
}

function goToLogin () {
  router.push('/login')
}

function goToRegister () {
  router.push({ path: '/login', query: { mode: 'register' } })
}

function clearChat () {
  stopSpeech()
  messages.value = []
  inputText.value = ''
  isLoading.value = false
  currentChatId.value = null
  currentChatTitle.value = ''
}

async function loadRecentChats () {
  historyLoading.value = true
  try {
    const result = await recentChatsRequest.run(signal => chatService.getRecentChats(10, { signal }))
    if (result.status !== 'success') return
    const data = result.value
    chatHistory.value = data.chats || []
  } catch {
    chatHistory.value = []
  } finally {
    if (!recentChatsRequest.isRunning()) {
      historyLoading.value = false
    }
  }
}

async function openHistoryModal () {
  historyModalOpen.value = true
  await loadRecentChats()
}

async function selectChat (chatId) {
  if (loadingChatId.value !== null) return

  await stopSpeech()
  loadingChatId.value = chatId
  try {
    const data = await chatService.getChat(chatId)
    const selected = data.chat

    currentChatId.value = selected.chat_id
    currentChatTitle.value = selected.title
    messages.value = (selected.messages || []).map(msg => ({
      role: msg.role === 'assistant' ? 'ai' : 'user',
      content: msg.content
    }))
    pendingScrollAfterHistoryClose.value = true
    historyModalOpen.value = false
  } catch {
    pendingScrollAfterHistoryClose.value = false
    historyModalOpen.value = false
  } finally {
    loadingChatId.value = null
  }
}

async function sendMessage () {
  const text = inputText.value.trim()
  if (!text || isLoading.value) return

  await stopSpeech()

  if (guestMode.value && getGuestTrialUsed()) {
    loginModalOpen.value = true
    return
  }

  inputText.value = ''
  messages.value.push({ role: 'user', content: text })

  // Placeholder loading bubble
  isLoading.value = true
  messages.value.push({ role: 'ai', content: '', loading: true, phase: 'classifying' })

  try {
    const lastMsg = messages.value[messages.value.length - 1]
    const onToken = (token, done, phase) => {
      if (phase) {
        lastMsg.phase = phase
        return
      }
      if (lastMsg.loading) {
        lastMsg.loading = false
        lastMsg.phase = null
      }
      if (done && !token) return
      lastMsg.content += token
    }

    if (guestMode.value) {
      await chatService.guestChatStream(text, onToken)
      setGuestTrialUsed()
    } else {
      await chatService.chatStream(
        text,
        onToken,
        currentChatId.value,
        (meta) => {
          if (meta.chatId) currentChatId.value = meta.chatId
          if (meta.title) currentChatTitle.value = meta.title
        }
      )
      await loadRecentChats()
    }
  } catch (err) {
    if (err.message === 'guest_trial_used') {
      setGuestTrialUsed()
      messages.value.splice(-2, 2)
      loginModalOpen.value = true
      return
    }
    const lastMsg = messages.value[messages.value.length - 1]
    lastMsg.loading = false
    lastMsg.content = err.message === 'unavailable'
      ? t('advisor.unavailableMessage')
      : t('advisor.errorMessage')
  } finally {
    isLoading.value = false
  }
}

async function shareCurrentChat () {
  if (!currentChatId.value || sharing.value) return

  sharing.value = true
  try {
    const { token } = await chatService.shareChat(currentChatId.value)
    const url = buildPublicAppUrl({
      name: 'shared-chat',
      params: { token }
    }, router)

    if (navigator.share) {
      await navigator.share({
        title: currentChatTitle.value || t('advisor.title'),
        text: t('advisor.shareText'),
        url
      })
      return
    }

    await navigator.clipboard.writeText(url)
    $q.notify({ type: 'positive', message: t('advisor.shareCopied') })
  } catch (err) {
    if (err?.name !== 'AbortError') {
      $q.notify({ type: 'negative', message: t('advisor.shareError') })
    }
  } finally {
    sharing.value = false
  }
}

watch(messages, keepWelcomeInputVisible, { deep: true })
watch(locale, () => {
  refreshSpeechSupportWithRetry()
})

onMounted(() => {
  if (!guestMode.value) loadRecentChats()
  keepWelcomeInputVisible()
  refreshSpeechSupportWithRetry()
  window.visualViewport?.addEventListener('resize', keepWelcomeInputVisible)
})

onUnmounted(() => {
  stopSpeech()
  clearSpeechSupportRetry()
  clearTimeout(mobileScrollTimer)
  window.visualViewport?.removeEventListener('resize', keepWelcomeInputVisible)
})
</script>

<style scoped>
.advisor-page {
  background: #f8f5ff;
  height: 100%;
  overflow-x: hidden;
  overflow-y: hidden;
}

.advisor-header {
  flex: 0 0 auto;
  z-index: 20;
  gap: 8px;
  overflow: hidden;
  width: 100%;
}

.advisor-header-title {
  min-width: 0;
}

.advisor-header-title .text-caption {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.guest-login-btn {
  flex: 0 0 auto;
  min-width: 0;
  padding-left: 8px;
  padding-right: 8px;
  white-space: nowrap;
}

.guest-login-btn :deep(.q-btn__content) {
  flex-wrap: nowrap;
  white-space: nowrap;
}

.messages-area {
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.message-row {
  gap: 4px;
}

.ai-message-stack {
  align-items: flex-start;
}

.input-area {
  flex-shrink: 0;
  overflow-x: hidden;
}

.input-row {
  gap: 8px;
  min-width: 0;
  width: 100%;
}

.input-row :deep(.q-field) {
  min-width: 0;
}

.send-btn {
  flex: 0 0 auto;
}

.messages-area .full-height {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.user-bubble {
  display: inline-block;
  background: #7B2FBE;
  color: white;
  border-radius: 18px 18px 4px 18px;
  max-width: 75%;
  width: fit-content;
  font-size: 14px;
  line-height: 1.5;
  box-sizing: border-box;
  white-space: normal;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.ai-bubble {
  display: inline-block;
  background: white;
  color: #1A1A2E;
  border-radius: 18px 18px 18px 4px;
  max-width: 75%;
  width: fit-content;
  font-size: 14px;
  line-height: 1.5;
  box-sizing: border-box;
  white-space: normal;
  overflow-wrap: anywhere;
  word-break: break-word;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
}

.ai-bubble-loading {
  width: auto;
  max-width: max-content;
}

.message-audio-btn {
  margin-left: 6px;
}

.ai-bubble :deep(.ai-message-heading) {
  margin: 0 0 6px;
  font-size: 15px;
  line-height: 1.35;
  font-weight: 700;
}

.ai-bubble :deep(h1.ai-message-heading) {
  font-size: 17px;
}

.ai-bubble :deep(h2.ai-message-heading) {
  font-size: 16px;
}

.ai-bubble :deep(.ai-message-paragraph) {
  margin: 0 0 8px;
}

.ai-bubble :deep(.ai-message-paragraph:last-child),
.ai-bubble :deep(.ai-message-list:last-child),
.ai-bubble :deep(.ai-message-heading:last-child) {
  margin-bottom: 0;
}

.ai-bubble :deep(.ai-message-list) {
  margin: 0 0 8px;
  padding-left: 18px;
}

.ai-bubble :deep(.ai-message-list li + li) {
  margin-top: 4px;
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

.history-modal-card {
  width: min(640px, 100vw);
  border-top-left-radius: 18px;
  border-top-right-radius: 18px;
}

.login-modal-card {
  width: min(420px, calc(100vw - 32px));
  border-radius: 18px;
}

/* Phase label */
.phase-wrapper {
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  white-space: nowrap;
}

.phase-label {
  font-size: 12px;
  color: #9C59D1;
  font-style: italic;
  white-space: nowrap;
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
