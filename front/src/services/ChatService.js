import ApiService from 'src/boot/api'

/**
 * ChatService — encapsula las llamadas HTTP al bot consejero.
 */
class ChatService extends ApiService {
  constructor () {
    super('/bot')
  }

  /**
   * Envía un prompt al consejero y devuelve la respuesta del modelo.
   * @param {string} prompt
   * @returns {Promise<{ message: string, data: { response: string } }>}
   */
  chat (prompt) {
    return this.post('/chat', { prompt })
  }
}

export default new ChatService()
