import { cn } from "@/lib/utils";

export function Logo({
  className,
  showText = true,
}: {
  className?: string;
  showText?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground shadow-sm">
        <svg viewBox="0 0 24 24" className="size-5" fill="none" aria-hidden>
          <path
            d="M6 3v7a3 3 0 0 0 6 0V3M9 3v18M18 3c-1.5 1-2.5 3-2.5 6.5S16.5 15 18 16v5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      {showText && (
        <span className="text-[15px] font-semibold tracking-tight">
          Ndaw<span className="text-primary">-Resto</span>
        </span>
      )}
    </span>
  );
}
