"use client";

import { cn } from "@/lib/utils";

export interface BarDatum {
  label: string;
  value: number;
  /** Optional richer label shown on hover. */
  title?: string;
}

/**
 * Minimal, dependency-free vertical bar chart using the design tokens.
 * Values scale to the tallest bar; bars carry a native tooltip.
 */
export function BarChart({
  data,
  height = 200,
  format = (v) => v.toLocaleString("fr-FR"),
  className,
}: {
  data: BarDatum[];
  height?: number;
  format?: (v: number) => string;
  className?: string;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));

  if (data.length === 0) {
    return (
      <div
        className="grid place-items-center text-sm text-muted-foreground"
        style={{ height }}
      >
        Aucune donnée sur la période.
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-end gap-2" style={{ height }}>
        {data.map((d, i) => {
          const pct = (d.value / max) * 100;
          return (
            <div
              key={`${d.label}-${i}`}
              className="group flex h-full flex-1 flex-col items-center justify-end gap-2"
              title={d.title ?? `${d.label} · ${format(d.value)}`}
            >
              <span className="text-[10px] font-medium text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
                {format(d.value)}
              </span>
              <div
                className="w-full rounded-t-md bg-gradient-to-t from-primary/40 to-primary transition-all group-hover:from-primary/60"
                style={{ height: `${Math.max(pct, 2)}%` }}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex gap-2">
        {data.map((d, i) => (
          <span
            key={`${d.label}-lbl-${i}`}
            className="flex-1 truncate text-center text-[10px] text-muted-foreground"
          >
            {d.label}
          </span>
        ))}
      </div>
    </div>
  );
}
