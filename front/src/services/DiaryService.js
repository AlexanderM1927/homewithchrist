import ApiService from 'src/boot/api'

class DiaryService extends ApiService {
  constructor() {
    super('/diary')
  }

  getEntries(page = 1) {
    return this.get(`/?page=${page}`)
  }

  getEntry(entryId) {
    return this.get(`/${entryId}`)
  }

  createEntry(payload) {
    return this.post('/', payload)
  }
}

export default new DiaryService()
