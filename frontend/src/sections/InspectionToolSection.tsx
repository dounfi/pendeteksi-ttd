import React, { useState, useRef } from 'react';
import { verify, VerifyResult } from '../lib/api';
import { PRESET_PAIRS, dataUriToFile } from '../data/mockData';

export default function InspectionToolSection() {
  // Slot 1: Referensi (Boleh 1 sampai 5 gambar)
  const [refFiles, setRefFiles] = useState<File[]>([]);
  const [refPreviews, setRefPreviews] = useState<string[]>([]);
  const [refTab, setRefTab] = useState<'upload' | 'draw' | 'camera'>('upload');

  // Slot 2: Yang diperiksa (1 gambar)
  const [queryFile, setQueryFile] = useState<File | null>(null);
  const [queryPreview, setQueryPreview] = useState<string | null>(null);
  const [queryTab, setQueryTab] = useState<'upload' | 'draw' | 'camera'>('upload');

  // State Eksekusi & Hasil
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<VerifyResult | null>(null);

  // Canvas Refs
  const refCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const queryCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawingRef, setIsDrawingRef] = useState(false);
  const [isDrawingQuery, setIsDrawingQuery] = useState(false);

  // Ambil contoh siap pakai
  const handleSelectPreset = (pairId: string) => {
    const pair = PRESET_PAIRS.find(p => p.id === pairId);
    if (!pair) return;

    const fRef = dataUriToFile(pair.refImage, pair.refName);
    const fQuery = dataUriToFile(pair.queryImage, pair.queryName);

    setRefFiles([fRef]);
    setRefPreviews([pair.refImage]);
    setQueryFile(fQuery);
    setQueryPreview(pair.queryImage);
    setErrorMessage(null);
    setResult(null);

    // Otomatis jalankan verifikasi
    jalankanPemeriksaan([fRef], fQuery);
  };

  // Upload berkas Referensi
  const handleUploadRef = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newFiles: File[] = [];
    const newPreviews: string[] = [];

    // Maksimal 5 gambar pembanding
    for (let i = 0; i < files.length && refFiles.length + newFiles.length < 5; i++) {
      const f = files[i];
      if (f.size > 8 * 1024 * 1024) {
        setErrorMessage("Waduh, ukuran fotonya kegedean (maks 8 MB ya!).");
        return;
      }
      newFiles.push(f);
      newPreviews.push(URL.createObjectURL(f));
    }

    setRefFiles(prev => [...prev, ...newFiles].slice(0, 5));
    setRefPreviews(prev => [...prev, ...newPreviews].slice(0, 5));
    setErrorMessage(null);
  };

  // Upload berkas Yang Diperiksa
  const handleUploadQuery = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;

    if (f.size > 8 * 1024 * 1024) {
      setErrorMessage("Ukuran fotonya kegedean (maks 8 MB ya!).");
      return;
    }

    setQueryFile(f);
    setQueryPreview(URL.createObjectURL(f));
    setErrorMessage(null);
  };

  // Canvas drawing functions
  const startDraw = (e: React.MouseEvent<HTMLCanvasElement>, target: 'ref' | 'query') => {
    const canvas = target === 'ref' ? refCanvasRef.current : queryCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = '#2B2118';
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (target === 'ref') setIsDrawingRef(true);
    else setIsDrawingQuery(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>, target: 'ref' | 'query') => {
    const isDrawing = target === 'ref' ? isDrawingRef : isDrawingQuery;
    if (!isDrawing) return;
    const canvas = target === 'ref' ? refCanvasRef.current : queryCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDraw = (target: 'ref' | 'query') => {
    if (target === 'ref') setIsDrawingRef(false);
    else setIsDrawingQuery(false);

    const canvas = target === 'ref' ? refCanvasRef.current : queryCanvasRef.current;
    if (!canvas) return;
    const dataUri = canvas.toDataURL('image/png');
    const f = dataUriToFile(dataUri, `tanda_tangan_${target}.png`);

    if (target === 'ref') {
      setRefFiles([f]);
      setRefPreviews([dataUri]);
    } else {
      setQueryFile(f);
      setQueryPreview(dataUri);
    }
  };

  const clearCanvas = (target: 'ref' | 'query') => {
    const canvas = target === 'ref' ? refCanvasRef.current : queryCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#FFFDF9';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (target === 'ref') {
      setRefFiles([]);
      setRefPreviews([]);
    } else {
      setQueryFile(null);
      setQueryPreview(null);
    }
  };

  // Jalankan pemeriksaan
  const jalankanPemeriksaan = async (refs = refFiles, query = queryFile) => {
    if (!refs || refs.length === 0) {
      setErrorMessage("Eits, kertas kirinya masih kosong! Masukin minimal 1 contoh asli ya.");
      return;
    }
    if (!query) {
      setErrorMessage("Kertas kanannya belum ada! Masukin tanda tangan yang mau kamu periksa.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await verify(refs, query);
      setResult(res);
      // Gulir lembut ke area hasil
      setTimeout(() => {
        const el = document.getElementById('hasil-pemeriksaan');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (err: any) {
      setErrorMessage(err.message || "Aduh, ada gangguan teknis saat memeriksa tanda tangan. Coba pastikan fotonya jelas ya!");
    } finally {
      setIsLoading(false);
    }
  };

  const resetPemeriksaan = () => {
    setResult(null);
    setRefFiles([]);
    setRefPreviews([]);
    setQueryFile(null);
    setQueryPreview(null);
    setErrorMessage(null);
  };

  const hapusRefSingle = (idx: number) => {
    setRefFiles(prev => prev.filter((_, i) => i !== idx));
    setRefPreviews(prev => prev.filter((_, i) => i !== idx));
  };

  return (
    <section id="alat-periksa" className="py-20 px-4 max-w-5xl mx-auto border-t-2 border-dashed border-ink/20">
      {/* Header Alat */}
      <div className="text-center mb-10">
        <span className="sticker-label bg-bata text-paper-card -rotate-1 mb-2 text-xs">
          LABORATORIUM DETEKTIF // MEJA UJI COBA
        </span>
        <h2 className="font-bricolage text-3xl sm:text-5xl font-black text-ink mb-3">
          Meja Uji: Giliran kamu jadi detektif! 🕵️‍♂️
        </h2>
        <p className="font-instrument text-ink-muted text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          Mau buktiin sendiri? Taruh tanda tangan asli di Kertas Kiri, lalu taruh tanda tangan yang dicurigai di Kertas Kanan. Mau upload foto, jepret pake kamera HP, atau coret langsung di layar? Bebas!
        </p>
      </div>

      {/* Baris Tombol Contoh Siap Pakai (Gaya Menu Makanan Arcade) */}
      <div className="mb-10 text-center bg-paper-card p-5 border-2 border-ink shadow-scrapbook rounded-lg max-w-3xl mx-auto relative">
        <div className="washi-tape washi-tape-yellow"></div>
        <span className="font-bricolage text-sm text-ink uppercase tracking-wider block mb-3 font-bold">
          ⚡ Belum ada foto di HP? Coba klik menu contoh siap uji ini:
        </span>
        <div className="flex flex-wrap justify-center gap-3">
          {PRESET_PAIRS.map((pair) => (
            <button
              key={pair.id}
              onClick={() => handleSelectPreset(pair.id)}
              className="bg-paper hover:bg-mustard-light text-ink font-bricolage font-extrabold text-xs sm:text-sm px-4 py-2.5 border-2 border-ink shadow-scrapbook-sm hover:shadow-scrapbook active:translate-x-0.5 active:translate-y-0.5 transition-all rounded-full"
            >
              {pair.labelTombol}
            </button>
          ))}
        </div>
      </div>

      {/* Kotak Error Ramah */}
      {errorMessage && (
        <div className="bg-bata-light border-2 border-bata text-ink p-4 mb-8 shadow-scrapbook-sm max-w-2xl mx-auto rounded">
          <p className="font-instrument font-bold text-sm text-bata">
            ⚠️ {errorMessage}
          </p>
          <span className="text-xs text-ink-muted block mt-1 font-instrument">
            Tips santai: Pastikan formatnya JPG, PNG, atau WEBP dan coretannya keliatan jelas ya.
          </span>
        </div>
      )}

      {/* Meja Kerja: 2 Kertas Berdampingan */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        {/* KERTAS KIRI: Referensi Asli */}
        <div className="bg-paper-card border-2 border-ink shadow-scrapbook p-5 relative -rotate-1 hover:rotate-0 transition-transform">
          <div className="washi-tape washi-tape-yellow"></div>
          
          <div className="flex justify-between items-center mb-4 border-b-2 border-dashed border-ink/20 pb-3">
            <div>
              <span className="text-xs font-mono font-bold uppercase text-ink-muted block">Kertas Kiri</span>
              <h3 className="font-bricolage text-xl font-black text-ink">
                Contoh Asli Tersimpan
              </h3>
            </div>
            <span className="text-xs font-mono font-bold text-daun bg-daun-light px-2.5 py-1 border border-daun/40 rounded-full">
              {refFiles.length} / 5 Foto
            </span>
          </div>

          <p className="font-instrument text-xs text-ink-muted mb-4">
            *Boleh upload 1 sampai 5 foto asli sekaligus biar komputer makin kenal gayamu!
          </p>

          {/* Tab Input Pilihan */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setRefTab('upload')}
              className={`text-xs font-bricolage font-bold px-3.5 py-2 border-2 border-ink shadow-scrapbook-sm rounded-md transition-all ${
                refTab === 'upload' ? 'bg-ink text-paper-card' : 'bg-paper text-ink hover:bg-paper-dark'
              }`}
            >
              📂 Upload File
            </button>
            <button
              onClick={() => {
                setRefTab('draw');
                setTimeout(() => clearCanvas('ref'), 50);
              }}
              className={`text-xs font-bricolage font-bold px-3.5 py-2 border-2 border-ink shadow-scrapbook-sm rounded-md transition-all ${
                refTab === 'draw' ? 'bg-ink text-paper-card' : 'bg-paper text-ink hover:bg-paper-dark'
              }`}
            >
              ✏️ Coret di Layar
            </button>
            <label className="text-xs font-bricolage font-bold px-3.5 py-2 border-2 border-ink shadow-scrapbook-sm rounded-md bg-paper text-ink cursor-pointer hover:bg-paper-dark transition-all">
              📸 Jepret Kamera
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleUploadRef}
              />
            </label>
          </div>

          {/* Area Tampilan / Input Kertas Kiri */}
          <div className="bg-paper border-2 border-dashed border-ink/30 min-h-[190px] flex flex-col items-center justify-center p-3 relative rounded-sm overflow-hidden">
            {refTab === 'upload' ? (
              refPreviews.length > 0 ? (
                <div className="w-full">
                  <div className="flex flex-wrap gap-2 justify-center mb-3">
                    {refPreviews.map((prev, idx) => (
                      <div key={idx} className="relative group bg-paper-card border border-ink/40 p-1 rounded shadow-xs">
                        <img src={prev} alt={`Ref ${idx + 1}`} className="h-16 w-24 object-contain" />
                        <button
                          type="button"
                          onClick={() => hapusRefSingle(idx)}
                          className="absolute -top-2 -right-2 bg-bata text-paper-card rounded-full w-5 h-5 text-xs font-bold flex items-center justify-center border border-ink shadow"
                          title="Hapus foto ini"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>

                  {refPreviews.length < 5 && (
                    <label className="text-xs font-bricolage font-bold text-kobalt underline block text-center cursor-pointer mt-2">
                      + Tambah contoh asli lagi (maks 5)
                      <input type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={handleUploadRef} />
                    </label>
                  )}
                </div>
              ) : (
                <label className="cursor-pointer text-center p-4">
                  <span className="text-2xl block mb-1">📁</span>
                  <span className="font-bricolage font-bold text-sm text-ink block mb-0.5">
                    Klik buat pilih foto tanda tangan asli
                  </span>
                  <span className="text-xs text-ink-muted font-instrument">
                    Boleh 1-5 foto (JPG, PNG, atau WEBP)
                  </span>
                  <input type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={handleUploadRef} />
                </label>
              )
            ) : (
              <div className="w-full flex flex-col items-center">
                <canvas
                  ref={refCanvasRef}
                  width={340}
                  height={140}
                  className="bg-paper-card border-2 border-ink/40 cursor-crosshair touch-none rounded"
                  onMouseDown={(e) => startDraw(e, 'ref')}
                  onMouseMove={(e) => draw(e, 'ref')}
                  onMouseUp={() => stopDraw('ref')}
                  onMouseLeave={() => stopDraw('ref')}
                />
                <button
                  type="button"
                  onClick={() => clearCanvas('ref')}
                  className="mt-2 text-xs font-mono font-bold text-bata underline"
                >
                  Bersihkan Goresan
                </button>
              </div>
            )}
          </div>
        </div>

        {/* KERTAS KANAN: Tanda Tangan yang Diuji */}
        <div className="bg-paper-card border-2 border-ink shadow-scrapbook p-5 relative rotate-1 hover:rotate-0 transition-transform">
          <div className="washi-tape washi-tape-blue"></div>

          <div className="flex justify-between items-center mb-4 border-b-2 border-dashed border-ink/20 pb-3">
            <div>
              <span className="text-xs font-mono font-bold uppercase text-ink-muted block">Kertas Kanan</span>
              <h3 className="font-bricolage text-xl font-black text-ink">
                Tanda Tangan yang Diuji
              </h3>
            </div>
            <span className="text-xs font-mono font-bold text-bata bg-bata-light px-2.5 py-1 border border-bata/40 rounded-full">
              1 Foto Uji
            </span>
          </div>

          <p className="font-instrument text-xs text-ink-muted mb-4">
            *Tanda tangan yang dicurigai atau mau kamu buktikan keasliannya
          </p>

          {/* Tab Input Pilihan */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setQueryTab('upload')}
              className={`text-xs font-bricolage font-bold px-3.5 py-2 border-2 border-ink shadow-scrapbook-sm rounded-md transition-all ${
                queryTab === 'upload' ? 'bg-ink text-paper-card' : 'bg-paper text-ink hover:bg-paper-dark'
              }`}
            >
              📂 Upload File
            </button>
            <button
              onClick={() => {
                setQueryTab('draw');
                setTimeout(() => clearCanvas('query'), 50);
              }}
              className={`text-xs font-bricolage font-bold px-3.5 py-2 border-2 border-ink shadow-scrapbook-sm rounded-md transition-all ${
                queryTab === 'draw' ? 'bg-ink text-paper-card' : 'bg-paper text-ink hover:bg-paper-dark'
              }`}
            >
              ✏️ Coret di Layar
            </button>
            <label className="text-xs font-bricolage font-bold px-3.5 py-2 border-2 border-ink shadow-scrapbook-sm rounded-md bg-paper text-ink cursor-pointer hover:bg-paper-dark transition-all">
              📸 Jepret Kamera
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleUploadQuery}
              />
            </label>
          </div>

          {/* Area Tampilan / Input Kertas Kanan */}
          <div className="bg-paper border-2 border-dashed border-ink/30 min-h-[190px] flex flex-col items-center justify-center p-3 relative rounded-sm overflow-hidden">
            {queryTab === 'upload' ? (
              queryPreview ? (
                <div className="w-full text-center">
                  <img src={queryPreview} alt="Tanda tangan uji" className="max-h-32 object-contain mx-auto mb-2" />
                  <label className="text-xs font-bricolage font-bold text-kobalt underline block text-center cursor-pointer">
                    Ganti foto tanda tangan uji
                    <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleUploadQuery} />
                  </label>
                </div>
              ) : (
                <label className="cursor-pointer text-center p-4">
                  <span className="text-2xl block mb-1">🔍</span>
                  <span className="font-bricolage font-bold text-sm text-ink block mb-0.5">
                    Pilih foto tanda tangan yang dicurigai
                  </span>
                  <span className="text-xs text-ink-muted font-instrument">
                    1 berkas (JPG, PNG, atau WEBP)
                  </span>
                  <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleUploadQuery} />
                </label>
              )
            ) : (
              <div className="w-full flex flex-col items-center">
                <canvas
                  ref={queryCanvasRef}
                  width={340}
                  height={140}
                  className="bg-paper-card border-2 border-ink/40 cursor-crosshair touch-none rounded"
                  onMouseDown={(e) => startDraw(e, 'query')}
                  onMouseMove={(e) => draw(e, 'query')}
                  onMouseUp={() => stopDraw('query')}
                  onMouseLeave={() => stopDraw('query')}
                />
                <button
                  type="button"
                  onClick={() => clearCanvas('query')}
                  className="mt-2 text-xs font-mono font-bold text-bata underline"
                >
                  Bersihkan Goresan
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tombol Eksekusi Besar Playful */}
      <div className="text-center mb-16">
        <button
          onClick={() => jalankanPemeriksaan()}
          disabled={isLoading || refFiles.length === 0 || !queryFile}
          className="bg-ink hover:bg-ink-muted disabled:opacity-40 disabled:cursor-not-allowed text-paper-card font-bricolage font-black text-xl px-10 py-4 border-3 border-ink shadow-scrapbook-lg active:translate-x-1 active:translate-y-1 transition-all rounded-full inline-flex items-center gap-3"
        >
          <span>{isLoading ? "Detektif sedang membedah lekukan..." : "Bongkar Status Keasliannya! 🔎"}</span>
        </button>
      </div>

      {/* HASIL PEMERIKSAAN (HASIL DETEKTIF) */}
      {result && (
        <div id="hasil-pemeriksaan" className="pt-4">
          <div className="bg-paper-card border-3 border-ink shadow-scrapbook-xl p-6 sm:p-10 relative mb-12 rounded-lg">
            <div className="washi-tape washi-tape-yellow"></div>

            {/* Label Mock jika server lokal offline */}
            {result.isMock && (
              <div className="flex justify-end mb-4">
                <span className="sticker-label bg-mustard-light text-ink text-xs">
                  Mode Simulasi Cepat (Server Offline)
                </span>
              </div>
            )}

            {/* Cap Stempel Raksasa Hasil */}
            <div className="text-center mb-8">
              <div
                className={`stamp-box text-3xl sm:text-5xl py-4 px-8 inline-block shadow-scrapbook ${
                  result.verdict === 'asli'
                    ? 'stamp-asli'
                    : result.verdict === 'palsu'
                    ? 'stamp-palsu'
                    : 'stamp-ragu'
                }`}
              >
                <span>
                  {result.verdict === 'asli' ? 'ASLI BANGET! 🎉' : result.verdict === 'palsu' ? 'JIPLAKAN NIH! 🚨' : 'AGAK RAGU-RAGU 🤔'}
                </span>
              </div>

              {/* Skor Kemiripan */}
              <div className="mt-5">
                <span className="font-bricolage text-2xl sm:text-3xl font-black text-ink">
                  Tingkat Kemiripan: {result.similarity}%
                </span>
                <span className="block text-xs text-ink-muted mt-1 font-instrument">
                  *dihitung murni dari jarak matematis titik koordinat 64 dimensi, bukan ramalan tebak-tebakan!
                </span>
              </div>
            </div>

            {/* Gauge Jarak terhadap Batas */}
            <div className="bg-paper p-5 border-2 border-ink shadow-scrapbook-sm mb-10 max-w-2xl mx-auto rounded">
              <div className="flex justify-between items-center mb-2">
                <span className="font-mono text-xs font-bold uppercase text-ink">
                  Jarak Model: <b className="text-bata text-sm">{result.distance.toFixed(4)}</b>
                </span>
                <span className="font-mono text-xs text-ink-muted">
                  Batas Pagar: <b>{result.threshold.toFixed(4)}</b>
                </span>
              </div>

              {/* Bar Gauge */}
              <div className="h-7 w-full rounded border-2 border-ink flex overflow-hidden relative">
                <div className="w-[45%] bg-daun/40 flex items-center justify-center text-[10px] font-mono font-bold text-daun-dark border-r border-ink">
                  Zona Sahabat (Asli)
                </div>
                <div className="w-[15%] bg-mustard/50 flex items-center justify-center text-[10px] font-mono font-bold text-mustard-dark border-r border-ink">
                  Ragu
                </div>
                <div className="w-[40%] bg-bata/40 flex items-center justify-center text-[10px] font-mono font-bold text-bata-dark">
                  Zona Peniru (Palsu)
                </div>

                {/* Penanda Posisi Hasil */}
                <div
                  className="absolute top-0 bottom-0 w-2.5 bg-ink border border-paper-card shadow"
                  style={{ left: `${Math.min(97, Math.max(3, (result.distance / 1.0) * 100))}%` }}
                ></div>
              </div>

              <div className="flex justify-between text-[10px] font-mono text-ink-muted mt-2">
                <span>0.0 (Dempet / Kembar)</span>
                <span>{result.threshold.toFixed(2)} (Ambang Batas)</span>
                <span>1.0 (Beda Alam Semesta)</span>
              </div>
            </div>

            {/* Strip 5 Tahap Pengolahan Citra Real */}
            {result.steps && result.steps.length > 0 && (
              <div className="mb-10">
                <div className="flex items-center justify-between mb-3 border-b-2 border-ink/20 pb-2">
                  <h4 className="font-bricolage text-lg font-bold text-ink">
                    🧼 Dapur Cuci Muka (Citra yang Diperiksa)
                  </h4>
                  <span className="text-xs font-mono text-ink-muted font-bold">5 Langkah Selesai</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {result.steps.map((st, i) => (
                    <div key={i} className="bg-paper p-2 border-2 border-ink shadow-scrapbook-sm text-center rounded">
                      <span className="text-[10px] font-mono block mb-1 text-ink-muted font-bold truncate">
                        {st.nama}
                      </span>
                      <img src={st.gambar} alt={st.nama} className="h-16 w-full object-contain bg-paper-card border border-ink/20 rounded" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Penjelasan Pendamping (8 Ciri Fisik Tanda Tangan) */}
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 border-b-2 border-ink/20 pb-2 gap-1">
                <h4 className="font-bricolage text-lg font-bold text-ink">
                  🔍 8 Ciri Fisik yang Ditelusuri Detektif
                </h4>
                <span className="text-xs text-ink-muted font-instrument">
                  *dihitung dari analisis morfologi citra klasik
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {result.forensics.map((f, i) => (
                  <div key={i} className="bg-paper p-3 border-2 border-ink shadow-scrapbook-sm flex justify-between items-center rounded">
                    <div>
                      <span className="font-bricolage text-sm font-bold text-ink block">{f.label}</span>
                      <span className="text-xs text-ink-muted font-mono">
                        Asli: {f.pembanding} | Uji: {f.diperiksa}
                      </span>
                    </div>
                    <span
                      className={`text-xs font-mono font-bold px-2 py-0.5 border rounded ${
                        f.tingkat === 'mirip'
                          ? 'bg-daun-light text-daun border-daun/40'
                          : f.tingkat === 'agak beda'
                          ? 'bg-mustard-light text-mustard-dark border-mustard/40'
                          : 'bg-bata-light text-bata border-bata/40'
                      }`}
                    >
                      {f.tingkat === 'mirip' ? '✓ Cocok' : f.tingkat === 'agak beda' ? '~ Sedikit Beda' : '✗ Beda Jauh'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Kartu Uji Goyang & Keputusan Gabungan */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 pt-2">
              <div className="bg-paper p-4 border-2 border-ink rounded shadow-scrapbook-sm">
                <span className="text-xs font-mono font-bold text-ink-muted uppercase block mb-1">
                  Uji Goyang (Stabilitas Posisi)
                </span>
                <p className="font-instrument text-sm text-ink leading-relaxed">
                  {result.confidence && result.confidence.z >= 1.74
                    ? "✨ Hasil sangat stabil! Mau kertasnya dimiringin atau digoyang dikit, keputusannya tetap konsisten."
                    : "⚠️ Hasilnya agak mepet di perbatasan garis. Disarankan nambah 1 contoh tanda tangan asli lagi ya biar lebih yakin!"}
                </p>
              </div>

              <div className="bg-paper p-4 border-2 border-ink rounded shadow-scrapbook-sm">
                <span className="text-xs font-mono font-bold text-ink-muted uppercase block mb-1">
                  Cross-Check Ciri Klasik
                </span>
                <p className="font-instrument text-sm text-ink leading-relaxed">
                  {result.fusion
                    ? `Analisis kombinasi ciri klasik menyatakan goresan ini cenderung ${result.fusion.condongPalsu ? 'TIRUAN' : 'ASLI'}.`
                    : "Semua karakteristik bentuk fisik selaras dengan kesimpulan model deep learning."}
                </p>
              </div>
            </div>

            {/* Tombol Periksa Pasangan Lain */}
            <div className="text-center pt-2">
              <button
                onClick={resetPemeriksaan}
                className="bg-paper hover:bg-mustard-light text-ink font-bricolage font-black text-base px-8 py-3 border-2 border-ink shadow-scrapbook active:translate-x-0.5 active:translate-y-0.5 transition-all rounded-full"
              >
                ← Coba periksa pasangan tanda tangan lain
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
