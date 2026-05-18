import { Download, GitCompare, Play, RotateCcw, Save } from "lucide-react";
import { useState } from "react";
import { scenarioPresets } from "../lib/scenarioPresets";
import { categoryLabels, parameterDefinitions } from "../lib/scoringWeights";
import type { ParameterCategoryId, ParameterKey } from "../types/policy";
import type { SimulationInputs } from "../types/simulation";
import { formatInputValue } from "../lib/formatters";

type ParameterControlsProps = {
  inputs: SimulationInputs;
  onInputChange: (key: ParameterKey, value: number) => void;
  onRunSimulation: () => void;
  onReset: () => void;
  onSave: () => void;
  onCompare: () => void;
  onExport: () => void;
  onApplyPreset: (inputs: SimulationInputs) => void;
};

const categoryOrder: ParameterCategoryId[] = [
  "macroeconomic",
  "costOfLiving",
  "fiscalPolicy",
  "publicServices",
  "labourMarket"
];

export function ParameterControls({
  inputs,
  onInputChange,
  onRunSimulation,
  onReset,
  onSave,
  onCompare,
  onExport,
  onApplyPreset
}: ParameterControlsProps) {
  const [selectedPresetId, setSelectedPresetId] = useState("baseline");
  const selectedPreset = scenarioPresets.find((preset) => preset.id === selectedPresetId) ?? scenarioPresets[0];

  return (
    <div className="space-y-6">
      <section className="panel p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">Policy Parameter Controls</h2>
            <p className="mt-1 max-w-3xl text-sm text-slate-600">
              Adjust macroeconomic conditions and policy levers. The model updates live, while Run Simulation provides a
              visible audit step for scenario review.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button className="btn-primary" type="button" onClick={onRunSimulation}>
              <Play className="h-4 w-4" aria-hidden="true" />
              Run Simulation
            </button>
            <button className="btn-secondary" type="button" onClick={onReset}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset to Baseline
            </button>
            <button className="btn-secondary" type="button" onClick={onSave}>
              <Save className="h-4 w-4" aria-hidden="true" />
              Save Scenario
            </button>
            <button className="btn-secondary" type="button" onClick={onCompare}>
              <GitCompare className="h-4 w-4" aria-hidden="true" />
              Compare Scenario
            </button>
            <button className="btn-secondary" type="button" onClick={onExport}>
              <Download className="h-4 w-4" aria-hidden="true" />
              Export Results
            </button>
          </div>
        </div>
        <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_auto]">
          <select
            className="input-field"
            value={selectedPresetId}
            onChange={(event) => setSelectedPresetId(event.target.value)}
            aria-label="Scenario preset"
          >
            {scenarioPresets.map((preset) => (
              <option key={preset.id} value={preset.id}>
                {preset.name}
              </option>
            ))}
          </select>
          <button className="btn-secondary" type="button" onClick={() => onApplyPreset(selectedPreset.inputs)}>
            Apply Preset
          </button>
        </div>
        <p className="mt-2 text-xs text-slate-500">{selectedPreset.description}</p>
      </section>

      {categoryOrder.map((category) => {
        const definitions = parameterDefinitions.filter((definition) => definition.category === category);
        return (
          <section key={category} className="panel p-5">
            <h3 className="text-base font-semibold text-slate-950">{categoryLabels[category]}</h3>
            <div className="mt-4 grid gap-4 xl:grid-cols-2">
              {definitions.map((definition) => {
                const value = inputs[definition.key];
                return (
                  <div key={definition.key} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <label className="text-sm font-semibold text-slate-900" htmlFor={definition.key}>
                          {definition.label}
                        </label>
                        <p className="mt-1 text-xs text-slate-500">{definition.description}</p>
                      </div>
                      <div className="text-right text-sm font-semibold text-gov-700">{formatInputValue(value, definition.unit)}</div>
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_120px] sm:items-center">
                      <input
                        id={definition.key}
                        type="range"
                        min={definition.min}
                        max={definition.max}
                        step={definition.step}
                        value={value}
                        onChange={(event) => onInputChange(definition.key, Number(event.target.value))}
                        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-gov-600"
                      />
                      <input
                        type="number"
                        min={definition.min}
                        max={definition.max}
                        step={definition.step}
                        value={value}
                        onChange={(event) => onInputChange(definition.key, Number(event.target.value))}
                        className="input-field w-full"
                        aria-label={`${definition.label} numeric value`}
                      />
                    </div>
                    <div className="mt-2 flex justify-between text-xs text-slate-500">
                      <span>{formatInputValue(definition.min, definition.unit)}</span>
                      <span>{formatInputValue(definition.max, definition.unit)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}

