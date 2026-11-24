import { CircleCheck, CircleMinus, CircleX, RotateCcw, type LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { FindingTone } from "@/lib/verify";
import { cn } from "@/lib/utils";
import { EMPTY_TEXT, ErrorCard, type CheckState } from "./ResultCard";

const TONE: Record<FindingTone, { icon: LucideIcon; bg: string; ink: string; sr: string }> = {
  asli: { icon: CircleCheck, bg: "bg-status-asli-tint", ink: "text-status-asli-ink", sr: "Mirip" },
  palsu: { icon: CircleX, bg: "bg-status-palsu-tint", ink: "text-status-palsu-ink", sr: "Berbeda" },
  netral: { icon: CircleMinus, bg: "bg-status-ragu-tint", ink: "text-status-ragu-ink", sr: "Agak berbeda" },
};

function PanelShell({ children }: { children: React.ReactNode }) {
  return (
    <section aria-labelledby="penjelasan-title" className="flex flex-col gap-4">
      <h2 id="penjelasan-title" className="text-3xl sm:text-4xl">
        Penjelasan Lebih Lanjut
      </h2>
      {children}
    </section>
  );
}

export function ExplanationPanel({
  state,
  onReset,
  onRetry,
}: {
  state: CheckState;
  onReset: () => void;
  onRetry: () => void;
}) {
  if (state.kind === "error") {
    return (
      <PanelShell>
        <ErrorCard message={state.message} onRetry={onRetry} />
      </PanelShell>
    );
  }

  if (state.kind !== "success") {
    const block = state.kind === "loading" ? "shimmer" : "skeleton";
    return (
      <PanelShell>
        <div className="card-muted p-5 sm:p-6" aria-busy={state.kind === "loading"}>
          <div className={cn(block, "h-4 w-40 rounded-full")} />
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className={cn(block, "aspect-[3/2]")} />
            <div className={cn(block, "aspect-[3/2]")} />
          </div>
          <div className="my-6 h-px bg-surface-200" />
          <div className={cn(block, "h-4 w-44 rounded-full")} />
          <div className="mt-4 space-y-3">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className={cn(block, "h-11 rounded-full")} />
            ))}
          </div>
          <p className="mt-5 text-center text-sm text-body">
            {state.kind === "loading" ? "Menyiapkan penjelasan..." : EMPTY_TEXT}
          </p>
        </div>
      </PanelShell>
    );
  }

  const { processed, explainMap, findings, findingsSummary, shakeStatus } = state.result;

  return (
    <PanelShell>
      <div className="card-muted p-5 sm:p-6">
        {processed && (
          <div>
            <h3 className="text-base">Foto Setelah Dirapikan</h3>
            <p className="mt-1 text-sm text-body">
              Foto dirapikan lebih dulu agar kedua tanda tangan lebih mudah dibandingkan.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-4">
              {processed.reference && (
                <figure>
                  <img
                    src={processed.reference}
                    alt="Tanda tangan asli setelah dirapikan"
                    className="aspect-[3/2] w-full rounded-xl border border-surface-200 bg-background object-contain"
                  />
                  <figcaption className="mt-2 text-sm text-body">Tanda tangan asli</figcaption>
                </figure>
              )}
              {processed.query && (
                <figure>
                  <img
                    src={processed.query}
                    alt="Tanda tangan yang diperiksa setelah dirapikan"
                    className="aspect-[3/2] w-full rounded-xl border border-surface-200 bg-background object-contain"
                  />
                  <figcaption className="mt-2 text-sm text-body">Tanda tangan yang diperiksa</figcaption>
                </figure>
              )}
            </div>
          </div>
        )}

        {processed && explainMap && <div className="my-6 h-px bg-surface-200" aria-hidden="true" />}

        {explainMap && (
          <div>
            <h3 className="text-base">Bagian yang Paling Berbeda</h3>
            <p className="mt-1 text-sm text-body">
              Bagian yang berwarna terang adalah bagian tanda tangan yang paling memengaruhi hasil
              pemeriksaan.
            </p>
            <figure className="mt-4">
              <img
                src={explainMap}
                alt="Peta warna yang menyorot bagian tanda tangan yang paling berbeda"
                className="aspect-[3/2] w-full rounded-xl border border-surface-200 bg-background object-contain"
              />
            </figure>
          </div>
        )}

        {(processed || explainMap) && findings && (
          <div className="my-6 h-px bg-surface-200" aria-hidden="true" />
        )}

        {findings && (
          <div>
            <h3 className="text-base">Perbandingan Ciri Tanda Tangan</h3>
            <p className="mt-1 text-sm text-body">
              Beberapa ciri bentuk, seperti luas dan kerapatan goresan, dibandingkan satu per satu.
            </p>
            {findingsSummary && (
              <p className="mt-1 text-sm text-body">
                Dari {findingsSummary.total} ciri: {findingsSummary.mirip} mirip,{" "}
                {findingsSummary.agakBeda} agak berbeda, dan {findingsSummary.beda} berbeda.
              </p>
            )}
            {shakeStatus && (
              <p className="mt-1 text-sm text-body">
                Hasil Uji Goyang (apakah hasil tetap sama saat foto sedikit diubah):{" "}
                <span className="font-semibold text-heading">{shakeStatus}</span>
              </p>
            )}
            <ul className="mt-4 space-y-2.5">
              {findings.map((f, i) => {
                const t = TONE[f.tone];
                const Icon = t.icon;
                return (
                  <li
                    key={i}
                    className={cn("flex items-start gap-3 rounded-xl px-4 py-3 text-[15px] text-heading", t.bg)}
                  >
                    <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", t.ink)} aria-hidden="true" />
                    <span className="sr-only">{t.sr}: </span>
                    <span className="min-w-0">{f.text}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        <Button
          variant="outline-brand"
          size="pill-lg"
          className={cn("w-full sm:w-auto", (processed || explainMap || findings) && "mt-6")}
          onClick={onReset}
        >
          <RotateCcw /> Periksa Pasangan Lain
        </Button>
      </div>
    </PanelShell>
  );
}
