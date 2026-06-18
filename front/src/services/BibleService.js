import ApiService from 'src/boot/api'

class BibleService extends ApiService {
  constructor() {
    super('/bible')
  }

  getVersions(options) {
    return this.get('/versions', options)
  }

  getBooks(version, options) {
    const params = new URLSearchParams()
    if (version) params.set('version', version)
    return this.get(`/books?${params.toString()}`, options)
  }

  getChapters({ book, version }, options) {
    const params = new URLSearchParams({ book })
    if (version) params.set('version', version)
    return this.get(`/chapters?${params.toString()}`, options)
  }

  getVerses({ book, chapter, version }, options) {
    const params = new URLSearchParams({ book, chapter })
    if (version) params.set('version', version)
    return this.get(`/verses?${params.toString()}`, options)
  }

  search({ query, version, limit = 30 }, options) {
    const params = new URLSearchParams({ q: query, limit })
    if (version) params.set('version', version)
    return this.get(`/search?${params.toString()}`, options)
  }
}

export default new BibleService()
