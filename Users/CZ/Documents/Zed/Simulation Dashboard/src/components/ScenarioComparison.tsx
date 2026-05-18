import { Award, Download } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { formatCurrencyBillions, formatScore } from "../lib/formatters";
import type { Scenario } from "../types/scenario";
import { ScenarioManager } from "./ScenarioManager";

type ScenarioComparisonProps = {
  scenarios: Scenario[];
  selectedIds: string[];
  onToggleSelected: (scenarioId: string) => void;
  onLoadScenario: (scenario: Scenario) => void;
  onSaveCurrent: () => void;
  onRenameScenario: (scenarioId: string) => void;
  onDeleteScenario: (scenarioId: string) => void;
  onExportCsv: (scenarios: Scenario[]) => void;
};

const metricRows: Array<{ label: string; key: keyof Scenario["outputs"]; type?: "currency" | "score" }> = [
  { label: "Citizen Sentiment", key: "citizenSentiment", type: "score" },
  { label: "Public Trust", key: "publicTrust", type: "score" },
  { label: "Cost of Living Pressure", key: "costOfLivingPressure", type: "score" },
  { label: "Inflation Pressure", key: "inflationPressure", type: "score" },
  { label: "Fiscal Balance", key: "fiscalBalance", type: "currency" },
  { label: "Disposable Income Index", key: "disposableIncomeIndex", type: "score" },
  { label: "Policy Approval", key: "policyApproval", type: "score" },
  { label: "Fiscal Risk", key: "fiscalRisk", type: "score" },
  { label: "Social Stability Risk", key: "socialStabilityRisk", type: "score" },
  { label: "Policy Sustainability Score", key: "policySustainability", type: "score" },
  { label: "B40 Sentiment", key: "b40Sentiment", type: "score" },
  { label: "M40 Sentiment", key: "m40Sentiment", type: "score" },
  { label: "T20 Sentiment", key: "t20Sentiment", type: "score" },
  { label: "Urban Sentiment", key: "urbanSentiment", type: "score" },
  { label: "Rural Sentiment", key: "ruralSentiment", type: "score" }
];

function formatMetric(value: number, type?: "currency" | "score"): string {
  if (type === "currency") return formatCurrencyBillions(value);
  if (type === "score") return formatScore(value);
  return value.toFixed(1);
}

function bestBy(scenarios: Scenario[], score: (scenario: Scenario) => number): Scenario | undefined {
  return [...scenarios].sort((a, b) => score(b) - score(a))[0];
}

export function ScenarioComparison({
  scenarios,
  selectedIds,
  onToggleSelected,
  onLoadScenario,
  onSaveCurrent,
  onRenameScenario,
  onDeleteScenario,
  onExportCsv
}: ScenarioComparisonProps) {
  const selectedScenarios = selectedIds.map((id) => scenarios.find((scenario) => scenario.id === id)).filter(Boolean) as Scenario[];
  const limitedSelection = selectedScenarios.slice(0, 4);
  const badgeScenarios = {
    best: bestBy(limitedSelection, (scenario) => scenario.outputs.citizenSentiment + scenario.outputs.policySustainability - scenario.outputs.fiscalRisk),
    worstFiscal: [...limitedSelection].sort((a, b) => a.outputs.fiscalBalance - b.outputs.fiscalBalance)[0],
    highestSentiment: bestBy(limitedSelection, (scenario) => scenario.outputs.citizenSentiment),
    lowestCost: bestBy(limitedSelection, (scenario) => 100 - scenario.outputs.costOfLivingPressure),
    balanced: bestBy(
      limitedSelection,
      (scenario) =>
        scenario.outputs.citizenSentiment +
        scenario.outputs.policySustainability +
        scenario.outputs.publicTrust -
        scenario.outputs.fiscalRisk -
        scenario.outputs.costOfLivingPressure * 0.4
    )
  };

  const chartData = limitedSelection.map((scenario) => ({
    name: scenario.name,
    Sentiment: scenario.outputs.citizenSentiment,
    Trust: scenario.outputs.publicTrust,
    "Cost Pressure": scenario.outputs.costOfLivingPressure,
    Sustainability: scenario.outputs.policySustainability
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-950">Scenario Comparison</h2>
          <p className="mt-1 text-sm text-slate-600">
            Compare baseline, presets, and saved scenarios across sentiment, fiscal, affordability, and segment metrics.
          </p>
        </div>
        <button className="btn-secondary" type="button" onClick={() => onExportCsv(limitedSelection)} disabled={limitedSelection.length < 2}>
          <Download className="h-4 w-4" aria-hidden="true" />
          Export Comparison CSV
        </button>
      </div>

      <ScenarioManager
        scenarios={scenarios}
        selectedIds={selectedIds}
        onToggleSelected={onToggleSelected}
        onLoadScenario={onLoadScenario}
        onSaveCurrent={onSaveCurrent}
        onRenameScenario={onRenameScenario}
        onDeleteScenario={onDeleteScenario}
      />

      {limitedSelection.length < 2 ? (
        <section className="panel p-5 text-sm text-slate-600">Select at least two scenarios to display comparison tables and charts.</section>
      ) : (
        <>
          <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            {[
              ["Best scenario", badgeScenarios.best?.name],
              ["Worst fiscal scenario", badgeScenarios.worstFiscal?.name],
              ["Highest citizen sentiment", badgeScenarios.highestSentiment?.name],
              ["Lowest cost pressure", badgeScenarios.lowestCost?.name],
              ["Most balanced scenario", badgeScenarios.balanced?.name]
            ].map(([label, name]) => (
              <div key={label} className="panel p-4">
                <div className="flex items-center gap-2 text-gov-700">
                  <Award className="h-4 w-4" aria-hidden="true" />
                  <div className="text-xs font-semibold uppercase tracking-wide">{label}</div>
                </div>
                <div className="mt-2 text-sm font-semibold text-slate-950">{name}</div>
              </div>
            ))}
          </section>

          <section className="panel p-5">
            <h3 className="text-base font-semibold text-slate-950">Scenario Metrics Chart</h3>
            <div className="mt-4 h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-12} textAnchor="end" height={70} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 8,
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 8px 20px rgba(15, 23, 42, 0.08)"
                    }}
                  />
                  <Legend />
                  <Bar dataKey="Sentiment" fill="#1d4ed8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Trust" fill="#059669" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Cost Pressure" fill="#dc2626" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Sustainability" fill="#b45309" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="panel overflow-hidden">
            <div className="border-b border-slate-200 px-5 py-4">
              <h3 className="text-base font-semibold text-slate-950">Side-by-Side Differences</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="sticky left-0 bg-slate-50 px-4 py-3 text-left font-semibold text-slate-700">Metric</th>
                    {limitedSelection.map((scenario) => (
                      <th key={scenario.id} className="min-w-44 px-4 py-3 text-left font-semibold text-slate-700">
                        {scenario.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {metricRows.map((metric) => (
                    <tr key={metric.key}>
                      <td className="sticky left-0 bg-white px-4 py-3 font-semibold text-slate-950">{metric.label}</td>
                      {limitedSelection.map((scenario) => (
                        <td key={`${scenario.id}-${metric.key}`} className="px-4 py-3 text-slate-700">
                          {formatMetric(Number(scenario.outputs[metric.key]), metric.type)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

