import { CircleAlert, CircleCheck, CircleX, type LucideIcon } from "lucide-react";

import { STAMP_LABEL, type VerifyStatus } from "@/lib/verify";
import { cn } from "@/lib/utils";

export const STATUS_STYLE: Record<VerifyStatus, { icon: LucideIcon; ink: string; border: string }> = {
  Asli: { icon: CircleCheck, ink: "text-status-asli-ink", border: "border-status-asli" },
  Palsu: { icon: CircleX, ink: "text-status-palsu-ink", border: "border-status-palsu" },
  "Belum Yakin": { icon: CircleAlert, ink: "text-status-ragu-ink", border: "border-status-ragu" },
};

export function StatusStamp({ status }: { status: VerifyStatus }) {
  const { icon: Icon, ink, border } = STATUS_STYLE[status];
  const [first, ...rest] = STAMP_LABEL[status].split(" ");
  const two = rest.length > 0 && first === "KEMUNGKINAN";
  return (
    <div className="grid w-full place-items-center rounded-xl border border-surface-200 bg-background p-4 sm:w-44">
      <div
        className={cn(
          "-rotate-6 flex items-center gap-2 rounded-lg border-[3px] px-3 py-2",
          border,
          ink,
        )}
      >
        <Icon className="h-7 w-7 shrink-0" aria-hidden="true" />
        <p className="text-center font-bold leading-none">
          {two ? (
            <>
              <span className="block text-[11px] tracking-[0.16em]">{first}</span>
              <span className="mt-1 block text-2xl tracking-wide">{rest.join(" ")}</span>
            </>
          ) : (
            <span className="block text-xl tracking-wide">{STAMP_LABEL[status]}</span>
          )}
        </p>
      </div>
    </div>
  );
}
