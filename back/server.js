require('dotenv').config()

const path = require('path')
const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')

const authRoutes = require('./routes/auth')
const botRoutes = require('./routes/bot')
const trainingRoutes = require('./routes/training')
const diaryRoutes = require('./routes/diary')
const bibleRoutes = require('./routes/bible')
const dailyVerseRoutes = require('./routes/dailyVerse')
const trainingReflectionRoutes = require('./routes/trainingReflection')

const app = express()
const publicDir = path.join(process.cwd(), 'public')

const isProduction = process.env.NODE_ENV === 'production'

if (isProduction) {
  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : []

  app.use(cors({
    origin: allowedOrigins,
    credentials: true // necesario para enviar/recibir cookies
  }))
} else {
  app.use(cors({ origin: true, credentials: true }))
}
app.use(express.json())
app.use(cookieParser())

app.use('/api/auth', authRoutes)
app.use('/api/bot', botRoutes)
app.use('/api/training', trainingRoutes)
app.use('/api/diary', diaryRoutes)
app.use('/api/bible', bibleRoutes)
app.use('/api/daily-verses', dailyVerseRoutes)
app.use('/api/training-reflections', trainingReflectionRoutes)

app.use(express.static(publicDir, {
  setHeaders: (res, filePath) => {
    const fileName = path.basename(filePath)

    if (['index.html', 'version.json', 'sw.js', 'service-worker.js'].includes(fileName)) {
      res.setHeader('Cache-Control', 'no-store')
      return
    }

    if (filePath.includes(`${path.sep}assets${path.sep}`)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
    }
  }
}))

app.get('/{*path}', (req, res) => {
  res.setHeader('Cache-Control', 'no-store')
  res.sendFile(path.join(publicDir, 'index.html'))
})

const PORT = process.env.PORT || 8004

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend corriendo en http://localhost:${PORT}`)
})
