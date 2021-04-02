const tape = require('tape')
const {
  ParserGeneratorUnitλ, PreProcessorUnitλ, TokeniserUnitλ, ParsingUnit,
  DevModeλ, ProMode,
  OptionsValidator
} = require('../library/core')
const { E, isError } = require('../library/err')


// =============================================================================
//    Mock Modules
// =============================================================================
const mockGenerator = (vskwpType, type, problem) => {
  switch (problem) {
    case 'undefined': return undefined
    case 'error':     return E(vskwpType + ' encountered a generic error')
    case 'noType':    return type === 'function' ? () => ({}) : {}
    case 'wrongType':
      const wrongType = type === 'function' ? () => ({}) : {}
      wrongType.vskwpType = 'WrongThing'
      return wrongType
    default:
      const normal = type === 'function' ? () => ({}) : {}
      normal.vskwpType = vskwpType
      return normal
  }
}
// We want to mock a function. Either there will be some problem with the
// function, or there will be some problem with the return value of the
// function, or there will be no problems.
const mockFunction = (vskwpType, problemWithFn, returnVskwpType, returnType, returnProblems) => {
  let fn = mockGenerator(vskwpType, 'function')
  if (problemWithFn) {
    fn = mockGenerator(vskwpType, 'function', problemWithFn)
    return fn
  } else if (returnVskwpType) {
    fn = () => {
      const fnReturn = mockGenerator(returnVskwpType, returnType, returnProblems)
      return fnReturn
    }
    fn.vskwpType = vskwpType
    return fn
  }
  return fn
}
const mockObject = (vskwpType, problemWithObj) => mockGenerator(vskwpType, 'object', problemWithObj)
const problems = ['undefined', 'error', 'noType', 'wrongType']
const problemsErrors = [' is undefined', ' encountered a generic error', ' must have a vskwpType property', ' must have the appropriate vskwpType property']

// =============================================================================
//    Units
// =============================================================================


// =============================================================================
//    ParserGeneratorUnitλ
// =============================================================================
tape('[Function: ParserGeneratorUnitλ] returns the correct Error if there is a problem with either of its arguments', async function (t) {
  t.plan(16)
  for (let i = 0; i < problems.length; i++) {
    const mockVesselConstraintGenerator = mockFunction('VesselConstraintGenerator', problems[i])
    const ParserGeneratorUnit = await ParserGeneratorUnitλ(mockVesselConstraintGenerator)
    t.equals(isError(ParserGeneratorUnit), true)
    t.equals(ParserGeneratorUnit.message, 'VesselConstraintGenerator' + problemsErrors[i])
  }
  for (let i = 0; i < problems.length; i++) {
    const mockVesselConstraintGenerator = mockFunction('VesselConstraintGenerator')
    const mockParserGenerator = mockFunction('ParserGenerator', problems[i])
    const ParserGeneratorUnit = await ParserGeneratorUnitλ(mockVesselConstraintGenerator, mockParserGenerator)
    t.equals(isError(ParserGeneratorUnit), true)
    t.equals(ParserGeneratorUnit.message, 'ParserGenerator' + problemsErrors[i])
  }
})
tape('[Function: ParserGeneratorUnitλ] returns the a curried function with the correct vskwpType', async function (t) {
  t.plan(1)
  const mockVesselConstraintGenerator = mockFunction('VesselConstraintGenerator')
  const mockParserGenerator = mockFunction('ParserGenerator')
  const ParserGeneratorUnit = await ParserGeneratorUnitλ(mockVesselConstraintGenerator, mockParserGenerator)
  t.equals(ParserGeneratorUnit.vskwpType, 'ParserGeneratorUnit')
})

// =============================================================================
//    ParserGeneratorUnit, the function curried by ParserGeneratorUnitλ
// =============================================================================
tape('[Function: ParserGeneratorUnit] returns the correct Error if there is a problem with its argument', async function (t) {
  t.plan(8)
  for (let i = 0; i < problems.length; i++) {
    const mockVesselConstraintGenerator = mockFunction('VesselConstraintGenerator')
    const mockParserGenerator = mockFunction('ParserGenerator')
    const ParserGeneratorUnit = await ParserGeneratorUnitλ(mockVesselConstraintGenerator, mockParserGenerator)
    const Parser = await ParserGeneratorUnit(mockObject('VesselData', problems[i]))
    t.equals(isError(Parser), true)
    t.equals(Parser.message, 'VesselData' + problemsErrors[i])
  }
})
tape('[Function: ParserGeneratorUnit] returns the correct Error if there is a problem with the results of either of the arguments to ParserGeneratorUnitλ', async function (t) {
  t.plan(16)
  for (let i = 0; i < problems.length; i++) {
    const mockVesselConstraintGenerator = mockFunction('VesselConstraintGenerator', false, 'VesselConstraints', 'object', problems[i])
    const mockParserGenerator = mockFunction('ParserGenerator')
    const ParserGeneratorUnit = await ParserGeneratorUnitλ(mockVesselConstraintGenerator, mockParserGenerator)
    const Parser = await ParserGeneratorUnit(mockObject('VesselData'))
    t.equals(isError(Parser), true)
    t.equals(Parser.message, 'VesselConstraints' + problemsErrors[i])
  }
  for (let i = 0; i < problems.length; i++) {
    const mockVesselConstraintGenerator = mockFunction('VesselConstraintGenerator', false, 'VesselConstraints')
    const mockParserGenerator = mockFunction('ParserGenerator', false, 'Parser', 'function', problems[i])
    const ParserGeneratorUnit = await ParserGeneratorUnitλ(mockVesselConstraintGenerator, mockParserGenerator)
    const Parser = await ParserGeneratorUnit(mockObject('VesselData'))
    t.equals(isError(Parser), true)
    t.equals(Parser.message, 'Parser' + problemsErrors[i])
  }
})
tape('[Function: ParserGeneratorUnit] returns the a curried function with the correct vskwpType', async function (t) {
  t.plan(1)
  const mockVesselConstraintGenerator = mockFunction('VesselConstraintGenerator', false, 'VesselConstraints')
  const mockParserGenerator = mockFunction('ParserGenerator', false, 'Parser')
  const ParserGeneratorUnit = await ParserGeneratorUnitλ(mockVesselConstraintGenerator, mockParserGenerator)
  const Parser = await ParserGeneratorUnit(mockObject('VesselData'))
  t.equals(Parser.vskwpType, 'Parser')
})


// =============================================================================
//    PreProcessorUnitλ
// =============================================================================
tape('[Function: PreProcessorUnitλ] returns the correct Error if there is a problem with its argument', async function (t) {
  t.plan(8)
  for (let i = 0; i < problems.length; i++) {
    const mockPreProcessor = mockFunction('PreProcessor', problems[i])
    const PreProcessorUnit = await PreProcessorUnitλ(mockPreProcessor)
    t.equals(isError(PreProcessorUnit), true)
    t.equals(PreProcessorUnit.message, 'PreProcessor' + problemsErrors[i])
  }
})
tape('[Function: PreProcessorUnitλ] returns the a curried function with the correct vskwpType', async function (t) {
  t.plan(1)
  const mockPreProcessor = mockFunction('PreProcessor', false, 'PreProcessedWaveData')
  const PreProcessorUnit = await PreProcessorUnitλ(mockPreProcessor)
  t.equals(PreProcessorUnit.vskwpType, 'PreProcessorUnit')
})

// =============================================================================
//    PreProcessorUnit, the function curried by PreProcessorUnitλ
// =============================================================================
tape('[Function: PreProcessorUnit] returns the correct Error if there is a problem with its argument', async function (t) {
  t.plan(8)
  for (let i = 0; i < problems.length; i++) {
    const mockPreProcessor = mockFunction('PreProcessor', false, 'PreProcessedWaveData')
    const PreProcessorUnit = await PreProcessorUnitλ(mockPreProcessor)
    const PreProcessedWaveData = await PreProcessorUnit(mockObject('WaveData', problems[i]))
    t.equals(isError(PreProcessedWaveData), true)
    t.equals(PreProcessedWaveData.message, 'WaveData' + problemsErrors[i])
  }
})
tape('[Function: PreProcessorUnit] returns the correct Error if there is a problem with the result of the arguments to PreProcessorUnitλ', async function (t) {
  t.plan(8)
  for (let i = 0; i < problems.length; i++) {
    const mockPreProcessor = mockFunction('PreProcessor', false, 'PreProcessedWaveData', 'object', problems[i])
    const PreProcessorUnit = await PreProcessorUnitλ(mockPreProcessor)
    const PreProcessedWaveData = await PreProcessorUnit(mockObject('WaveData'))
    t.equals(isError(PreProcessedWaveData), true)
    t.equals(PreProcessedWaveData.message, 'PreProcessedWaveData' + problemsErrors[i])
  }
})


// =============================================================================
//    TokeniserUnitλ
// =============================================================================
tape('[Function: TokeniserUnitλ] returns the correct Error if there is a problem with its argument', async function (t) {
  t.plan(8)
  for (let i = 0; i < problems.length; i++) {
    const mockTokeniser = mockFunction('Tokeniser', problems[i])
    const TokeniserUnit = await TokeniserUnitλ(mockTokeniser)
    t.equals(isError(TokeniserUnit), true)
    t.equals(TokeniserUnit.message, 'Tokeniser' + problemsErrors[i])
  }
})
tape('[Function: TokeniserUnitλ] returns the a curried function with the correct vskwpType', async function (t) {
  t.plan(1)
  const mockTokeniser = mockFunction('Tokeniser', false, 'Sentence')
  const TokeniserUnit = await TokeniserUnitλ(mockTokeniser)
  t.equals(TokeniserUnit.vskwpType, 'TokeniserUnit')
})

// =============================================================================
//    TokeniserUnit, the function curried by TokeniserUnitλ
// =============================================================================
tape('[Function: TokeniserUnit] returns the correct Error if there is a problem with its argument', async function (t) {
  t.plan(8)
  for (let i = 0; i < problems.length; i++) {
    const mockTokeniser = mockFunction('Tokeniser', false, 'Sentence')
    const TokeniserUnit = await TokeniserUnitλ(mockTokeniser)
    const Sentence = await TokeniserUnit(mockObject('PreProcessedWaveData', problems[i]))
    t.equals(isError(Sentence), true)
    t.equals(Sentence.message, 'PreProcessedWaveData' + problemsErrors[i])
  }
})
tape('[Function: TokeniserUnit] returns the correct Error if there is a problem with the result of the arguments to TokeniserUnitλ', async function (t) {
  t.plan(8)
  for (let i = 0; i < problems.length; i++) {
    const mockTokeniser = mockFunction('Tokeniser', false, 'Sentence', 'object', problems[i])
    const TokeniserUnit = await TokeniserUnitλ(mockTokeniser)
    const Sentence = await TokeniserUnit(mockObject('PreProcessedWaveData'))
    t.equals(isError(Sentence), true)
    t.equals(Sentence.message, 'Sentence' + problemsErrors[i])
  }
})


// =============================================================================
//    ParsingUnit
// =============================================================================
tape('[Function: ParsingUnit] returns the correct Error if there is a problem with either of its arguments', async function (t) {
  t.plan(16)
  for (let i = 0; i < problems.length; i++) {
    const mockParser = mockFunction('Parser', problems[i])
    const mockSentence = mockObject('Sentence')
    const Parsed = await ParsingUnit(mockParser, mockSentence)
    t.equals(isError(Parsed), true)
    t.equals(Parsed.message, 'Parser' + problemsErrors[i])
  }
  for (let i = 0; i < problems.length; i++) {
    const mockParser = mockFunction('Parser')
    const mockSentence = mockObject('Sentence', problems[i])
    const Parsed = await ParsingUnit(mockParser, mockSentence)
    t.equals(isError(Parsed), true)
    t.equals(Parsed.message, 'Sentence' + problemsErrors[i])
  }
})
tape('[Function: ParsingUnit] returns the correct Error if there is a problem with the result of the arguments to ParsingUnit', async function (t) {
  t.plan(8)
  for (let i = 0; i < problems.length; i++) {
    const mockParser = mockFunction('Parser', false, 'Parsed', 'object', problems[i])
    const mockSentence = mockObject('Sentence')
    const Parsed = await ParsingUnit(mockParser, mockSentence)
    t.equals(isError(Parsed), true)
    t.equals(Parsed.message, 'Parsed' + problemsErrors[i])
  }
})


// =============================================================================
//    Modes
// =============================================================================
tape('[Function: OptionsValidator] returns false if given an Options object which does not contain 4 properties', async function (t) {
  t.plan(1)
  const Options = { VesselConstraintGenerator: 'a', ParserGenerator: 'b', PreProcessor: 'c' }
  const result = OptionsValidator(Options)
  t.equals(result, false)
})
tape('[Function: OptionsValidator] returns false if given an Options object which does not contain correctly named properties', async function (t) {
  t.plan(4)
  const OptionsNoTokeniser = { VesselConstraintGenerator: 'a', ParserGenerator: 'b', PreProcessor: 'c', ShouldNotBeHere: 'd' }
  const resultNoTokeniser = OptionsValidator(OptionsNoTokeniser)
  t.equals(resultNoTokeniser, false)
  const OptionsNoPreProcessor = { VesselConstraintGenerator: 'a', ParserGenerator: 'b', ShouldNotBeHere: 'c', Tokeniser: 'd' }
  const resultNoPreProcessor = OptionsValidator(OptionsNoPreProcessor)
  t.equals(resultNoPreProcessor, false)
  const OptionsNoParserGenerator = { VesselConstraintGenerator: 'a', ShouldNotBeHere: 'b', PreProcessor: 'c', ShouldNotBeHere: 'd' }
  const resultNoParserGenerator = OptionsValidator(OptionsNoParserGenerator)
  t.equals(resultNoParserGenerator, false)
  const OptionsNoVesselConstraintGenerator = { ShouldNotBeHere: 'a', ParserGenerator: 'b', PreProcessor: 'c', ShouldNotBeHere: 'd' }
  const resultNoVesselConstraintGenerator = OptionsValidator(OptionsNoVesselConstraintGenerator)
  t.equals(resultNoVesselConstraintGenerator, false)
})
tape('[Function: OptionsValidator] returns false if given an Options object which contains undefined properties', async function (t) {
  t.plan(4)
  const OptionsTokeniserUndefined = { VesselConstraintGenerator: 'a', ParserGenerator: 'b', PreProcessor: 'c', Tokeniser: undefined }
  const resultTokeniserUndefined = OptionsValidator(OptionsTokeniserUndefined)
  t.equals(resultTokeniserUndefined, false)
  const OptionsPreProcessorUndefined = { VesselConstraintGenerator: 'a', ParserGenerator: 'b', PreProcessor: undefined, Tokeniser: 'd' }
  const resultPreProcessorUndefined = OptionsValidator(OptionsPreProcessorUndefined)
  t.equals(resultPreProcessorUndefined, false)
  const OptionsParserGeneratorUndefined = { VesselConstraintGenerator: 'a', ParserGenerator: undefined, PreProcessor: 'c', Tokeniser: 'd' }
  const resultParserGeneratorUndefined = OptionsValidator(OptionsParserGeneratorUndefined)
  t.equals(resultParserGeneratorUndefined, false)
  const OptionsVesselConstraintGeneratorUndefined = { VesselConstraintGenerator: undefined, ParserGenerator: 'b', PreProcessor: 'c', Tokeniser: 'd' }
  const resultVesselConstraintGeneratorUndefined = OptionsValidator(OptionsVesselConstraintGeneratorUndefined)
  t.equals(resultVesselConstraintGeneratorUndefined, false)
})
