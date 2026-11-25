import { Database, Layers, ShieldCheck, CheckCircle2 } from "lucide-react";

function Signature({ variant }: { variant: "a" | "b" }) {
  const d =
    variant === "a"
      ? "M8 40c6-18 12-28 16-22s-6 26 2 20 10-22 16-16-2 18 6 14 8-14 14-10 4 10 12 6 14-6 22-4"
      : "M8 42c6-20 13-28 17-21s-7 25 1 19 11-21 17-15-3 17 5 13 9-13 15-9 3 11 11 7 15-7 23-5";
  return (
    <svg viewBox="0 0 120 60" className="h-full w-full transition-transform duration-300 group-hover:scale-105" aria-hidden="true">
      <path
        d={d}
        fill="none"
        stroke="#0B2545"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Tampilan contoh asli dan diperiksa persis Gambar 3 — langsung di atas latar tanpa pembungkus kotak warna. */
export function ResultPreview() {
  return (
    <div aria-hidden="true" className="w-full">
      {/* Baris 2 Kotak Tanda Tangan + Stempel Hijau Miring */}
      <div className="grid grid-cols-[1fr_1fr_auto] items-center gap-3 sm:gap-4">
        {/* Kotak Contoh Asli */}
        <div className="group rounded-2xl border border-slate-200/90 bg-white p-3 shadow-2xs transition-colors duration-200 hover:border-[#1E65AB]">
          <p className="px-1 text-xs font-semibold text-slate-700">Contoh asli</p>
          <div className="mt-1 h-16 sm:h-20 rounded-xl bg-white flex items-center justify-center p-1">
            <Signature variant="a" />
          </div>
        </div>

        {/* Kotak Diperiksa */}
        <div className="group rounded-2xl border border-slate-200/90 bg-white p-3 shadow-2xs transition-colors duration-200 hover:border-[#1E65AB]">
          <p className="px-1 text-xs font-semibold text-slate-700">Diperiksa</p>
          <div className="mt-1 h-16 sm:h-20 rounded-xl bg-white flex items-center justify-center p-1">
            <Signature variant="b" />
          </div>
        </div>

        {/* Stempel Kemungkinan Asli */}
        <div className="flex items-center justify-center pl-1 sm:pl-2">
          <div className="-rotate-6 hover:rotate-0 hover:scale-105 transition-transform duration-300 rounded-2xl border-[3.5px] border-[#2E9E5B] bg-white px-4 py-2.5 sm:px-5 sm:py-3 text-center shadow-xs cursor-default select-none">
            <p className="text-[10px] sm:text-[11px] font-bold tracking-[0.18em] text-[#2E9E5B]">KEMUNGKINAN</p>
            <p className="text-2xl sm:text-3xl font-extrabold leading-none tracking-wide text-[#2E9E5B] mt-0.5">ASLI</p>
          </div>
        </div>
      </div>

      {/* Bar Indikator Nilai Beda */}
      <div className="mt-6 pt-1">
        <div className="relative flex h-3.5 overflow-hidden rounded-full shadow-inner bg-slate-100">
          <span className="h-full w-[45%] bg-[#2E9E5B] transition-all duration-300" />
          <span className="h-full w-[18%] bg-[#CFAF55] transition-all duration-300" />
          <span className="h-full flex-1 bg-[#D0575A] transition-all duration-300" />
        </div>
        <div className="relative mt-2 h-7">
          <span className="absolute left-[22%] top-[-22px] h-5 w-1.5 -translate-x-1/2 rounded-full bg-[#0B2545] shadow-xs" />
          <span className="absolute left-[22%] top-1 -translate-x-1/2 text-xs sm:text-sm font-bold text-[#0B2545] whitespace-nowrap">
            Nilai beda 0,32
          </span>
          <span className="absolute left-0 top-1 text-xs font-medium text-slate-500">Mirip</span>
          <span className="absolute right-0 top-1 text-xs font-medium text-slate-500">Berbeda</span>
        </div>
      </div>
    </div>
  );
}

const creativeChips = [
  {
    icon: Layers,
    title: "Bisa pakai 1 sampai 5 contoh asli",
    tag: "Fleksibel",
    color: "bg-[#0C7AB5]/10 text-[#0C7AB5] border-[#0C7AB5]/20",
    tagColor: "bg-[#0C7AB5]/10 text-[#0C7AB5]",
  },
  {
    icon: ShieldCheck,
    title: "Hasil: Asli, Belum Yakin, atau Palsu",
    tag: "3 Status Jelas",
    color: "bg-[#2E9E5B]/10 text-[#2E9E5B] border-[#2E9E5B]/20",
    tagColor: "bg-[#2E9E5B]/10 text-[#2E9E5B]",
  },
  {
    icon: Database,
    title: "Belajar dari ribuan contoh tanda tangan",
    tag: "Dataset Nyata",
    color: "bg-[#1E65AB]/10 text-[#1E65AB] border-[#1E65AB]/20",
    tagColor: "bg-[#1E65AB]/10 text-[#1E65AB]",
  },
];

/** Layout 3 info cards yang kreatif, modern, dan interaktif di sebelah kanan. */
export function ResultChips() {
  return (
    <div className="mt-8 flex flex-col gap-3 w-full">
      {creativeChips.map(({ icon: Icon, title, tag, color, tagColor }) => (
        <div
          key={title}
          className="group relative flex items-center justify-between gap-3.5 rounded-2xl border border-slate-200/80 bg-white p-3.5 sm:p-4 shadow-2xs transition-all duration-200 hover:-translate-y-1 hover:border-[#1E65AB]/40 hover:shadow-xs cursor-default"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl border ${color} transition-transform duration-200 group-hover:scale-110 shadow-2xs`}>
              <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="text-sm font-bold text-[#0B2545] group-hover:text-[#1E65AB] transition-colors leading-snug truncate sm:whitespace-normal">
              {title}
            </span>
          </div>

          <span className={`hidden sm:inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-bold ${tagColor}`}>
            {tag}
          </span>
        </div>
      ))}
    </div>
  );
}
