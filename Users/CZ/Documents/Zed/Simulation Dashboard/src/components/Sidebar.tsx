import {
  BarChart3,
  GitCompare,
  Gauge,
  Network,
  SlidersHorizontal,
  Sparkles,
  Users
} from "lucide-react";
import type { PageId } from "../types/policy";

type SidebarProps = {
  activePage: PageId;
  onNavigate: (page: PageId) => void;
};

const navigationItems: Array<{ id: PageId; label: string; icon: typeof Gauge }> = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "controls", label: "Policy Controls", icon: SlidersHorizontal },
  { id: "segments", label: "Citizen Segments", icon: Users },
  { id: "network", label: "Impact Network", icon: Network },
  { id: "comparison", label: "Scenario Comparison", icon: GitCompare },
  { id: "optimizer", label: "Policy Optimizer", icon: Sparkles }
];

export function Sidebar({ activePage, onNavigate }: SidebarProps) {
  return (
    <aside className="flex w-full flex-col border-r border-slate-200 bg-slate-950 text-white lg:min-h-screen lg:w-72">
      <div className="border-b border-white/10 px-5 py-5">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-200">Government Analytics</div>
        <div className="mt-2 text-xl font-semibold leading-tight">Policy Simulation Dashboard</div>
        <div className="mt-2 text-sm text-slate-300">Illustrative decision-support workspace</div>
      </div>
      <nav className="flex gap-2 overflow-x-auto px-3 py-3 lg:flex-col lg:overflow-visible">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const active = item.id === activePage;
          return (
            <button
              key={item.id}
              className={`flex min-w-fit items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm font-medium transition ${
                active ? "bg-white text-slate-950" : "text-slate-300 hover:bg-white/10 hover:text-white"
              }`}
              onClick={() => onNavigate(item.id)}
              type="button"
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
      <div className="mt-auto hidden border-t border-white/10 p-5 text-xs leading-relaxed text-slate-400 lg:block">
        Mock data and simplified weighted assumptions. Not an official economic forecast.
      </div>
    </aside>
  );
}
