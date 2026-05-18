import { AlertTriangle } from "lucide-react";

type DisclaimerBannerProps = {
  compact?: boolean;
};

export function DisclaimerBanner({ compact = false }: DisclaimerBannerProps) {
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900">
      <div className="flex gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 flex-none" aria-hidden="true" />
        <p className={`${compact ? "text-xs" : "text-sm"} leading-relaxed`}>
          This simulation is based on simplified assumptions and weighted relationships. It is intended for scenario planning
          and policy discussion only. It should not be treated as a final economic forecast, official policy prediction, or
          substitute for expert economic modelling.
        </p>
      </div>
    </div>
  );
}

