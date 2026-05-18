import { getScoreStatus } from "../lib/clamp";

type SentimentGaugeProps = {
  score: number;
  label?: string;
};

export function SentimentGauge({ score, label = "Citizen Sentiment" }: SentimentGaugeProps) {
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const status = getScoreStatus(score);

  return (
    <div className="panel flex h-full flex-col items-center justify-center p-6 text-center">
      <svg className="h-36 w-36 -rotate-90" viewBox="0 0 120 120" role="img" aria-label={`${label} ${score.toFixed(1)}`}>
        <circle cx="60" cy="60" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="10" />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="#1d4ed8"
          strokeLinecap="round"
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="-mt-24 flex h-24 flex-col items-center justify-center">
        <div className="text-3xl font-semibold text-slate-950">{score.toFixed(1)}</div>
        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">/ 100</div>
      </div>
      <div className="mt-8 text-sm font-semibold text-slate-950">{label}</div>
      <div className="mt-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-gov-700">{status}</div>
    </div>
  );
}

