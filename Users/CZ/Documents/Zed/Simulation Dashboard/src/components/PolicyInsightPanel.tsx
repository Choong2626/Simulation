import { Lightbulb } from "lucide-react";
import type { PolicyInsight } from "../types/simulation";

type PolicyInsightPanelProps = {
  insight: PolicyInsight;
};

export function PolicyInsightPanel({ insight }: PolicyInsightPanelProps) {
  return (
    <section className="panel p-5">
      <div className="flex items-center gap-2">
        <Lightbulb className="h-5 w-5 text-gov-600" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-slate-950">Policy Insight</h2>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-700">{insight.summary}</p>
      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Key Drivers</h3>
          <ul className="mt-2 space-y-2 text-sm text-slate-600">
            {insight.keyDrivers.map((item) => (
              <li key={item}>- {item}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Risks</h3>
          <ul className="mt-2 space-y-2 text-sm text-slate-600">
            {insight.risks.map((item) => (
              <li key={item}>- {item}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Recommendations</h3>
          <ul className="mt-2 space-y-2 text-sm text-slate-600">
            {insight.recommendations.map((item) => (
              <li key={item}>- {item}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

