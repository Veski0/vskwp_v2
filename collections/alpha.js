// 'alpha' Description --------------------------------------------------------
/*
- WaveData tracks gravity and uses m/s^2 as its unit.

- Token generation is based on analysing a 2D graph one datapoint at a time,
with peaks being determined by the datapoint's linear distance from the average.

- One level of peaks and troughs, with one flat marker.

- The pars consists of a simple pass to the check the tokens.

- Uses the tokens:
    P1, F, T1

- Gives SemanticInformation in the form:
    'The waveform looks correct.',
*/
const baseRegexes = [/[P]/, /[\s]/, /[T]/, /[F]/, /[1]/]
const { E, isError } = require('../library/err')
const { fitSpline } = require('../library/spline')


// SemanticInformationBuilder --------------------------------------------------
async function SemanticInformationBuilder (correct) {
  return `The waveform looks ${correct ? 'correct' : 'incorrect'}.`
}


// VesselConstraintGenerator ---------------------------------------------------
async function VesselConstraintGenerator (VesselData) {
  const VesselConstraints = { }
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

  const [ P, S, T, F, $1 ] = baseTokens
  const tokensToCompound = [ [ P, $1 ], [ T, $1 ] ]
  const compoundTokens = []
  for (var i = 0; i < tokensToCompound.length; i++) {
    const compound = parseManyλ(tokensToCompound[i])
    if (isError(compound)) return compound
    compoundTokens.push(compound)
  }

  const [ P1, T1 ] = compoundTokens
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
