import { ChevronDown, Info } from "lucide-react";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

/** Collapsible "Info Model" card. Only rendered when the backend sends model info. */
export function ModelInfo({ rows }: { rows?: { label: string; value: string }[] | undefined }) {
  if (!rows?.length) return null;
  return (
    <Collapsible className="card-soft group">
      <CollapsibleTrigger className="flex w-full cursor-pointer items-center justify-between gap-3 px-5 py-4 text-left font-semibold text-heading">
        <span className="flex items-center gap-2">
          <Info className="h-5 w-5 text-primary-700" aria-hidden="true" /> Informasi Teknis
        </span>
        <ChevronDown
          className="h-5 w-5 text-primary-700 transition-transform group-data-[state=open]:rotate-180"
          aria-hidden="true"
        />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <p className="px-5 pb-3 text-sm text-body">
          Bagian ini berisi data teknis sistem untuk pengembang atau peneliti. Anda tidak perlu
          memahaminya untuk membaca hasil pemeriksaan.
        </p>
        <dl className="grid gap-x-6 gap-y-2 px-5 pb-5 text-sm sm:grid-cols-[auto_minmax(0,1fr)]">
          {rows.map((r) => (
            <div key={r.label} className="contents">
              <dt className="font-medium capitalize text-heading">{r.label}</dt>
              <dd className="text-body">{r.value}</dd>
            </div>
          ))}
        </dl>
      </CollapsibleContent>
    </Collapsible>
  );
}
