import type { SentimentImpactKey, SimulationConfig } from "../types/simulation";

export type SentimentImpactDefinition = {
  key: SentimentImpactKey;
  label: string;
  unitImpactLabel: string;
  min: number;
  max: number;
  step: number;
  description: string;
};

export const sentimentImpactDefinitions: SentimentImpactDefinition[] = [
  {
    key: "oilPrice",
    label: "Oil price",
    unitImpactLabel: "sentiment pts per USD/bbl",
    min: -0.12,
    max: 0,
    step: 0.01,
    description: "Direct public concern from fuel and logistics exposure."
  },
  {
    key: "inflationRate",
    label: "Inflation rate",
    unitImpactLabel: "sentiment pts per percentage point",
    min: -1.2,
    max: 0,
    step: 0.05,
    description: "Direct sensitivity to headline inflation beyond derived affordability pressure."
  },
  {
    key: "cpiIndex",
    label: "CPI index",
    unitImpactLabel: "sentiment pts per index point",
    min: -0.12,
    max: 0,
    step: 0.01,
    description: "Direct effect of the consumer price level."
  },
  {
    key: "fuelSubsidy",
    label: "Fuel subsidy",
    unitImpactLabel: "sentiment pts per RM billion",
    min: 0,
    max: 0.35,
    step: 0.01,
    description: "Short-term public sentiment benefit from fuel-cost relief."
  },
  {
    key: "foodSubsidy",
    label: "Food subsidy",
    unitImpactLabel: "sentiment pts per RM billion",
    min: 0,
    max: 0.45,
    step: 0.01,
    description: "Sentiment benefit from essential goods support."
  },
  {
    key: "cashAid",
    label: "Cash aid",
    unitImpactLabel: "sentiment pts per RM billion",
    min: 0,
    max: 0.55,
    step: 0.01,
    description: "Direct household confidence effect from cash transfers."
  },
  {
    key: "taxRate",
    label: "Tax rate",
    unitImpactLabel: "sentiment pts per percentage point",
    min: -1.1,
    max: 0,
    step: 0.05,
    description: "Direct sentiment cost of higher effective taxation."
  },
  {
    key: "unemploymentRate",
    label: "Unemployment rate",
    unitImpactLabel: "sentiment pts per percentage point",
    min: -4,
    max: 0,
    step: 0.1,
    description: "Direct confidence loss from labour market weakness."
  },
  {
    key: "healthcareSpending",
    label: "Healthcare spending",
    unitImpactLabel: "sentiment pts per RM billion",
    min: 0,
    max: 0.18,
    step: 0.01,
    description: "Visible public service and welfare benefit."
  },
  {
    key: "publicTransportSpending",
    label: "Public transport spending",
    unitImpactLabel: "sentiment pts per RM billion",
    min: 0,
    max: 0.2,
    step: 0.01,
    description: "Mobility and cost-pressure relief effect."
  },
  {
    key: "exchangeRate",
    label: "Exchange rate weakening",
    unitImpactLabel: "sentiment pts per RM/USD",
    min: -4,
    max: 0,
    step: 0.1,
    description: "Direct concern from currency-linked import costs."
  },
  {
    key: "interestRate",
    label: "Interest rate",
    unitImpactLabel: "sentiment pts per percentage point",
    min: -0.8,
    max: 0.2,
    step: 0.05,
    description: "Household and business financing cost effect."
  },
  {
    key: "foodPriceIndex",
    label: "Food price index",
    unitImpactLabel: "sentiment pts per index point",
    min: -0.16,
    max: 0,
    step: 0.01,
    description: "Direct public sensitivity to food affordability."
  },
  {
    key: "housingCostIndex",
    label: "Housing cost index",
    unitImpactLabel: "sentiment pts per index point",
    min: -0.16,
    max: 0,
    step: 0.01,
    description: "Housing affordability pressure effect."
  },
  {
    key: "wageGrowth",
    label: "Wage growth",
    unitImpactLabel: "sentiment pts per percentage point",
    min: 0,
    max: 1.2,
    step: 0.05,
    description: "Direct improvement from stronger wage growth."
  },
  {
    key: "importCostIndex",
    label: "Import cost index",
    unitImpactLabel: "sentiment pts per index point",
    min: -0.12,
    max: 0,
    step: 0.01,
    description: "Imported input and goods price effect."
  },
  {
    key: "publicServiceQuality",
    label: "Public service quality",
    unitImpactLabel: "sentiment pts per score point",
    min: 0,
    max: 0.25,
    step: 0.01,
    description: "Trust-building effect from better service delivery."
  },
  {
    key: "socialAssistanceCoverage",
    label: "Social assistance coverage",
    unitImpactLabel: "sentiment pts per score point",
    min: 0,
    max: 0.2,
    step: 0.01,
    description: "Confidence effect from reaching more eligible households."
  }
];

export const defaultSentimentImpactWeights: Record<SentimentImpactKey, number> = {
  oilPrice: -0.025,
  inflationRate: -0.35,
  cpiIndex: -0.035,
  fuelSubsidy: 0.11,
  foodSubsidy: 0.18,
  cashAid: 0.26,
  taxRate: -0.45,
  unemploymentRate: -2.6,
  healthcareSpending: 0.04,
  publicTransportSpending: 0.04,
  exchangeRate: -0.65,
  interestRate: -0.2,
  foodPriceIndex: -0.04,
  housingCostIndex: -0.05,
  wageGrowth: 0.28,
  importCostIndex: -0.03,
  publicServiceQuality: 0.12,
  socialAssistanceCoverage: 0.06
};

export const defaultImpactEdgeWeights: Record<string, number> = {
  "oilPrice->transportBurden": 85,
  "oilPrice->foodPressure": 62,
  "oilPrice->costOfLiving": 72,
  "inflationRate->costOfLiving": 92,
  "inflationRate->disposableIncome": 78,
  "inflationRate->policyApproval": 66,
  "exchangeRate->foodPressure": 70,
  "unemploymentRate->disposableIncome": 88,
  "unemploymentRate->stabilityRisk": 92,
  "fuelSubsidy->transportBurden": 74,
  "fuelSubsidy->fiscalBalance": 82,
  "foodSubsidy->foodPressure": 78,
  "foodSubsidy->policyApproval": 58,
  "foodSubsidy->fiscalBalance": 64,
  "cashAid->disposableIncome": 82,
  "cashAid->policyApproval": 76,
  "cashAid->fiscalBalance": 70,
  "taxRate->fiscalBalance": 80,
  "taxRate->disposableIncome": 72,
  "foodPressure->costOfLiving": 86,
  "transportBurden->costOfLiving": 74,
  "disposableIncome->citizenSentiment": 80,
  "fiscalBalance->fiscalRisk": 88,
  "costOfLiving->citizenSentiment": 92,
  "costOfLiving->publicTrust": 58,
  "publicTrust->citizenSentiment": 74,
  "publicTrust->policyApproval": 82,
  "fiscalRisk->publicTrust": 62,
  "fiscalRisk->policyApproval": 58,
  "stabilityRisk->publicTrust": 68
};

export const defaultSimulationConfig: SimulationConfig = {
  sentimentImpactWeights: defaultSentimentImpactWeights,
  impactEdgeWeights: defaultImpactEdgeWeights
};

export function mergeSimulationConfig(value: Partial<SimulationConfig> | null | undefined): SimulationConfig {
  return {
    sentimentImpactWeights: {
      ...defaultSentimentImpactWeights,
      ...(value?.sentimentImpactWeights ?? {})
    },
    impactEdgeWeights: {
      ...defaultImpactEdgeWeights,
      ...(value?.impactEdgeWeights ?? {})
    }
  };
}
