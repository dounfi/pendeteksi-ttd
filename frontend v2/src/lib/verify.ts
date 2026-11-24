/**
 * Contract with the SIDIKTA backend (FastAPI, POST /api/verify, GET /api/model-info).
 * The frontend only *displays* what the backend sends: every field is optional and the UI hides
 * any element whose data is missing.
 */

export type VerifyStatus = "Asli" | "Belum Yakin" | "Palsu";
export type FindingTone = "asli" | "palsu" | "netral";

export interface Finding {
  text: string;
  tone: FindingTone;
}

export interface VerifyResult {
  status?: VerifyStatus;
  /** `similarity_pct` (0–100). */
  percentage?: number;
  /** `status_reasons`, joined. */
  explanation?: string;
  distance?: number;
  /** Display scale for the distance bar, anchored on the backend `threshold` and `ragu_margin`. */
  scale?: { min: number; max: number; asliMax?: number; raguMax?: number };
  /** `steps.ref.final` / `steps.qry.final`. */
  processed?: { reference?: string; query?: string };
  /** `explain_map` — heatmap (data URI PNG) sorotan area pembeda. */
  explainMap?: string;
  /** `forensic_report` rows. */
  findings?: Finding[];
  /** `forensic_summary`. */
  findingsSummary?: { mirip: number; agakBeda: number; beda: number; total: number };
  /** `shake_test.status`. */
  shakeStatus?: string;
  /** `warnings`. */
  warnings?: string[];
}

const API_BASE: string = (
  (import.meta.env["VITE_API_BASE"] as string | undefined) ?? "http://127.0.0.1:8000"
).replace(/\/$/, "");

export const VERIFY_URL = `${API_BASE}/api/verify`;
export const MODEL_INFO_URL = `${API_BASE}/api/model-info`;
export const MAX_REFERENCES = 5;

type Json = Record<string, unknown>;
const isObj = (v: unknown): v is Json => typeof v === "object" && v !== null && !Array.isArray(v);
const num = (v: unknown): number | undefined =>
  typeof v === "number" && Number.isFinite(v) ? v : undefined;
const str = (v: unknown): string | undefined =>
  typeof v === "string" && v.trim() !== "" ? v : undefined;
const pick = (o: Json, ...keys: string[]) => {
  for (const k of keys) if (o[k] !== undefined && o[k] !== null) return o[k];
  return undefined;
};

export const fmtNum = (n: number) => n.toLocaleString("id-ID", { maximumFractionDigits: 4 });

export function normalizeStatus(v: unknown): VerifyStatus | undefined {
  if (typeof v !== "string") return undefined;
  const s = v.trim().toLowerCase().replace(/[_-]/g, " ");
  if (s === "asli") return "Asli";
  if (s === "palsu") return "Palsu";
  if (s === "belum yakin" || s === "ragu ragu" || s === "ragu") return "Belum Yakin";
  return undefined;
}

function toneOf(tingkat: unknown): FindingTone {
  const s = typeof tingkat === "string" ? tingkat.toLowerCase().replace(/[_-]/g, " ") : "";
  if (s === "mirip") return "asli";
  if (s === "beda") return "palsu";
  return "netral";
}

const TINGKAT_LABEL: Record<string, string> = { mirip: "mirip", agak_beda: "agak berbeda", beda: "berbeda" };

function findingText(row: Json): string | undefined {
  const ciri = str(row["ciri"]);
  if (!ciri) return undefined;
  const t = str(row["tingkat"]);
  const parts: string[] = [];
  const sel = num(row["selisih"]);
  const bat = num(row["batas"]);
  if (sel !== undefined) parts.push(`perbedaan ${fmtNum(sel)}`);
  if (bat !== undefined) parts.push(`batas wajar ${fmtNum(bat)}`);
  const label = t ? (TINGKAT_LABEL[t] ?? t.replace(/_/g, " ")) : undefined;
  return `${ciri}${label ? `: ${label}` : ""}${parts.length ? ` (${parts.join("; ")})` : ""}`;
}

function stepImage(steps: unknown, side: "ref" | "qry"): string | undefined {
  if (!isObj(steps)) return undefined;
  const s = steps[side];
  if (!isObj(s)) return undefined;
  return str(pick(s, "final", "hasil"));
}

export function parseVerifyResponse(raw: unknown): VerifyResult {
  if (!isObj(raw)) return {};
  const out: VerifyResult = {};

  const status = normalizeStatus(pick(raw, "status", "decision"));
  if (status) out.status = status;

  const pct = num(raw["similarity_pct"]);
  if (pct !== undefined) out.percentage = pct;

  const reasons = raw["status_reasons"];
  if (Array.isArray(reasons)) {
    const text = reasons.filter((r): r is string => typeof r === "string" && r.trim() !== "");
    if (text.length) out.explanation = text.join(" ");
  }

  const dist = num(raw["distance"]);
  if (dist !== undefined) out.distance = dist;

  const thr = num(raw["threshold"]);
  if (thr !== undefined && thr > 0) {
    const margin = num(raw["ragu_margin"]);
    const scale: NonNullable<VerifyResult["scale"]> = { min: 0, max: thr * 2 };
    if (margin !== undefined && margin > 0 && margin < thr) {
      scale.asliMax = thr - margin;
      scale.raguMax = thr + margin;
    } else {
      scale.asliMax = thr;
      scale.raguMax = thr;
    }
    out.scale = scale;
  }

  const reference = stepImage(raw["steps"], "ref");
  const query = stepImage(raw["steps"], "qry");
  if (reference || query) {
    out.processed = {};
    if (reference) out.processed.reference = reference;
    if (query) out.processed.query = query;
  }

  const explainMap = str(raw["explain_map"]);
  if (explainMap) out.explainMap = explainMap;

  const report = raw["forensic_report"];
  if (Array.isArray(report)) {
    const findings: Finding[] = [];
    for (const row of report) {
      if (!isObj(row)) continue;
      const text = findingText(row);
      if (text) findings.push({ text, tone: toneOf(row["tingkat"]) });
    }
    if (findings.length) out.findings = findings;
  }

  const sum = raw["forensic_summary"];
  if (isObj(sum)) {
    const total = num(sum["total"]);
    if (total !== undefined && total > 0) {
      out.findingsSummary = {
        mirip: num(sum["mirip"]) ?? 0,
        agakBeda: num(sum["agak_beda"]) ?? 0,
        beda: num(sum["beda"]) ?? 0,
        total,
      };
    }
  }

  const shake = raw["shake_test"];
  if (isObj(shake)) {
    const s = str(shake["status"]);
    if (s) out.shakeStatus = s;
  }

  const warnings = raw["warnings"];
  if (Array.isArray(warnings)) {
    const w = warnings.filter((x): x is string => typeof x === "string" && x.trim() !== "");
    if (w.length) out.warnings = w;
  }

  return out;
}

/** Flattens GET /api/model-info into label/value rows (one level of nesting). */
export function parseModelInfo(raw: unknown): { label: string; value: string }[] {
  if (!isObj(raw)) return [];
  const rows: { label: string; value: string }[] = [];
  const add = (label: string, v: unknown) => {
    if (typeof v === "number") rows.push({ label, value: fmtNum(v) });
    else if (typeof v === "string" && v.trim()) rows.push({ label, value: v });
    else if (typeof v === "boolean") rows.push({ label, value: v ? "Ya" : "Tidak" });
    else if (Array.isArray(v) && v.every((x) => ["string", "number"].includes(typeof x)) && v.length)
      rows.push({ label, value: v.map((x) => (typeof x === "number" ? fmtNum(x) : x)).join(", ") });
  };
  for (const [k, v] of Object.entries(raw)) {
    const label = k.replace(/_/g, " ");
    if (isObj(v)) for (const [k2, v2] of Object.entries(v)) add(`${label} · ${k2.replace(/_/g, " ")}`, v2);
    else add(label, v);
  }
  return rows;
}

export const STAMP_LABEL: Record<VerifyStatus, string> = {
  Asli: "KEMUNGKINAN ASLI",
  Palsu: "KEMUNGKINAN PALSU",
  "Belum Yakin": "BELUM YAKIN",
};

/** Marker position along the bar as a 0–100 percentage, or undefined when the scale is missing. */
export function markerPosition(r: Pick<VerifyResult, "distance" | "scale">): number | undefined {
  if (r.distance === undefined || !r.scale) return undefined;
  const { min, max } = r.scale;
  const p = ((r.distance - min) / (max - min)) * 100;
  return Math.min(100, Math.max(0, p));
}

const OFFLINE =
  "Sistem pemeriksaan belum dapat dihubungi. Periksa koneksi internet Anda, lalu coba lagi beberapa saat lagi.";

export async function verifySignatures(references: File[], query: File): Promise<VerifyResult> {
  const body = new FormData();
  body.append("qry_image", query);
  references.forEach((f) => body.append("ref_images", f));
  let res: Response;
  try {
    res = await fetch(VERIFY_URL, { method: "POST", body });
  } catch {
    throw new Error(OFFLINE);
  }
  let json: unknown = null;
  try {
    json = await res.json();
  } catch {
    json = null;
  }
  if (!res.ok) {
    const detail = isObj(json) ? pick(json, "detail", "error", "message") : undefined;
    throw new Error(typeof detail === "string" && detail.trim() ? detail : OFFLINE);
  }
  if (json === null) throw new Error("Hasil pemeriksaan tidak dapat ditampilkan. Silakan coba lagi.");
  return parseVerifyResponse(json);
}

export async function fetchModelInfo(): Promise<{ label: string; value: string }[]> {
  try {
    const res = await fetch(MODEL_INFO_URL);
    if (!res.ok) return [];
    return parseModelInfo(await res.json());
  } catch {
    return [];
  }
}
