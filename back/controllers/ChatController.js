'use strict'

class ChatController {
  async chat (req, res) {
    const ollamaUrl = process.env.OLLAMA_URL
    const response = await fetch(`${ollamaUrl}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gemma3',
        prompt: req.body.prompt,
        stream: false
      })
    })
    const data = await response.json()
    res.json({ message: 'Backend Express funcionando', data })
  }
}

module.exports = new ChatController()