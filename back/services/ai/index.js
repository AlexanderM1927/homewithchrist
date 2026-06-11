'use strict'
const OllamaProvider = require('./OllamaProvider')
const OpenAIProvider = require('./OpenAIProvider')

function createAIProvider() {
  const provider = (process.env.AI_PROVIDER || 'ollama').toLowerCase()

  if (provider === 'ollama') {
    return new OllamaProvider()
  }

  if (provider === 'openai') {
    return new OpenAIProvider()
  }

  throw new Error(`Proveedor de IA no soportado: ${provider}`)
}

module.exports = createAIProvider()
