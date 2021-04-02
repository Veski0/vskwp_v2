const readlineSync = require('readline-sync')
const readWaveData = () => {}
const { E, isError } = require('./err')

const checkErr = (Obj, ObjName) => {
  // The object may be undefined
  if (Obj === undefined)           return E(`${ObjName} is undefined`)
  // The object may be an Error
  if (isError(Obj))                return Obj
  // The object may not have a vskwpType property
  if (Obj.vskwpType === undefined) return E(`${ObjName} must have a vskwpType property`)
  // The object may not have an inappropriate vskwpType property
  if (Obj.vskwpType !== ObjName)   return E(`${ObjName} must have the appropriate vskwpType property`)
  return false
}

// =============================================================================
//    Units
// =============================================================================

async function ParserGeneratorUnitλ (VesselConstraintGenerator, ParserGenerator) {
  if (isError(checkErr(VesselConstraintGenerator, 'VesselConstraintGenerator'))) return checkErr(VesselConstraintGenerator, 'VesselConstraintGenerator')
  if (isError(checkErr(ParserGenerator, 'ParserGenerator'))) return checkErr(ParserGenerator, 'ParserGenerator')
  async function ParserGeneratorUnit (VesselData) {
    if (isError(checkErr(VesselData, 'VesselData'))) return checkErr(VesselData, 'VesselData')
    const VesselConstraints = await VesselConstraintGenerator(VesselData)
    if (isError(checkErr(VesselConstraints, 'VesselConstraints'))) return checkErr(VesselConstraints, 'VesselConstraints')
    const Parser = await ParserGenerator(VesselConstraints)
    if (isError(checkErr(Parser, 'Parser'))) return checkErr(Parser, 'Parser')
    return Parser
  }
  ParserGeneratorUnit.vskwpType = 'ParserGeneratorUnit'
  return ParserGeneratorUnit
}
async function PreProcessorUnitλ (PreProcessor) {
  if (isError(checkErr(PreProcessor, 'PreProcessor'))) return checkErr(PreProcessor, 'PreProcessor')
  async function PreProcessorUnit (WaveData) {
    if (isError(checkErr(WaveData, 'WaveData'))) return checkErr(WaveData, 'WaveData')
    const PreProcessedWaveData = await PreProcessor(WaveData)
    if (isError(checkErr(PreProcessedWaveData, 'PreProcessedWaveData'))) return checkErr(PreProcessedWaveData, 'PreProcessedWaveData')
    return PreProcessedWaveData
  }
  PreProcessorUnit.vskwpType = 'PreProcessorUnit'
  return PreProcessorUnit
}
async function TokeniserUnitλ (Tokeniser) {
  if (isError(checkErr(Tokeniser, 'Tokeniser'))) return checkErr(Tokeniser, 'Tokeniser')
  async function TokeniserUnit (PreProcessedWaveData) {
    if (isError(checkErr(PreProcessedWaveData, 'PreProcessedWaveData'))) return checkErr(PreProcessedWaveData, 'PreProcessedWaveData')
    const Sentence = await Tokeniser(PreProcessedWaveData)
    if (isError(checkErr(Sentence, 'Sentence'))) return checkErr(Sentence, 'Sentence')
    return Sentence
  }
  TokeniserUnit.vskwpType = 'TokeniserUnit'
  return TokeniserUnit
}
async function ParsingUnit (Parser, Sentence) {
  if (isError(checkErr(Parser, 'Parser'))) return checkErr(Parser, 'Parser')
  if (isError(checkErr(Sentence, 'Sentence'))) return checkErr(Sentence, 'Sentence')
  const Parsed = await Parser(Sentence)
  if (isError(checkErr(Parsed, 'Parsed'))) return checkErr(Parsed, 'Parsed')
  return Parsed
}

// =============================================================================
//    Modes
// =============================================================================

const OptionsValidator = O => Object.keys(O).length === 4 &&
  O.VesselConstraintGenerator !== undefined && O.ParserGenerator !== undefined &&
  O.PreProcessor !== undefined && O.Tokeniser !== undefined

async function DevModeλ (Options) {
  if (Options == undefined) return E('DevModeλ requires an argument; an Options object')
  if (!OptionsValidator(Options)) return E('DevModeλ could not validate the Options object passed to it')

  async function DevMode (VesselData, WaveData) {
    if (VesselData == undefined || WaveData == undefined) return E('DevMode requires two arguments; a VesselData object and a WaveData object')
    const { VesselConstraintGenerator, ParserGenerator, PreProcessor, Tokeniser } = Options

    const ParserGeneratorUnit = await ParserGeneratorUnitλ(VesselConstraintGenerator, ParserGenerator)
    if (isError(ParserGeneratorUnit)) return ParserGeneratorUnit
    const Parser = await ParserGeneratorUnit(VesselData)
    if (isError(Parser)) return Parser


    const PreProcessorUnit = await PreProcessorUnitλ(PreProcessor)
    if (isError(PreProcessorUnit)) return PreProcessorUnit
    const PreProcessedWaveData = await PreProcessorUnit(WaveData)
    if (isError(PreProcessedWaveData)) return PreProcessedWaveData


    const TokeniserUnit = await TokeniserUnitλ(Tokeniser)
    if (isError(TokeniserUnit)) return TokeniserUnit
    const Sentence = await TokeniserUnit(PreProcessedWaveData)
    if (isError(Sentence)) return Sentence


    const Parsed = await ParsingUnit(Parser, Sentence)
    if (isError(Parsed)) return Parsed
    const { ParseResult, SemanticInformation } = Parsed
    return { ParseResult, SemanticInformation }
  }
  return DevMode
}

ParserGeneratorUnitλ

// const ProMode = (Options) => (VesselData, WaveData) => {
//   const { VesselConstraintGenerator, ParserGenerator, PreProcessor, Tokeniser } = Options
//   const Parser = ParserGeneratorUnit(VesselConstraintGenerator, ParserGenerator)(VesselData)
//   const cmd = readlineSync.question('Input a command')
//   while (cmd !== 'quit') {
//     switch (cmd) {
//       case 'wave':
//         const WaveData = readWaveData(cmd)
//         break;
//       default:
//
//     }
//   }
//   const PreProcessedWaveData = PreProcessorUnit(PreProcessor)(WaveData)
//   const Sentence = TokeniserUnit(Tokeniser)(PreProcessedWaveData)
//   const { ParseResult, SemanticInformation } = ParsingUnit(Parser)(Sentence)
// }

module.exports = { DevModeλ, ParserGeneratorUnitλ, PreProcessorUnitλ, TokeniserUnitλ, ParsingUnit, OptionsValidator }
