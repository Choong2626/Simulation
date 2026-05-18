import type { ReactNode } from "react";
import type { PageId } from "../types/policy";
import type { SimulationResult } from "../types/simulation";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

type AppShellProps = {
  activePage: PageId;
  onNavigate: (page: PageId) => void;
  result: SimulationResult;
  savedScenarioCount: number;
  onReset: () => void;
  onSave: () => void;
  children: ReactNode;
};

export function AppShell({
  activePage,
  onNavigate,
  result,
  savedScenarioCount,
  onReset,
  onSave,
  children
}: AppShellProps) {
  return (
    <div className="min-h-screen lg:flex">
      <Sidebar activePage={activePage} onNavigate={onNavigate} />
      <div className="min-w-0 flex-1">
        <Header result={result} savedScenarioCount={savedScenarioCount} onReset={onReset} onSave={onSave} />
        <main className="px-4 py-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}

