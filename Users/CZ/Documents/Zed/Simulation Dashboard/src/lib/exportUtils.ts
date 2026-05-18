import type { Scenario } from "../types/scenario";
import type { PolicyInsight, SimulationResult } from "../types/simulation";
import { formatCurrencyBillions } from "./formatters";

function downloadTextFile(filename: string, content: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function exportCurrentScenarioAsJson(name: string, result: SimulationResult, insight: PolicyInsight): void {
  const payload = {
    scenarioName: name,
    createdAt: new Date().toISOString(),
    inputs: result.inputs,
    outputs: result.outputs,
    segmentImpacts: result.segmentImpacts,
    generatedInsights: insight
  };
  downloadTextFile(`${name.replace(/\s+/g, "-").toLowerCase()}-scenario.json`, JSON.stringify(payload, null, 2), "application/json");
}

export function exportScenarioComparisonAsCsv(scenarios: Scenario[]): void {
  const headers = [
    "Scenario",
    "Created At",
    "Citizen Sentiment",
    "Public Trust",
    "Cost of Living Pressure",
    "Inflation Pressure",
    "Fiscal Balance",
    "Disposable Income Index",
    "Policy Approval",
    "Fiscal Risk",
    "Social Stability Risk",
    "Policy Sustainability",
    "B40 Sentiment",
    "M40 Sentiment",
    "T20 Sentiment",
    "Urban Sentiment",
    "Rural Sentiment"
  ];
  const rows = scenarios.map((scenario) => [
    scenario.name,
    scenario.createdAt,
    scenario.outputs.citizenSentiment,
    scenario.outputs.publicTrust,
    scenario.outputs.costOfLivingPressure,
    scenario.outputs.inflationPressure,
    scenario.outputs.fiscalBalance,
    scenario.outputs.disposableIncomeIndex,
    scenario.outputs.policyApproval,
    scenario.outputs.fiscalRisk,
    scenario.outputs.socialStabilityRisk,
    scenario.outputs.policySustainability,
    scenario.outputs.b40Sentiment,
    scenario.outputs.m40Sentiment,
    scenario.outputs.t20Sentiment,
    scenario.outputs.urbanSentiment,
    scenario.outputs.ruralSentiment
  ]);
  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  downloadTextFile("scenario-comparison.csv", csv, "text/csv");
}

export function exportPolicySummaryAsTxt(name: string, result: SimulationResult, insight: PolicyInsight): void {
  const content = [
    `Policy Simulation Summary: ${name}`,
    `Generated: ${new Date().toLocaleString()}`,
    "",
    insight.summary,
    "",
    "Headline Metrics",
    `Citizen Sentiment: ${result.outputs.citizenSentiment.toFixed(1)} / 100`,
    `Public Trust: ${result.outputs.publicTrust.toFixed(1)} / 100`,
    `Cost of Living Pressure: ${result.outputs.costOfLivingPressure.toFixed(1)} / 100`,
    `Fiscal Balance: ${formatCurrencyBillions(result.outputs.fiscalBalance)}`,
    `Policy Sustainability: ${result.outputs.policySustainability.toFixed(1)} / 100`,
    "",
    "Key Drivers",
    ...insight.keyDrivers.map((item) => `- ${item}`),
    "",
    "Risks",
    ...insight.risks.map((item) => `- ${item}`),
    "",
    "Recommendations",
    ...insight.recommendations.map((item) => `- ${item}`)
  ].join("\n");
  downloadTextFile(`${name.replace(/\s+/g, "-").toLowerCase()}-policy-summary.txt`, content, "text/plain");
}

