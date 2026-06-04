import ApiService from 'src/boot/api'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8004/api'

/**
 * ChatService — encapsula las llamadas HTTP al bot consejero.
 */
class ChatService extends ApiService {
  constructor () {
    super('/bot')
  }

  /**
   * Envía un prompt y recibe la respuesta token a token via SSE.
   * @param {string} prompt
   * @param {(token: string, done: boolean) => void} onToken - Callback por cada token recibido
   * @returns {Promise<void>}
   */
  async chatStream (prompt, onToken) {
    const { useAuthStore } = await import('src/stores/auth')
    const authStore = useAuthStore()

    const headers = { 'Content-Type': 'application/json' }
    if (authStore.accessToken) {
      headers['Authorization'] = `Bearer ${authStore.accessToken}`
    }

    const response = await fetch(`${BASE_URL}/bot/chat`, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify({ prompt })
    })

    if (!response.ok) {
      throw new Error('Error al conectar con el consejero')
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value, { stream: true })
      for (const line of chunk.split('\n')) {
        if (!line.startsWith('data: ')) continue
        try {
          const json = JSON.parse(line.slice(6))
          if (json.error) throw new Error(json.error)
          onToken(json.token ?? '', json.done ?? false)
        } catch {}
      }
    }
  }
}

export default new ChatService()
