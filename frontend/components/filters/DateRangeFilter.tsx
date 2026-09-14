"use client";

import type { Timeframe } from "@/types";
import { cn } from "@/lib/utils";

const options: Timeframe[] = ["7D", "28D", "90D", "1Y", "2Y"];

type DateRangeFilterProps = {
  value: Timeframe;
  onChange: (value: Timeframe) => void;
};

export function DateRangeFilter({ value, onChange }: DateRangeFilterProps) {
  return (
    <div className="inline-flex rounded-xl border border-border bg-surface p-1">
      {options.map((option) => (
        <button
          type="button"
          key={option}
          onClick={() => onChange(option)}
          className={cn(
            "rounded-lg px-3 py-1.5 text-xs font-semibold transition",
            value === option ? "bg-accent text-white" : "text-muted hover:bg-surface-2 hover:text-foreground",
          )}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

