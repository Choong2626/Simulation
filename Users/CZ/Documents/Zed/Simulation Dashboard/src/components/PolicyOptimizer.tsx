import { CheckCircle2, Save, Sparkles } from "lucide-react";
import { optimizationGoalLabels } from "../lib/formatters";
import type { OptimizationGoal, PolicyOptimizerResult, SimulationResult } from "../types/simulation";

type PolicyOptimizerProps = {
  goal: OptimizationGoal;
  current: SimulationResult;
  recommendations: PolicyOptimizerResult[];
  onGoalChange: (goal: OptimizationGoal) => void;
  onGenerate: () => void;
  onApplyRecommendation: (recommendation: PolicyOptimizerResult) => void;
  onSaveRecommendation: (recommendation: PolicyOptimizerResult) => void;
};

const goals = Object.entries(optimizationGoalLabels) as Array<[OptimizationGoal, string]>;

function confidenceClass(level: PolicyOptimizerResult["confidenceLevel"]): string {
  if (level === "High") return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  if (level === "Medium") return "bg-amber-50 text-amber-700 ring-amber-200";
  return "bg-red-50 text-red-700 ring-red-200";
}

function inputChanges(current: SimulationResult, recommendation: PolicyOptimizerResult) {
  const labels: Partial<Record<keyof PolicyOptimizerResult["inputs"], string>> = {
    cashAid: "Cash aid",
    foodSubsidy: "Food subsidy",
    fuelSubsidy: "Fuel subsidy",
    taxRate: "Tax rate",
    healthcareSpending: "Healthcare spending",
    publicTransportSpending: "Public transport spending",
    publicServiceQuality: "Public service quality",
    socialAssistanceCoverage: "Social assistance coverage",
    interestRate: "Interest rate",
    importCostIndex: "Import cost index",
    exchangeRate: "Exchange rate",
    housingCostIndex: "Housing cost index"
  };
  return (Object.keys(labels) as Array<keyof PolicyOptimizerResult["inputs"]>)
    .filter((key) => Math.abs(recommendation.inputs[key] - current.inputs[key]) > 0.05)
    .slice(0, 6)
    .map((key) => ({
      label: labels[key],
      from: current.inputs[key],
      to: recommendation.inputs[key]
    }));
}

export function PolicyOptimizer({
  goal,
  current,
  recommendations,
  onGoalChange,
  onGenerate,
  onApplyRecommendation,
  onSaveRecommendation
}: PolicyOptimizerProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-950">Policy Optimizer</h2>
        <p className="mt-1 max-w-3xl text-sm text-slate-600">
          Deterministic search tests bounded policy mixes against the selected objective. It favours targeted support,
          budget discipline, and sustainable trade-offs.
        </p>
      </div>

      <section className="panel p-5">
        <div className="grid gap-4 xl:grid-cols-[1fr_auto] xl:items-end">
          <div>
            <label className="text-sm font-semibold text-slate-900" htmlFor="optimizer-goal">
              Optimization goal
            </label>
            <select
              id="optimizer-goal"
              className="input-field mt-2 w-full"
              value={goal}
              onChange={(event) => onGoalChange(event.target.value as OptimizationGoal)}
            >
              {goals.map(([id, label]) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <button className="btn-primary" type="button" onClick={onGenerate}>
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            Generate Recommendations
          </button>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {[
            "Do not exceed national budget envelope",
            "Keep fiscal risk below 90 unless the goal allows high risk",
            "Avoid unrealistic jumps greater than about 30% from current values"
          ].map((constraint) => (
            <div key={constraint} className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
              <CheckCircle2 className="mr-2 inline h-4 w-4 text-emerald-600" aria-hidden="true" />
              {constraint}
            </div>
          ))}
        </div>
      </section>

      {recommendations.length === 0 ? (
        <section className="panel p-5 text-sm text-slate-600">
          No recommendations generated yet. Choose a goal and run the optimizer.
        </section>
      ) : (
        <div className="grid gap-5">
          {recommendations.map((recommendation, index) => {
            const changes = inputChanges(current, recommendation);
            return (
              <section key={recommendation.id} className="panel p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wide text-gov-700">Recommendation {index + 1}</div>
                    <h3 className="mt-1 text-xl font-semibold text-slate-950">{recommendation.name}</h3>
                    <span className={`mt-3 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${confidenceClass(recommendation.confidenceLevel)}`}>
                      {recommendation.confidenceLevel} confidence
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button className="btn-primary" type="button" onClick={() => onApplyRecommendation(recommendation)}>
                      Apply Scenario
                    </button>
                    <button className="btn-secondary" type="button" onClick={() => onSaveRecommendation(recommendation)}>
                      <Save className="h-4 w-4" aria-hidden="true" />
                      Save
                    </button>
                  </div>
                </div>

                <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_1fr]">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">Changes</h4>
                    <ul className="mt-2 space-y-2 text-sm text-slate-600">
                      {changes.map((change) => (
                        <li key={change.label}>
                          - {change.label}: {change.from.toFixed(1)} to {change.to.toFixed(1)}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">Expected Result</h4>
                    <div className="mt-2 grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
                      <div>Citizen sentiment: {current.outputs.citizenSentiment.toFixed(1)} to {recommendation.outputs.citizenSentiment.toFixed(1)}</div>
                      <div>B40 sentiment: {current.outputs.b40Sentiment.toFixed(1)} to {recommendation.outputs.b40Sentiment.toFixed(1)}</div>
                      <div>Fiscal balance: {current.outputs.fiscalBalance.toFixed(1)}B to {recommendation.outputs.fiscalBalance.toFixed(1)}B</div>
                      <div>Cost pressure: {current.outputs.costOfLivingPressure.toFixed(1)} to {recommendation.outputs.costOfLivingPressure.toFixed(1)}</div>
                    </div>
                  </div>
                </div>

                <p className="mt-5 text-sm leading-6 text-slate-700">{recommendation.explanation}</p>
                <div className="mt-4">
                  <h4 className="text-sm font-semibold text-slate-900">Trade-offs</h4>
                  <ul className="mt-2 space-y-1 text-sm text-slate-600">
                    {recommendation.tradeOffs.map((tradeOff) => (
                      <li key={tradeOff}>- {tradeOff}</li>
                    ))}
                  </ul>
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

