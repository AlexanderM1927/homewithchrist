require('dotenv').config()

const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')

const authRoutes = require('./routes/auth')

const app = express()

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:9000']

app.use(cors({
  origin: allowedOrigins,
  credentials: true // necesario para enviar/recibir cookies
}))
app.use(express.json())
app.use(cookieParser())

app.use('/api/auth', authRoutes)

app.get('/', async (req, res) => {
  const ollamaUrl = process.env.OLLAMA_URL
  const response = await fetch(`${ollamaUrl}/api/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gemma3',
      prompt: req.query.prompt,
      stream: false
    })
  })
  const data = await response.json()
  res.json({ message: 'Backend Express funcionando', data })
})

const PORT = process.env.PORT || 8004

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend corriendo en http://localhost:${PORT}`)
})