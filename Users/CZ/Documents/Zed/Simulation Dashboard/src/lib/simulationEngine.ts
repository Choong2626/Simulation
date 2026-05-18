import { baselineInputs } from "../data/baselineScenario";
import type {
  SegmentGroup,
  SegmentImpact,
  SimulationConfig,
  SimulationInputs,
  SimulationOutputs,
  SimulationResult
} from "../types/simulation";
import { clamp, getRiskStatus, normalizeScore, roundTo } from "./clamp";
import { defaultSimulationConfig, mergeSimulationConfig } from "./impactModel";

type DerivedMetrics = {
  costOfLivingPressure: number;
  inflationPressure: number;
  fiscalBalance: number;
  disposableIncomeIndex: number;
  fiscalRisk: number;
  publicTrust: number;
  policyApproval: number;
  socialStabilityRisk: number;
  citizenSentiment: number;
  policySustainability: number;
};

type SegmentWeightKey =
  | keyof SimulationInputs
  | "fiscalRisk"
  | "inflationPressure"
  | "costOfLivingPressure"
  | "publicTrust"
  | "policyApproval";

type SegmentModel = {
  id: string;
  name: string;
  group: SegmentGroup;
  outputKey?: keyof SimulationOutputs;
  weights: Partial<Record<SegmentWeightKey, number>>;
  baselineOffset?: number;
  costBurdenOffset?: number;
  urbanity?: number;
  rurality?: number;
  positiveDrivers: Array<{ condition: (inputs: SimulationInputs, outputs: SimulationOutputs) => boolean; text: string }>;
  negativeDrivers: Array<{ condition: (inputs: SimulationInputs, outputs: SimulationOutputs) => boolean; text: string }>;
};

const baselineDerived = {
  fiscalRisk: 42,
  inflationPressure: 55,
  costOfLivingPressure: 60,
  publicTrust: 62,
  policyApproval: 64
};

const incomeModels: SegmentModel[] = [
  {
    id: "b40",
    name: "B40 households",
    group: "Income",
    outputKey: "b40Sentiment",
    baselineOffset: -3,
    costBurdenOffset: 12,
    weights: {
      foodPriceIndex: -0.42,
      cashAid: 0.58,
      foodSubsidy: 0.46,
      fuelSubsidy: 0.14,
      unemploymentRate: -0.42,
      cpiIndex: -0.28,
      socialAssistanceCoverage: 0.24,
      costOfLivingPressure: -0.12
    },
    positiveDrivers: [
      { condition: (i) => i.cashAid > baselineInputs.cashAid, text: "direct cash aid targeted to low-income households" },
      { condition: (i) => i.foodSubsidy > baselineInputs.foodSubsidy, text: "food subsidy support for essentials" },
      { condition: (i) => i.socialAssistanceCoverage > baselineInputs.socialAssistanceCoverage, text: "broader social assistance coverage" }
    ],
    negativeDrivers: [
      { condition: (i) => i.foodPriceIndex > baselineInputs.foodPriceIndex, text: "food price pressure" },
      { condition: (i) => i.unemploymentRate > baselineInputs.unemploymentRate, text: "labour market weakness" },
      { condition: (_i, o) => o.costOfLivingPressure > 70, text: "high household affordability pressure" }
    ]
  },
  {
    id: "m40",
    name: "M40 households",
    group: "Income",
    outputKey: "m40Sentiment",
    baselineOffset: 0,
    costBurdenOffset: 3,
    weights: {
      taxRate: -0.34,
      housingCostIndex: -0.34,
      fuelSubsidy: 0.2,
      wageGrowth: 0.3,
      cpiIndex: -0.22,
      interestRate: -0.28,
      publicTransportSpending: 0.12
    },
    positiveDrivers: [
      { condition: (i) => i.wageGrowth > baselineInputs.wageGrowth, text: "stronger wage growth" },
      { condition: (i) => i.fuelSubsidy > baselineInputs.fuelSubsidy, text: "fuel cost relief" },
      { condition: (i) => i.publicTransportSpending > baselineInputs.publicTransportSpending, text: "better commuting support" }
    ],
    negativeDrivers: [
      { condition: (i) => i.taxRate > baselineInputs.taxRate, text: "higher tax burden" },
      { condition: (i) => i.housingCostIndex > baselineInputs.housingCostIndex, text: "housing cost pressure" },
      { condition: (i) => i.interestRate > baselineInputs.interestRate, text: "higher financing cost" }
    ]
  },
  {
    id: "t20",
    name: "T20 households",
    group: "Income",
    outputKey: "t20Sentiment",
    baselineOffset: 4,
    costBurdenOffset: -10,
    weights: {
      taxRate: -0.46,
      publicServiceQuality: 0.2,
      fiscalRisk: -0.18,
      inflationPressure: -0.1,
      cashAid: 0.03,
      fuelSubsidy: 0.03
    },
    positiveDrivers: [
      { condition: (i) => i.publicServiceQuality > baselineInputs.publicServiceQuality, text: "stronger public service quality" },
      { condition: (_i, o) => o.fiscalRisk < 40, text: "credible fiscal position" }
    ],
    negativeDrivers: [
      { condition: (i) => i.taxRate > baselineInputs.taxRate, text: "higher effective taxation" },
      { condition: (_i, o) => o.fiscalRisk > 65, text: "elevated fiscal risk" },
      { condition: (_i, o) => o.inflationPressure > 65, text: "inflation pressure" }
    ]
  }
];

const ageModels: SegmentModel[] = [
  {
    id: "youth",
    name: "Youth",
    group: "Age",
    outputKey: "youthSentiment",
    baselineOffset: -1,
    costBurdenOffset: 4,
    weights: {
      unemploymentRate: -0.46,
      wageGrowth: 0.38,
      housingCostIndex: -0.24,
      publicTransportSpending: 0.22,
      publicServiceQuality: 0.12
    },
    positiveDrivers: [
      { condition: (i) => i.wageGrowth > baselineInputs.wageGrowth, text: "better wage prospects" },
      { condition: (i) => i.publicTransportSpending > baselineInputs.publicTransportSpending, text: "lower commuting burden" }
    ],
    negativeDrivers: [
      { condition: (i) => i.unemploymentRate > baselineInputs.unemploymentRate, text: "job market concern" },
      { condition: (i) => i.housingCostIndex > baselineInputs.housingCostIndex, text: "housing affordability pressure" }
    ]
  },
  {
    id: "working-age",
    name: "Working-age adults",
    group: "Age",
    baselineOffset: 0,
    costBurdenOffset: 2,
    weights: {
      wageGrowth: 0.28,
      taxRate: -0.26,
      housingCostIndex: -0.26,
      fuelSubsidy: 0.16,
      unemploymentRate: -0.26,
      publicTransportSpending: 0.14
    },
    positiveDrivers: [
      { condition: (i) => i.wageGrowth > baselineInputs.wageGrowth, text: "wage growth" },
      { condition: (i) => i.fuelSubsidy > baselineInputs.fuelSubsidy, text: "fuel and commuting relief" }
    ],
    negativeDrivers: [
      { condition: (i) => i.taxRate > baselineInputs.taxRate, text: "higher tax burden" },
      { condition: (i) => i.unemploymentRate > baselineInputs.unemploymentRate, text: "labour market risk" }
    ]
  },
  {
    id: "elderly",
    name: "Elderly citizens",
    group: "Age",
    outputKey: "elderlySentiment",
    baselineOffset: -2,
    costBurdenOffset: 8,
    weights: {
      healthcareSpending: 0.38,
      cpiIndex: -0.3,
      socialAssistanceCoverage: 0.32,
      foodSubsidy: 0.28,
      foodPriceIndex: -0.24,
      cashAid: 0.18
    },
    positiveDrivers: [
      { condition: (i) => i.healthcareSpending > baselineInputs.healthcareSpending, text: "healthcare spending" },
      { condition: (i) => i.socialAssistanceCoverage > baselineInputs.socialAssistanceCoverage, text: "social assistance coverage" },
      { condition: (i) => i.foodSubsidy > baselineInputs.foodSubsidy, text: "food subsidy support" }
    ],
    negativeDrivers: [
      { condition: (i) => i.cpiIndex > baselineInputs.cpiIndex, text: "higher essential prices" },
      { condition: (i) => i.foodPriceIndex > baselineInputs.foodPriceIndex, text: "food affordability pressure" }
    ]
  }
];

const stateProfiles = [
  { id: "johor", name: "Johor", urbanity: 0.72, rurality: 0.28, lowIncomeExposure: 0.34, logisticsExposure: 0.34, baselineOffset: 0 },
  { id: "kedah", name: "Kedah", urbanity: 0.46, rurality: 0.54, lowIncomeExposure: 0.48, logisticsExposure: 0.36, baselineOffset: -2 },
  { id: "kelantan", name: "Kelantan", urbanity: 0.35, rurality: 0.65, lowIncomeExposure: 0.58, logisticsExposure: 0.44, baselineOffset: -3 },
  { id: "melaka", name: "Melaka", urbanity: 0.68, rurality: 0.32, lowIncomeExposure: 0.34, logisticsExposure: 0.3, baselineOffset: 0 },
  { id: "negeri-sembilan", name: "Negeri Sembilan", urbanity: 0.58, rurality: 0.42, lowIncomeExposure: 0.38, logisticsExposure: 0.32, baselineOffset: -1 },
  { id: "pahang", name: "Pahang", urbanity: 0.42, rurality: 0.58, lowIncomeExposure: 0.48, logisticsExposure: 0.48, baselineOffset: -2 },
  { id: "penang", name: "Penang", urbanity: 0.84, rurality: 0.16, lowIncomeExposure: 0.3, logisticsExposure: 0.34, baselineOffset: 1 },
  { id: "perak", name: "Perak", urbanity: 0.54, rurality: 0.46, lowIncomeExposure: 0.43, logisticsExposure: 0.36, baselineOffset: -1 },
  { id: "perlis", name: "Perlis", urbanity: 0.4, rurality: 0.6, lowIncomeExposure: 0.5, logisticsExposure: 0.38, baselineOffset: -2 },
  { id: "sabah", name: "Sabah", urbanity: 0.42, rurality: 0.58, lowIncomeExposure: 0.56, logisticsExposure: 0.68, baselineOffset: -4 },
  { id: "sarawak", name: "Sarawak", urbanity: 0.48, rurality: 0.52, lowIncomeExposure: 0.5, logisticsExposure: 0.62, baselineOffset: -3 },
  { id: "selangor", name: "Selangor", urbanity: 0.9, rurality: 0.1, lowIncomeExposure: 0.28, logisticsExposure: 0.28, baselineOffset: 2 },
  { id: "terengganu", name: "Terengganu", urbanity: 0.45, rurality: 0.55, lowIncomeExposure: 0.47, logisticsExposure: 0.42, baselineOffset: -2 },
  { id: "kuala-lumpur", name: "Kuala Lumpur", urbanity: 0.98, rurality: 0.02, lowIncomeExposure: 0.25, logisticsExposure: 0.22, baselineOffset: 2 },
  { id: "labuan", name: "Labuan", urbanity: 0.78, rurality: 0.22, lowIncomeExposure: 0.34, logisticsExposure: 0.58, baselineOffset: -1 },
  { id: "putrajaya", name: "Putrajaya", urbanity: 0.96, rurality: 0.04, lowIncomeExposure: 0.18, logisticsExposure: 0.18, baselineOffset: 3 }
];

const stateModels: SegmentModel[] = stateProfiles.map((state) => ({
  id: `state-${state.id}`,
  name: state.name,
  group: "State",
  urbanity: state.urbanity,
  rurality: state.rurality,
  baselineOffset: state.baselineOffset,
  costBurdenOffset: state.lowIncomeExposure * 6 + state.rurality * 4 + state.logisticsExposure * 3 - state.urbanity * 2,
  weights: {
    oilPrice: -0.08 - state.rurality * 0.22 - state.logisticsExposure * 0.08,
    fuelSubsidy: 0.08 + state.rurality * 0.34,
    foodSubsidy: 0.08 + state.lowIncomeExposure * 0.28,
    cashAid: 0.06 + state.lowIncomeExposure * 0.22,
    foodPriceIndex: -0.1 - state.lowIncomeExposure * 0.22,
    housingCostIndex: -0.08 - state.urbanity * 0.24,
    publicTransportSpending: 0.06 + state.urbanity * 0.2 + state.rurality * 0.08,
    socialAssistanceCoverage: 0.06 + state.lowIncomeExposure * 0.18,
    importCostIndex: -0.03 - state.logisticsExposure * 0.16,
    unemploymentRate: -0.16 - state.lowIncomeExposure * 0.18,
    wageGrowth: 0.1 + state.urbanity * 0.14,
    healthcareSpending: 0.04 + state.rurality * 0.08
  },
  positiveDrivers: [
    { condition: (i) => i.fuelSubsidy > baselineInputs.fuelSubsidy && state.rurality > 0.45, text: "fuel subsidy support for rural mobility" },
    { condition: (i) => i.publicTransportSpending > baselineInputs.publicTransportSpending && state.urbanity > 0.65, text: "urban public transport investment" },
    { condition: (i) => i.cashAid > baselineInputs.cashAid && state.lowIncomeExposure > 0.42, text: "cash aid for lower-income households" },
    { condition: (i) => i.foodSubsidy > baselineInputs.foodSubsidy, text: "food subsidy support" }
  ],
  negativeDrivers: [
    { condition: (i) => i.oilPrice > baselineInputs.oilPrice && state.rurality > 0.45, text: "fuel-linked rural transport pressure" },
    { condition: (i) => i.housingCostIndex > baselineInputs.housingCostIndex && state.urbanity > 0.65, text: "urban housing cost pressure" },
    { condition: (i) => i.importCostIndex > baselineInputs.importCostIndex && state.logisticsExposure > 0.5, text: "logistics and imported goods pressure" },
    { condition: (i) => i.foodPriceIndex > baselineInputs.foodPriceIndex, text: "food price pressure" }
  ]
}));

const segmentModels: SegmentModel[] = [...incomeModels, ...ageModels, ...stateModels];

const hiddenOutputModels: Array<{
  outputKey: keyof Pick<SimulationOutputs, "smallBusinessSentiment" | "civilServantSentiment" | "gigWorkerSentiment">;
  weights: SegmentModel["weights"];
  baselineOffset?: number;
}> = [
  {
    outputKey: "smallBusinessSentiment",
    baselineOffset: -1,
    weights: { inflationRate: -0.2, interestRate: -0.24, taxRate: -0.2, importCostIndex: -0.24, publicServiceQuality: 0.12 }
  },
  {
    outputKey: "civilServantSentiment",
    baselineOffset: 1,
    weights: { inflationRate: -0.2, wageGrowth: 0.18, publicServiceQuality: 0.26, cpiIndex: -0.16 }
  },
  {
    outputKey: "gigWorkerSentiment",
    baselineOffset: -2,
    weights: { oilPrice: -0.3, fuelSubsidy: 0.34, unemploymentRate: -0.18, cashAid: 0.18, foodPriceIndex: -0.18 }
  }
];

function delta(inputs: SimulationInputs, key: keyof SimulationInputs): number {
  return inputs[key] - baselineInputs[key];
}

function segmentDelta(inputs: SimulationInputs, outputs: Partial<SimulationOutputs>, weights: SegmentModel["weights"]): number {
  return Object.entries(weights).reduce((total, [rawKey, weight]) => {
    const key = rawKey as SegmentWeightKey;
    if (!weight) return total;
    if (key === "fiscalRisk") return total + ((outputs.fiscalRisk ?? baselineDerived.fiscalRisk) - baselineDerived.fiscalRisk) * weight * 0.7;
    if (key === "inflationPressure") return total + ((outputs.inflationPressure ?? baselineDerived.inflationPressure) - baselineDerived.inflationPressure) * weight * 0.7;
    if (key === "costOfLivingPressure") return total + ((outputs.costOfLivingPressure ?? baselineDerived.costOfLivingPressure) - baselineDerived.costOfLivingPressure) * weight;
    if (key === "publicTrust") return total + ((outputs.publicTrust ?? baselineDerived.publicTrust) - baselineDerived.publicTrust) * weight;
    if (key === "policyApproval") return total + ((outputs.policyApproval ?? baselineDerived.policyApproval) - baselineDerived.policyApproval) * weight;
    return total + delta(inputs, key) * weight;
  }, 0);
}

function average(values: number[]): number {
  if (values.length === 0) return 65;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function weightedAverage(items: Array<{ value: number; weight: number }>): number {
  const weightSum = items.reduce((sum, item) => sum + item.weight, 0);
  if (weightSum === 0) return average(items.map((item) => item.value));
  return items.reduce((sum, item) => sum + item.value * item.weight, 0) / weightSum;
}

export function calculateCostOfLivingPressure(inputs: SimulationInputs): number {
  return normalizeScore(
    60 +
      delta(inputs, "inflationRate") * 4.2 +
      delta(inputs, "cpiIndex") * 0.45 +
      delta(inputs, "oilPrice") * 0.12 +
      delta(inputs, "foodPriceIndex") * 0.3 +
      delta(inputs, "housingCostIndex") * 0.24 +
      delta(inputs, "exchangeRate") * 8 +
      delta(inputs, "importCostIndex") * 0.18 +
      delta(inputs, "interestRate") * 1.6 -
      delta(inputs, "foodSubsidy") * 0.55 -
      delta(inputs, "fuelSubsidy") * 0.26 -
      delta(inputs, "cashAid") * 0.18 -
      delta(inputs, "wageGrowth") * 2.1 -
      delta(inputs, "publicTransportSpending") * 0.14
  );
}

export function calculateInflationPressure(inputs: SimulationInputs): number {
  return normalizeScore(
    55 +
      delta(inputs, "inflationRate") * 6.2 +
      delta(inputs, "oilPrice") * 0.16 +
      delta(inputs, "importCostIndex") * 0.24 +
      delta(inputs, "exchangeRate") * 9.5 +
      delta(inputs, "foodPriceIndex") * 0.22 +
      delta(inputs, "housingCostIndex") * 0.13 -
      delta(inputs, "foodSubsidy") * 0.24 -
      delta(inputs, "publicTransportSpending") * 0.08 -
      delta(inputs, "interestRate") * 1.1
  );
}

export function calculateFiscalBalance(inputs: SimulationInputs): number {
  return roundTo(
    -20 +
      delta(inputs, "nationalBudget") * 0.16 +
      delta(inputs, "taxRate") * 4.2 -
      delta(inputs, "fuelSubsidy") * 1.0 -
      delta(inputs, "foodSubsidy") * 1.02 -
      delta(inputs, "cashAid") * 1.05 -
      delta(inputs, "healthcareSpending") * 0.62 -
      delta(inputs, "publicTransportSpending") * 0.64,
    1
  );
}

export function calculateDisposableIncomeIndex(inputs: SimulationInputs): number {
  return normalizeScore(
    63 +
      delta(inputs, "wageGrowth") * 3.2 +
      delta(inputs, "cashAid") * 0.75 +
      delta(inputs, "foodSubsidy") * 0.42 +
      delta(inputs, "fuelSubsidy") * 0.24 -
      delta(inputs, "taxRate") * 1.35 -
      delta(inputs, "unemploymentRate") * 3.7 -
      delta(inputs, "inflationRate") * 3.1 -
      delta(inputs, "housingCostIndex") * 0.16 -
      delta(inputs, "foodPriceIndex") * 0.14 -
      delta(inputs, "interestRate") * 1.2
  );
}

function calculateFiscalRisk(fiscalBalance: number, inputs: SimulationInputs): number {
  const targetedRatio = (inputs.cashAid + inputs.foodSubsidy) / Math.max(1, inputs.fuelSubsidy + inputs.foodSubsidy + inputs.cashAid);
  return normalizeScore(
    42 +
      Math.max(0, -fiscalBalance - 20) * 1.15 +
      delta(inputs, "fuelSubsidy") * 0.65 +
      delta(inputs, "cashAid") * 0.35 +
      delta(inputs, "foodSubsidy") * 0.25 -
      delta(inputs, "taxRate") * 1.7 -
      delta(inputs, "nationalBudget") * 0.05 -
      (targetedRatio - 0.42) * 8
  );
}

export function calculatePublicTrust(
  inputs: SimulationInputs,
  derived: Pick<DerivedMetrics, "costOfLivingPressure" | "fiscalRisk" | "inflationPressure" | "socialStabilityRisk" | "policySustainability">
): number {
  return normalizeScore(
    62 +
      delta(inputs, "healthcareSpending") * 0.28 +
      delta(inputs, "publicTransportSpending") * 0.25 +
      delta(inputs, "publicServiceQuality") * 0.42 +
      delta(inputs, "socialAssistanceCoverage") * 0.2 -
      (derived.costOfLivingPressure - 60) * 0.18 -
      (derived.fiscalRisk - 42) * 0.16 -
      (derived.inflationPressure - 55) * 0.12 -
      (derived.socialStabilityRisk - 42) * 0.15 +
      (derived.policySustainability - 62) * 0.12
  );
}

function calculateSocialStabilityRisk(inputs: SimulationInputs, costOfLivingPressure: number, disposableIncomeIndex: number): number {
  return normalizeScore(
    42 +
      (costOfLivingPressure - 60) * 0.48 -
      (disposableIncomeIndex - 63) * 0.22 +
      delta(inputs, "unemploymentRate") * 5.6 +
      delta(inputs, "inflationRate") * 2.7 -
      delta(inputs, "socialAssistanceCoverage") * 0.22 -
      delta(inputs, "cashAid") * 0.22 -
      delta(inputs, "publicServiceQuality") * 0.16
  );
}

function calculatePolicyApproval(
  inputs: SimulationInputs,
  derived: Pick<DerivedMetrics, "costOfLivingPressure" | "publicTrust" | "fiscalRisk" | "disposableIncomeIndex" | "inflationPressure">
): number {
  return normalizeScore(
    64 -
      (derived.costOfLivingPressure - 60) * 0.28 +
      (derived.publicTrust - 62) * 0.35 +
      (derived.disposableIncomeIndex - 63) * 0.18 -
      (derived.inflationPressure - 55) * 0.16 -
      Math.max(0, derived.fiscalRisk - 65) * 0.18 +
      delta(inputs, "cashAid") * 0.36 +
      delta(inputs, "foodSubsidy") * 0.22 +
      delta(inputs, "publicServiceQuality") * 0.14 -
      delta(inputs, "taxRate") * 0.55
  );
}

function calculateConfigurableSentimentAdjustment(inputs: SimulationInputs, config: SimulationConfig): number {
  const adjustment = Object.entries(config.sentimentImpactWeights).reduce((total, [rawKey, weight]) => {
    const key = rawKey as keyof SimulationInputs;
    return total + delta(inputs, key) * weight;
  }, 0);
  return clamp(adjustment, -24, 24);
}

export function calculateCitizenSentiment(
  inputs: SimulationInputs,
  derived: Pick<DerivedMetrics, "costOfLivingPressure" | "disposableIncomeIndex" | "publicTrust" | "inflationPressure" | "fiscalRisk" | "policyApproval">,
  config: SimulationConfig = defaultSimulationConfig
): number {
  return normalizeScore(
    65 -
      (derived.costOfLivingPressure - 60) * 0.32 +
      (derived.disposableIncomeIndex - 63) * 0.3 +
      (derived.publicTrust - 62) * 0.24 -
      (derived.inflationPressure - 55) * 0.18 -
      Math.max(0, derived.fiscalRisk - 70) * 0.17 +
      (derived.policyApproval - 64) * 0.17 +
      calculateConfigurableSentimentAdjustment(inputs, config)
  );
}

function calculatePolicySustainability(
  citizenSentiment: number,
  fiscalRisk: number,
  inflationPressure: number,
  costOfLivingPressure: number,
  segmentScores: number[]
): number {
  const inequality = Math.max(...segmentScores) - Math.min(...segmentScores);
  return normalizeScore(
    66 +
      (citizenSentiment - 65) * 0.28 -
      (fiscalRisk - 42) * 0.34 -
      (inflationPressure - 55) * 0.18 -
      (costOfLivingPressure - 60) * 0.14 -
      Math.max(0, inequality - 18) * 0.45
  );
}

function calculateSegmentScore(inputs: SimulationInputs, outputs: SimulationOutputs, model: SegmentModel): number {
  return normalizeScore(
    65 +
      (model.baselineOffset ?? 0) +
      segmentDelta(inputs, outputs, model.weights) +
      (outputs.citizenSentiment - 65) * 0.14
  );
}

export function calculateSegmentImpacts(inputs: SimulationInputs, outputs: SimulationOutputs): SegmentImpact[] {
  return segmentModels.map((model) => {
    const baselineScore = 65 + (model.baselineOffset ?? 0) + segmentDelta(baselineInputs, baselineDerived, model.weights);
    const score = calculateSegmentScore(inputs, outputs, model);
    const costBurden = normalizeScore(
      outputs.costOfLivingPressure +
        (model.costBurdenOffset ?? 0) -
        Math.max(0, delta(inputs, "cashAid")) * (model.group === "Income" && model.id === "b40" ? 0.22 : 0.08) -
        Math.max(0, delta(inputs, "foodSubsidy")) * (model.group === "Income" && model.id === "b40" ? 0.18 : 0.08) -
        Math.max(0, delta(inputs, "fuelSubsidy")) * (model.rurality ?? 0) * 0.1
    );
    const positive = model.positiveDrivers.find((driver) => driver.condition(inputs, outputs))?.text ?? "stable baseline support";
    const negative = model.negativeDrivers.find((driver) => driver.condition(inputs, outputs))?.text ?? "limited immediate downside";

    return {
      id: model.id,
      name: model.name,
      group: model.group,
      sentimentScore: score,
      sentimentChange: roundTo(score - baselineScore, 1),
      costBurden,
      disposableIncomeImpact: roundTo(outputs.disposableIncomeIndex - 63 + (100 - costBurden) * 0.04, 1),
      policyApproval: normalizeScore(outputs.policyApproval + (score - outputs.citizenSentiment) * 0.35),
      mainPositiveDriver: positive,
      mainNegativeDriver: negative,
      riskLevel: getRiskStatus(costBurden)
    };
  });
}

function calculateHiddenOutput(inputs: SimulationInputs, outputs: SimulationOutputs, weights: SegmentModel["weights"], baselineOffset = 0): number {
  return normalizeScore(65 + baselineOffset + segmentDelta(inputs, outputs, weights) + (outputs.citizenSentiment - 65) * 0.18);
}

function populateSegmentOutputs(outputs: SimulationOutputs, segmentImpacts: SegmentImpact[]): void {
  const modelById = new Map(segmentModels.map((model) => [model.id, model]));
  segmentImpacts.forEach((segment) => {
    const outputKey = modelById.get(segment.id)?.outputKey;
    if (outputKey) {
      outputs[outputKey] = segment.sentimentScore;
    }
  });

  const stateItems = segmentImpacts
    .filter((segment) => segment.group === "State")
    .map((segment) => {
      const model = modelById.get(segment.id);
      return {
        value: segment.sentimentScore,
        urbanWeight: model?.urbanity ?? 0,
        ruralWeight: model?.rurality ?? 0
      };
    });

  outputs.urbanSentiment = normalizeScore(weightedAverage(stateItems.map((item) => ({ value: item.value, weight: item.urbanWeight }))));
  outputs.ruralSentiment = normalizeScore(weightedAverage(stateItems.map((item) => ({ value: item.value, weight: item.ruralWeight }))));
}

function generateInlineInsights(outputs: SimulationOutputs, segments: SegmentImpact[]): string[] {
  const best = [...segments].sort((a, b) => b.sentimentChange - a.sentimentChange)[0];
  const worst = [...segments].sort((a, b) => a.sentimentChange - b.sentimentChange)[0];
  const b40 = segments.find((segment) => segment.id === "b40");
  const ruralStates = segments.filter((segment) => segment.group === "State" && (stateModels.find((model) => model.id === segment.id)?.rurality ?? 0) > 0.5);
  const ruralAverage = average(ruralStates.map((segment) => segment.sentimentScore));
  const insights = [
    `Overall citizen sentiment is ${outputs.citizenSentiment.toFixed(1)} / 100 with public trust at ${outputs.publicTrust.toFixed(1)} / 100.`,
    `Cost of living pressure is ${outputs.costOfLivingPressure.toFixed(1)} / 100 and fiscal balance is ${outputs.fiscalBalance < 0 ? "-" : ""}RM${Math.abs(outputs.fiscalBalance).toFixed(1)}B.`,
    `${best.name} gain the most in this scenario, while ${worst.name} face the weakest relative impact.`
  ];
  if (b40 && b40.sentimentChange > 4) insights.push("B40 sentiment improves strongly, indicating targeted relief is reaching the lowest-income group.");
  if (ruralAverage > outputs.urbanSentiment + 3) insights.push("Rural-state sentiment gains exceed urban-state gains, mainly due to fuel, food, and assistance channels.");
  if (outputs.fiscalRisk > 80) insights.push("Fiscal risk is critical; the policy mix may be difficult to sustain without revenue measures or sharper targeting.");
  if (outputs.socialStabilityRisk > 70) insights.push("Social stability risk is elevated, driven by affordability and labour market pressure.");
  return insights;
}

export function runSimulation(inputs: SimulationInputs, config: SimulationConfig = defaultSimulationConfig): SimulationResult {
  const modelConfig = mergeSimulationConfig(config);
  const boundedInputs = { ...inputs };
  const costOfLivingPressure = calculateCostOfLivingPressure(boundedInputs);
  const inflationPressure = calculateInflationPressure(boundedInputs);
  const fiscalBalance = calculateFiscalBalance(boundedInputs);
  const disposableIncomeIndex = calculateDisposableIncomeIndex(boundedInputs);
  const socialStabilityRisk = calculateSocialStabilityRisk(boundedInputs, costOfLivingPressure, disposableIncomeIndex);
  const fiscalRisk = calculateFiscalRisk(fiscalBalance, boundedInputs);

  const preliminarySustainability = normalizeScore(
    64 - (fiscalRisk - 42) * 0.32 - (inflationPressure - 55) * 0.16 - (costOfLivingPressure - 60) * 0.13
  );
  const publicTrust = calculatePublicTrust(boundedInputs, {
    costOfLivingPressure,
    fiscalRisk,
    inflationPressure,
    socialStabilityRisk,
    policySustainability: preliminarySustainability
  });
  const policyApproval = calculatePolicyApproval(boundedInputs, {
    costOfLivingPressure,
    publicTrust,
    fiscalRisk,
    disposableIncomeIndex,
    inflationPressure
  });
  const citizenSentiment = calculateCitizenSentiment(
    boundedInputs,
    {
      costOfLivingPressure,
      disposableIncomeIndex,
      publicTrust,
      inflationPressure,
      fiscalRisk,
      policyApproval
    },
    modelConfig
  );

  const outputShell: SimulationOutputs = {
    citizenSentiment,
    publicTrust,
    costOfLivingPressure,
    inflationPressure,
    fiscalBalance,
    disposableIncomeIndex,
    policyApproval,
    fiscalRisk,
    socialStabilityRisk,
    policySustainability: preliminarySustainability,
    b40Sentiment: 0,
    m40Sentiment: 0,
    t20Sentiment: 0,
    urbanSentiment: 0,
    ruralSentiment: 0,
    youthSentiment: 0,
    elderlySentiment: 0,
    smallBusinessSentiment: 0,
    civilServantSentiment: 0,
    gigWorkerSentiment: 0
  };

  const segmentImpacts = calculateSegmentImpacts(boundedInputs, outputShell);
  populateSegmentOutputs(outputShell, segmentImpacts);
  hiddenOutputModels.forEach((model) => {
    outputShell[model.outputKey] = calculateHiddenOutput(boundedInputs, outputShell, model.weights, model.baselineOffset);
  });

  outputShell.policySustainability = calculatePolicySustainability(
    citizenSentiment,
    fiscalRisk,
    inflationPressure,
    costOfLivingPressure,
    segmentImpacts.map((segment) => segment.sentimentScore)
  );
  outputShell.publicTrust = calculatePublicTrust(boundedInputs, {
    costOfLivingPressure,
    fiscalRisk,
    inflationPressure,
    socialStabilityRisk,
    policySustainability: outputShell.policySustainability
  });
  outputShell.policyApproval = calculatePolicyApproval(boundedInputs, {
    costOfLivingPressure,
    publicTrust: outputShell.publicTrust,
    fiscalRisk,
    disposableIncomeIndex,
    inflationPressure
  });
  outputShell.citizenSentiment = calculateCitizenSentiment(
    boundedInputs,
    {
      costOfLivingPressure,
      disposableIncomeIndex,
      publicTrust: outputShell.publicTrust,
      inflationPressure,
      fiscalRisk,
      policyApproval: outputShell.policyApproval
    },
    modelConfig
  );

  const finalSegmentImpacts = calculateSegmentImpacts(boundedInputs, outputShell);
  populateSegmentOutputs(outputShell, finalSegmentImpacts);
  hiddenOutputModels.forEach((model) => {
    outputShell[model.outputKey] = calculateHiddenOutput(boundedInputs, outputShell, model.weights, model.baselineOffset);
  });

  return {
    inputs: boundedInputs,
    outputs: outputShell,
    segmentImpacts: finalSegmentImpacts,
    insights: generateInlineInsights(outputShell, finalSegmentImpacts)
  };
}
