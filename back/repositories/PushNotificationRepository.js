'use strict'
const { Op } = require('sequelize')
const {
  PushNotificationToken,
  DailyNotificationDelivery,
  User,
  UserSession
} = require('../models')

class PushNotificationRepository {
  async registerToken({ userId, sessionId, token, platform }) {
    const existing = await PushNotificationToken.findOne({ where: { token } })
    const values = {
      user_id: userId,
      session_id: sessionId,
      platform,
      enabled: true,
      last_seen_at: new Date()
    }

    if (existing) {
      return existing.update(values)
    }

    return PushNotificationToken.create({ ...values, token })
  }

  async disableToken({ userId, token }) {
    return PushNotificationToken.update(
      { enabled: false },
      { where: { user_id: userId, token } }
    )
  }

  async disableById(id) {
    return PushNotificationToken.update(
      { enabled: false },
      { where: { id } }
    )
  }

  async disableForSession(sessionId) {
    return PushNotificationToken.update(
      { enabled: false },
      { where: { session_id: sessionId } }
    )
  }

  async disableForUser(userId) {
    return PushNotificationToken.update(
      { enabled: false },
      { where: { user_id: userId } }
    )
  }

  async findEligibleTokens(notificationDate, maxAttempts = 5) {
    const tokens = await PushNotificationToken.findAll({
      where: {
        enabled: true
      },
      attributes: ['id', 'token', 'platform'],
      include: [
        {
          model: User,
          attributes: ['preferred_locale'],
          required: true
        },
        {
          model: UserSession,
          as: 'session',
          attributes: [],
          required: true,
          where: {
            revoked_at: null,
            expires_at: { [Op.gt]: new Date() }
          }
        },
        {
          model: DailyNotificationDelivery,
          as: 'deliveries',
          attributes: ['id', 'sent_at', 'error_message', 'attempt_count', 'next_retry_at'],
          required: false,
          where: { notification_date: notificationDate }
        }
      ],
      subQuery: false
    })

    return tokens.filter(token => {
      const delivery = token.deliveries?.[0]
      if (!delivery) return true
      if (delivery.sent_at !== null) return false
      if (delivery.attempt_count >= maxAttempts) return false
      return !delivery.next_retry_at || new Date(delivery.next_retry_at).getTime() <= Date.now()
    })
  }

  async reserveDailyDelivery({ pushTokenId, dailyVerseId, notificationDate }) {
    const [delivery] = await DailyNotificationDelivery.findOrCreate({
      where: {
        push_token_id: pushTokenId,
        notification_date: notificationDate
      },
      defaults: {
        daily_verse_id: dailyVerseId
      }
    })

    if (delivery.sent_at) return null

    if (delivery.daily_verse_id !== dailyVerseId) {
      await delivery.update({ daily_verse_id: dailyVerseId })
    }

    return delivery
  }

  async markDeliverySent(id) {
    return DailyNotificationDelivery.update(
      { sent_at: new Date(), error_message: null, next_retry_at: null },
      { where: { id } }
    )
  }

  async markDeliveryFailed(id, errorMessage, { maxAttempts, baseDelayMinutes }) {
    const delivery = await DailyNotificationDelivery.findByPk(id)
    if (!delivery) return null

    const attemptCount = delivery.attempt_count + 1
    const canRetry = attemptCount < maxAttempts
    const delayMinutes = baseDelayMinutes * (2 ** Math.max(0, attemptCount - 1))
    const nextRetryAt = canRetry
      ? new Date(Date.now() + (delayMinutes * 60 * 1000))
      : null

    return delivery.update({
      attempt_count: attemptCount,
      next_retry_at: nextRetryAt,
      error_message: String(errorMessage || 'Error desconocido').slice(0, 500)
    })
  }
}

module.exports = new PushNotificationRepository()
