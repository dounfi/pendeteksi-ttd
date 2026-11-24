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
    <div className={cn("flex flex-col gap-3", className)}>
      <p className={cn("eyebrow flex items-center gap-2", eyebrowClassName)}>
        <span aria-hidden="true" className="h-px w-8 bg-primary-400" />
        {number} / {label}
      </p>
      <h2 id={id} className="text-section">
        {title}
      </h2>
    </div>
  );
}
