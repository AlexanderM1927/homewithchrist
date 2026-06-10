'use strict'
const bibleService = require('../services/BibleService')
const { sequelize } = require('../models')

async function main() {
  const args = parseArgs(process.argv.slice(2))
  const result = await bibleService.generateMissingEmbeddings({
    version: args.version || null,
    limit: args.limit ? Number(args.limit) : null
  })

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
