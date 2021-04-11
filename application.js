// =============================================================================
//    Execution
// =============================================================================

// Program execution begins and ends in this file. Since various aspects of the
// application are either CPU intensive or require IO, the main application
// is wrapped into an async function due to JavaScript not allowing the use of
// the await syntax in the main script as it would block execution.

const { readFileλ, writeFileλ } = require('./library/file')
const { DevModeλ }              = require('./library/core')
const { topLevelErrorCheck }    = require('./library/err')

// This is the current version of the software that the core will run.
const alpha                     = require('./collections/alpha')

async function application(collection) {

  const readVesselDataFile = await readFileλ('vs')
  const readWaveDataFile = await readFileλ('wv')

  const VesselData = await readVesselDataFile('./input/vessel.vs.json')
  topLevelErrorCheck(VesselData)
  VesselData.vskwpType = 'VesselData'
  const WaveData = await readWaveDataFile('./input/waves.wv.json')
  topLevelErrorCheck(WaveData)
  WaveData.vskwpType = 'WaveData'

  const Options = {
    VesselConstraintGenerator: collection.VesselConstraintGenerator,
    ParserGenerator: collection.ParserGenerator,
    PreProcessor: collection.PreProcessor,
    Tokeniser: collection.Tokeniser
  }
  const DevMode = await DevModeλ(Options)
  const Parsed = await DevMode(VesselData, WaveData)
  topLevelErrorCheck(Parsed)
  console.log("Parse Complete")
  console.log(`The Statechain was ${Parsed.ParseResult.length} blocks long.`)
  console.log(`The availlable Semantic Information was "${Parsed.SemanticInformation}"`)
}

application(alpha)
