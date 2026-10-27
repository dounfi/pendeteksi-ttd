import type { CSSProperties, ReactNode } from "react";

type Base = { className?: string | undefined; style?: CSSProperties | undefined; children?: ReactNode | undefined; speed?: number  | undefined};

export const SIG_A = [20, 70, 40, 20, 70, 20, 80, 60, 90, 95, 60, 100, 70, 60, 85, 30, 110, 25, 120, 60, 128, 85, 140, 40, 160, 45, 180, 50, 170, 85, 200, 70, 225, 58, 250, 40, 280, 55];
export const SIG_B = [22, 72, 44, 24, 66, 16, 82, 56, 94, 98, 56, 96, 72, 64, 88, 34, 106, 22, 124, 64, 130, 80, 144, 44, 158, 40, 184, 56, 168, 88, 204, 66, 228, 62, 246, 36, 282, 60];

export function sigPath(p: readonly number[]) {
  let d = `M${p[0]} ${p[1]}`;
  for (let i = 2; i + 5 < p.length; i += 6) d += ` C${p[i]} ${p[i + 1]} ${p[i + 2]} ${p[i + 3]} ${p[i + 4]} ${p[i + 5]}`;
  return d;
}
export function lerp(a: readonly number[], b: readonly number[], t: number) {
  return a.map((v, i) => v + ((b[i] ?? v) - v) * t);
}

export function Signature({ points = SIG_A, className = "", draw = false, stroke = "var(--ink)", width = 3 }: { points?: readonly number[] | undefined; className?: string | undefined; draw?: boolean | undefined; stroke?: string | undefined; width?: number  | undefined}) {
  return (
    <svg viewBox="0 0 300 110" className={`${className} ${draw ? "draw-sig" : ""}`} aria-hidden>
      <path d={sigPath(points)} fill="none" stroke={stroke} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const sp = (speed?: number) => (speed ? { "data-speed": speed } : {});

export function Paper({ className = "", style, children, curl, holes, speed }: Base & { curl?: boolean | undefined; holes?: boolean  | undefined}) {
  return (
    <div {...sp(speed)} data-drop className={`paper ${curl ? "paper-curl" : ""} ${holes ? "spiral" : ""} ${className}`} style={style}>
      {children}
    </div>
  );
}

export function Folder({ className = "", style, children, tab }: Base & { tab?: ReactNode  | undefined}) {
  return (
    <div data-drop className={`relative ${className}`} style={style}>
      <div className="paper absolute -top-4 left-8 right-6 h-24 rotate-2" aria-hidden />
      <div className="folder absolute -top-7 left-5 h-10 w-40 rounded-t-xl" aria-hidden>
        {tab && <span className="block px-4 pt-2 font-display text-sm font-extrabold text-ink">{tab}</span>}
      </div>
      <div className="folder relative p-4 sm:p-6">{children}</div>
    </div>
  );
}

export function Sticky({ color = "y", className = "", style, children, speed }: Base & { color?: "y" | "p" | "b"  | undefined}) {
  return (
    <div {...sp(speed)} data-drop className={`note note-${color} ${className}`} style={style}>
      <span className="tape" aria-hidden />
      {children}
    </div>
  );
}

export function LabelStrip({ children, className = "" }: Base) {
  return <div data-drop className={`label-strip ${className}`}>{children}</div>;
}

export function Stamp({ kind, children, className = "" }: Base & { kind: "asli" | "pasti" | "palsu" }) {
  return <span data-stamp className={`stamp stamp-${kind} ${className}`}>{children}</span>;
}

export function Clipboard({ children, className = "", style }: Base) {
  return (
    <div data-drop className={`clipboard relative p-3 pt-10 sm:p-5 sm:pt-12 ${className}`} style={style}>
      <svg className="absolute -top-6 left-1/2 h-14 w-40 -translate-x-1/2" viewBox="0 0 160 56" aria-hidden>
        <defs>
          <linearGradient id="clip" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#f0d9b5" />
            <stop offset="1" stopColor="#a8875a" />
          </linearGradient>
        </defs>
        <rect x="10" y="18" width="140" height="34" rx="10" fill="url(#clip)" />
        <rect x="52" y="4" width="56" height="22" rx="11" fill="none" stroke="url(#clip)" strokeWidth="7" />
        <rect x="14" y="20" width="132" height="4" rx="2" fill="#fff" opacity=".6" />
      </svg>
      <div className="rounded-lg bg-paper p-5 sm:p-8">{children}</div>
    </div>
  );
}

export function Magnifier({ className = "" }: Base) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden>
      <circle cx="40" cy="40" r="28" fill="#bfe3f5" fillOpacity=".5" stroke="#14213d" strokeWidth="7" />
      <path d="M26 30 a16 16 0 0 1 14 -10" stroke="#fff" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M61 61 L88 88" stroke="#1d1d1f" strokeWidth="12" strokeLinecap="round" />
    </svg>
  );
}

export function RibbonBand({ text }: { text: string }) {
  return (
    <div data-drop className="label-strip w-[110%] -translate-x-[4%] -rotate-1 overflow-hidden whitespace-nowrap rounded-none py-3 text-lg">
      {Array.from({ length: 8 }).map((_, i) => (
        <span key={i} className="mx-5 inline-flex items-center gap-5">
          {text}
          <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden><path d="M12 2l3 7 7 .6-5.3 4.7 1.6 7.2L12 17.8 5.7 21.5l1.6-7.2L2 9.6 9 9z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /></svg>
        </span>
      ))}
    </div>
  );
}

export function IdCard({ title, role, initials, small, className = "", draw, lanyard }: { title: string; role?: string | undefined; initials?: string | undefined; small?: boolean | undefined; className?: string | undefined; draw?: boolean | undefined; lanyard?: boolean  | undefined}) {
  return (
    <div data-drop className={`relative ${className}`}>
      {lanyard && (
        <svg data-speed="0.6" className="pointer-events-none absolute -top-40 -left-24 h-48 w-64 sm:-left-40 sm:w-80" viewBox="0 0 320 200" aria-hidden>
          <path d="M-10 10 C 80 40, 160 60, 190 190" stroke="#1f4fbf" strokeWidth="22" fill="none" strokeLinecap="round" />
          <path d="M-10 4 C 80 34, 160 54, 186 180" stroke="#fff" strokeOpacity=".35" strokeWidth="3" fill="none" />
        </svg>
      )}
      <div className={`relative overflow-hidden rounded-[14px] border border-paper/70 bg-paper/40 p-2 obj backdrop-blur-sm ${small ? "w-36" : "w-64 sm:w-72"}`}>
        <div className="pointer-events-none absolute inset-0 z-10 bg-[linear-gradient(120deg,transparent_30%,rgba(255,255,255,.55)_45%,transparent_60%)]" aria-hidden />
        <div className="overflow-hidden rounded-[10px] bg-paper">
          <div className={`bg-label text-center font-display font-extrabold text-paper ${small ? "py-1 text-xs" : "py-2 text-lg"}`}>{title}</div>
          <div className={`m-3 flex items-center justify-center rounded-md bg-sticky-b/50 ${small ? "h-14" : "h-36"}`}>
            {initials ? <span className="font-display text-xl font-extrabold text-ink">{initials}</span> : <Signature className="w-4/5" draw={draw} width={4} />}
          </div>
          {role && <p className={`px-3 pb-3 text-center font-semibold text-ink ${small ? "text-xs" : "text-sm"}`}>{role}</p>}
        </div>
      </div>
    </div>
  );
}
