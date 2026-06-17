'use strict'
const { UserSession } = require('../models')

class UserSessionRepository {
  async create(data) {
    return UserSession.create(data)
  }

  async findActiveBySessionId(sessionId) {
    return UserSession.findOne({
      where: {
        session_id: sessionId,
        revoked_at: null
      }
    })
  }

  async replaceRefreshToken(sessionId, refreshTokenHash, expiresAt) {
    await UserSession.update(
      {
        refresh_token_hash: refreshTokenHash,
        expires_at: expiresAt,
        last_used_at: new Date()
      },
      { where: { session_id: sessionId, revoked_at: null } }
    )

    return this.findActiveBySessionId(sessionId)
  }

  async revokeSession(sessionId) {
    await UserSession.update(
      { revoked_at: new Date() },
      { where: { session_id: sessionId, revoked_at: null } }
    )
  }

  async revokeAllForUser(userId) {
    await UserSession.update(
      { revoked_at: new Date() },
      { where: { user_id: userId, revoked_at: null } }
    )
  }
}

module.exports = new UserSessionRepository()
