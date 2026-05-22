import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type TooltipProps = {
  label: string;
  children: ReactNode;
  className?: string;
};

export function Tooltip({ label, children, className }: TooltipProps) {
  return (
    <span className={cn("group relative inline-flex w-full", className)}>
      {children}
      <span className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 hidden max-w-56 -translate-x-1/2 rounded-md border bg-popover px-3 py-2 text-center text-xs font-semibold text-popover-foreground shadow-glow group-hover:block group-focus-within:block">
        {label}
      </span>
    </span>
  );
}
