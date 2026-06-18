import ApiService from 'src/boot/api'

class AuthService extends ApiService {
  constructor() {
    super('/auth')
  }

  login(credentials) {
    return this.post('/login', credentials, { _skipRetry: true })
  }

  mobileLogin(credentials) {
    return this.post('/mobile/login', credentials, { _skipRetry: true })
  }

  register(credentials) {
    return this.post('/register', credentials, { _skipRetry: true })
  }

  mobileRegister(credentials) {
    return this.post('/mobile/register', credentials, { _skipRetry: true })
  }

  forgotPassword(data) {
    return this.post('/forgot-password', data, { _skipRetry: true })
  }

  resetPassword(data) {
    return this.post('/reset-password', data, { _skipRetry: true })
  }

  refresh() {
    return this.post('/refresh', undefined, { _skipRetry: true })
  }

  mobileRefresh(refreshToken) {
    return this.post('/mobile/refresh', { refreshToken }, { _skipRetry: true })
  }

  logout() {
    return this.post('/logout', undefined, { _skipRetry: true })
  }

  mobileLogout(refreshToken) {
    return this.post('/mobile/logout', { refreshToken }, { _skipRetry: true })
  }

  updateProfile(data) {
    return this.put('/profile', data)
  }

  changePassword(data) {
    return this.put('/password', data)
  }

  deleteAccount() {
    return this.delete('/account')
  }

  getUsers(options) {
    return this.get('/users', options)
  }

  updateUserRole(userId, roleId) {
    return this.put(`/users/${userId}/role`, { role_id: roleId })
  }

  updateUserContact(userId, data) {
    return this.put(`/users/${userId}/contact`, data)
  }
}

export default new AuthService()
