'use strict'
const OllamaProvider = require('./OllamaProvider')
const OpenAIProvider = require('./OpenAIProvider')
const HybridProvider = require('./HybridProvider')

function createAIProvider() {
  const provider = (process.env.AI_PROVIDER || 'ollama').toLowerCase()

  if (provider === 'ollama') {
    return new OllamaProvider()
  }

  if (provider === 'openai') {
    return new OpenAIProvider()
  }

  if (provider === 'hybrid') {
    return new HybridProvider()
  }

  throw new Error(`Proveedor de IA no soportado: ${provider}`)
}

module.exports = createAIProvider()
