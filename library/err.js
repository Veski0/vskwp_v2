const terminate = s => { console.trace(s); process.exit(-1) }

const E = s => new Error(s)
const isError = e => e instanceof Error

const topLevelError = e => {
  console.log(`An error occurred that could not be recovered from: ${e.message}`)
  process.exit(-1)
}
const topLevelErrorCheck = e => {
  if (isError(e)) return topLevelError(e)
}

module.exports = { terminate, E, isError, topLevelError, topLevelErrorCheck }
