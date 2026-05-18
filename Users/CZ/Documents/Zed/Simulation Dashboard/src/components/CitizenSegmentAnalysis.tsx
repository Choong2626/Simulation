import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import type { SegmentGroup, SegmentImpact } from "../types/simulation";

type CitizenSegmentAnalysisProps = {
  segments: SegmentImpact[];
};

type SortKey = keyof Pick<
  SegmentImpact,
  "name" | "sentimentScore" | "sentimentChange" | "costBurden" | "disposableIncomeImpact" | "policyApproval" | "riskLevel"
>;

const groupLabels: Record<SegmentGroup, string> = {
  Income: "Income Group",
  Age: "Age Group",
  State: "State"
};

const groupDescriptions: Record<SegmentGroup, string> = {
  Income: "B40, M40, and T20 groups have distinct exposure to subsidies, tax, food prices, housing, and fiscal risk.",
  Age: "Age cohorts respond differently to jobs, wages, healthcare, commuting costs, and essential prices.",
  State: "State-level scores use urbanisation, rural mobility exposure, low-income exposure, and logistics sensitivity."
};

function riskClass(risk: SegmentImpact["riskLevel"]): string {
  if (risk === "Low") return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  if (risk === "Moderate") return "bg-amber-50 text-amber-700 ring-amber-200";
  if (risk === "High") return "bg-orange-50 text-orange-700 ring-orange-200";
  return "bg-red-50 text-red-700 ring-red-200";
}

export function CitizenSegmentAnalysis({ segments }: CitizenSegmentAnalysisProps) {
  const [activeGroup, setActiveGroup] = useState<SegmentGroup>("Income");
  const [sortKey, setSortKey] = useState<SortKey>("sentimentChange");
  const [direction, setDirection] = useState<"asc" | "desc">("desc");

  const groupedSegments = useMemo(
    () => segments.filter((segment) => segment.group === activeGroup),
    [segments, activeGroup]
  );

  const sortedSegments = useMemo(() => {
    return [...groupedSegments].sort((a, b) => {
      const first = a[sortKey];
      const second = b[sortKey];
      const modifier = direction === "asc" ? 1 : -1;
      if (typeof first === "number" && typeof second === "number") return (first - second) * modifier;
      return String(first).localeCompare(String(second)) * modifier;
    });
  }, [groupedSegments, sortKey, direction]);

  const best = [...groupedSegments].sort((a, b) => b.sentimentChange - a.sentimentChange)[0];
  const weakest = [...groupedSegments].sort((a, b) => a.sentimentChange - b.sentimentChange)[0];
  const chartData = groupedSegments.map((segment) => ({
    name: segment.name.replace(" households", "").replace(" citizens", ""),
    change: segment.sentimentChange,
    sentiment: segment.sentimentScore
  }));

  function updateSort(key: SortKey) {
    if (sortKey === key) {
      setDirection((current) => (current === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setDirection(key === "name" ? "asc" : "desc");
    }
  }

  const headers: Array<{ key: SortKey; label: string }> = [
    { key: "name", label: activeGroup === "State" ? "State / Territory" : "Segment" },
    { key: "sentimentScore", label: "Sentiment" },
    { key: "sentimentChange", label: "Change" },
    { key: "costBurden", label: "Cost Burden" },
    { key: "disposableIncomeImpact", label: "Income Impact" },
    { key: "policyApproval", label: "Approval" },
    { key: "riskLevel", label: "Risk" }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-950">Citizen Segment Analysis</h2>
          <p className="mt-1 max-w-3xl text-sm text-slate-600">
            Segment scoring is now separated by income group, age group, and state. Subsidies and direct assistance are
            intentionally weighted more strongly for B40 households and more rural states.
          </p>
        </div>
        <div className="flex rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
          {(["Income", "Age", "State"] as SegmentGroup[]).map((group) => (
            <button
              key={group}
              type="button"
              className={`rounded-md px-3 py-2 text-sm font-semibold transition ${
                activeGroup === group ? "bg-gov-600 text-white" : "text-slate-600 hover:bg-slate-50"
              }`}
              onClick={() => setActiveGroup(group)}
            >
              {groupLabels[group]}
            </button>
          ))}
        </div>
      </div>

      <section className="panel p-5">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <h3 className="text-base font-semibold text-slate-950">{groupLabels[activeGroup]} View</h3>
            <p className="mt-1 text-sm text-slate-600">{groupDescriptions[activeGroup]}</p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-sm">
            <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
              <div className="text-xs text-slate-500">Segments</div>
              <div className="font-semibold text-slate-950">{groupedSegments.length}</div>
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
              <div className="text-xs text-slate-500">Average</div>
              <div className="font-semibold text-slate-950">
                {(groupedSegments.reduce((sum, segment) => sum + segment.sentimentScore, 0) / Math.max(1, groupedSegments.length)).toFixed(1)}
              </div>
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
              <div className="text-xs text-slate-500">Spread</div>
              <div className="font-semibold text-slate-950">
                {(
                  Math.max(...groupedSegments.map((segment) => segment.sentimentScore)) -
                  Math.min(...groupedSegments.map((segment) => segment.sentimentScore))
                ).toFixed(1)}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-2">
        <section className="panel p-5">
          <h3 className="text-base font-semibold text-slate-950">Sentiment Change by {groupLabels[activeGroup]}</h3>
          <div className="mt-4 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={activeGroup === "State" ? 0 : undefined} angle={activeGroup === "State" ? -35 : -20} textAnchor="end" height={activeGroup === "State" ? 92 : 70} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 8px 20px rgba(15, 23, 42, 0.08)"
                  }}
                />
                <Bar dataKey="change" name="Sentiment Change" fill="#1d4ed8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <div className="grid gap-5">
          <section className="panel p-5">
            <div className="flex items-center gap-2 text-emerald-700">
              <ArrowUp className="h-5 w-5" aria-hidden="true" />
              <h3 className="text-base font-semibold">Most Positively Affected</h3>
            </div>
            <div className="mt-3 text-2xl font-semibold text-slate-950">{best?.name}</div>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Sentiment changes by {best?.sentimentChange.toFixed(1)} points. The main positive driver is{" "}
              {best?.mainPositiveDriver}, while the main risk channel is {best?.mainNegativeDriver}.
            </p>
          </section>
          <section className="panel p-5">
            <div className="flex items-center gap-2 text-red-700">
              <ArrowDown className="h-5 w-5" aria-hidden="true" />
              <h3 className="text-base font-semibold">Most Negatively Affected</h3>
            </div>
            <div className="mt-3 text-2xl font-semibold text-slate-950">{weakest?.name}</div>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Sentiment changes by {weakest?.sentimentChange.toFixed(1)} points. The primary drag is{" "}
              {weakest?.mainNegativeDriver}; policy support is currently strongest through {weakest?.mainPositiveDriver}.
            </p>
          </section>
        </div>
      </div>

      <section className="panel overflow-hidden">
        <div className="border-b border-slate-200 px-5 py-4">
          <h3 className="text-base font-semibold text-slate-950">Sortable {groupLabels[activeGroup]} Impact Table</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                {headers.map((header) => (
                  <th key={header.key} className="px-4 py-3 text-left font-semibold text-slate-700">
                    <button className="inline-flex items-center gap-1" type="button" onClick={() => updateSort(header.key)}>
                      {header.label}
                      <ChevronsUpDown className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </th>
                ))}
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Drivers</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {sortedSegments.map((segment) => (
                <tr key={segment.id} className="hover:bg-slate-50">
                  <td className="whitespace-nowrap px-4 py-3 font-semibold text-slate-950">{segment.name}</td>
                  <td className="whitespace-nowrap px-4 py-3">{segment.sentimentScore.toFixed(1)}</td>
                  <td className={`whitespace-nowrap px-4 py-3 font-semibold ${segment.sentimentChange >= 0 ? "text-emerald-700" : "text-red-700"}`}>
                    {segment.sentimentChange > 0 ? "+" : ""}
                    {segment.sentimentChange.toFixed(1)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">{segment.costBurden.toFixed(1)}</td>
                  <td className="whitespace-nowrap px-4 py-3">{segment.disposableIncomeImpact.toFixed(1)}</td>
                  <td className="whitespace-nowrap px-4 py-3">{segment.policyApproval.toFixed(1)}</td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${riskClass(segment.riskLevel)}`}>
                      {segment.riskLevel}
                    </span>
                  </td>
                  <td className="min-w-80 px-4 py-3 text-slate-600">
                    <span className="font-medium text-slate-800">Positive:</span> {segment.mainPositiveDriver}.{" "}
                    <span className="font-medium text-slate-800">Negative:</span> {segment.mainNegativeDriver}.
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
