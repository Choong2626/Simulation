import type { SimulationInputs } from "./simulation";

export type ParameterKey = keyof SimulationInputs;

export type ParameterCategoryId =
  | "macroeconomic"
  | "costOfLiving"
  | "fiscalPolicy"
  | "publicServices"
  | "labourMarket";

export type ParameterDefinition = {
  key: ParameterKey;
  label: string;
  min: number;
  max: number;
  step: number;
  unit: string;
  category: ParameterCategoryId;
  description: string;
};

export type PageId =
  | "overview"
  | "controls"
  | "segments"
  | "network"
  | "comparison"
  | "optimizer";
