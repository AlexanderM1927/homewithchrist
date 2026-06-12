import ApiService from 'src/boot/api'

class TrainingService extends ApiService {
  constructor() {
    super('/training')
  }

  /** Obtiene todos los temas activos */
  getTopics() {
    return this.get('/topics')
  }

  /**
   * Crea un versículo asociado a un tema.
   * @param {{ topic_id, book, chapter, verse_start, verse_end, reference, text, version, weight, notes }} payload
   */
  createVerse(payload) {
    return this.post('/verses', payload)
  }

  associateVerses(payload) {
    return this.post('/topic-verses', payload)
  }

  updateTopicVerse(id, payload) {
    return this.put(`/topic-verses/${id}`, payload)
  }

  deleteTopicVerse(id) {
    return this.delete(`/topic-verses/${id}`)
  }

  /** Lista versículos paginados */
  getVerses({ page = 1, limit = 20, search = '', createdBy = null } = {}) {
    const params = new URLSearchParams({ page, limit })
    const trimmedSearch = search.trim()
    if (trimmedSearch) params.set('search', trimmedSearch)
    if (createdBy) params.set('createdBy', createdBy)

    return this.get(`/verses?${params.toString()}`)
  }

  getTopicVerses({ page = 1, limit = 20, search = '', createdBy = null } = {}) {
    const params = new URLSearchParams({ page, limit })
    const trimmedSearch = search.trim()
    if (trimmedSearch) params.set('search', trimmedSearch)
    if (createdBy) params.set('createdBy', createdBy)
    return this.get(`/topic-verses?${params.toString()}`)
  }
}

export default new TrainingService()
