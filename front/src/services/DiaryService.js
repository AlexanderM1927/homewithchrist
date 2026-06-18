import ApiService from 'src/boot/api'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8004/api'
const ASSET_URL = API_URL.replace(/\/api\/?$/, '')

class DiaryService extends ApiService {
  constructor() {
    super('/diary')
  }

  getEntries(page = 1, options) {
    return this.get(`/?page=${page}`, options)
  }

  getEntry(entryId, options) {
    return this.get(`/${entryId}`, options)
  }

  shareEntry(entryId) {
    return this.post(`/${entryId}/share`)
  }

  getSharedEntry(token) {
    return this.get(`/shared/${encodeURIComponent(token)}`)
  }

  createEntry(payload) {
    return this.post('/', this._buildPayload(payload))
  }

  updateEntry(entryId, payload) {
    return this.put(`/${entryId}`, this._buildPayload(payload))
  }

  deleteEntry(entryId) {
    return this.delete(`/${entryId}`)
  }

  getImageUrl(path) {
    if (!path) return ''
    if (/^https?:\/\//.test(path)) return path
    return `${ASSET_URL}${path}`
  }

  _buildPayload(payload) {
    if (!payload.image) return payload

    const formData = new FormData()
    formData.append('title', payload.title || '')
    formData.append('content', payload.content || '')
    formData.append('image', payload.image)
    return formData
  }
}

export default new DiaryService()
