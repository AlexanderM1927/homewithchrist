import ApiService from 'src/boot/api'

class DiaryService extends ApiService {
  constructor() {
    super('/diary')
  }

  getEntries() {
    return this.get('/')
  }

  createEntry(payload) {
    return this.post('/', payload)
  }
}

export default new DiaryService()
