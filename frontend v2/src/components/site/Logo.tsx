import { cn } from "@/lib/utils";
import { BRAND } from "@/lib/brand";

/** SIDIKTA wordmark: a signature stroke with an underline, plus the name. */
export function Logo({ className, tone = "brand" }: { className?: string; tone?: "brand" | "light" }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <svg viewBox="0 0 40 40" className="h-9 w-9 shrink-0" aria-hidden="true">
        <path
          d="M10 6c-2 6-1 16 1 22 1 3 3 3 4 0 1-4 0-9 2-10 2-1 2 4 3 6 1 2 3 1 4-1 1-2 2-3 3-1 1 2 3 2 6 0"
          fill="none"
          stroke="var(--primary-600)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M8 34h24" stroke="var(--primary-600)" strokeWidth="3" strokeLinecap="round" />
      </svg>
      <span
        className={cn(
          "text-lg font-bold tracking-tight",
          tone === "brand" ? "text-primary-700" : "text-on-brand",
        )}
      >
        {BRAND.name}
      </span>
    </span>
  );
}
