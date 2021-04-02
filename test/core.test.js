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
const mock = (vskwpType, mockvskwpType, type, notDefined, error, property, wrong) => {
  const mocked = (a) => {
    if (notDefined) {
      return undefined
    } else if (error) {
      return E(error)
    } else if (property) {
      const retval = type === 'function' ? () => {} : {}
      return retval
    } else if (wrong) {
      const retval = type === 'function' ? () => {} : {}
      retval.vskwpType = 'WrongThing'
      return retval
    } else {
      const retval = type === 'function' ? () => {} : {}
      retval.vskwpType = mockvskwpType
      return retval
    }
  }
  mocked.vskwpType = vskwpType
  return mocked
}


// =============================================================================
//    Units
// =============================================================================


// =============================================================================
//    ParserGeneratorUnitλ
// =============================================================================
tape('[Function: ParserGeneratorUnitλ] returns the correct Error without a first argument', async function (t) {
  t.plan(2)
  const ParserGeneratorUnit = await ParserGeneratorUnitλ(undefined, mock('ParserGenerator', 'Parser', 'function'))
  t.equals(isError(ParserGeneratorUnit), true)
  t.equals(ParserGeneratorUnit.message, 'VesselConstraintGenerator is undefined')
})
tape('[Function: ParserGeneratorUnitλ] returns the correct Error if its first argument is an Error', async function (t) {
  t.plan(2)
  const ParserGeneratorUnit = await ParserGeneratorUnitλ(E('something'), mock('ParserGenerator', 'Parser', 'function'))
  t.equals(isError(ParserGeneratorUnit), true)
  t.equals(ParserGeneratorUnit.message, 'something')
})
tape('[Function: ParserGeneratorUnitλ] returns the correct Error if its first argument is missing its vskwpType', async function (t) {
  t.plan(2)
  const ParserGeneratorUnit = await ParserGeneratorUnitλ({}, mock('ParserGenerator', 'Parser', 'function'))
  t.equals(isError(ParserGeneratorUnit), true)
  t.equals(ParserGeneratorUnit.message, 'VesselConstraintGenerator must have a vskwpType property')
})
tape('[Function: ParserGeneratorUnitλ] returns the correct Error if its first argument has the wrong vskwpType', async function (t) {
  t.plan(2)
  const ParserGeneratorUnit = await ParserGeneratorUnitλ(mock('ParserGenerator', 'Parser', 'function', false, false, false, true), mockParserGenerator())
  t.equals(isError(ParserGeneratorUnit), true)
  t.equals(ParserGeneratorUnit.message, 'VesselConstraintGenerator must have the appropriate vskwpType property')
})

tape('[Function: ParserGeneratorUnitλ] returns the correct Error without a second argument', async function (t) {
  t.plan(2)
  const ParserGeneratorUnit = await ParserGeneratorUnitλ({}, undefined)
  t.equals(isError(ParserGeneratorUnit), true)
  t.equals(ParserGeneratorUnit.message, 'ParserGeneratorUnitλ requires two arguments')
})
tape('[Function: ParserGeneratorUnitλ] returns the correct Error if its second argument is an Error', async function (t) {
  t.plan(2)
  const ParserGeneratorUnit = await ParserGeneratorUnitλ(mockVesselConstraintGenerator(), E('something'))
  t.equals(isError(ParserGeneratorUnit), true)
  t.equals(ParserGeneratorUnit.message, 'something')
})
tape('[Function: ParserGeneratorUnitλ] returns the correct Error if its second argument is missing its vskwpType', async function (t) {
  t.plan(2)
  const ParserGeneratorUnit = await ParserGeneratorUnitλ(mockVesselConstraintGenerator(), {})
  t.equals(isError(ParserGeneratorUnit), true)
  t.equals(ParserGeneratorUnit.message, 'ParserGenerator must have a vskwpType property')
})
tape('[Function: ParserGeneratorUnitλ] returns the correct Error if its second argument has the wrong vskwpType', async function (t) {
  t.plan(2)
  const ParserGeneratorUnit = await ParserGeneratorUnitλ(mockVesselConstraintGenerator(), mockWrongThing())
  t.equals(isError(ParserGeneratorUnit), true)
  t.equals(ParserGeneratorUnit.message, 'ParserGenerator must have the appropriate vskwpType property')
})

tape('[Function: ParserGeneratorUnitλ] returns the a curried function with the correct vskwpType', async function (t) {
  t.plan(1)
  const ParserGeneratorUnit = await ParserGeneratorUnitλ(mockVesselConstraintGenerator(), mockParserGenerator())
  t.equals(ParserGeneratorUnit.vskwpType, 'ParserGeneratorUnit')
})


// =============================================================================
//    ParserGeneratorUnit
// =============================================================================
tape('[Function: ParserGeneratorUnit] returns the correct Error without an argument', async function (t) {
  t.plan(2)
  const ParserGeneratorUnit = await ParserGeneratorUnitλ(mockVesselConstraintGenerator(), mockParserGenerator())
  const Parser = await ParserGeneratorUnit()
  t.equals(isError(Parser), true)
  t.equals(Parser.message, 'VesselData is undefined')
})
tape('[Function: ParserGeneratorUnit] returns the correct Error if its argument is an Error', async function (t) {
  t.plan(2)
  const ParserGeneratorUnit = await ParserGeneratorUnitλ(mockVesselConstraintGenerator(), mockParserGenerator())
  const Parser = await ParserGeneratorUnit(E('something'))
  t.equals(isError(Parser), true)
  t.equals(Parser.message, 'something')
})
tape('[Function: ParserGeneratorUnit] returns the correct Error if its argument is missing its vskwpType', async function (t) {
  t.plan(2)
  const ParserGeneratorUnit = await ParserGeneratorUnitλ(mockVesselConstraintGenerator(), mockParserGenerator())
  const Parser = await ParserGeneratorUnit({})
  t.equals(isError(Parser), true)
  t.equals(Parser.message, 'VesselData must have a vskwpType property')
})
tape('[Function: ParserGeneratorUnit] returns the correct Error if its argument has the wrong vskwpType', async function (t) {
  t.plan(2)
  const ParserGeneratorUnit = await ParserGeneratorUnitλ(mockVesselConstraintGenerator(), mockParserGenerator())
  const Parser = await ParserGeneratorUnit({ vskwpType: 'WrongThing' })
  t.equals(isError(Parser), true)
  t.equals(Parser.message, 'VesselData must have the appropriate vskwpType property')
})





// =============================================================================
//    PreProcessorUnitλ
// =============================================================================
tape('[Function: PreProcessorUnitλ] returns the correct Error without an argument', async function (t) {
  t.plan(2)
  const PreProcessorUnit = await PreProcessorUnitλ()
  t.equals(isError(PreProcessorUnit), true)
  t.equals(PreProcessorUnit.message, 'PreProcessorUnitλ requires an argument; a PreProcessor')
})
tape('[Function: PreProcessorUnitλ] returns the correct Error if its argument is missing its vskwpType', async function (t) {
  t.plan(2)
  const PreProcessorUnit = await PreProcessorUnitλ({}, mockParserGenerator())
  t.equals(isError(PreProcessorUnit), true)
  t.equals(PreProcessorUnit.message, 'PreProcessor must have a vskwpType property')
})
tape('[Function: PreProcessorUnitλ] returns the correct Error if its argument has the wrong vskwpType', async function (t) {
  t.plan(2)
  const PreProcessorUnit = await PreProcessorUnitλ(mockWrongThing(), mockParserGenerator())
  t.equals(isError(PreProcessorUnit), true)
  t.equals(PreProcessorUnit.message, 'PreProcessor must have the appropriate vskwpType property')
})
tape('[Function: PreProcessorUnitλ] returns the a curried function with the correct vskwpType', async function (t) {
  t.plan(1)
  const PreProcessorUnit = await PreProcessorUnitλ(mockPreProcessor())
  t.equals(PreProcessorUnit.vskwpType, 'PreProcessorUnit')
})


// =============================================================================
//    ParserGeneratorUnit
// =============================================================================
tape('[Function: ParserGeneratorUnit] returns the correct Error without an argument', async function (t) {
  t.plan(2)
  const ParserGeneratorUnit = await ParserGeneratorUnitλ(mockVesselConstraintGenerator(), mockParserGenerator())
  const Parser = await ParserGeneratorUnit()
  t.equals(isError(Parser), true)
  t.equals(Parser.message, 'ParserGeneratorUnit requires an argument; a VesselData object')
})


// // =============================================================================
// //    Modes
// // =============================================================================
//
//
// tape('[Function: OptionsValidator] returns false if given an Options object which does not contain 4 properties', async function (t) {
//   t.plan(1)
//   const Options = { VesselConstraintGenerator: 'a', ParserGenerator: 'b', PreProcessor: 'c' }
//   const result = OptionsValidator(Options)
//   t.equals(result, false)
// })
// tape('[Function: OptionsValidator] returns false if given an Options object which does not contain correctly named properties', async function (t) {
//   t.plan(4)
//   const OptionsNoTokeniser = { VesselConstraintGenerator: 'a', ParserGenerator: 'b', PreProcessor: 'c', ShouldNotBeHere: 'd' }
//   const resultNoTokeniser = OptionsValidator(OptionsNoTokeniser)
//   t.equals(resultNoTokeniser, false)
//   const OptionsNoPreProcessor = { VesselConstraintGenerator: 'a', ParserGenerator: 'b', ShouldNotBeHere: 'c', Tokeniser: 'd' }
//   const resultNoPreProcessor = OptionsValidator(OptionsNoPreProcessor)
//   t.equals(resultNoPreProcessor, false)
//   const OptionsNoParserGenerator = { VesselConstraintGenerator: 'a', ShouldNotBeHere: 'b', PreProcessor: 'c', ShouldNotBeHere: 'd' }
//   const resultNoParserGenerator = OptionsValidator(OptionsNoParserGenerator)
//   t.equals(resultNoParserGenerator, false)
//   const OptionsNoVesselConstraintGenerator = { ShouldNotBeHere: 'a', ParserGenerator: 'b', PreProcessor: 'c', ShouldNotBeHere: 'd' }
//   const resultNoVesselConstraintGenerator = OptionsValidator(OptionsNoVesselConstraintGenerator)
//   t.equals(resultNoVesselConstraintGenerator, false)
// })
// tape('[Function: OptionsValidator] returns false if given an Options object which contains undefined properties', async function (t) {
//   t.plan(4)
//   const OptionsTokeniserUndefined = { VesselConstraintGenerator: 'a', ParserGenerator: 'b', PreProcessor: 'c', Tokeniser: undefined }
//   const resultTokeniserUndefined = OptionsValidator(OptionsTokeniserUndefined)
//   t.equals(resultTokeniserUndefined, false)
//   const OptionsPreProcessorUndefined = { VesselConstraintGenerator: 'a', ParserGenerator: 'b', PreProcessor: undefined, Tokeniser: 'd' }
//   const resultPreProcessorUndefined = OptionsValidator(OptionsPreProcessorUndefined)
//   t.equals(resultPreProcessorUndefined, false)
//   const OptionsParserGeneratorUndefined = { VesselConstraintGenerator: 'a', ParserGenerator: undefined, PreProcessor: 'c', Tokeniser: 'd' }
//   const resultParserGeneratorUndefined = OptionsValidator(OptionsParserGeneratorUndefined)
//   t.equals(resultParserGeneratorUndefined, false)
//   const OptionsVesselConstraintGeneratorUndefined = { VesselConstraintGenerator: undefined, ParserGenerator: 'b', PreProcessor: 'c', Tokeniser: 'd' }
//   const resultVesselConstraintGeneratorUndefined = OptionsValidator(OptionsVesselConstraintGeneratorUndefined)
//   t.equals(resultVesselConstraintGeneratorUndefined, false)
// })
//
//
// tape('[Function: DevModeλ] returns an Error without an argument', async function (t) {
//   t.plan(1)
//   const DevMode = await DevModeλ()
//   t.equals(isError(DevMode), true)
// })
// tape('[Function: DevModeλ] returns an Error if given an invalid Options object', async function (t) {
//   t.plan(1)
//   const Options = { VesselConstraintGenerator: 'a', ParserGenerator: 'b', PreProcessor: 'c', Tokeniser: undefined }
//   const DevMode = await DevModeλ(Options)
//   t.equals(isError(DevMode), true)
// })
// tape('[Function: DevModeλ] returns a function ([Function: DevMode])', async function (t) {
//   t.plan(1)
//   const Options = { VesselConstraintGenerator: 'a', ParserGenerator: 'b', PreProcessor: 'c', Tokeniser: 'd' }
//   const DevMode = await DevModeλ(Options)
//   t.equals(typeof DevMode === 'function', true)
// })
// tape('[Function: DevMode] returns an Error without 2 arguments', async function (t) {
//   t.plan(3)
//   const Options = { VesselConstraintGenerator: 'a', ParserGenerator: 'b', PreProcessor: 'c', Tokeniser: 'd' }
//   const DevMode = await DevModeλ(Options)
//   const noArgument = await DevMode()
//   t.equals(isError(noArgument), true)
//   const firstArgOnly = await DevMode({}, undefined)
//   t.equals(isError(firstArgOnly), true)
//   const secondArgOnly = await DevMode(undefined, {})
//   t.equals(isError(secondArgOnly), true)
// })
