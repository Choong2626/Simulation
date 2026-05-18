import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { mockHistoricalData } from "../data/mockHistoricalData";
import { formatCurrencyBillions } from "../lib/formatters";
import type { SimulationResult } from "../types/simulation";

type SimulationChartsProps = {
  baseline: SimulationResult;
  current: SimulationResult;
};

const tooltipStyle = {
  borderRadius: 8,
  border: "1px solid #e2e8f0",
  boxShadow: "0 8px 20px rgba(15, 23, 42, 0.08)"
};

export function SimulationCharts({ baseline, current }: SimulationChartsProps) {
  const comparisonData = [
    { metric: "Sentiment", Baseline: baseline.outputs.citizenSentiment, Current: current.outputs.citizenSentiment },
    { metric: "Trust", Baseline: baseline.outputs.publicTrust, Current: current.outputs.publicTrust },
    { metric: "Cost Pressure", Baseline: baseline.outputs.costOfLivingPressure, Current: current.outputs.costOfLivingPressure },
    { metric: "Approval", Baseline: baseline.outputs.policyApproval, Current: current.outputs.policyApproval },
    { metric: "Sustainability", Baseline: baseline.outputs.policySustainability, Current: current.outputs.policySustainability }
  ];

  const trendData = [
    ...mockHistoricalData,
    {
      month: "Scenario",
      sentiment: current.outputs.citizenSentiment,
      publicTrust: current.outputs.publicTrust,
      cpi: current.inputs.cpiIndex,
      inflation: current.inputs.inflationRate,
      costPressure: current.outputs.costOfLivingPressure
    }
  ];

  const radarData = [
    { axis: "Sentiment", Baseline: baseline.outputs.citizenSentiment, Current: current.outputs.citizenSentiment },
    { axis: "Trust", Baseline: baseline.outputs.publicTrust, Current: current.outputs.publicTrust },
    { axis: "Affordability", Baseline: 100 - baseline.outputs.costOfLivingPressure, Current: 100 - current.outputs.costOfLivingPressure },
    { axis: "Fiscal", Baseline: 100 - baseline.outputs.fiscalRisk, Current: 100 - current.outputs.fiscalRisk },
    { axis: "Stability", Baseline: 100 - baseline.outputs.socialStabilityRisk, Current: 100 - current.outputs.socialStabilityRisk },
    { axis: "Sustainability", Baseline: baseline.outputs.policySustainability, Current: current.outputs.policySustainability }
  ];

  const fiscalData = [
    { name: "Baseline", balance: baseline.outputs.fiscalBalance },
    { name: "Current", balance: current.outputs.fiscalBalance }
  ];

  const segmentData = current.segmentImpacts.map((segment) => ({
    name: segment.name.replace(" households", "").replace(" citizens", ""),
    change: segment.sentimentChange,
    sentiment: segment.sentimentScore
  }));

  return (
    <div className="grid gap-5 xl:grid-cols-2">
      <section className="panel p-5">
        <h2 className="text-base font-semibold text-slate-950">Baseline vs Simulated Metrics</h2>
        <div className="mt-4 h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="metric" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
              <Bar dataKey="Baseline" fill="#64748b" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Current" fill="#1d4ed8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="panel p-5">
        <h2 className="text-base font-semibold text-slate-950">Citizen Sentiment and Trust Trend</h2>
        <div className="mt-4 h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
              <Line type="monotone" dataKey="sentiment" name="Sentiment" stroke="#1d4ed8" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="publicTrust" name="Public Trust" stroke="#059669" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="panel p-5">
        <h2 className="text-base font-semibold text-slate-950">Policy Trade-Off Profile</h2>
        <div className="mt-4 h-80">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="axis" tick={{ fontSize: 12 }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 11 }} />
              <Radar name="Baseline" dataKey="Baseline" stroke="#64748b" fill="#64748b" fillOpacity={0.18} />
              <Radar name="Current" dataKey="Current" stroke="#1d4ed8" fill="#1d4ed8" fillOpacity={0.22} />
              <Legend />
              <Tooltip contentStyle={tooltipStyle} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="panel p-5">
        <h2 className="text-base font-semibold text-slate-950">Fiscal Balance Impact</h2>
        <div className="mt-4 h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={fiscalData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => `${value}B`} />
              <Tooltip contentStyle={tooltipStyle} formatter={(value) => formatCurrencyBillions(Number(value))} />
              <Bar dataKey="balance" name="Fiscal Balance" fill="#b45309" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="panel p-5">
        <h2 className="text-base font-semibold text-slate-950">Segment Sentiment Comparison</h2>
        <div className="mt-4 h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={segmentData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-20} textAnchor="end" height={70} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="sentiment" name="Sentiment Score" fill="#2563eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="panel p-5">
        <h2 className="text-base font-semibold text-slate-950">Cost of Living Pressure Trend</h2>
        <div className="mt-4 h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="costPressure" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="5%" stopColor="#dc2626" stopOpacity={0.32} />
                  <stop offset="95%" stopColor="#dc2626" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area
                type="monotone"
                dataKey="costPressure"
                name="Cost Pressure"
                stroke="#dc2626"
                strokeWidth={2.5}
                fill="url(#costPressure)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}

