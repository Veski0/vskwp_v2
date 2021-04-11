// 'beta' Description --------------------------------------------------------
/*
- WaveData tracks gravity and uses m/s^2 as its unit.

- Token generation is based on analysing a 2D graph one datapoint at a time,
with peaks being determined by the datapoint's linear distance from the average.

- Three levels of peaks and three levels of troughs, with one flat marker.

- The vessel's width is used, using the given pragma that a vessel cannot handle
a wave higher or lower than the average water height than that vessel is wide.

- The vessel's sail and motor boolean, and the vessel's length are used, using
the given pragma that a vessel will stall if it encounters more than a certain
number of high waves wthin a given period based on the length of the vessel,
unless the vessel's motor is on.

- Uses the tokens:
    P1, P2, P3, F, T1, T2, T3

- Gives SemanticInformation in the forms:
    'The peaks are currently too high for this vessel',
    'The troughs are currently too low for this vessel',
    'The vessel cannot handle so much chop, vessel stall imminent'
*/
const baseRegexes = [/[P]/, /[\s]/, /[T]/, /[F]/, /[1]/, /[2]/, /[3]/]
const { E, isError } = require('../library/err')
const { fitSpline } = require('../library/spline')


// SemanticInformationBuilder --------------------------------------------------
async function SemanticInformationBuilder (form) {
  switch (form) {
    case 'peaks': return 'The peaks are currently too high for this vessel'
    case 'troughs': return 'The troughs are currently too low for this vessel'
    case 'chop': return 'The vessel cannot handle so much chop, vessel stall imminents'
  }
}


// VesselConstraintGenerator ---------------------------------------------------
async function VesselConstraintGenerator (VesselData) {
  const { length, width, motor, sail } = VesselData
  const VesselConstraints = {
    peak: { max: 0 },
    trough: { max: 0 },
    period: {
      size: 0,
      count: 0
    }
  }
  // "The vessel's width is used, using the given pragma that a vessel cannot
  // handle a wave higher or lower than the average water height than that
  // vessel is wide."
  VesselConstraints.peak.max = width
  VesselConstraints.trough.max = width
  // WHAT DOES THS TRANSLATE TO?
  // THE PARSE SHOULD ONLY ACCEPT TOKENS THAT HAVE A LOWER MAGNITUDE

  // "The vessel's sail and motor boolean, and the vessel's length, are used,
  // using the given pragma that a vessel will stall if it encounters more than
  // a certain number of high waves within a given period based on the length of
  // the vessel, unless the vessel's motor is on."
  if (!motor) {
    VesselConstraints.period.size = 2
    VesselConstraints.period.count = 5 * length
  } else {
    VesselConstraints.period.size = -1
    VesselConstraints.period.count = -1
  }
  // WHAT DOES THS TRANSLATE TO?
  // THE PARSE SHOULD CONSIST OF parseNOfAnyToken
  VesselConstraints.vskwpType = 'VesselConstraints'
  return VesselConstraints
}
VesselConstraintGenerator.vskwpType = 'VesselConstraintGenerator'


// ParserGenerator -------------------------------------------------------------
const { parseRegexλ, parseFromλ, parseManyλ } = require('../library/parse2')
async function ParserGenerator (VesselConstraints) {
  const baseTokens = []
  for (var i = 0; i < baseRegexes.length; i++) {
    const r = baseRegexes[i]
    const parseRegex = parseRegexλ(r)
    if (isError(parseRegex)) {
      return parseRegex
    } else {
      baseTokens.push(parseRegex)
    }
  }

  const [ P, S, T, F, $1, $2, $3 ] = baseTokens
  const tokensToCompound = [ [ P, $1 ], [ P, $2 ], [ P, $3 ], [ T, $1 ], [ T, $2 ], [ T, $3 ] ]
  const compoundTokens = []
  for (var i = 0; i < tokensToCompound.length; i++) {
    const compound = parseManyλ(tokensToCompound[i])
    if (isError(compound)) return compound
    compoundTokens.push(compound)
  }

  const [ P1, P2, P3, T1, T2, T3 ] = compoundTokens
  const parseFromTokens = parseFromλ([...compoundTokens, S, F])

  if (isError(parseFromTokens)) {
    return parseFromTokens
  } else {
    async function Parser (Sentence) {
      const timesN = []
      for (var i = 0; i < ((Sentence.string.split(' ').length * 2) - 1) ; i++) {
        timesN.push(parseFromTokens)
      }
      const parseNOfAnyToken = parseManyλ(timesN)
      if (isError(parseNOfAnyToken)) return parseNOfAnyToken
      const statechain = [{ tokens: Sentence.string, parsed: '', index: 0 }]
      const result = parseNOfAnyToken(statechain)
      const Parsed = {
        ParseResult: result,
        SemanticInformation: 'All tokens parsed successfully'
      }
      Parsed.vskwpType = 'Parsed'
      return Parsed
    }
    Parser.vskwpType = 'Parser'
    return Parser
  }
}
ParserGenerator.vskwpType = 'ParserGenerator'


// PreProcessor ----------------------------------------------------------------
const spline = require('../library/spline')
const plot = require('../library/plot')
// Find peaks and troughs using a different naive algorithm.
function findPeaksAndTroughs3(data) {
  var obj = { x: [], y: []  }
  const breakpoint = breakpointer(0, 5, 8, 12, 15, 20)

  for (let i = 0; i <= data.y.length; i++) {
    const bp = breakpoint(data.y[i])
    switch (bp) {
      case 0: obj.y.push(-2.5); break;
      case 1: obj.y.push(2.5); break;
      case 2: obj.y.push(6.5); break;
      // Flat space
      case 3: obj.y.push(10); break;
      case 4: obj.y.push(13.5); break;
      case 5: obj.y.push(17.5); break;
      case 6: obj.y.push(25); break;
    }
    obj.x.push(i)
  }
  return obj
}

// [0, 5, 10, 15, 20] => 6 => 2
const breakpointer = (...breakpoints) => (n) => {
  if (n < breakpoints[0]) return 0
  if (breakpoints[breakpoints.length - 1] <= n) return breakpoints.length
  for (var i = 0; i < breakpoints.length - 1; i++) {
    const lowLimit = breakpoints[i]
    const highLimit = breakpoints[i + 1]
    if (lowLimit <= n && n < highLimit) return i + 1
  }
}
console.log(breakpointer(...[0, 2, 4, 6, 8, 10])(3))
async function PreProcessor (WaveData) {
  const splined1_16         = fitSpline(WaveData.series, 0.0625)
  const pnt                 = findPeaksAndTroughs3(splined1_16)
  // plot.plotMany(splined1_16, pnt)
  const PreProcessedWaveData = { pnt }
  PreProcessedWaveData.vskwpType = 'PreProcessedWaveData'
  return PreProcessedWaveData
}
PreProcessor.vskwpType = 'PreProcessor'


// Tokeniser -------------------------------------------------------------------
async function Tokeniser (PreProcessedWaveData) {
  const Sentence = { string: [] }
  for (var i = 0; i < PreProcessedWaveData.pnt.y.length; i++) {
    switch (PreProcessedWaveData.pnt.y[i]) {
      case 10:
        Sentence.string.push('F')
        break;
      case 5:
        Sentence.string.push('T1')
        break;
      case 15:
        Sentence.string.push('P1')
        break;
      default:
      console.log('FUUUUCK')
    }
  }
  Sentence.string = Sentence.string.join(' ')
  Sentence.vskwpType = 'Sentence'
  return Sentence
}
Tokeniser.vskwpType = 'Tokeniser'


module.exports = {
  VesselConstraintGenerator, ParserGenerator, PreProcessor, Tokeniser
}
