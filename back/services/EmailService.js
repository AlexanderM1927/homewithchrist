'use strict'

const nodemailer = require('nodemailer')

const DEFAULT_SENDGRID_HOST = 'smtp.sendgrid.net'
const DEFAULT_SENDGRID_PORT = 587
const DEFAULT_SENDGRID_USER = 'apikey'

function parseBoolean(value, defaultValue = false) {
  if (value === undefined || value === null || value === '') return defaultValue
  return ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase())
}

function parsePort(value) {
  const port = Number(value)
  return Number.isInteger(port) && port > 0 ? port : DEFAULT_SENDGRID_PORT
}

function buildFromAddress() {
  const address = process.env.EMAIL_FROM
  if (!address) return undefined

  const name = process.env.EMAIL_FROM_NAME
  return name ? { name, address } : address
}

class EmailService {
  constructor() {
    this.transporter = null
  }

  getTransporter() {
    if (this.transporter) return this.transporter

    const apiKey = process.env.SENDGRID_API_KEY
    const smtpPass = process.env.SMTP_PASS || apiKey

    if (!smtpPass) {
      const err = new Error('SENDGRID_API_KEY o SMTP_PASS no esta configurado')
      err.status = 500
      throw err
    }

    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || DEFAULT_SENDGRID_HOST,
      port: parsePort(process.env.SMTP_PORT),
      secure: parseBoolean(process.env.SMTP_SECURE, false),
      auth: {
        user: process.env.SMTP_USER || DEFAULT_SENDGRID_USER,
        pass: smtpPass
      }
    })

    return this.transporter
  }

  async verifyConnection() {
    return this.getTransporter().verify()
  }

  /**
   * Envia un email usando SendGrid por SMTP.
   * @param {{ to: string|string[], subject: string, text?: string, html?: string, from?: string|object, replyTo?: string }} message
   */
  async sendMail({ to, subject, text, html, from, replyTo }) {
    if (!to) {
      const err = new Error('El destinatario del email es requerido')
      err.status = 400
      throw err
    }

    if (!subject) {
      const err = new Error('El asunto del email es requerido')
      err.status = 400
      throw err
    }

    if (!text && !html) {
      const err = new Error('El contenido del email es requerido')
      err.status = 400
      throw err
    }

    const fromAddress = from || buildFromAddress()
    if (!fromAddress) {
      const err = new Error('EMAIL_FROM no esta configurado')
      err.status = 500
      throw err
    }

    return this.getTransporter().sendMail({
      from: fromAddress,
      to,
      subject,
      text,
      html,
      replyTo
    })
  }

  async sendText({ to, subject, text, from, replyTo }) {
    return this.sendMail({ to, subject, text, from, replyTo })
  }
}

module.exports = new EmailService()
