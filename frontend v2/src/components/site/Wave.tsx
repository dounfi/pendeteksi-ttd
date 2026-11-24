import { cn } from "@/lib/utils";

/** Soft wave divider. Colour comes from a fill-* class so it follows the tokens. */
export function Wave({
  className,
  flip = false,
}: {
  className?: string;
  flip?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 1440 120"
      preserveAspectRatio="none"
      aria-hidden="true"
      className={cn("block h-12 w-full md:h-20", flip && "rotate-180", className)}
    >
      <path d="M0 64C180 20 360 0 560 22s380 82 580 70 220-50 300-62v90H0Z" />
    </svg>
  );
}
