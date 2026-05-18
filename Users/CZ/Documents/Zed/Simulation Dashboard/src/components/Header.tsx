import { RotateCcw, Save, ShieldCheck } from "lucide-react";
import { formatCurrencyBillions, formatScore } from "../lib/formatters";
import type { SimulationResult } from "../types/simulation";

type HeaderProps = {
  result: SimulationResult;
  savedScenarioCount: number;
  onReset: () => void;
  onSave: () => void;
};

export function Header({ result, savedScenarioCount, onReset, onSave }: HeaderProps) {
  return (
    <header className="border-b border-slate-200 bg-white/90 px-4 py-4 backdrop-blur lg:px-8">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-gov-700">
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            Senior policy simulation workspace
          </div>
          <h1 className="mt-1 text-2xl font-semibold text-slate-950">Economic and Citizen Sentiment Simulator</h1>
          <p className="mt-1 max-w-3xl text-sm text-slate-600">
            Test policy trade-offs across affordability, public trust, fiscal balance, and demographic sentiment.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
            <div className="text-xs text-slate-500">Current sentiment</div>
            <div className="font-semibold text-slate-900">{formatScore(result.outputs.citizenSentiment)}</div>
          </div>
          <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
            <div className="text-xs text-slate-500">Fiscal balance</div>
            <div className="font-semibold text-slate-900">{formatCurrencyBillions(result.outputs.fiscalBalance)}</div>
          </div>
          <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
            <div className="text-xs text-slate-500">Saved scenarios</div>
            <div className="font-semibold text-slate-900">{savedScenarioCount}</div>
          </div>
          <button className="btn-secondary" type="button" onClick={onReset}>
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset
          </button>
          <button className="btn-primary" type="button" onClick={onSave}>
            <Save className="h-4 w-4" aria-hidden="true" />
            Save Scenario
          </button>
        </div>
      </div>
    </header>
  );
}

