const tape = require('tape')
const { isError } = require('../library/err')
const { read, write, extensionCheck, readFileλ, writeFileλ } = require('../library/file')

// =============================================================================
//    File Handling
// =============================================================================


tape('[Function: extensionCheck] returns false if filename does not have the schema *.<extension>.*', async function (t) {
  t.plan(1)
  const result = extensionCheck('thing.no', 'no')
  t.equals(isError(result), false)
})
tape('[Function: extensionCheck] returns false if filename does not have a recognised extension', async function (t) {
  t.plan(1)
  const result = extensionCheck('thing.no.json', 'wv')
  t.equals(isError(result), false)
})
tape('[Function: extensionCheck] returns false if filename extension does not match the input type', async function (t) {
  t.plan(1)
  const result = extensionCheck('thing.vs.json', 'wv')
  t.equals(isError(result), false)
})
tape('[Function: extensionCheck] returns true if filename is valid', async function (t) {
  t.plan(1)
  const result = extensionCheck('thing.wv.json', 'wv')
  t.equals(result, true)
})


tape('[Function: readFileλ] returns an Error if not given an argument', async function (t) {
  t.plan(1)
  const result = await readFileλ()
  t.equals(isError(result), true)
})
tape('[Function: readFileλ] returns an Error if provided an invalid type', async function (t) {
  t.plan(1)
  const result = await readFileλ('wrong')
  t.equals(isError(result), true)
})
tape('[Function: readFileλ] returns a curried function', async function (t) {
  t.plan(1)
  const result = await readFileλ('wv')
  t.equals(typeof result === 'function', true)
})
tape('[Function: readFile] returns an Error if not given an argument', async function (t) {
  t.plan(1)
  const readFile = await readFileλ('vs')
  const result = await readFile()
  t.equals(isError(result), true)
})
tape('[Function: readFile] returns an Error if the requested file does not contain a valid extension', async function (t) {
  t.plan(1)
  const readFile = await readFileλ('wv')
  const result = await readFile('nothing.jab.json')
  t.equals(isError(result), true)
})
tape('[Function: readFile] returns an Error if the requested filename contains an extension which does not match the given type', async function (t) {
  t.plan(1)
  const readFile = await readFileλ('wv')
  const result = await readFile('nothing.vs.json')
  t.equals(isError(result), true)
})
tape('[Function: readFile] returns an Error if the requested file does not exist', async function (t) {
  t.plan(1)
  const readFile = await readFileλ('wv')
  const result = await readFile('nothing.vs.json')
  t.equals(isError(result), true)
})
tape('[Function: readFile] returns an Error if the requested file does not comport to the extension specification', async function (t) {
  const fs = require('fs')
  t.plan(1)
  const testVesselFilename = '../input/test.wv.json'
  const written = await write(testVesselFilename, { junk: 'data' })

  const readFile = await readFileλ('wv')
  const result = await readFile(testVesselFilename)

  t.equals(isError(result), true)
  fs.unlink(testVesselFilename, (err) => {})
})
tape('[Function: readFile] returns a VesselData object if curried with a vs type', async function (t) {
  const fs = require('fs')
  t.plan(1)
  const testVessel = { length: 20, width: 8, motor: 8, berth: 8, sail: 8 }
  const testVesselFilename = '../input/test.vs.json'
  const written = await write(testVesselFilename, testVessel)

  const readFile = await readFileλ('vs')
  const result = await readFile(testVesselFilename)

  t.equals(JSON.stringify(testVessel), JSON.stringify(result))
  fs.unlink(testVesselFilename, (err) => {})
})


tape('[Function: writeFileλ] returns an Error if not given an argument', async function (t) {
  t.plan(1)
  const result = await writeFileλ()
  t.equals(isError(result), true)
})
tape('[Function: writeFileλ] returns an Error if provided an invalid type', async function (t) {
  t.plan(1)
  const result = await writeFileλ('wrong')
  t.equals(isError(result), true)
})
tape('[Function: writeFileλ] returns a curried function', async function (t) {
  t.plan(1)
  const result = await writeFileλ('wv')
  t.equals(typeof result === 'function', true)
})
tape('[Function: writeFile] returns an Error if not given 2 arguments', async function (t) {
  t.plan(1)
  const writeFile = await writeFileλ('vs')
  const result = await writeFile()
  t.equals(isError(result), true)
})
tape('[Function: writeFile] returns an Error if the requested write does not contain a valid extension', async function (t) {
  t.plan(1)
  const writeFile = await writeFileλ('wv')
  const result = await writeFile('../input/test.no.json')
  t.equals(isError(result), true)
})
tape('[Function: writeFile] returns an Error if the data for the requested write does not comport to the extension specification', async function (t) {
  const fs = require('fs')
  t.plan(1)

  const writeFile = await writeFileλ('wv')
  const result = await writeFile('../input/temp.wv.json', { some: 'data' })

  t.equals(isError(result), true)
})
tape('[Function: writeFile] Should write a file if provided a valid filename and valid data', async function (t) {
  const fs = require('fs')
  t.plan(1)
  const testVessel = { length: 20, width: 8, motor: 8, berth: 8, sail: 8 }
  const testVesselFilename = '../input/test.vs.json'

  const writeFile = await writeFileλ('vs')
  const written = await writeFile(testVesselFilename, testVessel)

  const exists = () => new Promise(function(resolve, reject) {
    fs.exists(testVesselFilename, (e) => {
      if (e) {
        fs.unlink(testVesselFilename, (err) => {
          resolve(true)
        })
      } else {
        resolve(false)
      }
    })
  });

  const result = await exists()

  t.equals(result, true)
})
