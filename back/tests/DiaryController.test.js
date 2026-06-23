'use strict'
const test = require('node:test')
const assert = require('node:assert/strict')
const path = require('path')

const controllerPath = path.resolve(__dirname, '../controllers/DiaryController.js')
const repoPath = path.resolve(__dirname, '../repositories/DiaryRepository.js')
const sharpPath = require.resolve('sharp')

function createResponse() {
  return {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code
      return this
    },
    json(payload) {
      this.body = payload
      return this
    },
    setHeader() {}
  }
}

function loadController({ repoMock, sharpMock, fsUnlinkMock }) {
  delete require.cache[controllerPath]
  delete require.cache[repoPath]
  delete require.cache[sharpPath]

  require.cache[repoPath] = {
    id: repoPath,
    filename: repoPath,
    loaded: true,
    exports: repoMock
  }

  require.cache[sharpPath] = {
    id: sharpPath,
    filename: sharpPath,
    loaded: true,
    exports: sharpMock
  }

  const fs = require('fs')
  const originalUnlink = fs.unlink
  fs.unlink = fsUnlinkMock

  const controller = require(controllerPath)

  return {
    controller,
    restore() {
      fs.unlink = originalUnlink
      delete require.cache[controllerPath]
      delete require.cache[repoPath]
      delete require.cache[sharpPath]
    }
  }
}

test('create converts uploaded image to webp before persisting', async () => {
  const createdEntries = []
  const repoMock = {
    create: async data => {
      createdEntries.push(data)
      return { diary_entry_id: 1, ...data }
    }
  }

  const fsCalls = []
  const sharpMock = inputPath => {
    assert.equal(inputPath, '/tmp/upload.jpg')
    return {
      rotate() { return this },
      resize() { return this },
      webp() { return this },
      toFile: async outputPath => {
        assert.match(outputPath, /-optimized\.webp$/)
      }
    }
  }

  const { controller, restore } = loadController({
    repoMock,
    sharpMock,
    fsUnlinkMock: (filePath, callback) => {
      fsCalls.push(filePath)
      if (callback) callback(null)
    }
  })

  try {
    const req = {
      body: { title: 'Titulo', content: 'Contenido' },
      file: { filename: 'photo.jpg', path: '/tmp/upload.jpg' },
      user: { sub: 7 }
    }
    const res = createResponse()

    await controller.create(req, res)

    assert.equal(res.statusCode, 201)
    assert.equal(createdEntries.length, 1)
    assert.equal(createdEntries[0].imagePath, '/uploads/photo-optimized.webp')
    assert.deepEqual(fsCalls, [path.join(process.cwd(), 'public', 'uploads', 'photo.jpg')])
  } finally {
    restore()
  }
})

test('create cleans partial output when webp conversion fails', async () => {
  const repoMock = {
    create: async () => {
      throw new Error('should not create')
    }
  }

  const fsCalls = []
  const sharpMock = () => ({
    rotate() { return this },
    resize() { return this },
    webp() { return this },
    toFile: async () => {
      throw new Error('conversion failed')
    }
  })

  const { controller, restore } = loadController({
    repoMock,
    sharpMock,
    fsUnlinkMock: (filePath, callback) => {
      fsCalls.push(filePath)
      if (callback) callback(null)
    }
  })

  try {
    const req = {
      body: { title: 'Titulo', content: 'Contenido' },
      file: { filename: 'photo.jpg', path: '/tmp/upload.jpg' },
      user: { sub: 7 }
    }
    const res = createResponse()

    await controller.create(req, res)

    assert.equal(res.statusCode, 500)
    assert.equal(res.body.message, 'No se pudo procesar la imagen')
    assert.deepEqual(fsCalls, [
      '/tmp/photo-optimized.webp',
      path.join(process.cwd(), 'public', 'uploads', 'photo.jpg'),
      path.join(process.cwd(), 'public', 'uploads', 'photo.jpg')
    ])
  } finally {
    restore()
  }
})

test('update uses the loaded entry instance and removes previous image after successful save', async () => {
  let findCalls = 0
  const entry = {
    image_path: '/uploads/old.webp',
    saveCalls: 0,
    async save() {
      this.saveCalls += 1
      return this
    }
  }

  const repoMock = {
    findByIdAndUser: async () => {
      findCalls += 1
      return entry
    },
    updateEntry: async (receivedEntry, data) => {
      assert.equal(receivedEntry, entry)
      receivedEntry.title = data.title || null
      receivedEntry.content = data.content
      receivedEntry.image_path = data.imagePath
      return receivedEntry.save()
    }
  }

  const fsCalls = []
  const sharpMock = () => ({
    rotate() { return this },
    resize() { return this },
    webp() { return this },
    toFile: async () => {}
  })

  const { controller, restore } = loadController({
    repoMock,
    sharpMock,
    fsUnlinkMock: (filePath, callback) => {
      fsCalls.push(filePath)
      if (callback) callback(null)
    }
  })

  try {
    const req = {
      params: { id: '4' },
      body: { title: 'Nuevo', content: 'Actualizado' },
      file: { filename: 'fresh.png', path: '/tmp/fresh.png' },
      user: { sub: 9 }
    }
    const res = createResponse()

    await controller.update(req, res)

    assert.equal(res.statusCode, 200)
    assert.equal(findCalls, 1)
    assert.equal(entry.saveCalls, 1)
    assert.equal(entry.image_path, '/uploads/fresh-optimized.webp')
    assert.deepEqual(fsCalls, [
      path.join(process.cwd(), 'public', 'uploads', 'fresh.png'),
      path.join(process.cwd(), 'public', 'uploads', 'old.webp')
    ])
  } finally {
    restore()
  }
})

test('update cleans converted image when save fails', async () => {
  const entry = {
    image_path: '/uploads/old.webp',
    async save() {
      throw new Error('db failed')
    }
  }

  const repoMock = {
    findByIdAndUser: async () => entry,
    updateEntry: async (receivedEntry, data) => {
      receivedEntry.title = data.title || null
      receivedEntry.content = data.content
      receivedEntry.image_path = data.imagePath
      return receivedEntry.save()
    }
  }

  const fsCalls = []
  const sharpMock = () => ({
    rotate() { return this },
    resize() { return this },
    webp() { return this },
    toFile: async () => {}
  })

  const { controller, restore } = loadController({
    repoMock,
    sharpMock,
    fsUnlinkMock: (filePath, callback) => {
      fsCalls.push(filePath)
      if (callback) callback(null)
    }
  })

  try {
    const req = {
      params: { id: '4' },
      body: { title: 'Nuevo', content: 'Actualizado' },
      file: { filename: 'fresh.png', path: '/tmp/fresh.png' },
      user: { sub: 9 }
    }
    const res = createResponse()

    await controller.update(req, res)

    assert.equal(res.statusCode, 500)
    assert.equal(res.body.message, 'db failed')
    assert.deepEqual(fsCalls, [
      path.join(process.cwd(), 'public', 'uploads', 'fresh.png'),
      path.join(process.cwd(), 'public', 'uploads', 'fresh-optimized.webp')
    ])
  } finally {
    restore()
  }
})
