// 'alpha' Description --------------------------------------------------------
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
// const statechainA = [{ tokens: 'P1 P2 P3', parsed: '', index: 0 }]
const baseRegexes = [/[P]/, /[\s]/, /[T]/, /[F]/, /[1]/, /[2]/, /[3]/]
const { E, isError } = require('../library/err')
const { fitSpline } = require('../library/spline')
// SemanticInformationBuilder --------------------------------------------------
async function SemanticInformationBuilder () {

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
function findPeaksAndTroughs(data) {
  // Find peaks and troughs using a naive algorithm.
  var start = 1
  var end = data.y.length - 2
  var obj = { x: [], y: []  }

  for (let i = start; i <= end; i++) {
    var current = data.y[i]
    var prev = data.y[i-1]
    var next = data.y[i+1]

    if(current > (next + (next / 10)) && current > (prev + (prev / 10))) {
      obj.x.push(i)
      obj.y.push(15)
    } else if(current < next && current < prev) {
      obj.x.push(i)
      obj.y.push(5)
    } else {
      obj.x.push(i)
      obj.y.push(10)
    }
  }
  return obj
}
async function PreProcessor (WaveData) {
  const splined1_16         = fitSpline(WaveData.series, 0.0625)
  const pnt                 = findPeaksAndTroughs(splined1_16)
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
