export type SimulationInputs = {
  nationalBudget: number;
  inflationRate: number;
  oilPrice: number;
  cpiIndex: number;
  fuelSubsidy: number;
  foodSubsidy: number;
  cashAid: number;
  taxRate: number;
  unemploymentRate: number;
  healthcareSpending: number;
  publicTransportSpending: number;
  exchangeRate: number;
  interestRate: number;
  foodPriceIndex: number;
  housingCostIndex: number;
  wageGrowth: number;
  importCostIndex: number;
  publicServiceQuality: number;
  socialAssistanceCoverage: number;
};

export type SimulationOutputs = {
  citizenSentiment: number;
  publicTrust: number;
  costOfLivingPressure: number;
  inflationPressure: number;
  fiscalBalance: number;
  disposableIncomeIndex: number;
  policyApproval: number;
  fiscalRisk: number;
  socialStabilityRisk: number;
  policySustainability: number;
  b40Sentiment: number;
  m40Sentiment: number;
  t20Sentiment: number;
  urbanSentiment: number;
  ruralSentiment: number;
  youthSentiment: number;
  elderlySentiment: number;
  smallBusinessSentiment: number;
  civilServantSentiment: number;
  gigWorkerSentiment: number;
};

export type RiskLevel = "Low" | "Moderate" | "High" | "Critical";

export type SegmentGroup = "Income" | "Age" | "State";

export type SegmentImpact = {
  id: string;
  name: string;
  group: SegmentGroup;
  sentimentScore: number;
  sentimentChange: number;
  costBurden: number;
  disposableIncomeImpact: number;
  policyApproval: number;
  mainPositiveDriver: string;
  mainNegativeDriver: string;
  riskLevel: RiskLevel;
};

export type SimulationResult = {
  inputs: SimulationInputs;
  outputs: SimulationOutputs;
  segmentImpacts: SegmentImpact[];
  insights: string[];
};

export type SentimentImpactKey =
  | "oilPrice"
  | "inflationRate"
  | "cpiIndex"
  | "fuelSubsidy"
  | "foodSubsidy"
  | "cashAid"
  | "taxRate"
  | "unemploymentRate"
  | "healthcareSpending"
  | "publicTransportSpending"
  | "exchangeRate"
  | "interestRate"
  | "foodPriceIndex"
  | "housingCostIndex"
  | "wageGrowth"
  | "importCostIndex"
  | "publicServiceQuality"
  | "socialAssistanceCoverage";

export type SimulationConfig = {
  sentimentImpactWeights: Record<SentimentImpactKey, number>;
  impactEdgeWeights: Record<string, number>;
};

export type PolicyInsight = {
  summary: string;
  keyDrivers: string[];
  risks: string[];
  recommendations: string[];
};

export type OptimizationGoal =
  | "maximize_sentiment"
  | "minimize_fiscal_deficit"
  | "reduce_b40_cost_burden"
  | "improve_rural_sentiment"
  | "improve_urban_sentiment"
  | "keep_inflation_below_threshold"
  | "improve_public_trust"
  | "balance_sentiment_fiscal"
  | "reduce_social_stability_risk"
  | "maximize_policy_approval";

export type PolicyOptimizerResult = {
  id: string;
  name: string;
  goal: OptimizationGoal;
  inputs: SimulationInputs;
  outputs: SimulationOutputs;
  explanation: string;
  tradeOffs: string[];
  confidenceLevel: "Low" | "Medium" | "High";
};
