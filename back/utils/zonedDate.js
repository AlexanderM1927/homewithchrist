'use strict'

const DEFAULT_TIME_ZONE = 'America/Bogota'

function getZonedDateTime(timeZone = DEFAULT_TIME_ZONE, date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23'
  }).formatToParts(date)

  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]))
  return {
    date: `${values.year}-${values.month}-${values.day}`,
    hour: Number(values.hour),
    minute: Number(values.minute)
  }
}

module.exports = {
  DEFAULT_TIME_ZONE,
  getZonedDateTime
}
