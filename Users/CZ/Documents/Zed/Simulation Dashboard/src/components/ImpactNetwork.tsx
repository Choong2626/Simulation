import { RotateCcw } from "lucide-react";
import { baselineInputs } from "../data/baselineScenario";
import { defaultImpactEdgeWeights, sentimentImpactDefinitions } from "../lib/impactModel";
import type { SentimentImpactKey, SimulationConfig, SimulationInputs } from "../types/simulation";

type ImpactNetworkProps = {
  inputs: SimulationInputs;
  config: SimulationConfig;
  onSentimentWeightChange: (key: SentimentImpactKey, value: number) => void;
  onEdgeWeightChange: (edgeId: string, value: number) => void;
  onResetConfig: () => void;
};

type Node = {
  id: string;
  label: string;
  x: number;
  y: number;
  kind: "input" | "channel" | "output";
};

type Edge = {
  id: string;
  from: string;
  to: string;
  label: string;
  effect: "positive" | "negative" | "tradeoff" | "pressure" | "trust";
};

const nodes: Node[] = [
  { id: "oilPrice", label: "Oil Price", x: 7, y: 12, kind: "input" },
  { id: "inflationRate", label: "Inflation", x: 7, y: 34, kind: "input" },
  { id: "exchangeRate", label: "Exchange Rate", x: 7, y: 56, kind: "input" },
  { id: "unemploymentRate", label: "Unemployment", x: 7, y: 78, kind: "input" },
  { id: "fuelSubsidy", label: "Fuel Subsidy", x: 28, y: 16, kind: "input" },
  { id: "foodSubsidy", label: "Food Subsidy", x: 28, y: 38, kind: "input" },
  { id: "cashAid", label: "Cash Aid", x: 28, y: 60, kind: "input" },
  { id: "taxRate", label: "Tax Rate", x: 28, y: 82, kind: "input" },
  { id: "foodPressure", label: "Food Price Pressure", x: 51, y: 15, kind: "channel" },
  { id: "transportBurden", label: "Transport Burden", x: 51, y: 34, kind: "channel" },
  { id: "disposableIncome", label: "Disposable Income", x: 51, y: 55, kind: "channel" },
  { id: "fiscalBalance", label: "Fiscal Balance", x: 51, y: 78, kind: "output" },
  { id: "costOfLiving", label: "Cost of Living", x: 74, y: 18, kind: "output" },
  { id: "publicTrust", label: "Public Trust", x: 74, y: 43, kind: "output" },
  { id: "fiscalRisk", label: "Fiscal Risk", x: 74, y: 68, kind: "output" },
  { id: "citizenSentiment", label: "Citizen Sentiment", x: 92, y: 30, kind: "output" },
  { id: "policyApproval", label: "Policy Approval", x: 92, y: 58, kind: "output" },
  { id: "stabilityRisk", label: "Social Stability Risk", x: 92, y: 82, kind: "output" }
];

const edges: Edge[] = [
  { id: "oilPrice->transportBurden", from: "oilPrice", to: "transportBurden", label: "Cost pressure channel", effect: "pressure" },
  { id: "oilPrice->foodPressure", from: "oilPrice", to: "foodPressure", label: "Cost pressure channel", effect: "pressure" },
  { id: "oilPrice->costOfLiving", from: "oilPrice", to: "costOfLiving", label: "Negative effect", effect: "negative" },
  { id: "inflationRate->costOfLiving", from: "inflationRate", to: "costOfLiving", label: "Cost pressure channel", effect: "pressure" },
  { id: "inflationRate->disposableIncome", from: "inflationRate", to: "disposableIncome", label: "Negative effect", effect: "negative" },
  { id: "inflationRate->policyApproval", from: "inflationRate", to: "policyApproval", label: "Negative effect", effect: "negative" },
  { id: "exchangeRate->foodPressure", from: "exchangeRate", to: "foodPressure", label: "Import channel", effect: "pressure" },
  { id: "unemploymentRate->disposableIncome", from: "unemploymentRate", to: "disposableIncome", label: "Negative effect", effect: "negative" },
  { id: "unemploymentRate->stabilityRisk", from: "unemploymentRate", to: "stabilityRisk", label: "Negative effect", effect: "negative" },
  { id: "fuelSubsidy->transportBurden", from: "fuelSubsidy", to: "transportBurden", label: "Positive effect", effect: "positive" },
  { id: "fuelSubsidy->fiscalBalance", from: "fuelSubsidy", to: "fiscalBalance", label: "Fiscal trade-off", effect: "tradeoff" },
  { id: "foodSubsidy->foodPressure", from: "foodSubsidy", to: "foodPressure", label: "Positive effect", effect: "positive" },
  { id: "foodSubsidy->policyApproval", from: "foodSubsidy", to: "policyApproval", label: "Positive effect", effect: "positive" },
  { id: "foodSubsidy->fiscalBalance", from: "foodSubsidy", to: "fiscalBalance", label: "Fiscal trade-off", effect: "tradeoff" },
  { id: "cashAid->disposableIncome", from: "cashAid", to: "disposableIncome", label: "Positive effect", effect: "positive" },
  { id: "cashAid->policyApproval", from: "cashAid", to: "policyApproval", label: "Positive effect", effect: "positive" },
  { id: "cashAid->fiscalBalance", from: "cashAid", to: "fiscalBalance", label: "Fiscal trade-off", effect: "tradeoff" },
  { id: "taxRate->fiscalBalance", from: "taxRate", to: "fiscalBalance", label: "Positive effect", effect: "positive" },
  { id: "taxRate->disposableIncome", from: "taxRate", to: "disposableIncome", label: "Negative effect", effect: "negative" },
  { id: "foodPressure->costOfLiving", from: "foodPressure", to: "costOfLiving", label: "Cost pressure channel", effect: "pressure" },
  { id: "transportBurden->costOfLiving", from: "transportBurden", to: "costOfLiving", label: "Cost pressure channel", effect: "pressure" },
  { id: "disposableIncome->citizenSentiment", from: "disposableIncome", to: "citizenSentiment", label: "Positive effect", effect: "positive" },
  { id: "fiscalBalance->fiscalRisk", from: "fiscalBalance", to: "fiscalRisk", label: "Fiscal trade-off", effect: "tradeoff" },
  { id: "costOfLiving->citizenSentiment", from: "costOfLiving", to: "citizenSentiment", label: "Negative effect", effect: "negative" },
  { id: "costOfLiving->publicTrust", from: "costOfLiving", to: "publicTrust", label: "Trust channel", effect: "trust" },
  { id: "publicTrust->citizenSentiment", from: "publicTrust", to: "citizenSentiment", label: "Trust channel", effect: "trust" },
  { id: "publicTrust->policyApproval", from: "publicTrust", to: "policyApproval", label: "Trust channel", effect: "trust" },
  { id: "fiscalRisk->publicTrust", from: "fiscalRisk", to: "publicTrust", label: "Negative effect", effect: "negative" },
  { id: "fiscalRisk->policyApproval", from: "fiscalRisk", to: "policyApproval", label: "Fiscal trade-off", effect: "tradeoff" },
  { id: "stabilityRisk->publicTrust", from: "stabilityRisk", to: "publicTrust", label: "Negative effect", effect: "negative" }
];

const affectedMap = edges.reduce<Record<string, string[]>>((map, edge) => {
  map[edge.from] = Array.from(new Set([...(map[edge.from] ?? []), edge.to]));
  return map;
}, {});

function edgeColor(effect: Edge["effect"]): string {
  if (effect === "positive") return "#059669";
  if (effect === "negative") return "#dc2626";
  if (effect === "tradeoff") return "#b45309";
  if (effect === "trust") return "#2563eb";
  return "#7c3aed";
}

function nodeClass(kind: Node["kind"], highlighted: boolean): string {
  const base =
    "absolute flex h-14 w-32 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-lg border px-3 text-center text-xs font-semibold shadow-sm";
  if (highlighted) return `${base} border-gov-600 bg-blue-50 text-gov-900 ring-2 ring-gov-100`;
  if (kind === "input") return `${base} border-slate-300 bg-white text-slate-900`;
  if (kind === "channel") return `${base} border-purple-200 bg-purple-50 text-purple-900`;
  return `${base} border-slate-300 bg-slate-100 text-slate-900`;
}

function nodeLabel(id: string): string {
  return nodes.find((node) => node.id === id)?.label ?? id;
}

export function ImpactNetwork({
  inputs,
  config,
  onSentimentWeightChange,
  onEdgeWeightChange,
  onResetConfig
}: ImpactNetworkProps) {
  const changedInputIds = (Object.keys(affectedMap) as Array<keyof SimulationInputs>).filter(
    (key) => Math.abs(inputs[key] - baselineInputs[key]) > 0.05
  );
  const highlighted = new Set<string>(changedInputIds.flatMap((key) => [key, ...(affectedMap[key] ?? [])]));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-950">Configurable Impact Network</h2>
          <p className="mt-1 max-w-3xl text-sm text-slate-600">
            Adjust both the visible relationship strength in the network and the direct parameter sensitivity used by the
            simulation engine to calculate overall citizen sentiment.
          </p>
        </div>
        <button className="btn-secondary" type="button" onClick={onResetConfig}>
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Reset Model Weights
        </button>
      </div>

      <section className="panel p-5">
        <div className="flex flex-wrap gap-2 text-xs font-semibold">
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700 ring-1 ring-emerald-200">Positive effect</span>
          <span className="rounded-full bg-red-50 px-3 py-1 text-red-700 ring-1 ring-red-200">Negative effect</span>
          <span className="rounded-full bg-amber-50 px-3 py-1 text-amber-700 ring-1 ring-amber-200">Fiscal trade-off</span>
          <span className="rounded-full bg-purple-50 px-3 py-1 text-purple-700 ring-1 ring-purple-200">Cost pressure channel</span>
          <span className="rounded-full bg-blue-50 px-3 py-1 text-gov-700 ring-1 ring-blue-200">Trust channel</span>
        </div>

        <div className="relative mt-5 min-h-[560px] overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            {edges.map((edge) => {
              const from = nodes.find((node) => node.id === edge.from)!;
              const to = nodes.find((node) => node.id === edge.to)!;
              const active = highlighted.has(edge.from) || highlighted.has(edge.to);
              const weight = config.impactEdgeWeights[edge.id] ?? defaultImpactEdgeWeights[edge.id] ?? 50;
              return (
                <line
                  key={edge.id}
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke={edgeColor(edge.effect)}
                  strokeOpacity={active ? 0.55 + weight / 220 : 0.16 + weight / 360}
                  strokeWidth={0.18 + weight / 130}
                />
              );
            })}
          </svg>
          {nodes.map((node) => (
            <div key={node.id} className={nodeClass(node.kind, highlighted.has(node.id))} style={{ left: `${node.x}%`, top: `${node.y}%` }}>
              {node.label}
            </div>
          ))}
        </div>
      </section>

      <section className="panel p-5">
        <h3 className="text-base font-semibold text-slate-950">Direct Parameter Effect on Overall Sentiment</h3>
        <p className="mt-1 text-sm text-slate-600">
          These weights are applied to each parameter's change from baseline. For example, increasing cash aid has a
          positive direct sentiment effect, while higher unemployment has a negative direct effect.
        </p>
        <div className="mt-5 grid gap-4 xl:grid-cols-2">
          {sentimentImpactDefinitions.map((definition) => {
            const value = config.sentimentImpactWeights[definition.key];
            return (
              <div key={definition.key} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <label className="text-sm font-semibold text-slate-900" htmlFor={`sentiment-${definition.key}`}>
                      {definition.label}
                    </label>
                    <p className="mt-1 text-xs leading-5 text-slate-500">{definition.description}</p>
                  </div>
                  <div className="rounded-md bg-white px-2 py-1 text-sm font-semibold text-gov-700 ring-1 ring-slate-200">
                    {value.toFixed(2)}
                  </div>
                </div>
                <input
                  id={`sentiment-${definition.key}`}
                  type="range"
                  min={definition.min}
                  max={definition.max}
                  step={definition.step}
                  value={value}
                  onChange={(event) => onSentimentWeightChange(definition.key, Number(event.target.value))}
                  className="mt-4 h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-gov-600"
                />
                <div className="mt-2 flex justify-between text-xs text-slate-500">
                  <span>{definition.min}</span>
                  <span>{definition.unitImpactLabel}</span>
                  <span>{definition.max}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="panel p-5">
        <h3 className="text-base font-semibold text-slate-950">Network Relationship Strengths</h3>
        <p className="mt-1 text-sm text-slate-600">
          These values control the displayed strength of each causal relationship. They support model review and
          documentation without changing fiscal or affordability formulas.
        </p>
        <div className="mt-4 grid gap-3 xl:grid-cols-2">
          {edges.map((edge) => {
            const value = config.impactEdgeWeights[edge.id] ?? defaultImpactEdgeWeights[edge.id] ?? 50;
            return (
              <div key={edge.id} className="rounded-md border border-slate-200 bg-slate-50 px-3 py-3">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <div>
                    <span className="font-semibold text-slate-900">{nodeLabel(edge.from)}</span>
                    <span className="text-slate-500"> to </span>
                    <span className="font-semibold text-slate-900">{nodeLabel(edge.to)}</span>
                    <span className="ml-2 text-xs text-slate-500">{edge.label}</span>
                  </div>
                  <span className="font-semibold text-gov-700">{value.toFixed(0)}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={value}
                  onChange={(event) => onEdgeWeightChange(edge.id, Number(event.target.value))}
                  className="mt-3 h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-gov-600"
                  aria-label={`${nodeLabel(edge.from)} to ${nodeLabel(edge.to)} strength`}
                />
              </div>
            );
          })}
        </div>
      </section>

      <section className="panel p-5">
        <h3 className="text-base font-semibold text-slate-950">Active Change Channels</h3>
        {changedInputIds.length > 0 ? (
          <ul className="mt-3 grid gap-2 text-sm text-slate-700 md:grid-cols-2">
            {changedInputIds.map((key) => (
              <li key={key} className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
                <span className="font-semibold">{nodeLabel(key)}:</span>{" "}
                {(affectedMap[key] ?? []).map((nodeId) => nodeLabel(nodeId)).join(", ")}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-slate-600">No major parameter is currently changed from the baseline.</p>
        )}
      </section>
    </div>
  );
}
