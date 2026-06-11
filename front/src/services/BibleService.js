import ApiService from 'src/boot/api'

class BibleService extends ApiService {
  constructor() {
    super('/bible')
  }

  getVersions() {
    return this.get('/versions')
  }

  getBooks(version) {
    const params = new URLSearchParams()
    if (version) params.set('version', version)
    return this.get(`/books?${params.toString()}`)
  }

  getChapters({ book, version }) {
    const params = new URLSearchParams({ book })
    if (version) params.set('version', version)
    return this.get(`/chapters?${params.toString()}`)
  }

  getVerses({ book, chapter, version }) {
    const params = new URLSearchParams({ book, chapter })
    if (version) params.set('version', version)
    return this.get(`/verses?${params.toString()}`)
  }

  search({ query, version, limit = 30 }) {
    const params = new URLSearchParams({ q: query, limit })
    if (version) params.set('version', version)
    return this.get(`/search?${params.toString()}`)
  }
}

export default new BibleService()
