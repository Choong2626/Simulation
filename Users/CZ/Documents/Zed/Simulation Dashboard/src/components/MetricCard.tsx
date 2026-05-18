import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

type MetricCardProps = {
  title: string;
  value: string;
  change: string;
  changeValue: number;
  status: string;
  description: string;
  lowerIsBetter?: boolean;
};

function statusClasses(status: string): string {
  if (["Strong", "Good", "Improving", "Low"].includes(status)) return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  if (["Moderate", "Weak"].includes(status)) return "bg-amber-50 text-amber-700 ring-amber-200";
  if (["High", "High Risk", "Critical", "Worsening"].includes(status)) return "bg-red-50 text-red-700 ring-red-200";
  return "bg-slate-100 text-slate-700 ring-slate-200";
}

export function MetricCard({ title, value, change, changeValue, status, description, lowerIsBetter = false }: MetricCardProps) {
  const improved = lowerIsBetter ? changeValue < 0 : changeValue > 0;
  const worsened = lowerIsBetter ? changeValue > 0 : changeValue < 0;
  const Icon = improved ? ArrowUpRight : worsened ? ArrowDownRight : Minus;
  const changeColor = improved ? "text-emerald-700" : worsened ? "text-red-700" : "text-slate-500";

  return (
    <section className="panel p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-medium text-slate-600">{title}</h3>
          <div className="mt-2 text-2xl font-semibold text-slate-950">{value}</div>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${statusClasses(status)}`}>{status}</span>
      </div>
      <div className={`mt-3 flex items-center gap-1 text-sm font-semibold ${changeColor}`}>
        <Icon className="h-4 w-4" aria-hidden="true" />
        {change}
      </div>
      <p className="mt-2 text-xs leading-relaxed text-slate-500">{description}</p>
    </section>
  );
}

