import { Database, Layers, ShieldCheck } from "lucide-react";

function Signature({ variant }: { variant: "a" | "b" }) {
  const d =
    variant === "a"
      ? "M8 40c6-18 12-28 16-22s-6 26 2 20 10-22 16-16-2 18 6 14 8-14 14-10 4 10 12 6 14-6 22-4"
      : "M8 42c6-20 13-28 17-21s-7 25 1 19 11-21 17-15-3 17 5 13 9-13 15-9 3 11 11 7 15-7 23-5";
  return (
    <svg viewBox="0 0 120 60" className="h-full w-full" aria-hidden="true">
      <path
        d={d}
        fill="none"
        stroke="var(--heading)"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Static, decorative preview of a result card. */
export function ResultPreview() {
  return (
    <div
      aria-hidden="true"
      className="card relative mx-auto w-full max-w-2xl p-4 text-left sm:p-6"
    >
      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
        <div className="grid grid-cols-2 gap-3">
          {(["Contoh asli", "Diperiksa"] as const).map((label, i) => (
            <div key={label} className="rounded-xl border border-surface-200 bg-surface-50 p-2">
              <p className="px-1 text-xs font-medium text-body">{label}</p>
              <div className="mt-1 h-14 rounded-lg bg-background sm:h-16">
                <Signature variant={i === 0 ? "a" : "b"} />
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center">
          <div className="-rotate-6 rounded-lg border-[3px] border-status-asli bg-on-brand px-4 py-2 text-center">
            <p className="text-[10px] font-bold tracking-[0.18em] text-status-asli">KEMUNGKINAN</p>
            <p className="text-2xl font-bold leading-none tracking-wide text-status-asli">ASLI</p>
          </div>
        </div>
      </div>

      <div className="mt-5">
        <div className="relative flex h-3 overflow-hidden rounded-full">
          <span className="h-full w-[45%] bg-status-asli" />
          <span className="h-full w-[18%] bg-status-ragu" />
          <span className="h-full flex-1 bg-status-palsu" />
        </div>
        <div className="relative mt-1 h-6">
          <span className="absolute left-[22%] top-[-18px] h-5 w-1 -translate-x-1/2 rounded-full bg-heading" />
          <span className="absolute left-[22%] top-1 hidden -translate-x-1/2 text-xs font-semibold text-heading sm:block">
            Nilai beda 0,32
          </span>
          <span className="absolute left-0 top-1 text-xs text-body">Mirip</span>
          <span className="absolute right-0 top-1 text-xs text-body">Berbeda</span>
        </div>
        <p className="-mt-2 text-center text-xs font-semibold text-heading sm:hidden">
          Nilai beda 0,32
        </p>
      </div>
    </div>
  );
}

const chips = [
  { icon: Layers, label: "Bisa pakai 1 sampai 5 contoh asli" },
  { icon: ShieldCheck, label: "Hasil: Asli, Belum Yakin, atau Palsu" },
  { icon: Database, label: "Belajar dari ribuan contoh tanda tangan" },
];

/** Short info pills shown next to the result preview. */
export function ResultChips() {
  return (
    <ul className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
      {chips.map(({ icon: Icon, label }) => (
        <li
          key={label}
          className="inline-flex items-center gap-2 rounded-full border border-surface-200 bg-background px-4 py-2 text-sm font-medium text-heading"
        >
          <Icon className="h-4 w-4 shrink-0 text-primary-700" aria-hidden="true" />
          {label}
        </li>
      ))}
    </ul>
  );
}
