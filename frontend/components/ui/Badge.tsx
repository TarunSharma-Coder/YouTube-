import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type BadgeTone = "default" | "success" | "danger" | "warning";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: BadgeTone;
};

export function Badge({ className, tone = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
        tone === "default" && "border-border bg-surface-2 text-muted",
        tone === "success" && "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
        tone === "danger" && "border-red-500/20 bg-red-500/10 text-red-300",
        tone === "warning" && "border-amber-500/20 bg-amber-500/10 text-amber-300",
        className,
      )}
      {...props}
    />
  );
}

