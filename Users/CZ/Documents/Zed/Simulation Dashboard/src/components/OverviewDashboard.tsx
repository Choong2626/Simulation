import { getPressureStatus, getRiskStatus, getScoreStatus, roundTo } from "../lib/clamp";
import {
  formatChange,
  formatCurrencyBillions,
  formatCurrencyChange,
  formatScore
} from "../lib/formatters";
import type { PolicyInsight, SimulationResult } from "../types/simulation";
import { DisclaimerBanner } from "./DisclaimerBanner";
import { MetricCard } from "./MetricCard";
import { PolicyInsightPanel } from "./PolicyInsightPanel";
import { SentimentGauge } from "./SentimentGauge";
import { SimulationCharts } from "./SimulationCharts";

type OverviewDashboardProps = {
  baseline: SimulationResult;
  current: SimulationResult;
  insight: PolicyInsight;
};

function change(current: number, baseline: number): number {
  return roundTo(current - baseline, 1);
}

export function OverviewDashboard({ baseline, current, insight }: OverviewDashboardProps) {
  const base = baseline.outputs;
  const out = current.outputs;
  const cards = [
    {
      title: "Citizen Sentiment Score",
      value: formatScore(out.citizenSentiment),
      change: `${formatChange(change(out.citizenSentiment, base.citizenSentiment))} from baseline`,
      changeValue: change(out.citizenSentiment, base.citizenSentiment),
      status: getScoreStatus(out.citizenSentiment),
      description: "Composite of affordability, trust, employment, and approval indicators."
    },
    {
      title: "Public Trust Index",
      value: formatScore(out.publicTrust),
      change: `${formatChange(change(out.publicTrust, base.publicTrust))} from baseline`,
      changeValue: change(out.publicTrust, base.publicTrust),
      status: getScoreStatus(out.publicTrust),
      description: "Reflects service quality, assistance reach, fiscal credibility, and stability."
    },
    {
      title: "Cost of Living Pressure",
      value: formatScore(out.costOfLivingPressure),
      change: `${formatChange(change(out.costOfLivingPressure, base.costOfLivingPressure))} from baseline`,
      changeValue: change(out.costOfLivingPressure, base.costOfLivingPressure),
      status: getPressureStatus(out.costOfLivingPressure),
      lowerIsBetter: true,
      description: "Higher values indicate heavier household affordability pressure."
    },
    {
      title: "Inflation Pressure",
      value: formatScore(out.inflationPressure),
      change: `${formatChange(change(out.inflationPressure, base.inflationPressure))} from baseline`,
      changeValue: change(out.inflationPressure, base.inflationPressure),
      status: getPressureStatus(out.inflationPressure),
      lowerIsBetter: true,
      description: "Tracks modelled pressure from oil, imports, exchange rate, food, and housing."
    },
    {
      title: "Fiscal Balance",
      value: formatCurrencyBillions(out.fiscalBalance),
      change: `${formatCurrencyChange(change(out.fiscalBalance, base.fiscalBalance))} from baseline`,
      changeValue: change(out.fiscalBalance, base.fiscalBalance),
      status: out.fiscalBalance >= base.fiscalBalance ? "Improving" : "Worsening",
      description: "Illustrative net balance in RM billions after policy allocations."
    },
    {
      title: "Household Disposable Income Index",
      value: formatScore(out.disposableIncomeIndex),
      change: `${formatChange(change(out.disposableIncomeIndex, base.disposableIncomeIndex))} from baseline`,
      changeValue: change(out.disposableIncomeIndex, base.disposableIncomeIndex),
      status: getScoreStatus(out.disposableIncomeIndex),
      description: "Proxy for income left after tax, inflation, housing, food, and labour effects."
    },
    {
      title: "Policy Approval Estimate",
      value: formatScore(out.policyApproval),
      change: `${formatChange(change(out.policyApproval, base.policyApproval))} from baseline`,
      changeValue: change(out.policyApproval, base.policyApproval),
      status: getScoreStatus(out.policyApproval),
      description: "Public-facing acceptance estimate from relief, trust, and cost pressures."
    },
    {
      title: "Fiscal Risk",
      value: formatScore(out.fiscalRisk),
      change: `${formatChange(change(out.fiscalRisk, base.fiscalRisk))} from baseline`,
      changeValue: change(out.fiscalRisk, base.fiscalRisk),
      status: getRiskStatus(out.fiscalRisk),
      lowerIsBetter: true,
      description: "Higher values suggest deficit and subsidy sustainability concerns."
    },
    {
      title: "Social Stability Risk",
      value: formatScore(out.socialStabilityRisk),
      change: `${formatChange(change(out.socialStabilityRisk, base.socialStabilityRisk))} from baseline`,
      changeValue: change(out.socialStabilityRisk, base.socialStabilityRisk),
      status: getRiskStatus(out.socialStabilityRisk),
      lowerIsBetter: true,
      description: "Affordability, unemployment, and trust-driven social risk proxy."
    },
    {
      title: "Policy Sustainability Score",
      value: formatScore(out.policySustainability),
      change: `${formatChange(change(out.policySustainability, base.policySustainability))} from baseline`,
      changeValue: change(out.policySustainability, base.policySustainability),
      status: getScoreStatus(out.policySustainability),
      description: "Rewards balanced gains without excessive fiscal, inflation, or inequality risk."
    }
  ];

  return (
    <div className="space-y-6">
      <DisclaimerBanner compact />
      <div className="grid gap-5 xl:grid-cols-[320px_1fr]">
        <SentimentGauge score={out.citizenSentiment} />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {cards.slice(0, 6).map((card) => (
            <MetricCard key={card.title} {...card} />
          ))}
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.slice(6).map((card) => (
          <MetricCard key={card.title} {...card} />
        ))}
      </div>
      <PolicyInsightPanel insight={insight} />
      <SimulationCharts baseline={baseline} current={current} />
    </div>
  );
}

