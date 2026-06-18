'use strict'
const { applicationDefault, cert, getApps, initializeApp } = require('firebase-admin/app')
const { getMessaging } = require('firebase-admin/messaging')

function parseServiceAccount() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
    const json = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64').toString('utf8')
    return JSON.parse(json)
  }

  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON)
  }

  return null
}

class FirebasePushService {
  constructor() {
    this.app = null
    this.configurationChecked = false
  }

  initialize() {
    if (this.configurationChecked) return this.app
    this.configurationChecked = true

    try {
      const serviceAccount = parseServiceAccount()
      const canUseApplicationDefault = Boolean(process.env.GOOGLE_APPLICATION_CREDENTIALS)

      if (!serviceAccount && !canUseApplicationDefault) {
        console.warn('Firebase push deshabilitado: configura FIREBASE_SERVICE_ACCOUNT_JSON, FIREBASE_SERVICE_ACCOUNT_BASE64 o GOOGLE_APPLICATION_CREDENTIALS')
        return null
      }

      this.app = getApps()[0] || initializeApp({
        credential: serviceAccount ? cert(serviceAccount) : applicationDefault()
      })
      return this.app
    } catch (error) {
      console.error('No se pudo inicializar Firebase Admin:', error.message)
      return null
    }
  }

  isConfigured() {
    return Boolean(this.initialize())
  }

  async sendDailyVerse({ token, verse, locale }) {
    const app = this.initialize()
    if (!app) {
      throw new Error('Firebase Admin no esta configurado')
    }

    const english = String(locale || '').toLowerCase().startsWith('en')
    const title = english ? 'Verse of the day' : 'Versiculo del dia'

    return getMessaging(app).send({
      token,
      notification: {
        title,
        body: `${verse.reference}: ${verse.text}`
      },
      data: {
        type: 'daily_verse',
        route: '/',
        verse_id: String(verse.id)
      },
      android: {
        priority: 'high',
        notification: {
          channelId: 'daily_verse',
          icon: 'ic_launcher',
          color: '#7B2FBE'
        }
      }
    })
  }

  isInvalidTokenError(error) {
    return [
      'messaging/invalid-registration-token',
      'messaging/registration-token-not-registered'
    ].includes(error?.code)
  }
}

module.exports = new FirebasePushService()
