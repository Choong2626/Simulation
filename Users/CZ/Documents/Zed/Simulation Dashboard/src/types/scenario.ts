import type { SegmentImpact, SimulationInputs, SimulationOutputs } from "./simulation";

export type Scenario = {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  inputs: SimulationInputs;
  outputs: SimulationOutputs;
  segmentImpacts: SegmentImpact[];
};

export type ScenarioPreset = {
  id: string;
  name: string;
  description: string;
  inputs: SimulationInputs;
};

