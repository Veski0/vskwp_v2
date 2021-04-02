// ----------------------------------------------------------- Require and Setup

const inspect = require('util').inspect
const fs = require('fs')

// ---------------------------------------------------------------- Strip String

const _strip = (str, max = 24) => {
  if (str.length < max) {
    let addon = ''
    for (let i = 0; i < max - str.length; i++) addon += ' '
    return str + addon
  } else if (str.length === max) {
    return str
  } else if (str.length > max) {
    return str.substring(0, max)
  }
}

// --------------------------------------------------------------------- Printer

const _printer = (mark, named) => (...o) => {
  const msg = o.shift()
  const p = []
  for (const [index, obj] of o.entries()) {
    // If this is not the last object, then we need to add a joining symbol.
    const trailingString = o.length - (index + 1) === 0
      ? ''
      : `${typeof obj === 'string' ? ':' : ','} `
    // Objects need to be inspected, strings and numbers do not.
    const element = (typeof obj === 'string' || typeof obj === 'number')
      ? `${obj}${trailingString}`
      : `${inspect(obj, {depth: null})}${trailingString}`
    p.push(element)
  }
  const objects = p.join()
  const text = `${named}${mark} ${msg}${o.length > 0 ? ': ' : ''}${objects}`
  console.log(text)
}

// ----------------------------------------------------------- Revealed Function

const log = name => {
  const newName = _strip(name)
  return {
    log: _printer('::', newName),
    err: _printer('!!', newName),
    par: _printer('λ!', newName)
  }
}

module.exports = log
