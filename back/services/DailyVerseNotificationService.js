'use strict'
const dailyVerseRepository = require('../repositories/DailyVerseRepository')
const pushNotificationRepository = require('../repositories/PushNotificationRepository')
const firebasePushService = require('./FirebasePushService')
const { DEFAULT_TIME_ZONE, getZonedDateTime } = require('../utils/zonedDate')

const POLL_INTERVAL_MS = 60 * 1000
const DEFAULT_HOUR = 8
const DEFAULT_MAX_ATTEMPTS = 5
const DEFAULT_RETRY_BASE_MINUTES = 5

function getPositiveInteger(value, fallback) {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback
}

function getSchedule() {
  const hour = Number(process.env.DAILY_VERSE_NOTIFICATION_HOUR ?? DEFAULT_HOUR)
  const minute = Number(process.env.DAILY_VERSE_NOTIFICATION_MINUTE ?? 0)

  return {
    hour: Number.isInteger(hour) && hour >= 0 && hour <= 23 ? hour : DEFAULT_HOUR,
    minute: Number.isInteger(minute) && minute >= 0 && minute <= 59 ? minute : 0
  }
}

class DailyVerseNotificationService {
  constructor() {
    this.timer = null
    this.running = false
  }

  start() {
    if (this.timer || !firebasePushService.isConfigured()) return

    const timeZone = process.env.DAILY_VERSE_NOTIFICATION_TIME_ZONE || DEFAULT_TIME_ZONE
    const schedule = getSchedule()
    console.log(`Notificaciones del versiculo programadas a las ${String(schedule.hour).padStart(2, '0')}:${String(schedule.minute).padStart(2, '0')} (${timeZone})`)

    setTimeout(() => this.runIfDue(), 5000)
    this.timer = setInterval(() => this.runIfDue(), POLL_INTERVAL_MS)
  }

  async runIfDue() {
    if (this.running) return

    const timeZone = process.env.DAILY_VERSE_NOTIFICATION_TIME_ZONE || DEFAULT_TIME_ZONE
    const now = getZonedDateTime(timeZone)
    const schedule = getSchedule()
    const currentMinutes = (now.hour * 60) + now.minute
    const scheduledMinutes = (schedule.hour * 60) + schedule.minute

    if (currentMinutes < scheduledMinutes) return

    this.running = true
    try {
      await this.sendForDate(now.date)
    } catch (error) {
      console.error('Error enviando el versiculo diario:', error)
    } finally {
      this.running = false
    }
  }

  async sendForDate(notificationDate) {
    const verse = await dailyVerseRepository.findToday(notificationDate)
    if (!verse) return

    const maxAttempts = getPositiveInteger(
      process.env.DAILY_VERSE_NOTIFICATION_MAX_ATTEMPTS,
      DEFAULT_MAX_ATTEMPTS
    )
    const baseDelayMinutes = getPositiveInteger(
      process.env.DAILY_VERSE_NOTIFICATION_RETRY_BASE_MINUTES,
      DEFAULT_RETRY_BASE_MINUTES
    )
    const tokens = await pushNotificationRepository.findEligibleTokens(notificationDate, maxAttempts)

    for (const pushToken of tokens) {
      const delivery = await pushNotificationRepository.reserveDailyDelivery({
        pushTokenId: pushToken.id,
        dailyVerseId: verse.id,
        notificationDate
      })

      if (!delivery) continue

      try {
        await firebasePushService.sendDailyVerse({
          token: pushToken.token,
          verse,
          locale: pushToken.User?.preferred_locale
        })
        await pushNotificationRepository.markDeliverySent(delivery.id)
      } catch (error) {
        await pushNotificationRepository.markDeliveryFailed(delivery.id, error.message, {
          maxAttempts,
          baseDelayMinutes
        })
        if (firebasePushService.isInvalidTokenError(error)) {
          await pushNotificationRepository.disableById(pushToken.id)
        }
      }
    }
  }
}

module.exports = new DailyVerseNotificationService()
