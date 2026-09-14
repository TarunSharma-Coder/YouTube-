import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

type MetricCardProps = {
  label: string;
  value: string;
  hint?: string;
  icon?: LucideIcon;
  trend?: string;
  tone?: "neutral" | "positive" | "negative";
};

export function MetricCard({ label, value, hint, icon: Icon, trend, tone = "neutral" }: MetricCardProps) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted">{label}</p>
          <p className="mt-3 text-2xl font-semibold tracking-tight text-foreground">{value}</p>
        </div>
        {Icon ? (
          <div className="rounded-xl border border-border bg-surface-2 p-2 text-muted">
            <Icon className="size-4" />
          </div>
        ) : null}
      </div>
      <div className="mt-3 flex items-center justify-between gap-2 text-xs">
        <span className="text-muted">{hint}</span>
        {trend ? (
          <span
            className={cn(
              "font-semibold",
              tone === "positive" && "text-emerald-300",
              tone === "negative" && "text-red-300",
              tone === "neutral" && "text-muted",
            )}
          >
            {trend}
          </span>
        ) : null}
      </div>
    </Card>
  );
}

