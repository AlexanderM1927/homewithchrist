import ApiService from 'src/boot/api'

class DailyVerseService extends ApiService {
  constructor() {
    super('/daily-verses')
  }

  getToday(options) {
    return this.get('/today', options)
  }

  getVerses({ page = 1, limit = 20, search = '', createdBy = null } = {}, options) {
    const params = new URLSearchParams({ page, limit })
    const trimmedSearch = search.trim()
    if (trimmedSearch) params.set('search', trimmedSearch)
    if (createdBy) params.set('createdBy', createdBy)

    return this.get(`/?${params.toString()}`, options)
  }

  createVerse(payload) {
    return this.post('/', payload)
  }

  deleteVerse(id) {
    return this.delete(`/${id}`)
  }
}

export default new DailyVerseService()
