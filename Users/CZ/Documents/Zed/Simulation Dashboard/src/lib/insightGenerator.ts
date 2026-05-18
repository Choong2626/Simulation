import type { PolicyInsight, SimulationResult } from "../types/simulation";
import { formatCurrencyBillions, formatScore } from "./formatters";

function signedDelta(current: number, baseline: number): string {
  const delta = current - baseline;
  const sign = delta > 0 ? "+" : "";
  return `${sign}${delta.toFixed(1)}`;
}

export function generatePolicyInsight(baseline: SimulationResult, current: SimulationResult): PolicyInsight {
  const output = current.outputs;
  const base = baseline.outputs;
  const sentimentDelta = output.citizenSentiment - base.citizenSentiment;
  const fiscalDelta = output.fiscalBalance - base.fiscalBalance;
  const costDelta = output.costOfLivingPressure - base.costOfLivingPressure;
  const trustDelta = output.publicTrust - base.publicTrust;
  const bestSegment = [...current.segmentImpacts].sort((a, b) => b.sentimentChange - a.sentimentChange)[0];
  const weakestSegment = [...current.segmentImpacts].sort((a, b) => a.sentimentChange - b.sentimentChange)[0];
  const broadSubsidySpend = current.inputs.fuelSubsidy;
  const targetedSpend = current.inputs.cashAid + current.inputs.foodSubsidy;

  const direction = sentimentDelta >= 0 ? "improves" : "weakens";
  const costDirection = costDelta <= 0 ? "eases" : "increases";
  const fiscalDirection = fiscalDelta >= 0 ? "improves" : "worsens";

  const summary = `This scenario ${direction} overall citizen sentiment from ${base.citizenSentiment.toFixed(
    1
  )} to ${output.citizenSentiment.toFixed(1)}. Cost of living pressure ${costDirection} by ${Math.abs(costDelta).toFixed(
    1
  )} points, while fiscal balance ${fiscalDirection} from ${formatCurrencyBillions(base.fiscalBalance)} to ${formatCurrencyBillions(
    output.fiscalBalance
  )}. ${bestSegment.name} receive the strongest relative benefit, while ${weakestSegment.name} face the weakest impact.`;

  const keyDrivers = [
    `Citizen sentiment change: ${signedDelta(output.citizenSentiment, base.citizenSentiment)} points.`,
    `Public trust change: ${signedDelta(output.publicTrust, base.publicTrust)} points.`,
    `Cost of living pressure change: ${signedDelta(output.costOfLivingPressure, base.costOfLivingPressure)} points.`,
    `Fiscal balance change: ${signedDelta(output.fiscalBalance, base.fiscalBalance)} RM billions.`
  ];

  if (targetedSpend > broadSubsidySpend) {
    keyDrivers.push("The policy mix leans toward targeted household support through cash aid and food subsidies.");
  } else {
    keyDrivers.push("The policy mix relies more on broad fuel subsidy support than targeted household assistance.");
  }
  if (current.inputs.healthcareSpending > baseline.inputs.healthcareSpending || current.inputs.publicTransportSpending > baseline.inputs.publicTransportSpending) {
    keyDrivers.push("Public service investment contributes to trust and segment-specific sentiment gains.");
  }

  const risks: string[] = [];
  if (output.fiscalRisk > 80) {
    risks.push("Fiscal risk is critical; the package may require revenue offsets or narrower targeting.");
  } else if (output.fiscalRisk > 60) {
    risks.push("Fiscal risk is elevated and should be monitored against the budget envelope.");
  }
  if (costDelta > 4) risks.push("Cost pressure rises materially, which may dilute approval gains from assistance measures.");
  if (weakestSegment.sentimentChange < -4) risks.push(`${weakestSegment.name} may perceive this policy mix negatively because of ${weakestSegment.mainNegativeDriver}.`);
  if (output.socialStabilityRisk > 70) risks.push("Social stability risk is high due to affordability and labour market stress.");
  if (risks.length === 0) risks.push("No critical modelled risk is triggered, but the estimates remain illustrative and assumption-driven.");

  const recommendations: string[] = [];
  if (output.fiscalRisk > 70 && targetedSpend < broadSubsidySpend) {
    recommendations.push("Shift part of broad fuel subsidy expenditure into targeted cash aid or food support.");
  }
  if (costDelta > 0) {
    recommendations.push("Prioritise measures that lower food, housing, and transport pressure before expanding broad spending.");
  }
  if (trustDelta < 0) {
    recommendations.push("Pair affordability measures with visible public service improvements to rebuild trust.");
  }
  if (weakestSegment.id === "ruralSentiment") {
    recommendations.push("Add rural transport or fuel-cost mitigation to reduce the rural impact gap.");
  }
  if (weakestSegment.group === "State" && output.ruralSentiment < output.urbanSentiment - 2) {
    recommendations.push("Add rural transport or fuel-cost mitigation to reduce the rural-state impact gap.");
  }
  if (weakestSegment.id === "m40") {
    recommendations.push("Review tax, housing, and fuel-cost exposure for middle-income households.");
  }
  if (weakestSegment.id === "b40") {
    recommendations.push("Increase targeted cash aid, food subsidy, or assistance coverage if the B40 impact remains weak.");
  }
  if (recommendations.length === 0) {
    recommendations.push(`Maintain the balanced setting and monitor sustainability at ${formatScore(output.policySustainability)}.`);
  }

  return { summary, keyDrivers, risks, recommendations };
}
