const express = require('express')
const cors = require('cors')

const app = express()

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
  res.json({ message: 'Backend Express funcionando' })
})

app.listen(8004, '0.0.0.0', () => {
  console.log('Backend corriendo en http://localhost:8004')
})