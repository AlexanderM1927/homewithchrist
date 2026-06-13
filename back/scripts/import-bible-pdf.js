'use strict'
const bibleService = require('../services/BibleService')
const { sequelize } = require('../models')

async function main() {
  const args = parseArgs(process.argv.slice(2))
  const pdfPath = args.path || args.p

  if (!pdfPath) {
    throw new Error('Uso: npm run bible:import -- --path=/ruta/al/archivo.pdf --version=BJ')
  }

  const result = await bibleService.importVersesFromPdf({
    pdfPath,
    version: args.version || 'BJ',
    replace: args.replace === 'true' || args.replace === true
  })

  if (args['replace-version']) {
    result.replacement = await bibleService.replaceImportedVersion({
      sourceVersion: args['replace-version'],
      targetVersion: args.version || 'BJ'
    })
  }

  console.log(JSON.stringify(result, null, 2))
}

function parseArgs(argv) {
  return argv.reduce((result, arg) => {
    const normalized = arg.replace(/^--?/, '')
    const [key, ...valueParts] = normalized.split('=')
    result[key] = valueParts.length > 0 ? valueParts.join('=') : true
    return result
  }, {})
}

main()
  .catch(err => {
    console.error(err.message)
    process.exitCode = 1
  })
  .finally(async () => {
    await sequelize.close()
  })
