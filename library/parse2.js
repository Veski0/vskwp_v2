// =============================================================================
//    Parser Combinators
// =============================================================================

const l = require('./log')('parse/index')
const _ = require('./fn')
const t = require('./type')
const { E, isError } = require('./err')

const isRegExp = r => r instanceof RegExp

const parseRegexλ = regex => {
  if (regex == undefined) return E('parseRegexλ requires an argument; a regex')
  if (!isRegExp(regex)) return E('parseRegexλ expects an instance of RegExp')
  const parseRegex = statechain => {
    if (statechain === undefined) return E('parseRegex requires an argument: a statechain')
    if (isError(statechain)) return statechain
    if (!Array.isArray(statechain)) return E('parseRegex expects an array')
    if (statechain.length === 0) return E('parseRegex expects a non-empty statechain')
    const last =  _.last(statechain)
    if (last.tokens === undefined || last.parsed === undefined || last.index === undefined) {
      return E('parseRegex received a statechain whose last element does not comport')
    }
    const { tokens, parsed, index } = last
    if (tokens.length === 0) return E('parseRegex received a statechain whose last element has a zero-length tokens property')
    const nextToken = _.head(tokens)
    const result = nextToken.match(regex)
    if (result) {
      const remainder = _.tail(tokens)
      const nextIndex = index + 1
      const nextState = { tokens: remainder, parsed: nextToken, index: nextIndex }
      return [ ...statechain, nextState ]
    } else {
      return E(`Index ${index}. Expected ${regex}, but got ${nextToken}.`)
    }
  }
  parseRegex.isParser = true
  parseRegex.parses = regex
  return parseRegex
}

const parseFromλ = parsers => {
  if (parsers == undefined) return E('parseFromλ requires an argument; an array of parsers')
  if (!Array.isArray(parsers)) return E('parseFromλ expects an array')
  if (parsers.length === 0) return E('parseFromλ expects a non-empty array of parsers')
  const regexes = []
  for (const parser of parsers) {
    if (isError(parser)) return parser
    if (parser.isParser === undefined || parser.isParser !== true) return E('parseFromλ was passed an object not marked as a parser')
    regexes.push(parser.parses)
  }
  const parseFrom = statechain => {
    if (statechain == undefined) return E('parseFrom requires an argument; a statechain')
    for (const parser of parsers) {
      const result = parser(statechain)
      if (isError(result)) {
        if (result.message.split(' ')[0] === 'parseRegexλ' || result.message.split(' ')[0] === 'parseRegex') {
          // console.log('Right here', Array.isArray(statechain))
          return result
        } else continue
      } else return result
    }
    const { tokens, parsed, index } = _.last(statechain)
    const nextToken = _.head(tokens)
    return E(`Index ${index}. Expected ${regexes.map(regex => regex.toString())}, but got ${nextToken}.`)
  }
  parseFrom.isParser = true
  parseFrom.parses = regexes
  return parseFrom
}

const parseManyλ = parsers => {
  if (parsers == undefined) return E('parseManyλ requires an argument; an array of parsers')
  if (!Array.isArray(parsers)) return E('parseManyλ expects an array')
  if (parsers.length === 0) return E('parseManyλ expects a non-empty array of parsers')
  const regexes = []
  for (const parser of parsers) {
    if (isError(parser)) return parser
    if (parser.isParser === undefined || parser.isParser !== true) return E('parseFromλ was passed an object not marked as a parser')
    regexes.push(parser.parses)
  }
  const parseMany = _.composeL(...parsers)
  parseMany.isParser = true
  parseMany.parses = regexes
  return parseMany
}

// async function wrapper () {
//   const statechainA = [{ tokens: 'P1 P2 P3', parsed: '', index: 0 }]
//   const baseRegexes = [/[P]/, /[\s]/, /[T]/, /[1]/, /[2]/, /[3]/]
//   const baseTokens = []
//   for (var i = 0; i < baseRegexes.length; i++) {
//     const r = baseRegexes[i]
//     const parseRegex = parseRegexλ(r)
//     if (isError(parseRegex)) {
//       return parseRegex
//     } else {
//       baseTokens.push(parseRegex)
//     }
//   }
//
//   const [ P, F, T, $1, $2, $3 ] = baseTokens
//   const tokensToCompound = [ [ P, $1 ], [ P, $2 ], [ P, $3 ], [ T, $1 ], [ T, $2 ], [ T, $3 ] ]
//   const compoundTokens = []
//   for (var i = 0; i < tokensToCompound.length; i++) {
//     const compound = parseManyλ(tokensToCompound[i])
//     if (isError(compound)) return compound
//     compoundTokens.push(compound)
//   }
//
//   const [ P1, P2, P3, T1, T2, T3 ] = compoundTokens
//   const parseFromTokens = parseFromλ([...compoundTokens, F])
//
//   if (isError(parseFromTokens)) {
//     return parseFromTokens
//   } else {
//     const times5 = [parseFromTokens, parseFromTokens, parseFromTokens, parseFromTokens, parseFromTokens]
//     const parse5OfAnyToken = parseManyλ(times5)
//     if (isError(parse5OfAnyToken)) return parse5OfAnyToken
//     async function Parser (Sentence) {
//       const statechain = [{ tokens: Sentence.string, parsed: '', index: 0 }]
//       const result = parse5OfAnyToken(statechain)
//       const Parsed = { ParseResult: result, SemanticInformation: "Hoorah!" }
//       Parsed.vskwpType = 'Parsed'
//       return Parsed
//     }
//     Parser.vskwpType = 'Parser'
//     return Parser
//   }
// }
//
// wrapper().then(Parser => {
//   Parser({ string: 'P1 P2 P3' }).then(Parsed => console.log(Parsed)).catch(err => console.log(err))
// }).catch(err => console.log(err))

module.exports = { parseRegexλ, parseFromλ, parseManyλ }
