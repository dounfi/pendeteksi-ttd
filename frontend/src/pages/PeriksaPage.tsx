import { useEffect, useRef, useState, type ChangeEvent, type DragEvent } from 'react';
import { gsap } from 'gsap';
import { PRESET_PAIRS, dataUriToFile } from '../data/mockData';
import { verifySignature, type Decision, type VerificationResponse } from '../lib/signaCheckClient';

type Upload = { file: File; preview: string; id: string };
type ResultTab = 'ringkasan' | 'citra' | 'forensik' | 'pengaturan';
const maxFileSize = 8 * 1024 * 1024;
const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
const featureInfo: Record<string, string> = {
  kemiringan: 'Arah umum tanda tangan pembanding dan yang diperiksa.',
  'ketebalan goresan': 'Perbedaan ketebalan garis yang tampak pada citra.',
  'goresan terputus': 'Bagian garis yang mungkin terputus akibat kualitas foto atau proses menulis.',
  proporsi: 'Perbandingan lebar dan tinggi bentuk tanda tangan.',
};

function percent(value: number): number {
  return Math.max(0, Math.min(100, value <= 1 ? value * 100 : value));
}

function verdictFor(decision: Decision): { label: string; className: string } {
  if (decision === 'asli') return { label: 'Kemungkinan asli', className: 'verdict-asli' };
  if (decision === 'palsu') return { label: 'Terindikasi palsu', className: 'verdict-palsu' };
  return { label: 'Belum bisa dipastikan', className: 'verdict-uncertain' };
}

function decisionAt(score: number, threshold: number, below: number, above: number): Decision {
  const low = threshold - Math.max(0, threshold - below);
  const high = threshold + Math.max(0, above - threshold);
  if (score >= high) return 'asli';
  if (score < low) return 'palsu';
  return 'belum_yakin';
}

function SignatureMark({ className = '' }: { className?: string }) {
  return (
    <div className={`signature-sheet ${className}`} aria-label="Ilustrasi garis tanda tangan">
      <span className="mono-label block text-[9px] text-[#14213D]/60 mb-1">LEMBAR UJI SPESIMEN</span>
      <svg viewBox="0 0 300 120" role="img" aria-label="Ilustrasi goresan tanda tangan" className="w-full h-auto block">
        <path
          d="M20 83 C34 56 43 39 53 45 C66 53 46 101 58 102 C70 104 82 50 95 55 C106 60 92 91 101 93 C112 96 124 56 137 60 C149 64 140 90 152 88 C164 86 177 48 189 52 C201 56 187 91 201 91 C214 92 229 67 244 65 C256 64 266 76 281 72 M65 109 C119 101 189 105 267 96"
          fill="none"
          stroke="#14213D"
          strokeWidth="3.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="signature-path"
        />
      </svg>
      <span className="mono-label block text-[9px] text-[#14213D]/50 mt-1">128 X 256 PIKSEL</span>
    </div>
  );
}

function CompareSlider({ before, after }: { before: string; after?: string }) {
  const [position, setPosition] = useState(50);
  if (!after) {
    return (
      <div className="file-drop" role="status">
        <p className="text-xs text-[#14213D]/70">Pratinjau hasil pengolahan belum tersedia.</p>
      </div>
    );
  }
  return (
    <div className="compare-slider" aria-label="Perbandingan sebelum dan sesudah pengolahan">
      <img src={after} alt="Tanda tangan setelah pengolahan citra" />
      <div className="compare-before" style={{ width: `${position}%` }}>
        <img src={before} alt="Tanda tangan sebelum pengolahan citra" />
      </div>
      <div className="compare-divider" style={{ left: `${position}%` }} />
      <span className="compare-label compare-label-left">Sebelum</span>
      <span className="compare-label compare-label-right">Sesudah</span>
      <input
        type="range"
        min="0"
        max="100"
        value={position}
        aria-label="Geser pembanding sebelum dan sesudah"
        onChange={(event) => setPosition(Number(event.target.value))}
      />
    </div>
  );
}

export function PeriksaPage() {
  const [references, setReferences] = useState<Upload[]>([]);
  const [query, setQuery] = useState<Upload | null>(null);
  const [result, setResult] = useState<VerificationResponse | null>(null);
  const [activeTab, setActiveTab] = useState<ResultTab>('ringkasan');
  const [threshold, setThreshold] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);
  const stampRef = useRef<HTMLSpanElement>(null);
  const queryPickerRef = useRef<HTMLInputElement>(null);
  const referencePickerRef = useRef<HTMLInputElement>(null);

  useEffect(() => () => {
    references.forEach(({ preview }) => URL.revokeObjectURL(preview));
    if (query) URL.revokeObjectURL(query.preview);
  }, [references, query]);

  useEffect(() => {
    const stamp = stampRef.current;
    if (!result || !stamp || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    gsap.fromTo(stamp, { y: -22, rotation: -12, scale: 1.12, autoAlpha: 0 }, {
      y: 0,
      rotation: -3,
      scale: 1,
      autoAlpha: 1,
      duration: 0.5,
      ease: 'elastic.out(1, 0.55)',
      clearProps: 'transform,opacity,visibility',
    });
  }, [result]);

  const validate = (file: File): string | null => {
    if (!allowedTypes.includes(file.type)) return 'Jenis berkas tidak didukung. Pilih gambar JPG, PNG, atau WEBP.';
    if (file.size > maxFileSize) return 'Berkas terlalu besar. Pilih gambar berukuran maksimal 8 MB.';
    return null;
  };

  const addReferences = (files: FileList | File[]) => {
    const incoming = Array.from(files);
    const available = 5 - references.length;
    if (available <= 0) {
      setError('Pembanding sudah berjumlah lima. Hapus salah satu sebelum menambahkan gambar.');
      return;
    }
    const valid: Upload[] = [];
    for (const file of incoming.slice(0, available)) {
      const message = validate(file);
      if (message) {
        setError(message);
        continue;
      }
      valid.push({ file, preview: URL.createObjectURL(file), id: `${Date.now()}-${Math.random()}` });
    }
    if (valid.length) {
      setReferences((current) => [...current, ...valid].slice(0, 5));
      setResult(null);
      setError('');
    }
  };

  const setQueryFile = (file?: File) => {
    if (!file) return;
    const message = validate(file);
    if (message) {
      setError(message);
      return;
    }
    setQuery({ file, preview: URL.createObjectURL(file), id: `${Date.now()}-query` });
    setResult(null);
    setError('');
  };

  const handleReferencePicker = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) addReferences(event.target.files);
    event.target.value = '';
  };
  const handleQueryPicker = (event: ChangeEvent<HTMLInputElement>) => {
    setQueryFile(event.target.files?.[0]);
    event.target.value = '';
  };
  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    const files = Array.from(event.dataTransfer.files);
    if (files.length) setQueryFile(files[0]);
  };

  const runCheck = async (refs = references, selectedQuery = query) => {
    if (!refs.length || !selectedQuery) {
      setError('Pilih setidaknya satu tanda tangan pembanding dan satu tanda tangan yang diperiksa.');
      return;
    }
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const response = await verifySignature(refs.map(({ file }) => file), selectedQuery.file);
      setResult(response);
      setThreshold(response.threshold);
      setActiveTab('ringkasan');
      window.setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Server belum terhubung. Jalankan server lokal, lalu coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const useExample = () => {
    const pair = PRESET_PAIRS[0];
    if (!pair) return;
    const ref = { file: dataUriToFile(pair.refImage, pair.refName), preview: pair.refImage, id: 'sample-ref' };
    const checked = { file: dataUriToFile(pair.queryImage, pair.queryName), preview: pair.queryImage, id: 'sample-query' };
    setReferences([ref]);
    setQuery(checked);
    setResult(null);
    setError('');
    void runCheck([ref], checked);
  };

  const removeReference = (id: string) => {
    setReferences((current) => current.filter((reference) => reference.id !== id));
    setResult(null);
  };

  const currentThreshold = threshold ?? result?.threshold ?? 0.7;
  const adjustedDecision = result
    ? (currentThreshold === result.threshold
      ? result.decision
      : decisionAt(percent(result.score) / 100, currentThreshold, result.uncertainLow, result.uncertainHigh))
    : 'belum_yakin';
  const verdict = verdictFor(adjustedDecision);
  const scorePct = result ? percent(result.score) : 0;
  const thresholdPct = percent(currentThreshold);
  const uncertainLowPct = result ? percent(currentThreshold - (result.threshold - result.uncertainLow)) : 0;
  const uncertainHighPct = result ? percent(currentThreshold + (result.uncertainHigh - result.threshold)) : 0;

  const tabs: { key: ResultTab; label: string }[] = [
    { key: 'ringkasan', label: 'Ringkasan' },
    { key: 'citra', label: 'Pengolahan citra' },
    { key: 'forensik', label: 'Laporan forensik' },
    { key: 'pengaturan', label: 'Pengaturan' },
  ];

  const processedBefore = query?.preview ?? '';
  const processedAfter = result?.processedImages[result.processedImages.length - 1]?.image;

  return (
    <>
      {/* Mobile top thin progress bar */}
      <div className="mobile-progress" aria-hidden="true"><span /></div>

      <div className="page-wrap min-h-screen relative overflow-hidden sm:overflow-visible">
        {/* Edge Props: Cropped keyboard at bottom-left & mouse at top-right (completely outside text areas) */}
        <div
          className="hidden md:block fixed bottom-4 -left-16 w-52 pointer-events-none z-0 opacity-40 select-none"
          aria-hidden="true"
        >
          <div className="keyboard-peek" style={{ transform: 'rotate(-10deg)' }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <span key={i} />
            ))}
          </div>
        </div>
        <div
          className="hidden md:block fixed top-24 -right-10 w-28 pointer-events-none z-0 opacity-40 select-none"
          aria-hidden="true"
        >
          <div className="mouse-peek" style={{ transform: 'rotate(8deg)' }} />
        </div>

        {/* ── 3) HERO: ONE COMPOSED FULL-WIDTH SCENE (560px tall on desktop) ── */}
        <section
          className="no-print relative w-full min-h-[500px] lg:h-[560px] flex items-center justify-center py-8 px-4 select-none"
          data-desk-enter
          aria-label="Meja periksa tanda tangan"
        >
          {/* Main Large Manila Folder (~62% width on desktop, rotated 1.5deg) */}
          <div
            className="folder w-full max-w-3xl lg:w-[62%] relative rotate-[1.5deg] z-10 p-6 sm:p-8"
            style={{ transform: 'rotate(1.5deg)' }}
          >
            {/* Folder Tab holding LabelStrip (offset to right of IdCard so text is never covered) */}
            <div className="folder-tab -top-9 left-20 sm:left-32 p-0 bg-transparent border-0 z-20">
              <span className="label-strip text-base sm:text-lg font-heading">
                Periksa tanda tangan
              </span>
            </div>

            {/* Washi tape strip top */}
            <div
              className="tape absolute -top-3 right-16 w-24 h-6 z-20"
              style={{ transform: 'rotate(-2deg)' }}
            />

            {/* Cream Paper sheet inside folder (Ink text on paper for high contrast) */}
            <article
              className="paper-sheet p-6 sm:p-8 pr-12 sm:pr-24 space-y-3 relative"
              style={{ transform: 'rotate(-0.8deg)' }}
            >
              {/* Translucent highlighter tabs from Inspo 2 on paper right edge */}
              <div className="hidden sm:flex flex-col gap-1.5 absolute -right-3 top-8 z-20" aria-hidden="true">
                <span className="w-7 h-3 rounded-xs bg-[#FFE566]/90 border border-[#E5B820]/40 shadow-xs" title="Ciri Bentuk" />
                <span className="w-7 h-3 rounded-xs bg-[#FFB4A2]/90 border border-[#E07A5F]/40 shadow-xs" title="Kestabilan Goresan" />
                <span className="w-7 h-3 rounded-xs bg-[#70E0FF]/90 border border-[#0096C7]/40 shadow-xs" title="Vektor Siamese" />
              </div>

              <div className="flex justify-between items-center border-b border-[#14213D]/10 pb-2">
                <span className="highlighter-pill highlighter-coral">
                  BERKAS: SC-INSP-01
                </span>
                <span className="text-[11px] text-[#14213D]/60 font-medium">
                  Verifikasi Tanda Tangan Meja Kerja
                </span>
              </div>

              <h1 className="font-heading text-2xl sm:text-3xl text-[#14213D] leading-tight max-w-md">
                Uji keaslian goresan dengan Siamese CNN
              </h1>

              <p className="text-sm sm:text-base text-[#14213D]/90 leading-relaxed max-w-md">
                Unggah satu sampai lima tanda tangan pembanding yang sudah diketahui asli, lalu masukkan tanda tangan yang diperiksa. Sistem membandingkan ciri visual goresan dan kestabilan tarikan pena secara otomatis.
              </p>

              <div className="pt-2 text-xs text-[#14213D]/70 font-medium max-w-sm">
                Bandingkan lekukan, ketebalan, dan kemiringan tarikan secara otomatis.
              </div>

              {/* Scaled prop: Yellow Sticky overlapping Paper's lower-right corner (+3deg) with Blue Pushpin */}
              <aside
                className="sticky-note sticky-yellow absolute -bottom-5 -right-3 sm:-right-8 z-30 max-w-[180px] select-none shadow-md"
                style={{ transform: 'rotate(3deg)' }}
              >
                {/* Blue Pushpin prop from Inspo 1 */}
                <div className="absolute -top-3 left-4 w-4 h-4 z-40 pointer-events-none" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" className="w-full h-full drop-shadow-sm">
                    <circle cx="12" cy="7" r="5" fill="#1F4FBF" />
                    <circle cx="12" cy="6" r="2" fill="#93C5FD" />
                    <path d="M10 11 L14 11 L12 21 Z" fill="#94A3B8" />
                  </svg>
                </div>
                <p className="font-caveat text-xl sm:text-2xl leading-tight pt-1">
                  Pakai 1 sampai 5 pembanding
                </p>
              </aside>
            </article>

            {/* Woven Blue Lanyard Strap coming down from top (Inspo 2 & Inspo 1) */}
            <div
              className="absolute -top-16 left-4 sm:left-2 w-5 h-18 bg-[#1F4FBF] border-x border-[#123698] shadow-xs z-20 pointer-events-none rounded-t-xs"
              aria-hidden="true"
            />

            {/* Scaled prop ~1.6x: IdCard overlapping folder's top-left corner (-4deg) */}
            <div
              className="id-card absolute -top-6 -left-3 sm:-left-8 z-30 w-32 sm:w-40 select-none shadow-md"
              style={{ transform: 'rotate(-4deg)' }}
              aria-label="Kartu identitas proyek SignaCheck"
            >
              <div className="id-initials w-12 h-12 text-base font-extrabold mx-auto">SC</div>
              <p className="id-card-title text-xs mt-1 font-heading font-bold">SIGNACHECK</p>
              <span className="text-[9px] block text-[#14213D]/70 mt-0.5 font-medium">Tim Peneliti</span>
            </div>

            {/* Scaled prop ~1.6x: Clipboard "Lembar uji" overlapping folder's right edge (+3deg) */}
            <div
              className="clipboard-board hidden sm:block absolute -top-6 -right-10 sm:-right-20 lg:-right-32 z-20 w-52 sm:w-60 select-none shadow-lg"
              style={{ transform: 'rotate(3deg)' }}
              aria-label="Lembar uji tanda tangan"
            >
              <div className="clipboard-clip">
                <span />
              </div>
              <div className="clipboard-content p-2">
                <SignatureMark className="drop-signature" />
              </div>
            </div>
          </div>
        </section>

        {/* ── 4) STEP STRIP ON TORNLABEL ABOVE TOOL ROW ── */}
        <section className="my-6 no-print flex justify-center px-4" aria-label="Alur pemeriksaan">
          <div
            className="torn-label p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 shadow-md max-w-full"
            style={{ transform: 'rotate(-0.5deg)' }}
          >
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="flex items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-[#1F4FBF] text-[#FFFEFA] font-heading font-extrabold text-sm flex items-center justify-center shadow-sm">
                  01
                </div>
                <span className="font-heading text-xs sm:text-sm text-[#14213D]">Unggah</span>
              </div>
              <span className="font-heading text-base text-[#14213D]/40 font-bold">→</span>

              <div className="flex items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-[#E2C07C] text-[#14213D] font-heading font-extrabold text-sm flex items-center justify-center shadow-sm border border-[#14213D]/20">
                  02
                </div>
                <span className="font-heading text-xs sm:text-sm text-[#14213D]">Periksa</span>
              </div>
              <span className="font-heading text-base text-[#14213D]/40 font-bold">→</span>

              <div className="flex items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-[#1F7A4F] text-[#FFFEFA] font-heading font-extrabold text-sm flex items-center justify-center shadow-sm">
                  03
                </div>
                <span className="font-heading text-xs sm:text-sm text-[#14213D]">Baca hasil</span>
              </div>
            </div>

            <div className="text-center sm:text-left border-t sm:border-t-0 sm:border-l border-[#14213D]/15 pt-2 sm:pt-0 sm:pl-5 space-y-0.5">
              <span className="mono-label text-[10px] block text-[#1F4FBF]">SIAPKAN GAMBAR</span>
              <p className="text-xs text-[#14213D] font-medium">Foto tegak lurus, pencahayaan merata, ukuran berkas maksimal 8 MB.</p>
            </div>
          </div>
        </section>

        {/* ── 4) TOOL ROW: TWO ASYMMETRIC PANELS WITH OVERLAP ── */}
        <section className="chapter-section page-section no-print" aria-labelledby="upload-title">
          <div className="flex flex-col lg:flex-row items-start justify-center relative mt-4">

            {/* Left Clipboard: narrower (~44% width), rotated -1.5deg */}
            <div
              className="clipboard-board w-full lg:w-[44%] relative z-10"
              style={{ transform: 'rotate(-1.5deg)' }}
              aria-labelledby="reference-title"
            >
              <div className="clipboard-clip" aria-hidden="true">
                <span />
              </div>

              <div className="clipboard-content space-y-3">
                <span className="highlighter-pill highlighter-cyan">01 / PEMBANDING</span>
                <h2 id="reference-title" className="font-heading text-lg text-[#14213D]">
                  Tanda tangan pembanding
                </h2>
                <p className="text-xs text-[#14213D]/80 leading-normal">
                  Gunakan contoh yang sudah diketahui berasal dari penanda tangan asli (maksimal 5).
                </p>

                {/* 5 Reference Slots */}
                <div className="reference-slots">
                  {references.map((reference, index) => (
                    <article
                      className="file-card"
                      key={reference.id}
                      style={{ transform: `rotate(${[-2, 1.5, -1, 2, -1.5][index]}deg)` }}
                    >
                      <span className="tape" aria-hidden="true" />
                      <img src={reference.preview} alt={`Pratinjau tanda tangan pembanding ${index + 1}`} />
                      <span className="file-number font-mono">{String(index + 1).padStart(2, '0')}</span>
                      <button
                        type="button"
                        className="remove-file"
                        aria-label={`Hapus pembanding ${index + 1}`}
                        onClick={() => removeReference(reference.id)}
                      >
                        ×
                      </button>
                    </article>
                  ))}
                  {Array.from({ length: 5 - references.length }, (_, index) => (
                    <div
                      className="empty-slot"
                      key={`empty-${index}`}
                      aria-label={`Slot pembanding ${references.length + index + 1} kosong`}
                    >
                      <span className="font-mono">{String(references.length + index + 1).padStart(2, '0')}</span>
                    </div>
                  ))}
                </div>

                <input
                  ref={referencePickerRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  hidden
                  onChange={handleReferencePicker}
                />
                <button
                  type="button"
                  className="paper-button w-full touch-target text-xs font-heading font-bold"
                  onClick={() => referencePickerRef.current?.click()}
                  disabled={references.length >= 5}
                >
                  Pilih gambar pembanding
                </button>
              </div>
            </div>

            {/* Right Paper: wider (~52% width), rotated +1.2deg, shifted down 40px, overlapping by 24px */}
            <div
              className="desk-paper query-paper w-full lg:w-[52%] lg:mt-10 lg:-ml-6 relative z-20 space-y-3"
              style={{ transform: 'rotate(1.2deg)' }}
              aria-labelledby="query-title"
            >
              {/* Two Washi Tape pieces on top corners */}
              <div
                className="tape absolute -top-3 left-6 w-20 h-5"
                style={{ transform: 'rotate(-2.5deg)' }}
                aria-hidden="true"
              />
              <div
                className="tape absolute -top-3 right-6 w-20 h-5"
                style={{ transform: 'rotate(3deg)' }}
                aria-hidden="true"
              />

              <span className="highlighter-pill highlighter-yellow">02 / YANG DIPERIKSA</span>
              <h2 id="query-title" className="font-heading text-lg text-[#14213D]">
                Tanda tangan yang diperiksa
              </h2>
              <p className="text-xs text-[#14213D]/80 leading-normal">
                Unggah spesimen yang ingin diverifikasi tingkat kemiripannya.
              </p>

              {/* Dropzone with dashed signature line */}
              <div
                className={`file-drop${dragging ? ' dragging' : ''}`}
                onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
              >
                {query ? (
                  <div className="query-preview-wrap">
                    <img src={query.preview} alt="Pratinjau tanda tangan yang diperiksa" className="query-preview" />
                    <span className="scan-light" aria-hidden="true" />
                  </div>
                ) : (
                  <div>
                    <SignatureMark className="drop-signature" />
                    <p className="text-xs text-[#14213D]/70 font-medium mt-2">
                      Letakkan gambar di sini atau gunakan tombol di bawah
                    </p>
                  </div>
                )}
              </div>

              <input
                ref={queryPickerRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                hidden
                onChange={handleQueryPicker}
              />

              {/* Buttons moved inside the right Paper so no empty space at the bottom */}
              <div className="query-buttons flex gap-2 pt-1">
                <button
                  type="button"
                  className="paper-button touch-target flex-1 text-xs font-heading font-bold"
                  onClick={() => queryPickerRef.current?.click()}
                >
                  Pilih berkas
                </button>
                <label className="paper-button touch-target camera-button text-xs font-heading font-bold cursor-pointer">
                  Kamera
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    capture="environment"
                    hidden
                    onChange={handleQueryPicker}
                  />
                </label>
              </div>
            </div>

          </div>

          {/* Error and Loading States */}
          {error && (
            <div className="error-note mt-4" role="alert">
              <strong>Perhatian:</strong> {error}
            </div>
          )}
          {loading && (
            <div className="loading-note mt-4" role="status">
              Sedang membandingkan representasi vektor tanda tangan. Tunggu sebentar.
            </div>
          )}

          {/* Action Row: 56px Primary Button + Overlapping Sticky "Pakai contoh" + Small Disclaimer Sticky */}
          <div className="action-row flex flex-wrap items-center gap-4 mt-8 pt-2">
            <div className="relative inline-flex items-center">
              <button
                type="button"
                className="desk-button h-[56px] min-h-[56px] px-8 text-base font-heading font-extrabold shadow-[0_4px_0_#123698]"
                onClick={() => void runCheck()}
                disabled={loading}
              >
                Periksa tanda tangan
              </button>

              {/* Sticky "Pakai contoh" overlapping primary button corner */}
              <button
                type="button"
                className="sticky-note sticky-yellow font-caveat text-lg px-5 py-2 -ml-3 -mt-3 z-30 cursor-pointer shadow-md hover:scale-105 transition-transform"
                onClick={useExample}
                disabled={loading}
                title="Gunakan spesimen tanda tangan contoh"
                style={{ transform: 'rotate(2.5deg)' }}
              >
                Pakai contoh
              </button>
            </div>

            {/* Small Sticky near the buttons in Caveat */}
            <aside
              className="sticky-note sticky-pink font-caveat text-base leading-tight max-w-[220px] select-none shadow-sm"
              style={{ transform: 'rotate(-2deg)' }}
            >
              Hasil ini adalah indikasi, bukan bukti hukum.
            </aside>
          </div>
        </section>

        {/* ── 3) RESULT FOLDER (OPENED FOLDER WITH TABS) ── */}
        {result && query && (
          <section
            ref={resultRef}
            className="chapter-section result-section page-section mt-12"
            aria-labelledby="result-title"
            data-desk-enter
          >
            <div className="folder result-folder">
              {/* Manila tab bar */}
              <div className="result-tabs" role="tablist" aria-label="Bagian hasil pemeriksaan">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    role="tab"
                    aria-selected={activeTab === tab.key}
                    className={`result-tab${activeTab === tab.key ? ' active' : ''}`}
                    onClick={() => setActiveTab(tab.key)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="result-content space-y-6">
                {result.isMock && <span className="mock-badge font-mono">Data contoh</span>}

                {/* ─ TAB 1: RINGKASAN ─ */}
                {activeTab === 'ringkasan' && (
                  <div className="result-grid">
                    <div className="summary-main space-y-4">
                      <div className="summary-verdict">
                        <SignatureMark />
                        <span ref={stampRef} className={`verdict-stamp ${verdict.className}`}>
                          {verdict.label}
                        </span>
                      </div>
                      <p className="result-explanation">
                        Kemiripan {Math.round(scorePct)} persen. Nilai ini {scorePct >= thresholdPct ? 'di atas' : 'di bawah'} batas {Math.round(thresholdPct)} persen, jadi tanda tangan ini {adjustedDecision === 'asli' ? 'kemungkinan asli' : adjustedDecision === 'palsu' ? 'terindikasi palsu' : 'belum bisa dipastikan'}.
                      </p>
                    </div>

                    <div className="space-y-4">
                      {/* Similarity Gauge */}
                      <div className="desk-paper score-card space-y-2">
                        <h3 className="font-heading text-sm text-[#14213D]">Kemiripan</h3>
                        <div className="gauge" role="img" aria-label={`Kemiripan ${Math.round(scorePct)} persen`}>
                          <span
                            className="gauge-range"
                            style={{ left: `${uncertainLowPct}%`, width: `${uncertainHighPct - uncertainLowPct}%` }}
                          />
                          <span
                            className="gauge-fill"
                            style={{
                              width: `${scorePct}%`,
                              background: adjustedDecision === 'asli' ? '#1F7A4F' : adjustedDecision === 'palsu' ? '#B93A2E' : '#E0A21B',
                            }}
                          />
                          <span className="gauge-mark" style={{ left: `${thresholdPct}%` }} />
                        </div>
                        <div className="gauge-labels">
                          <span>0%</span>
                          <span>Batas {Math.round(thresholdPct)}%</span>
                          <span>100%</span>
                        </div>
                        <p className="mono-label text-[10px] text-[#14213D]/60 pt-1">
                          Pita kuning menandakan zona belum pasti.
                        </p>
                      </div>

                      {/* Stability Indicator */}
                      <div className="desk-paper stability-card space-y-2">
                        <h3 className="font-heading text-sm text-[#14213D]">Indikator Kestabilan</h3>
                        <div className="shake-dots" aria-label="Indikator uji goyang">
                          {Array.from({ length: 6 }, (_, index) => (
                            <span
                              key={index}
                              className={typeof result.shakeTest === 'number' && index < Math.min(6, Math.round(result.shakeTest)) ? 'filled' : ''}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-[#14213D]/80">
                          Uji goyang mengamati kestabilan hasil saat citra mengalami perturbasi mikro, bukan menambah akurasi.
                        </p>
                        <p className="font-mono text-[11px] text-[#14213D]/70">
                          Konsistensi model: {result.consistency ?? 'TODO'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* ─ TAB 2: PENGOLAHAN CITRA ─ */}
                {activeTab === 'citra' && (
                  <div className="result-panel space-y-4">
                    <div>
                      <h3 className="font-heading text-base text-[#14213D]">Perbandingan sebelum dan sesudah</h3>
                      <p className="text-xs text-[#14213D]/80 mt-1">
                        Geser slider untuk melihat perbandingan citra sebelum dan sesudah normalisasi binerisasi Otsu.
                      </p>
                    </div>
                    <CompareSlider before={processedBefore} after={processedAfter} />
                    {result.processedImages.length > 0 ? (
                      <div className="processed-strip flex gap-3 overflow-x-auto pt-2 pb-2">
                        {result.processedImages.map((item, index) => (
                          <figure key={`${item.label}-${index}`} className="flex-shrink-0 bg-[#FFFEFA] p-2 rounded border border-[#14213D]/10 text-center">
                            <img src={item.image} alt={`Tahap pengolahan: ${item.label}`} className="h-20 w-auto object-contain mx-auto" />
                            <figcaption className="font-mono text-[10px] text-[#14213D]/70 mt-1">{item.label}</figcaption>
                          </figure>
                        ))}
                      </div>
                    ) : (
                      <p className="mono-label text-[11px] text-[#14213D]/50">
                        Pratinjau tahapan citra rinci disesuaikan dari respon server.
                      </p>
                    )}
                  </div>
                )}

                {/* ─ TAB 3: LAPORAN FORENSIK ─ */}
                {activeTab === 'forensik' && (
                  <div className="result-panel space-y-4">
                    <div>
                      <h3 className="font-heading text-base text-[#14213D]">Laporan forensik ciri visual</h3>
                      <p className="text-xs text-[#14213D]/80 mt-1">
                        Satu sticky note untuk setiap temuan ciri bentuk fisik tanda tangan:
                      </p>
                    </div>

                    <div className="report-grid">
                      {['Kemiringan', 'Ketebalan goresan', 'Goresan terputus', 'Proporsi'].map((name, index) => {
                        const item = result.forensicFeatures.find((f) => f.name.toLowerCase().includes(name.toLowerCase())) ?? result.forensicFeatures[index];
                        return (
                          <article
                            key={name}
                            className={`report-item sticky-note ${index % 2 === 0 ? 'sticky-yellow' : 'sticky-blue'}`}
                            style={{ transform: `rotate(${[-1, 1.2, -0.8, 1][index % 4]}deg)` }}
                          >
                            <h4 className="font-heading text-base text-[#14213D]">{item?.name ?? name}</h4>
                            <p className="font-caveat text-lg leading-tight mt-1">{item?.explanation ?? featureInfo[name.toLowerCase()]}</p>
                            <div className="finding-value font-mono text-[11px] mt-2 pt-1 border-t border-[#14213D]/10">
                              Pembanding: {item?.pembanding ?? 'TODO'} · Diperiksa: {item?.diperiksa ?? 'TODO'}
                            </div>
                          </article>
                        );
                      })}
                    </div>

                    <div className="desk-paper p-4 space-y-1">
                      <strong className="font-heading text-xs text-[#14213D] block">Uji goyang</strong>
                      <p className="text-xs text-[#14213D]/80">
                        Indikator kestabilan hasil saat diberi gangguan posisi dan cahaya, bukan indikator bertambahnya akurasi.
                      </p>
                    </div>
                  </div>
                )}

                {/* ─ TAB 4: PENGATURAN ─ */}
                {activeTab === 'pengaturan' && (
                  <div className="result-panel settings-panel space-y-4 max-w-md">
                    <div>
                      <h3 className="font-heading text-base text-[#14213D]">Sensitivitas pemeriksaan lokal</h3>
                      <p className="text-xs text-[#14213D]/80 mt-1">
                        Pengaturan ini mengubah batas keputusan di perambanmu tanpa menghitung ulang skor server.
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="sensitivity" className="font-heading text-xs text-[#14213D] block">
                        Ambang keputusan: {Math.round(thresholdPct)}%
                      </label>
                      <input
                        id="sensitivity"
                        className="w-full accent-[#1F4FBF] cursor-pointer"
                        type="range"
                        min="0.3"
                        max="0.95"
                        step="0.01"
                        value={currentThreshold}
                        onChange={(event) => setThreshold(Number(event.target.value))}
                      />
                      <div className="flex justify-between font-mono text-[10px] text-[#14213D]/60">
                        <span>Longgar (Toleran)</span>
                        <span>Batas {Math.round(thresholdPct)}%</span>
                        <span>Ketat (Rentan Tolak)</span>
                      </div>
                    </div>

                    <div className="pt-2">
                      <p className="text-xs text-[#14213D]/80 mb-2">
                        Status putusan terlabel saat ini: <span className={`verdict-badge ml-1 ${verdict.className}`}>{verdict.label}</span>
                      </p>
                      <button
                        type="button"
                        className="paper-button touch-target no-print font-heading font-bold text-xs"
                        onClick={() => window.print()}
                      >
                        Unduh laporan (Cetak)
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}
      </div>
    </>
  );
}
