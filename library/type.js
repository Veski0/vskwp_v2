// ----------------------------------------------------------- Require and Setup

const _ = require('./fn')

// --------------------------------------------------------------- Type Checking

const isUndefined   = u => typeof u === 'undefined'
const isBoolean     = b => typeof b === 'boolean'
const isNumber      = n => typeof n === 'number'
const isString      = s => typeof s === 'string'
const isFunction    = f => typeof f === 'function'
const isObject      = o => typeof o === 'object'

const isList        = l => Array.isArray(l)
const isPair        = l => isList(l) && l.length === 2
const isChar        = c => isString(c) && c.length === 1
const isInt         = i => Number.isInteger(i)
const isTokens      = t => Array.isArray(t)
                            && t.filter(a => isString(a)).length === t.length

const isRemainder   = r => isString(r)
const isFailure     = r => isString(r)
const isSuccess     = s => isPair(s)

const isResult      = r => isSuccess(r) || isFailure(r)
const isState       = s => isPair(s) && isTokens(_.head(s)) && isInt(_.tail(s))

module.exports = {
  isUndefined,
  isBoolean,
  isNumber,
  isString,
  isFunction,
  isObject,
  isList,
  isPair,
  isChar,
  isInt,
  isTokens,
  isRemainder,
  isFailure,
  isSuccess,
  isResult,
  isState
}
