import { baselineInputs } from "../data/baselineScenario";
import type { ScenarioPreset } from "../types/scenario";

export const scenarioPresets: ScenarioPreset[] = [
  {
    id: "baseline",
    name: "Baseline",
    description: "Current illustrative macro-fiscal baseline.",
    inputs: baselineInputs
  },
  {
    id: "high-oil-price-shock",
    name: "High Oil Price Shock",
    description: "External energy shock with elevated CPI and food prices.",
    inputs: {
      ...baselineInputs,
      oilPrice: 130,
      inflationRate: 5.8,
      cpiIndex: 128,
      foodPriceIndex: 135
    }
  },
  {
    id: "increased-subsidy-support",
    name: "Increased Subsidy Support",
    description: "Expanded broad subsidies and cash assistance.",
    inputs: {
      ...baselineInputs,
      fuelSubsidy: 30,
      foodSubsidy: 14,
      cashAid: 12
    }
  },
  {
    id: "targeted-cash-aid",
    name: "Targeted Cash Aid",
    description: "Shift from universal fuel support toward household cash and food support.",
    inputs: {
      ...baselineInputs,
      cashAid: 18,
      foodSubsidy: 10,
      fuelSubsidy: 14
    }
  },
  {
    id: "fiscal-consolidation",
    name: "Fiscal Consolidation",
    description: "Higher tax effort and subsidy rationalisation.",
    inputs: {
      ...baselineInputs,
      taxRate: 22,
      fuelSubsidy: 10,
      foodSubsidy: 4,
      cashAid: 5
    }
  },
  {
    id: "inflation-control-package",
    name: "Inflation Control Package",
    description: "Food support, transport investment, and tighter monetary conditions.",
    inputs: {
      ...baselineInputs,
      foodSubsidy: 10,
      publicTransportSpending: 22,
      interestRate: 4.2,
      importCostIndex: 112
    }
  },
  {
    id: "rural-support-package",
    name: "Rural Support Package",
    description: "Fuel and mobility support with expanded assistance coverage.",
    inputs: {
      ...baselineInputs,
      fuelSubsidy: 24,
      publicTransportSpending: 18,
      socialAssistanceCoverage: 70
    }
  },
  {
    id: "public-services-investment",
    name: "Public Services Investment",
    description: "Higher healthcare, transport, and service delivery quality.",
    inputs: {
      ...baselineInputs,
      healthcareSpending: 55,
      publicTransportSpending: 30,
      publicServiceQuality: 75
    }
  }
];

