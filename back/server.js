const express = require('express')
const cors = require('cors')
require('dotenv').config()

const app = express()

app.use(cors())
app.use(express.json())

app.get('/', async (req, res) => {
  const ollamaUrl = process.env.OLLAMA_URL

  const response = await fetch(`${ollamaUrl}/api/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gemma3',
      prompt: 'Hola, puedes decirme un versiculo biblico hoy?',
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