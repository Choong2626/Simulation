import type { OptimizationGoal, PolicyOptimizerResult, SimulationConfig, SimulationInputs, SimulationOutputs } from "../types/simulation";
import { clamp, roundTo } from "./clamp";
import { optimizationGoalLabels } from "./formatters";
import { parameterRanges } from "./scoringWeights";
import { runSimulation } from "./simulationEngine";

type Candidate = {
  name: string;
  inputs: SimulationInputs;
  rationale: string;
};

const goalNames: Partial<Record<OptimizationGoal, string[]>> = {
  maximize_sentiment: ["Targeted Relief Package", "Trust and Affordability Mix", "Household Confidence Package"],
  minimize_fiscal_deficit: ["Fiscal Repair Package", "Revenue and Subsidy Rationalisation", "Deficit Reduction Mix"],
  reduce_b40_cost_burden: ["B40 Cost Relief Package", "Essential Goods Support", "Low-Income Household Shield"],
  improve_rural_sentiment: ["Rural Mobility Package", "Rural Cost Relief Mix", "Regional Access Package"],
  improve_urban_sentiment: ["Urban Affordability Package", "Public Transport Relief Mix", "City Household Support"],
  keep_inflation_below_threshold: ["Inflation Containment Package", "Price Stability Mix", "Imported Cost Buffer"],
  improve_public_trust: ["Public Trust Investment", "Service Delivery Package", "Trust and Coverage Package"],
  balance_sentiment_fiscal: ["Balanced Policy Mix", "Targeted Sustainability Package", "Sentiment-Fiscal Balance"],
  reduce_social_stability_risk: ["Stability Risk Reduction Package", "Household Resilience Package", "Social Cohesion Mix"],
  maximize_policy_approval: ["Approval-Oriented Relief Package", "Visible Household Support", "Policy Confidence Package"]
};

function boundedValue(key: keyof SimulationInputs, current: number, target: number): number {
  const range = parameterRanges[key];
  const maxJump = Math.max(Math.abs(current) * 0.3, (range.max - range.min) * 0.08);
  const limited = clamp(target, current - maxJump, current + maxJump);
  return roundTo(clamp(limited, range.min, range.max), key === "exchangeRate" ? 2 : 1);
}

function applyAdjustments(inputs: SimulationInputs, adjustments: Partial<SimulationInputs>): SimulationInputs {
  const next = { ...inputs };
  (Object.keys(adjustments) as Array<keyof SimulationInputs>).forEach((key) => {
    next[key] = boundedValue(key, inputs[key], adjustments[key] ?? inputs[key]);
  });
  return next;
}

function isWithinBudget(inputs: SimulationInputs): boolean {
  const discretionarySpend =
    inputs.fuelSubsidy + inputs.foodSubsidy + inputs.cashAid + inputs.healthcareSpending + inputs.publicTransportSpending;
  return discretionarySpend <= inputs.nationalBudget * 0.48;
}

function candidateLibrary(current: SimulationInputs): Candidate[] {
  return [
    {
      name: "Targeted Relief Package",
      rationale: "Shifts support toward household-level cash and food relief while trimming broad fuel exposure.",
      inputs: applyAdjustments(current, {
        cashAid: current.cashAid + 5,
        foodSubsidy: current.foodSubsidy + 3,
        fuelSubsidy: current.fuelSubsidy - 4,
        publicTransportSpending: current.publicTransportSpending + 4
      })
    },
    {
      name: "Public Trust Investment",
      rationale: "Uses service quality, healthcare, and transport investment to improve trust and medium-term resilience.",
      inputs: applyAdjustments(current, {
        healthcareSpending: current.healthcareSpending + 8,
        publicTransportSpending: current.publicTransportSpending + 8,
        publicServiceQuality: current.publicServiceQuality + 10,
        socialAssistanceCoverage: current.socialAssistanceCoverage + 8
      })
    },
    {
      name: "Fiscal Consolidation Mix",
      rationale: "Reduces deficit risk through subsidy rationalisation and modest revenue gains.",
      inputs: applyAdjustments(current, {
        taxRate: current.taxRate + 2,
        fuelSubsidy: current.fuelSubsidy - 5,
        foodSubsidy: current.foodSubsidy - 1.5,
        cashAid: current.cashAid - 1.5
      })
    },
    {
      name: "Rural Mobility Support",
      rationale: "Protects rural and gig-worker fuel exposure while improving assistance coverage.",
      inputs: applyAdjustments(current, {
        fuelSubsidy: current.fuelSubsidy + 4,
        publicTransportSpending: current.publicTransportSpending + 3,
        socialAssistanceCoverage: current.socialAssistanceCoverage + 10,
        foodSubsidy: current.foodSubsidy + 2
      })
    },
    {
      name: "Urban Cost Pressure Package",
      rationale: "Focuses on transport, food, and household support for dense urban affordability pressure.",
      inputs: applyAdjustments(current, {
        publicTransportSpending: current.publicTransportSpending + 7,
        foodSubsidy: current.foodSubsidy + 3,
        cashAid: current.cashAid + 3,
        housingCostIndex: current.housingCostIndex - 4
      })
    },
    {
      name: "Inflation Containment Mix",
      rationale: "Counters imported and food price pressure while using interest rates carefully.",
      inputs: applyAdjustments(current, {
        foodSubsidy: current.foodSubsidy + 4,
        publicTransportSpending: current.publicTransportSpending + 4,
        interestRate: current.interestRate + 0.7,
        importCostIndex: current.importCostIndex - 5,
        exchangeRate: current.exchangeRate - 0.12
      })
    },
    {
      name: "Balanced Sustainability Package",
      rationale: "Combines targeted assistance with moderate revenue effort and public service quality gains.",
      inputs: applyAdjustments(current, {
        cashAid: current.cashAid + 3,
        foodSubsidy: current.foodSubsidy + 2,
        fuelSubsidy: current.fuelSubsidy - 2,
        taxRate: current.taxRate + 1,
        publicServiceQuality: current.publicServiceQuality + 6
      })
    }
  ];
}

function goalScore(goal: OptimizationGoal, outputs: SimulationOutputs): number {
  switch (goal) {
    case "maximize_sentiment":
      return outputs.citizenSentiment * 1.4 + outputs.policyApproval * 0.4 - outputs.fiscalRisk * 0.25;
    case "minimize_fiscal_deficit":
      return outputs.fiscalBalance * 2 - outputs.fiscalRisk * 0.7 + outputs.policySustainability * 0.5;
    case "reduce_b40_cost_burden":
      return outputs.b40Sentiment * 1.2 - outputs.costOfLivingPressure * 0.8 + outputs.policyApproval * 0.25;
    case "improve_rural_sentiment":
      return outputs.ruralSentiment * 1.4 + outputs.citizenSentiment * 0.25 - outputs.fiscalRisk * 0.2;
    case "improve_urban_sentiment":
      return outputs.urbanSentiment * 1.4 - outputs.costOfLivingPressure * 0.25 + outputs.publicTrust * 0.25;
    case "keep_inflation_below_threshold":
      return (100 - outputs.inflationPressure) * 1.5 + outputs.policySustainability * 0.4 - outputs.costOfLivingPressure * 0.25;
    case "improve_public_trust":
      return outputs.publicTrust * 1.5 + outputs.policySustainability * 0.35 - outputs.socialStabilityRisk * 0.25;
    case "balance_sentiment_fiscal":
      return outputs.citizenSentiment + outputs.policySustainability + outputs.publicTrust * 0.4 - outputs.fiscalRisk * 0.75;
    case "reduce_social_stability_risk":
      return (100 - outputs.socialStabilityRisk) * 1.5 + outputs.disposableIncomeIndex * 0.4 + outputs.publicTrust * 0.3;
    case "maximize_policy_approval":
      return outputs.policyApproval * 1.5 + outputs.citizenSentiment * 0.45 - outputs.fiscalRisk * 0.25;
  }
}

function describeChanges(current: SimulationInputs, candidate: SimulationInputs): string[] {
  const labels: Partial<Record<keyof SimulationInputs, string>> = {
    cashAid: "cash aid",
    foodSubsidy: "food subsidy",
    fuelSubsidy: "fuel subsidy",
    publicTransportSpending: "public transport spending",
    healthcareSpending: "healthcare spending",
    taxRate: "tax rate",
    publicServiceQuality: "public service quality",
    socialAssistanceCoverage: "social assistance coverage",
    importCostIndex: "import cost index",
    interestRate: "interest rate",
    exchangeRate: "exchange rate",
    housingCostIndex: "housing cost index"
  };
  return (Object.keys(labels) as Array<keyof SimulationInputs>)
    .filter((key) => Math.abs(candidate[key] - current[key]) >= 0.05)
    .map((key) => `${labels[key]} ${candidate[key] > current[key] ? "from" : "from"} ${current[key].toFixed(1)} to ${candidate[key].toFixed(1)}`);
}

function tradeOffsFor(outputs: SimulationOutputs, currentOutputs: SimulationOutputs): string[] {
  const tradeOffs: string[] = [];
  if (outputs.fiscalBalance < currentOutputs.fiscalBalance) tradeOffs.push("Higher short-term fiscal cost.");
  if (outputs.fiscalRisk > currentOutputs.fiscalRisk + 3) tradeOffs.push("Fiscal risk rises and may require offsets.");
  if (outputs.t20Sentiment < currentOutputs.t20Sentiment - 2 || outputs.m40Sentiment < currentOutputs.m40Sentiment - 2) {
    tradeOffs.push("Middle- or high-income sentiment may soften under the revenue mix.");
  }
  if (outputs.ruralSentiment < currentOutputs.ruralSentiment - 2) tradeOffs.push("Rural households may need additional mobility support.");
  if (outputs.inflationPressure > currentOutputs.inflationPressure + 2) tradeOffs.push("Inflation pressure is not fully contained.");
  if (tradeOffs.length === 0) tradeOffs.push("No major trade-off exceeds the model threshold, though implementation capacity still matters.");
  return tradeOffs;
}

export function optimizePolicy(currentInputs: SimulationInputs, goal: OptimizationGoal, config?: SimulationConfig): PolicyOptimizerResult[] {
  const current = runSimulation(currentInputs, config);
  const allowHighFiscalRisk = goal === "maximize_sentiment" || goal === "maximize_policy_approval";
  const scored = candidateLibrary(currentInputs)
    .map((candidate) => {
      const result = runSimulation(candidate.inputs, config);
      const budgetPenalty = isWithinBudget(candidate.inputs) ? 0 : 45;
      const fiscalPenalty = !allowHighFiscalRisk && result.outputs.fiscalRisk > 90 ? 80 : 0;
      const extremeFiscalPenalty = Math.max(0, current.outputs.fiscalBalance - result.outputs.fiscalBalance - 12) * 2.5;
      return {
        ...candidate,
        result,
        score: goalScore(goal, result.outputs) - budgetPenalty - fiscalPenalty - extremeFiscalPenalty
      };
    })
    .filter((candidate) => isWithinBudget(candidate.inputs))
    .filter((candidate) => allowHighFiscalRisk || candidate.result.outputs.fiscalRisk <= 90)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  return scored.map((candidate, index) => {
    const names = goalNames[goal] ?? ["Recommended Policy Mix"];
    const changes = describeChanges(currentInputs, candidate.inputs).slice(0, 5);
    const sentimentDelta = candidate.result.outputs.citizenSentiment - current.outputs.citizenSentiment;
    const fiscalDelta = candidate.result.outputs.fiscalBalance - current.outputs.fiscalBalance;
    const costDelta = candidate.result.outputs.costOfLivingPressure - current.outputs.costOfLivingPressure;

    return {
      id: `${goal}-${index + 1}`,
      name: names[index] ?? candidate.name,
      goal,
      inputs: candidate.inputs,
      outputs: candidate.result.outputs,
      explanation: `${candidate.rationale} Expected movement: citizen sentiment ${sentimentDelta >= 0 ? "increases" : "falls"} by ${Math.abs(
        sentimentDelta
      ).toFixed(1)} points, cost pressure ${costDelta <= 0 ? "decreases" : "increases"} by ${Math.abs(costDelta).toFixed(
        1
      )} points, and fiscal balance changes by ${fiscalDelta.toFixed(1)} RM billions. Key setting changes: ${changes.join("; ")}.`,
      tradeOffs: tradeOffsFor(candidate.result.outputs, current.outputs),
      confidenceLevel: candidate.result.outputs.fiscalRisk < 75 && candidate.result.outputs.policySustainability > 55 ? "High" : candidate.result.outputs.fiscalRisk < 88 ? "Medium" : "Low"
    };
  });
}

export { optimizationGoalLabels };
