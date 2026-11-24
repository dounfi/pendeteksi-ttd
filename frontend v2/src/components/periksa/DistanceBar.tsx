import { markerPosition, type VerifyResult } from "@/lib/verify";

function fmt(n: number) {
  return n.toLocaleString("id-ID", { maximumFractionDigits: 3 });
}

/** Three-segment distance bar. Only rendered when the backend sends a distance. */
export function DistanceBar({ result }: { result: VerifyResult }) {
  if (result.distance === undefined) return null;
  const pos = markerPosition(result);
  const sc = result.scale;
  const span = sc ? sc.max - sc.min : 0;
  const a = sc?.asliMax !== undefined ? ((sc.asliMax - sc.min) / span) * 100 : 100 / 3;
  const r = sc?.raguMax !== undefined ? ((sc.raguMax - sc.min) / span) * 100 : (200 / 3);

  return (
    <figure className="mt-6" aria-label={`Nilai perbedaan ${fmt(result.distance)}`}>
      <div className="relative">
        <div className="flex h-3 overflow-hidden rounded-full" aria-hidden="true">
          <span className="h-full bg-status-asli" style={{ width: `${a}%` }} />
          <span className="h-full bg-status-ragu" style={{ width: `${Math.max(0, r - a)}%` }} />
          <span className="h-full flex-1 bg-status-palsu" />
        </div>
        {pos !== undefined && (
          <span
            aria-hidden="true"
            className="absolute -top-1.5 h-6 w-1.5 -translate-x-1/2 rounded-full bg-heading ring-2 ring-on-brand"
            style={{ left: `${pos}%` }}
          />
        )}
      </div>
      <div className="relative mt-1.5 h-10 text-xs">
        <span className="absolute left-0 top-0 text-body">Mirip</span>
        <span className="absolute right-0 top-0 text-body">Berbeda</span>
        <span
          className="absolute top-4 -translate-x-1/2 whitespace-nowrap text-sm font-semibold text-heading"
          style={{ left: `${pos !== undefined ? Math.min(88, Math.max(12, pos)) : 50}%` }}
        >
          Nilai beda {fmt(result.distance)}
        </span>
      </div>
      <figcaption className="text-sm text-body">
        Garis penanda menunjukkan posisi tanda tangan yang diperiksa. Makin ke kiri, makin mirip
        dengan tanda tangan asli.
      </figcaption>
    </figure>
  );
}
