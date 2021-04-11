const l = require('./log')('file/index')
const { terminate, E, isError } = require('./err')
const { objectContainsArray } = require('./helpers')

const fileTypes = {
  'wv': {
    extension: 'wv',
    distinctives: {
      properties: ['series']
    }
  },
  'vs': {
    extension: 'vs',
    distinctives: {
      properties: ['length','width','motor','berth','sail']
    }
  }
}

// fs.readFile doesn't use Promises by default but instead callbacks. We wrap
// the calls to fs.readFile and fs.writeFile in Promises, resolving errors if
// they occur and thereby allowing fs.readFile and fs.writeFile to work with
// our particular usage of the async/await lanaguage feature.

const fs = require('fs')

const read = filename => new Promise(function(resolve, reject) {
  fs.readFile(filename, "utf8", (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        return resolve(E('read tried to read a file but it was missing'))
      } else return resolve(E('read tried to read a file and failed for some reason other than it was missing'))
    } else return resolve(JSON.parse(data))
  })
})

const write = (filename, data) => new Promise(function(resolve, reject) {
  fs.writeFile(filename, JSON.stringify(data), function (err) {
    if (err) {
      return resolve(err)
    } else return resolve(true)
  })
})

// Now, fs.readFile and fs.writeFile are wrapped in Promises and we can use them
// as though they were writen for async/await-style programming.

// =============================================================================
//    File Handling
// =============================================================================

const extensionCheck = (filename, type) => {
  const split = filename.split('.')
  const extension = split[split.length - 2]
  if (extension === undefined) return false
  const allExtensions = Object.keys(fileTypes)
  if (!allExtensions.includes(extension)) return false
  if (extension !== type) return false
  return true
}

async function readFileλ (type) {
  if (type == undefined) return E('readFileλ requires an argument; a type string for the type of file being read')
  const requestedSchema = fileTypes[type]
  if (requestedSchema == undefined) return E('readFileλ was passed a type string which does not refer to a known file type schema')

  async function readFile (filename) {
    if (filename == undefined) return E('readFile requires an argument; a filename to read from disk')
    const filenameHasCorrectExension = extensionCheck(filename, type)
    if (!filenameHasCorrectExension) return E('readFile was passed a filename which does not contain a valid extension')
    const schema = fileTypes[type]
    const fileData = await read(filename)
    if (isError(fileData)) return fileData
    const correct = objectContainsArray(schema.distinctives.properties, fileData)
    if (!correct) return E('readFile encountered a schema error')
    return fileData
  }
  return readFile
}

async function writeFileλ (type) {
  if (type == undefined) return E('writeFileλ requires an argument; a type string for the type of file being written')
  const requestedSchema = fileTypes[type]
  if (requestedSchema == undefined) return E('writeFileλ was passed a type string which does not refer to a known file type schema')

  async function writeFile (filename, data) {
    if (filename == undefined || data == undefined) return E('writeFile requires two arguments; a filename and a data object')
    const filenameHasCorrectExension = extensionCheck(filename, type)
    if (!filenameHasCorrectExension) return E('writeFile was passed a filename which does not contain a valid extension')
    const schema = fileTypes[type]
    const correct = objectContainsArray(schema.distinctives.properties, data)
    if (!correct) return E('writeFile encountered a schema error')
    const written = await write(filename, data)
    if (isError(written)) return written
    return written
  }
  return writeFile
}

module.exports = { read, write, extensionCheck, readFileλ, writeFileλ }
