// =============================================================================
//    Templates
// =============================================================================

async function VesselConstraintGeneratorT(VesselData) {
  return VesselConstraints
}

async function ParserGeneratorT(VesselConstraints) {
  return Parser
}

async function PreProcessorT(WaveData) {
  return PreProcessedWaveData
}

async function TokeniserT(PreProcessedWaveData) {
  return Sentence
}
