require('dotenv').config()

const path = require('path')
const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')

const authRoutes = require('./routes/auth')
const botRoutes = require('./routes/bot')
const trainingRoutes = require('./routes/training')

const app = express()

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

app.use(express.static(path.join(__dirname, '../public')))

app.get('/{*path}', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'index.html'))
})

const PORT = process.env.PORT || 8004

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend corriendo en http://localhost:${PORT}`)
})