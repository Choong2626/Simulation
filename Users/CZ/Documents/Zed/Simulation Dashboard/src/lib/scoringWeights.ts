import type { ParameterDefinition } from "../types/policy";

export const sentimentWeights = {
  costOfLivingPressure: -0.3,
  disposableIncomeIndex: 0.25,
  publicTrust: 0.2,
  unemploymentRate: -0.15,
  inflationPressure: -0.2,
  cashAid: 0.08,
  foodSubsidy: 0.06,
  fuelSubsidy: 0.04,
  publicServiceQuality: 0.1,
  fiscalRiskPenalty: -0.12
};

export const segmentWeights = {
  b40: {
    foodPriceIndex: -0.3,
    cashAid: 0.3,
    foodSubsidy: 0.25,
    unemploymentRate: -0.2,
    cpiIndex: -0.2
  },
  m40: {
    taxRate: -0.2,
    housingCostIndex: -0.25,
    fuelSubsidy: 0.12,
    wageGrowth: 0.2,
    cpiIndex: -0.18
  },
  t20: {
    taxRate: -0.25,
    publicServiceQuality: 0.15,
    fiscalRisk: -0.15,
    inflationPressure: -0.12
  },
  rural: {
    oilPrice: -0.25,
    fuelSubsidy: 0.25,
    publicTransportSpending: 0.08,
    foodSubsidy: 0.15
  },
  urban: {
    housingCostIndex: -0.25,
    publicTransportSpending: 0.25,
    foodPriceIndex: -0.18,
    wageGrowth: 0.15
  }
};

export const parameterDefinitions: ParameterDefinition[] = [
  {
    key: "inflationRate",
    label: "Inflation rate",
    min: 0,
    max: 12,
    step: 0.1,
    unit: "%",
    category: "macroeconomic",
    description: "Headline inflation rate."
  },
  {
    key: "oilPrice",
    label: "Oil price",
    min: 40,
    max: 160,
    step: 1,
    unit: "USD/bbl",
    category: "macroeconomic",
    description: "Global oil benchmark used for domestic fuel pressure."
  },
  {
    key: "cpiIndex",
    label: "CPI index",
    min: 90,
    max: 160,
    step: 1,
    unit: "index",
    category: "macroeconomic",
    description: "Consumer price index level."
  },
  {
    key: "exchangeRate",
    label: "Exchange rate",
    min: 3.5,
    max: 5.5,
    step: 0.01,
    unit: "RM/USD",
    category: "macroeconomic",
    description: "Ringgit rate against the US dollar."
  },
  {
    key: "interestRate",
    label: "Interest rate",
    min: 0,
    max: 8,
    step: 0.1,
    unit: "%",
    category: "macroeconomic",
    description: "Policy and lending rate proxy."
  },
  {
    key: "importCostIndex",
    label: "Import cost index",
    min: 90,
    max: 180,
    step: 1,
    unit: "index",
    category: "macroeconomic",
    description: "Imported input cost pressure."
  },
  {
    key: "foodPriceIndex",
    label: "Food price index",
    min: 90,
    max: 170,
    step: 1,
    unit: "index",
    category: "costOfLiving",
    description: "Retail food cost pressure."
  },
  {
    key: "housingCostIndex",
    label: "Housing cost index",
    min: 90,
    max: 180,
    step: 1,
    unit: "index",
    category: "costOfLiving",
    description: "Rent, mortgage, and housing services pressure."
  },
  {
    key: "wageGrowth",
    label: "Wage growth",
    min: -5,
    max: 12,
    step: 0.1,
    unit: "%",
    category: "costOfLiving",
    description: "Average wage growth against cost pressures."
  },
  {
    key: "nationalBudget",
    label: "National budget",
    min: 300,
    max: 600,
    step: 5,
    unit: "RM B",
    category: "fiscalPolicy",
    description: "Annual federal budget envelope."
  },
  {
    key: "taxRate",
    label: "Tax rate",
    min: 0,
    max: 35,
    step: 0.5,
    unit: "%",
    category: "fiscalPolicy",
    description: "Average effective tax burden."
  },
  {
    key: "fuelSubsidy",
    label: "Fuel subsidy",
    min: 0,
    max: 40,
    step: 0.5,
    unit: "RM B",
    category: "fiscalPolicy",
    description: "Annual fuel subsidy allocation."
  },
  {
    key: "foodSubsidy",
    label: "Food subsidy",
    min: 0,
    max: 30,
    step: 0.5,
    unit: "RM B",
    category: "fiscalPolicy",
    description: "Annual food price support allocation."
  },
  {
    key: "cashAid",
    label: "Cash aid",
    min: 0,
    max: 30,
    step: 0.5,
    unit: "RM B",
    category: "fiscalPolicy",
    description: "Direct household assistance allocation."
  },
  {
    key: "healthcareSpending",
    label: "Healthcare spending",
    min: 0,
    max: 80,
    step: 1,
    unit: "RM B",
    category: "publicServices",
    description: "Healthcare budget allocation."
  },
  {
    key: "publicTransportSpending",
    label: "Public transport spending",
    min: 0,
    max: 60,
    step: 1,
    unit: "RM B",
    category: "publicServices",
    description: "Urban and regional public transport allocation."
  },
  {
    key: "publicServiceQuality",
    label: "Public service quality",
    min: 0,
    max: 100,
    step: 1,
    unit: "score",
    category: "publicServices",
    description: "Administrative quality and service delivery proxy."
  },
  {
    key: "socialAssistanceCoverage",
    label: "Social assistance coverage",
    min: 0,
    max: 100,
    step: 1,
    unit: "score",
    category: "publicServices",
    description: "Coverage of eligible households by social assistance."
  },
  {
    key: "unemploymentRate",
    label: "Unemployment rate",
    min: 0,
    max: 15,
    step: 0.1,
    unit: "%",
    category: "labourMarket",
    description: "Unemployment rate proxy."
  }
];

export const parameterRanges = Object.fromEntries(
  parameterDefinitions.map((definition) => [
    definition.key,
    { min: definition.min, max: definition.max, step: definition.step }
  ])
) as Record<ParameterDefinition["key"], { min: number; max: number; step: number }>;

export const categoryLabels: Record<ParameterDefinition["category"], string> = {
  macroeconomic: "Macroeconomic Conditions",
  costOfLiving: "Cost of Living",
  fiscalPolicy: "Fiscal Policy",
  publicServices: "Public Services",
  labourMarket: "Labour Market"
};

