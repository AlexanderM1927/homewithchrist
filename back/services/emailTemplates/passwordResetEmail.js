'use strict'

const { escapeHtml } = require('./helpers')

const SUPPORT_EMAIL = 'admin@alexanderm.co'

function passwordResetEmail({ user, resetUrl }) {
  const isEnglish = user.preferred_locale === 'en-US'
  return isEnglish
    ? englishPasswordResetEmail({ user, resetUrl })
    : spanishPasswordResetEmail({ user, resetUrl })
}

function englishPasswordResetEmail({ user, resetUrl }) {
  const safeName = escapeHtml(user.name)
  const safeResetUrl = escapeHtml(resetUrl)

  return {
    subject: 'Reset your Home With Christ PIN',
    text: [
      `Hello ${user.name},`,
      '',
      'We received a request to reset your Home With Christ PIN.',
      `Open this link to create a new 4-digit PIN: ${resetUrl}`,
      '',
      'This link expires in 20 minutes. If you did not request this change, you can ignore this email.',
      `For support, write to ${SUPPORT_EMAIL}.`
    ].join('\n'),
    html: `
      <p>Hello ${safeName},</p>
      <p>We received a request to reset your Home With Christ PIN.</p>
      <p><a href="${safeResetUrl}">Create a new 4-digit PIN</a></p>
      <p>This link expires in 20 minutes. If you did not request this change, you can ignore this email.</p>
      <p>For support, write to <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a>.</p>
    `
  }
}

function spanishPasswordResetEmail({ user, resetUrl }) {
  const safeName = escapeHtml(user.name)
  const safeResetUrl = escapeHtml(resetUrl)

  return {
    subject: 'Recupera tu clave de Home With Christ',
    text: [
      `Hola ${user.name},`,
      '',
      'Recibimos una solicitud para recuperar tu clave de Home With Christ.',
      `Abre este enlace para crear una nueva clave de 4 digitos: ${resetUrl}`,
      '',
      'Este enlace vence en 20 minutos. Si no solicitaste este cambio, puedes ignorar este correo.',
      `Para soporte, escribe a ${SUPPORT_EMAIL}.`
    ].join('\n'),
    html: `
      <p>Hola ${safeName},</p>
      <p>Recibimos una solicitud para recuperar tu clave de Home With Christ.</p>
      <p><a href="${safeResetUrl}">Crear una nueva clave de 4 digitos</a></p>
      <p>Este enlace vence en 20 minutos. Si no solicitaste este cambio, puedes ignorar este correo.</p>
      <p>Para soporte, escribe a <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a>.</p>
    `
  }
}

module.exports = passwordResetEmail
