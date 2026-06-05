'use strict'
const OllamaProvider = require('./OllamaProvider')

function createAIProvider() {
  const provider = (process.env.AI_PROVIDER || 'ollama').toLowerCase()

  if (provider === 'ollama') {
    return new OllamaProvider()
  }

  throw new Error(`Proveedor de IA no soportado: ${provider}`)
}

module.exports = createAIProvider()
