'use strict'

class ChatController {
  async chat (req, res) {
    const ollamaUrl = process.env.OLLAMA_URL

    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')

    let ollamaResponse
    try {
      ollamaResponse = await fetch(`${ollamaUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gemma3',
          prompt: req.body.prompt,
          stream: true
        })
      })
    } catch (err) {
      res.write(`data: ${JSON.stringify({ error: 'No se pudo conectar con Ollama' })}\n\n`)
      return res.end()
    }

    const reader = ollamaResponse.body.getReader()
    const decoder = new TextDecoder()

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        for (const line of chunk.split('\n').filter(Boolean)) {
          try {
            const json = JSON.parse(line)
            res.write(`data: ${JSON.stringify({ token: json.response, done: json.done })}\n\n`)
          } catch {}
        }
      }
    } finally {
      res.end()
    }
  }
}

module.exports = new ChatController()