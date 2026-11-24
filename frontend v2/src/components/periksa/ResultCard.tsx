import { RotateCcw, TriangleAlert, WifiOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { VerifyResult } from "@/lib/verify";
import { cn } from "@/lib/utils";
import { DistanceBar } from "./DistanceBar";
import { STATUS_STYLE, StatusStamp } from "./StatusStamp";

export type CheckState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "success"; result: VerifyResult };

export const EMPTY_TEXT = "Hasil akan muncul di sini setelah pemeriksaan.";

function Placeholder({ loading }: { loading: boolean }) {
  const block = loading ? "shimmer" : "skeleton";
  return (
    <div className="card-muted p-5 sm:p-6" aria-busy={loading}>
      <div className="grid gap-5 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-center">
        <div className={cn(block, "h-28 w-full sm:w-44")} />
        <div className="space-y-3">
          <div className={cn(block, "h-10 w-28 rounded-xl")} />
          <div className={cn(block, "h-4 w-full rounded-full")} />
          <div className={cn(block, "h-4 w-2/3 rounded-full")} />
        </div>
      </div>
      <div className={cn(block, "mt-6 h-3 w-full rounded-full")} />
      <p className="mt-5 text-center text-sm text-body" role="status">
        {loading ? "Sedang memeriksa tanda tangan..." : EMPTY_TEXT}
      </p>
    </div>
  );
}

export function ErrorCard({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="card-muted flex flex-col items-center gap-3 p-6 text-center" role="alert">
      <span className="grid h-14 w-14 place-items-center rounded-full bg-primary-200">
        <WifiOff className="h-7 w-7 text-primary-700" aria-hidden="true" />
      </span>
      <p className="font-semibold text-heading">Pemeriksaan belum berhasil</p>
      <p className="max-w-md text-sm text-body">{message}</p>
      <Button variant="brand" size="pill" onClick={onRetry}>
        <RotateCcw /> Coba Lagi
      </Button>
    </div>
  );
}

export function ResultCard({ state, onRetry }: { state: CheckState; onRetry: () => void }) {
  if (state.kind === "idle") return <Placeholder loading={false} />;
  if (state.kind === "loading") return <Placeholder loading />;
  if (state.kind === "error") return <ErrorCard message={state.message} onRetry={onRetry} />;

  const r = state.result;
  const ink = r.status ? STATUS_STYLE[r.status].ink : "text-heading";
  const hasTop = r.status || r.percentage !== undefined || r.explanation;

  return (
    <div className="card-muted p-5 sm:p-6" role="status" aria-live="polite">
      {hasTop && (
        <div className="grid gap-5 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-center">
          {r.status && <StatusStamp status={r.status} />}
          <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
            {r.percentage !== undefined && (
              <div className="shrink-0">
                <p className="text-sm font-medium text-body">Tingkat kemiripan</p>
                <p className={cn("text-5xl font-bold tracking-tight", ink)}>
                  {r.percentage.toLocaleString("id-ID", { maximumFractionDigits: 1 })}%
                </p>
              </div>
            )}
            {r.explanation && <p className="text-body">{r.explanation}</p>}
          </div>
        </div>
      )}
      <DistanceBar result={r} />
      {r.warnings && (
        <ul className="mt-4 space-y-2" aria-label="Peringatan kualitas foto">
          {r.warnings.map((w, i) => (
            <li
              key={i}
              className="flex items-start gap-2 rounded-xl border border-surface-200 bg-background px-4 py-2.5 text-sm text-heading"
            >
              <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-primary-700" aria-hidden="true" />
              <span className="min-w-0">{w}</span>
            </li>
          ))}
        </ul>
      )}
      {!hasTop && r.distance === undefined && !r.warnings && (
        <p className="text-center text-sm text-body">Rincian hasil belum tersedia untuk pemeriksaan ini.</p>
      )}
    </div>
  );
}
