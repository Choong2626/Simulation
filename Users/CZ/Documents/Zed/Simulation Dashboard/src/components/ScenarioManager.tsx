import { Edit2, Eye, Save, Trash2 } from "lucide-react";
import type { Scenario } from "../types/scenario";

type ScenarioManagerProps = {
  scenarios: Scenario[];
  selectedIds: string[];
  onToggleSelected: (scenarioId: string) => void;
  onLoadScenario: (scenario: Scenario) => void;
  onSaveCurrent: () => void;
  onRenameScenario: (scenarioId: string) => void;
  onDeleteScenario: (scenarioId: string) => void;
};

function isReadOnlyScenario(id: string): boolean {
  return id === "baseline" || id === "current" || id.startsWith("preset:");
}

export function ScenarioManager({
  scenarios,
  selectedIds,
  onToggleSelected,
  onLoadScenario,
  onSaveCurrent,
  onRenameScenario,
  onDeleteScenario
}: ScenarioManagerProps) {
  return (
    <section className="panel overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-950">Scenario Manager</h3>
          <p className="mt-1 text-sm text-slate-600">Select 2 to 4 scenarios for side-by-side comparison.</p>
        </div>
        <button className="btn-primary" type="button" onClick={onSaveCurrent}>
          <Save className="h-4 w-4" aria-hidden="true" />
          Save Current
        </button>
      </div>
      <div className="divide-y divide-slate-100">
        {scenarios.map((scenario) => {
          const selected = selectedIds.includes(scenario.id);
          const readOnly = isReadOnlyScenario(scenario.id);
          return (
            <div key={scenario.id} className="grid gap-3 px-5 py-4 lg:grid-cols-[1fr_auto] lg:items-center">
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-gov-600 focus:ring-gov-500"
                  checked={selected}
                  onChange={() => onToggleSelected(scenario.id)}
                />
                <span>
                  <span className="font-semibold text-slate-950">{scenario.name}</span>
                  <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                    {readOnly ? "Preset" : "Saved"}
                  </span>
                  {scenario.description ? <span className="mt-1 block text-sm text-slate-600">{scenario.description}</span> : null}
                  <span className="mt-1 block text-xs text-slate-500">{new Date(scenario.createdAt).toLocaleString()}</span>
                </span>
              </label>
              <div className="flex flex-wrap gap-2">
                <button className="btn-secondary" type="button" onClick={() => onLoadScenario(scenario)}>
                  <Eye className="h-4 w-4" aria-hidden="true" />
                  Load
                </button>
                <button className="btn-secondary" type="button" onClick={() => onRenameScenario(scenario.id)} disabled={readOnly}>
                  <Edit2 className="h-4 w-4" aria-hidden="true" />
                  Rename
                </button>
                <button className="btn-danger" type="button" onClick={() => onDeleteScenario(scenario.id)} disabled={readOnly}>
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
