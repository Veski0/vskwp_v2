const tape = require('tape')
const { parseRegexλ, parseFromλ, parseManyλ } = require('../library/parse2')
const { E, isError } = require('../library/err')
const _ = require('../library/fn')
const l = require('../library/log')('test/parse2.test')


// =============================================================================
//    Parser Combinators
// =============================================================================


// Tests for the parseRegexλ function, a factory function which produces the
// parseRegex function - the foundation of the parser combinator library.
tape('[Function: parseRegexλ] returns the correct Error without an argument', (t) => {
  t.plan(2)
  const noArgument = parseRegexλ()
  t.equals(isError(noArgument), true)
  t.equals(noArgument.message, 'parseRegexλ requires an argument; a regex')
})
tape('[Function: parseRegexλ] returns the correct Error if not provided an instance of RegExp', (t) => {
  t.plan(2)
  const notRegExp = parseRegexλ('A string!')
  t.equals(isError(notRegExp), true)
  t.equals(notRegExp.message, 'parseRegexλ expects an instance of RegExp')
})
tape('[Function: parseRegexλ] returns a curried function called [Function: parseRegex] whose parses property is set to the input regex, and whose isParser property exists and is set to true', (t) => {
  t.plan(4)
  const curried = parseRegexλ(/[a]/)
  t.equals(typeof curried === 'function', true)
  t.equals(JSON.stringify(curried.parses), JSON.stringify(/[a]/))
  t.notEquals(curried.isParser, undefined)
  t.equals(curried.isParser, true)
})

// Tests for the parseRegex function, the function created by parseRegexλ.
tape('[Function: parseRegex] returns the correct Error without an argument', (t) => {
  t.plan(2)
  const parseRegex = parseRegexλ(/[a]/)
  const noArgument = parseRegex()
  t.equals(isError(noArgument), true)
  t.equals(noArgument.message, 'parseRegex requires an argument: a statechain')
})
tape('[Function: parseRegex] returns the correct Error if provided an Error instead of a statechain', (t) => {
  t.plan(2)
  const parseRegex = parseRegexλ(/[a]/)
  const passedError = parseRegex(E('Some Error'))
  t.equals(isError(passedError), true)
  t.equals(passedError.message, 'Some Error')
})
tape('[Function: parseRegex] returns the correct Error if not provided an Array', (t) => {
  t.plan(2)
  const parseRegex = parseRegexλ(/[a]/)
  const notArray = parseRegex({})
  t.equals(isError(notArray), true)
  t.equals(notArray.message, 'parseRegex expects an array')
})
tape('[Function: parseRegex] returns the correct Error if provided an empty statechain', (t) => {
  t.plan(2)
  const parseRegex = parseRegexλ(/[a]/)
  const emptyList = parseRegex([])
  t.equals(isError(emptyList), true)
  t.equals(emptyList.message, 'parseRegex expects a non-empty statechain')
})
tape('[Function: parseRegex] returns the correct Error if the last statechain object does not comport', (t) => {
  const nonComportingStates = [
    { tokens: 'a', parsed: '' }, { tokens: 'a', index: 0 }, { parsed: '', index: 0 }
  ]
  t.plan(6)
  for (let i = 0; i < 3; i++) {
    const parseRegex = parseRegexλ(/[a]/)
    const nonComporting = parseRegex([ nonComportingStates[i] ])
    t.equals(isError(nonComporting), true)
    t.equals(nonComporting.message, 'parseRegex received a statechain whose last element does not comport')
  }
})
tape('[Function: parseRegex] returns the correct Error if the last statechain\'s tokens property is zero-length', (t) => {
  t.plan(2)
  const parseRegex = parseRegexλ(/[a]/)
  const nonComporting = parseRegex([ { tokens: [], parsed: '', index: 0 } ])
  t.equals(isError(nonComporting), true)
  t.equals(nonComporting.message, 'parseRegex received a statechain whose last element has a zero-length tokens property')
})
tape('[Function: parseRegex] returns the correct Error if parse was unsuccessful', (t) => {
  t.plan(2)
  const parseRegex = parseRegexλ(/[a]/)
  const unsuccessful = parseRegex([ { tokens: 'b', parsed: '', index: 0 } ])
  t.equals(isError(unsuccessful), true)
  t.equals(unsuccessful.message, `Index 0. Expected ${/[a]/}, but got b.`)
})
tape('[Function: parseRegex] returns a new statechain if parse was successful', (t) => {
  t.plan(1)
  const parseRegex = parseRegexλ(/[a]/)
  const successful = parseRegex([ { tokens: 'a', parsed: '', index: 0 } ])
  const expected = [ { tokens: 'a', parsed: '', index: 0 }, { tokens: [], parsed: 'a', index:1 } ]
  t.equals(JSON.stringify(successful), JSON.stringify(expected))
})
tape('[Function: parseRegex] is composable', (t) => {
  t.plan(1)
  const parse_a = parseRegexλ(/[a]/)
  const parse_b = parseRegexλ(/[b]/)
  const parse_ab = _.composeL(parse_a, parse_b)
  const successful = parse_ab([ { tokens: 'ab', parsed: '', index: 0 } ])
  const expected = [ { tokens: 'ab', parsed: '', index: 0 }, { tokens: 'b', parsed: 'a', index:1 }, { tokens: [], parsed: 'b', index:2 } ]
  t.equals(JSON.stringify(successful), JSON.stringify(expected))
})


// Tests for the parseFromλ function, a factory function which produces the
// parseFrom function.
tape('[Function: parseFromλ] returns the correct Error without an argument', (t) => {
  t.plan(2)
  const noArgument = parseFromλ()
  t.equals(isError(noArgument), true)
  t.equals(noArgument.message, 'parseFromλ requires an argument; an array of parsers')
})
tape('[Function: parseFromλ] returns the correct Error if not provided an Array', (t) => {
  t.plan(2)
  const notArray = parseFromλ(/[a]/)
  t.equals(isError(notArray), true)
  t.equals(notArray.message, 'parseFromλ expects an array')
})
tape('[Function: parseFromλ] returns the correct Error if provided an empty array of parsers', (t) => {
  t.plan(2)
  const emptyArray = parseFromλ([])
  t.equals(isError(emptyArray), true)
  t.equals(emptyArray.message, 'parseFromλ expects a non-empty array of parsers')
})
tape('[Function: parseFromλ] returns the correct Error if any parser is an Error', (t) => {
  t.plan(2)
  const parsers = [parseRegexλ('A string!')]
  const parseFrom = parseFromλ(parsers)
  t.equals(isError(parseFrom), true)
  t.equals(parseFrom.message, 'parseRegexλ expects an instance of RegExp')
})
tape('[Function: parseFromλ] returns the correct Error if any of its array argument is not marked as a parser', (t) => {
  t.plan(2)
  const parsers = [parseRegexλ(/[a]/)]
  delete parsers[0].isParser
  const parseFrom = parseFromλ(parsers)
  t.equals(isError(parseFrom), true)
  t.equals(parseFrom.message, 'parseFromλ was passed an object not marked as a parser')
})
tape('[Function: parseFromλ] returns a curried function called [Function: parseFrom] whose parses property is set to an array of regexes representing the parsers that were passed in, and whose isParser property exists and is set to true', (t) => {
  t.plan(5)
  const regexes = [/[a]/, /[b]/]
  const parsers = [parseRegexλ(/[a]/), parseRegexλ(/[b]/)]
  const parseFrom = parseFromλ(parsers)
  t.equals(typeof parseFrom === 'function', true)
  t.notEquals(parseFrom.isParser, undefined)
  t.equals(parseFrom.isParser, true)
  for (let i = 0; i < 2; i++) {
    t.equals(JSON.stringify(parseFrom.parses[i]), JSON.stringify(regexes[i]))
  }
})

// Tests for the parseFrom function, the funcion created by parseFromλ.
tape('[Function: parseFrom] returns the correct Error without an argument', (t) => {
  t.plan(2)
  const parsers = [parseRegexλ(/[a]/), parseRegexλ(/[b]/)]
  const parseFrom = parseFromλ(parsers)
  const noArgument = parseFrom()
  t.equals(isError(noArgument), true)
  t.equals(noArgument.message, 'parseFrom requires an argument; a statechain')
})
tape('[Function: parseFrom] returns the correct Error if any parser returns an Error', (t) => {
  t.plan(2)
  const parsers = [parseRegexλ(/[a]/)]
  const parseFrom = parseFromλ(parsers)
  const emptyArray = parseFrom([])
  t.equals(isError(emptyArray), true)
  t.equals(emptyArray.message, 'parseRegex expects a non-empty statechain')
})
tape('[Function: parseFrom] returns the correct Error if any parse was unsuccessful', (t) => {
  t.plan(2)
  const parsers = [parseRegexλ(/[a]/)]
  const parseFrom = parseFromλ(parsers)
  const unsuccessful = parseFrom([ { tokens: 'bb', parsed: '', index: 0 } ])
  t.equals(isError(unsuccessful), true)
  t.equals(unsuccessful.message, `Index 0. Expected ${/[a]/}, but got b.`)
})


// Tests for the parseManyλ function, a factory function which produces the
// parseMany function.
tape('[Function: parseManyλ] returns the correct Error without an argument', (t) => {
  t.plan(2)
  const noArgument = parseManyλ()
  t.equals(isError(noArgument), true)
  t.equals(noArgument.message, 'parseManyλ requires an argument; an array of parsers')
})
tape('[Function: parseManyλ] returns the correct Error if not provided an Array', (t) => {
  t.plan(2)
  const notArray = parseManyλ(/[a]/)
  t.equals(isError(notArray), true)
  t.equals(notArray.message, 'parseManyλ expects an array')
})
tape('[Function: parseManyλ] returns the correct Error if provided an empty array of parsers', (t) => {
  t.plan(2)
  const emptyArray = parseManyλ([])
  t.equals(isError(emptyArray), true)
  t.equals(emptyArray.message, 'parseManyλ expects a non-empty array of parsers')
})
tape('[Function: parseManyλ] returns the correct Error if any parser is an Error', (t) => {
  t.plan(2)
  const parsers = [parseRegexλ('A string!')]
  const parseFrom = parseManyλ(parsers)
  t.equals(isError(parseFrom), true)
  t.equals(parseFrom.message, 'parseRegexλ expects an instance of RegExp')
})
