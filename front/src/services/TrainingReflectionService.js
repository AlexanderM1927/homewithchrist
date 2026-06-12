import ApiService from 'src/boot/api'

class TrainingReflectionService extends ApiService {
  constructor() {
    super('/training-reflections')
  }

  getReflections({ page = 1, limit = 20, search = '', createdBy = null } = {}) {
    const params = new URLSearchParams({ page, limit })
    const trimmedSearch = search.trim()
    if (trimmedSearch) params.set('search', trimmedSearch)
    if (createdBy) params.set('createdBy', createdBy)
    return this.get(`/?${params.toString()}`)
  }

  createReflection(payload) {
    return this.post('/', payload)
  }

  updateReflection(id, payload) {
    return this.put(`/${id}`, payload)
  }

  deleteReflection(id) {
    return this.delete(`/${id}`)
  }
}

export default new TrainingReflectionService()
