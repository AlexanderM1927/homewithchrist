import ApiService from 'src/boot/api'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8004/api'

/**
 * ChatService — encapsula las llamadas HTTP al bot consejero.
 */
class ChatService extends ApiService {
  constructor () {
    super('/bot')
  }

  async getRecentChats (limit = 10) {
    return this.get(`/chats?limit=${limit}`)
  }

  async getChat (chatId) {
    return this.get(`/chats/${chatId}`)
  }

  async shareChat (chatId) {
    return this.post(`/chats/${chatId}/share`)
  }

  async getSharedChat (token) {
    return this.get(`/shared-chats/${encodeURIComponent(token)}`)
  }

  /**
   * Envía un prompt y recibe la respuesta token a token via SSE.
   * @param {string} prompt - Mensaje actual del usuario
   * @param {(token: string, done: boolean, phase: string|null) => void} onToken
   * @returns {Promise<void>}
   */
  async chatStream (prompt, onToken, chatId = null, onMeta = null) {
    const { useAuthStore } = await import('src/stores/auth')
    const authStore = useAuthStore()

    const headers = { 'Content-Type': 'application/json' }
    if (authStore.accessToken) {
      headers['Authorization'] = `Bearer ${authStore.accessToken}`
    }

    return this._stream(`${BASE_URL}/bot/chat`, { prompt, chatId }, headers, onToken, onMeta)
  }

  async guestChatStream (prompt, onToken) {
    return this._stream(
      `${BASE_URL}/bot/guest-chat`,
      { prompt },
      { 'Content-Type': 'application/json' },
      onToken
    )
  }

  async _stream (url, body, headers, onToken, onMeta = null) {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      if (data.code === 'GUEST_TRIAL_USED') {
        throw new Error('guest_trial_used')
      }
      throw new Error('Error al conectar con el consejero')
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      buffer += decoder.decode(value || new Uint8Array(), { stream: !done })

      const lines = buffer.split('\n')
      buffer = done ? '' : lines.pop()

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue
        let json
        try {
          json = JSON.parse(line.slice(6))
        } catch {
          console.log('No se pudo parsear el token recibido:', line)
          continue
        }

        if (json.error) {
          throw new Error(json.error === 'unavailable' ? 'unavailable' : json.error)
        }
        if (json.chatId) {
          onMeta?.({ chatId: json.chatId, title: json.title || '' })
          continue
        }
        if (json.phase) { onToken('', false, json.phase); continue }
        onToken(json.token ?? '', json.done ?? false, null)
      }

      if (done) break
    }
  }
}

export default new ChatService()
