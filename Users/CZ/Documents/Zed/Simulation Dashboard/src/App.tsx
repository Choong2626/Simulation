import { useEffect, useMemo, useState } from "react";
import { AppShell } from "./components/AppShell";
import { CitizenSegmentAnalysis } from "./components/CitizenSegmentAnalysis";
import { ExportControls } from "./components/ExportControls";
import { ImpactNetwork } from "./components/ImpactNetwork";
import { OverviewDashboard } from "./components/OverviewDashboard";
import { ParameterControls } from "./components/ParameterControls";
import { PolicyOptimizer } from "./components/PolicyOptimizer";
import { ScenarioComparison } from "./components/ScenarioComparison";
import { baselineInputs } from "./data/baselineScenario";
import {
  exportCurrentScenarioAsJson,
  exportPolicySummaryAsTxt,
  exportScenarioComparisonAsCsv
} from "./lib/exportUtils";
import { defaultSimulationConfig, mergeSimulationConfig } from "./lib/impactModel";
import { generatePolicyInsight } from "./lib/insightGenerator";
import { optimizePolicy } from "./lib/policyOptimizer";
import { scenarioPresets } from "./lib/scenarioPresets";
import { parameterRanges } from "./lib/scoringWeights";
import { runSimulation } from "./lib/simulationEngine";
import type { PageId, ParameterKey } from "./types/policy";
import type { Scenario } from "./types/scenario";
import type {
  OptimizationGoal,
  PolicyOptimizerResult,
  SentimentImpactKey,
  SimulationConfig,
  SimulationInputs,
  SimulationResult
} from "./types/simulation";

const STORAGE_KEY = "policy-simulation-dashboard-scenarios";
const MODEL_CONFIG_STORAGE_KEY = "policy-simulation-dashboard-model-config";

function createScenario(id: string, name: string, result: SimulationResult, description?: string): Scenario {
  return {
    id,
    name,
    description,
    createdAt: new Date().toISOString(),
    inputs: result.inputs,
    outputs: result.outputs,
    segmentImpacts: result.segmentImpacts
  };
}

function loadSavedScenarios(): Scenario[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function loadModelConfig(): SimulationConfig {
  try {
    const raw = localStorage.getItem(MODEL_CONFIG_STORAGE_KEY);
    if (!raw) return defaultSimulationConfig;
    return mergeSimulationConfig(JSON.parse(raw));
  } catch {
    return defaultSimulationConfig;
  }
}

function clampInputValue(key: ParameterKey, value: number): number {
  const range = parameterRanges[key];
  return Math.min(range.max, Math.max(range.min, value));
}

export default function App() {
  const [activePage, setActivePage] = useState<PageId>("overview");
  const [inputs, setInputs] = useState<SimulationInputs>(baselineInputs);
  const [modelConfig, setModelConfig] = useState<SimulationConfig>(() => loadModelConfig());
  const [savedScenarios, setSavedScenarios] = useState<Scenario[]>(() => loadSavedScenarios());
  const [selectedScenarioIds, setSelectedScenarioIds] = useState<string[]>(["baseline", "current"]);
  const [optimizerGoal, setOptimizerGoal] = useState<OptimizationGoal>("balance_sentiment_fiscal");
  const [optimizerRecommendations, setOptimizerRecommendations] = useState<PolicyOptimizerResult[]>([]);

  const baselineResult = useMemo(() => runSimulation(baselineInputs, modelConfig), [modelConfig]);
  const currentResult = useMemo(() => runSimulation(inputs, modelConfig), [inputs, modelConfig]);
  const policyInsight = useMemo(() => generatePolicyInsight(baselineResult, currentResult), [baselineResult, currentResult]);

  const presetScenarios = useMemo(
    () =>
      scenarioPresets
        .filter((preset) => preset.id !== "baseline")
        .map((preset) => createScenario(`preset:${preset.id}`, preset.name, runSimulation(preset.inputs, modelConfig), preset.description)),
    [modelConfig]
  );

  const comparisonScenarios = useMemo(() => {
    const baselineScenario = createScenario("baseline", "Baseline", baselineResult, "Current illustrative macro-fiscal baseline.");
    const currentScenario = createScenario("current", "Current Working Scenario", currentResult, "Live unsaved scenario from current controls.");
    return [baselineScenario, currentScenario, ...presetScenarios, ...savedScenarios];
  }, [baselineResult, currentResult, presetScenarios, savedScenarios]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedScenarios));
  }, [savedScenarios]);

  useEffect(() => {
    localStorage.setItem(MODEL_CONFIG_STORAGE_KEY, JSON.stringify(modelConfig));
  }, [modelConfig]);

  function updateInput(key: ParameterKey, value: number) {
    setInputs((current) => ({ ...current, [key]: clampInputValue(key, Number.isFinite(value) ? value : current[key]) }));
  }

  function resetToBaseline() {
    setInputs(baselineInputs);
    setOptimizerRecommendations([]);
  }

  function updateSentimentWeight(key: SentimentImpactKey, value: number) {
    setModelConfig((current) =>
      mergeSimulationConfig({
        ...current,
        sentimentImpactWeights: {
          ...current.sentimentImpactWeights,
          [key]: value
        }
      })
    );
  }

  function updateEdgeWeight(edgeId: string, value: number) {
    setModelConfig((current) =>
      mergeSimulationConfig({
        ...current,
        impactEdgeWeights: {
          ...current.impactEdgeWeights,
          [edgeId]: value
        }
      })
    );
  }

  function resetModelConfig() {
    setModelConfig(defaultSimulationConfig);
  }

  function saveScenarioWithName(name: string, result: SimulationResult = currentResult) {
    const trimmed = name.trim();
    if (!trimmed) return;
    const scenario = createScenario(`saved:${Date.now()}`, trimmed, result);
    setSavedScenarios((current) => [scenario, ...current]);
    setSelectedScenarioIds((current) => Array.from(new Set([...current, scenario.id])).slice(0, 4));
  }

  function saveCurrentScenario() {
    const name = window.prompt("Scenario name", `Policy Scenario ${savedScenarios.length + 1}`);
    if (name) saveScenarioWithName(name);
  }

  function renameScenario(scenarioId: string) {
    if (!scenarioId.startsWith("saved:")) return;
    const scenario = savedScenarios.find((item) => item.id === scenarioId);
    if (!scenario) return;
    const name = window.prompt("Rename scenario", scenario.name);
    if (!name?.trim()) return;
    setSavedScenarios((current) => current.map((item) => (item.id === scenarioId ? { ...item, name: name.trim() } : item)));
  }

  function deleteScenario(scenarioId: string) {
    if (!scenarioId.startsWith("saved:")) return;
    if (!window.confirm("Delete this saved scenario?")) return;
    setSavedScenarios((current) => current.filter((scenario) => scenario.id !== scenarioId));
    setSelectedScenarioIds((current) => current.filter((id) => id !== scenarioId));
  }

  function toggleSelectedScenario(scenarioId: string) {
    setSelectedScenarioIds((current) => {
      if (current.includes(scenarioId)) return current.filter((id) => id !== scenarioId);
      return [...current, scenarioId].slice(-4);
    });
  }

  function loadScenario(scenario: Scenario) {
    setInputs(scenario.inputs);
    setActivePage("overview");
  }

  function generateRecommendations() {
    setOptimizerRecommendations(optimizePolicy(inputs, optimizerGoal, modelConfig));
  }

  function applyRecommendation(recommendation: PolicyOptimizerResult) {
    setInputs(recommendation.inputs);
    setActivePage("overview");
  }

  function saveRecommendation(recommendation: PolicyOptimizerResult) {
    const result = runSimulation(recommendation.inputs, modelConfig);
    saveScenarioWithName(recommendation.name, result);
  }

  function exportJson() {
    exportCurrentScenarioAsJson("Current Scenario", currentResult, policyInsight);
  }

  function exportTxt() {
    exportPolicySummaryAsTxt("Current Scenario", currentResult, policyInsight);
  }

  function renderPage() {
    switch (activePage) {
      case "overview":
        return <OverviewDashboard baseline={baselineResult} current={currentResult} insight={policyInsight} />;
      case "controls":
        return (
          <ParameterControls
            inputs={inputs}
            onInputChange={updateInput}
            onRunSimulation={() => setActivePage("overview")}
            onReset={resetToBaseline}
            onSave={saveCurrentScenario}
            onCompare={() => setActivePage("comparison")}
            onExport={exportJson}
            onApplyPreset={(presetInputs) => setInputs(presetInputs)}
          />
        );
      case "segments":
        return <CitizenSegmentAnalysis segments={currentResult.segmentImpacts} />;
      case "network":
        return (
          <ImpactNetwork
            inputs={inputs}
            config={modelConfig}
            onSentimentWeightChange={updateSentimentWeight}
            onEdgeWeightChange={updateEdgeWeight}
            onResetConfig={resetModelConfig}
          />
        );
      case "comparison":
        return (
          <ScenarioComparison
            scenarios={comparisonScenarios}
            selectedIds={selectedScenarioIds}
            onToggleSelected={toggleSelectedScenario}
            onLoadScenario={loadScenario}
            onSaveCurrent={saveCurrentScenario}
            onRenameScenario={renameScenario}
            onDeleteScenario={deleteScenario}
            onExportCsv={exportScenarioComparisonAsCsv}
          />
        );
      case "optimizer":
        return (
          <PolicyOptimizer
            goal={optimizerGoal}
            current={currentResult}
            recommendations={optimizerRecommendations}
            onGoalChange={setOptimizerGoal}
            onGenerate={generateRecommendations}
            onApplyRecommendation={applyRecommendation}
            onSaveRecommendation={saveRecommendation}
          />
        );
      default:
        return null;
    }
  }

  return (
    <AppShell
      activePage={activePage}
      onNavigate={setActivePage}
      result={currentResult}
      savedScenarioCount={savedScenarios.length}
      onReset={resetToBaseline}
      onSave={saveCurrentScenario}
    >
      <div className="mx-auto max-w-[1600px]">
        {activePage === "overview" ? null : (
          <div className="mb-5 flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
            <div className="text-sm text-slate-600">
              Illustrative model output. Current sentiment:{" "}
              <span className="font-semibold text-slate-950">{currentResult.outputs.citizenSentiment.toFixed(1)} / 100</span>
            </div>
            <ExportControls
              onExportJson={exportJson}
              onExportTxt={exportTxt}
              onExportCsv={() =>
                exportScenarioComparisonAsCsv(
                  selectedScenarioIds
                    .map((id) => comparisonScenarios.find((scenario) => scenario.id === id))
                    .filter(Boolean) as Scenario[]
                )
              }
              csvDisabled={selectedScenarioIds.length < 2}
            />
          </div>
        )}
        {renderPage()}
      </div>
    </AppShell>
  );
}
