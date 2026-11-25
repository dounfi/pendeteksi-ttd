import { cn } from "@/lib/utils";

export function SectionHeading({
  number,
  label,
  title,
  id,
  className,
  eyebrowClassName,
}: {
  number: string;
  label: string;
  title: string;
  id: string;
  className?: string;
  eyebrowClassName?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <p className={cn("flex items-center gap-2 text-xs sm:text-sm font-extrabold uppercase tracking-wider text-[#1E65AB]", eyebrowClassName)}>
        <span aria-hidden="true" className="h-0.5 w-7 bg-[#1E65AB]" />
        {number} / {label}
      </p>
      <h2 id={id} className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#010211] tracking-tight leading-tight">
        {title}
      </h2>
    </div>
  );
}
