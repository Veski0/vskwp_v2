// =============================================================================
//    Parser Combinators
// =============================================================================

const l = require('./log')('parse/index')
const _ = require('./fn')
const t = require('./type')
const { E, isError } = require('./err')

// Parse a regex.
// COMPOSABLE
const parseRegexλ = regex => {
  if (regex == undefined) return E('parseRegexλ requires an argument; a regex')
  const parseRegex = statechain => {
    if (statechain == undefined) return E('parseRegex requires an argument; a statechain')
    console.log(`In parseRegex, prior to composition: ${JSON.stringify(_.last(statechain))}`)
    const { tokens, parsed, index } = _.last(statechain)
    const nextIndex = index + 1
    const nextToken = _.head(tokens)
    if (tokens.length === 0) return E(`Index ${nextIndex}. Expected ${regex}, but got ${nextToken}.`)
    const result = nextToken.match(regex)
    if (result) {
      const remainder = _.tail(tokens)
      const nextState = { tokens: remainder, parsed: nextToken, index: nextIndex }
      return [ ...statechain, nextState ]
    } else {
      return E(`Index ${nextIndex}. Expected ${regex}, but got ${nextToken}.`)
    }
  }
  parseRegex.parses = regex
  return parseRegex
}

// Parse many regexes in a row. Best used with an array of parsers generated
// from a call to parseFromRegexesλ, or for composite tokens.
// COMPOSABLE
const parseMany = (...parsers) => _.composeL(...parsers)

// Parse from a group of regexes. Useful for validation.
// COMPOSABLE
const parseFromRegexesλ = (...regexes) => {
  if (regexes.length === 0) return E('parseFromRegexesλ requires an argument; an array of regexes')
  const parsers = []
  for (const regex of regexes) {
    const parser = parseRegexλ(regex)
    if (isError(parser)) return parser
    parsers.push(parser)
  }
  const parseFromRegexes = (statechain) => {
    if (statechain == undefined) return E('parseFromRegexes requires an argument; a statechain')
    for (const parser of parsers) {
      const result = parser(statechain)
      if (isError(result)) {
        if (result.message === 'parseRegex requires an argument; a statechain') {
          return result
        } else continue
      } else return result
    }
    const { tokens, parsed, index } = _.last(statechain)
    const nextIndex = index + 1
    const nextToken = _.head(tokens)
    return E(`Index ${nextIndex}. Expected one of ${regexes}, but got ${nextToken}.`)
  }
  parseFromRegexes.parses = regexes
  return parseFromRegexes
}

// Parse from a group of parsers. Useful!
// COMPOSABLE
const parseFromλ = (...parsers) => {
  if (parsers.length === 0) return E('parseFromλ requires an argument; an array of parsers')
  const regexes = parsers.map(parser => parser.parses)
  const parseFrom = (statechain) => {
    if (statechain == undefined) return E('parseFrom requires an argument; a statechain')
    for (const parser of parsers) {
      const result = parser(statechain)
      if (isError(result)) {
        if (result.message === 'parseRegex requires an argument; a statechain') {
          return result
        } else continue
      } else return result
    }
    const { tokens, parsed, index } = _.last(statechain)
    const nextIndex = index + 1
    const nextToken = _.head(tokens)
    return E(`Index ${nextIndex}. Expected one of ${regexes}, but got ${nextToken}.`)
  }
  parseFrom.parses = regexes
  return parseFrom
}

const [ P, T, F, $1, $2, $3, S ] = [ /[P]/, /[T]/, /[F]/, /[$1]/, /[$2]/, /[$3]/, /[\s]/ ].map(regex => parseRegexλ(regex))
const [ P1, P2, P3, T1, T2, T3 ] = [ [ P, $1 ], [ P, $2 ], [ P, $3 ], [ T, $1 ], [ T, $2 ], [ T, $3 ] ].map(parserSet => parseMany(...parserSet))
const validateToken = parseFromλ(...[ P1, P2, P3, T1, T2, T3, F, S ])

const statechainA = [{ tokens: 'P2 T1 F', parsed: '', index: 0 }]

const tokenCount = statechainA[0].tokens.split(' ')
const spaces = tokenCount.length - 1
const parses = tokenCount.length + spaces

console.log(`Expecting ${parses} parses`)
const manyValidations = new Array(parses).fill(validateToken)
console.log(`An array of ${manyValidations.length} validations`)

const thatMany = parseMany(...manyValidations)

const result = thatMany(statechainA)
console.log(result)

// const result = validateSentence(statechainA)
// console.log(result)

module.exports = { parseRegexλ, parseMany, parseFromRegexesλ }
