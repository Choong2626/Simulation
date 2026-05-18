import type { OptimizationGoal } from "../types/simulation";

export function formatCurrencyBillions(value: number): string {
  const sign = value < 0 ? "-" : "";
  return `${sign}RM${Math.abs(value).toFixed(1)}B`;
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function formatScore(value: number): string {
  return `${value.toFixed(1)} / 100`;
}

export function formatChange(value: number, suffix = ""): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}${suffix}`;
}

export function formatCurrencyChange(value: number): string {
  const sign = value > 0 ? "+" : value < 0 ? "-" : "";
  return `${sign}RM${Math.abs(value).toFixed(1)}B`;
}

export function formatInputValue(value: number, unit: string): string {
  if (unit === "RM B") return `RM${value.toFixed(1)}B`;
  if (unit === "%") return `${value.toFixed(1)}%`;
  if (unit === "USD/bbl") return `USD${value.toFixed(0)}/bbl`;
  if (unit === "RM/USD") return `RM${value.toFixed(2)}`;
  return value.toFixed(1);
}

export const optimizationGoalLabels: Record<OptimizationGoal, string> = {
  maximize_sentiment: "Maximize overall citizen sentiment",
  minimize_fiscal_deficit: "Minimize fiscal deficit",
  reduce_b40_cost_burden: "Reduce B40 cost burden",
  improve_rural_sentiment: "Improve rural sentiment",
  improve_urban_sentiment: "Improve urban sentiment",
  keep_inflation_below_threshold: "Keep inflation pressure below threshold",
  improve_public_trust: "Improve public trust",
  balance_sentiment_fiscal: "Balance sentiment and fiscal sustainability",
  reduce_social_stability_risk: "Reduce social stability risk",
  maximize_policy_approval: "Maximize policy approval"
};

