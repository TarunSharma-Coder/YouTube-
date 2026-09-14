import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60",
        variant === "primary" &&
          "bg-accent text-white shadow-[0_14px_35px_rgba(255,59,92,0.18)] hover:bg-accent/90",
        variant === "secondary" &&
          "border border-border bg-surface text-foreground hover:bg-surface-2",
        variant === "ghost" && "text-muted hover:bg-surface-2 hover:text-foreground",
        className,
      )}
      {...props}
    />
  );
}

