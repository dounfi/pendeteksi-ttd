import React, { useState, useRef } from 'react';
import { 
  Upload, 
  PenTool, 
  Camera, 
  Trash2, 
  Scan, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ShieldCheck, 
  AlertOctagon, 
  RotateCcw, 
  Layers, 
  Activity, 
  Cpu, 
  Sparkles,
  Sliders,
  FileCheck,
  Search,
  ArrowRight,
  ChevronRight
} from 'lucide-react';
import { verify, VerifyResult } from '../lib/api';
import { PRESET_PAIRS, dataUriToFile } from '../data/mockData';

export default function InspectionToolSection() {
  // Slot 1: Referensi (1 sampai 5 gambar)
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

    for (let i = 0; i < files.length && refFiles.length + newFiles.length < 5; i++) {
      const f = files[i];
      if (f.size > 8 * 1024 * 1024) {
        setErrorMessage("Ukuran berkas melebihi batas maksimal 8 MB.");
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
      setErrorMessage("Ukuran berkas melebihi batas maksimal 8 MB.");
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
    ctx.strokeStyle = '#0F172A';
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
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (target === 'ref') {
      setRefFiles([]);
      setRefPreviews([]);
    } else {
      setQueryFile(null);
      setQueryPreview(null);
    }
  };

  // Jalankan verifikasi
  const jalankanPemeriksaan = async (refs = refFiles, query = queryFile) => {
    if (!refs || refs.length === 0) {
      setErrorMessage("Silakan sediakan minimal 1 sampel tanda tangan referensi asli.");
      return;
    }
    if (!query) {
      setErrorMessage("Silakan sediakan sampel tanda tangan uji yang ingin diperiksa.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await verify(refs, query);
      setResult(res);
      setTimeout(() => {
        const el = document.getElementById('hasil-pemeriksaan');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (err: any) {
      setErrorMessage(err.message || "Terjadi kesalahan saat memproses inferensi model.");
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
    <section id="alat-periksa" className="py-16 md:py-24 px-4 max-w-6xl mx-auto">
      {/* Section Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-mono mb-3">
          <Scan className="w-3.5 h-3.5 text-cyan-400" />
          <span>INTERACTIVE INFERENCE SUITE</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
          Meja Uji Verifikasi Tanda Tangan
        </h2>
        <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          Unggah atau gambar tanda tangan referensi dan tanda tangan uji untuk mengevaluasi jarak embedding Siamese CNN dan analisis forensik fisik.
        </p>
      </div>

      {/* Preset Quick Select Bar */}
      <div className="mb-10 glass-panel p-5 rounded-2xl max-w-3xl mx-auto border border-slate-800">
        <div className="flex items-center justify-between mb-3 text-xs">
          <span className="font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            Preset Sampel Uji Cepat
          </span>
          <span className="text-[11px] text-slate-500 font-mono">1-Klik Eksekusi</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {PRESET_PAIRS.map((pair) => (
            <button
              key={pair.id}
              onClick={() => handleSelectPreset(pair.id)}
              className="px-4 py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-cyan-300 border border-slate-700/80 hover:border-cyan-500/50 text-xs font-medium transition-all flex items-center justify-between group cursor-pointer"
            >
              <span className="truncate">{pair.labelTombol}</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all shrink-0 ml-1" />
            </button>
          ))}
        </div>
      </div>

      {/* Error Message Pill */}
      {errorMessage && (
        <div className="mb-8 max-w-2xl mx-auto p-4 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-200 flex items-start gap-3 backdrop-blur-md">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="text-xs">
            <p className="font-semibold">{errorMessage}</p>
            <p className="text-rose-300/80 mt-1">Pastikan berkas citra berformat PNG, JPG, atau WEBP dengan kontras goresan tinta yang jelas.</p>
          </div>
        </div>
      )}

      {/* Dual Testing Workbenches */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {/* SLOT 1: REFERENSI ASLI */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 relative">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <div>
              <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider block">SLOT REFERENSI</span>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-cyan-400" />
                Sampel Tanda Tangan Asli
              </h3>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono">
              {refFiles.length} / 5 Terpilih
            </span>
          </div>

          {/* Mode Tabs */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setRefTab('upload')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                refTab === 'upload'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              Unggah Berkas
            </button>
            <button
              onClick={() => {
                setRefTab('draw');
                setTimeout(() => clearCanvas('ref'), 50);
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                refTab === 'draw'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <PenTool className="w-3.5 h-3.5" />
              Kanvas Digital
            </button>
            <label className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800 cursor-pointer transition-all">
              <Camera className="w-3.5 h-3.5" />
              Ambil Foto
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleUploadRef}
              />
            </label>
          </div>

          {/* Viewport Area */}
          <div className="bg-slate-950/80 rounded-xl border border-dashed border-slate-800 min-h-[220px] flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {refTab === 'upload' ? (
              refPreviews.length > 0 ? (
                <div className="w-full">
                  <div className="flex flex-wrap gap-2.5 justify-center mb-3">
                    {refPreviews.map((prev, idx) => (
                      <div key={idx} className="relative group bg-slate-900 rounded-lg border border-slate-700/80 p-1.5 shadow-sm">
                        <img src={prev} alt={`Ref ${idx + 1}`} className="h-16 w-24 object-contain invert brightness-90 filter" />
                        <button
                          type="button"
                          onClick={() => hapusRefSingle(idx)}
                          className="absolute -top-2 -right-2 bg-rose-600 hover:bg-rose-500 text-white rounded-full w-5 h-5 text-xs font-bold flex items-center justify-center shadow transition-all cursor-pointer"
                          title="Hapus gambar ini"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>

                  {refPreviews.length < 5 && (
                    <label className="text-xs text-cyan-400 hover:text-cyan-300 block text-center cursor-pointer font-medium mt-2">
                      + Tambah sampel referensi lagi (maksimal 5)
                      <input type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={handleUploadRef} />
                    </label>
                  )}
                </div>
              ) : (
                <label className="cursor-pointer text-center p-6 w-full flex flex-col items-center">
                  <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 mb-3 group-hover:border-cyan-500/50">
                    <Upload className="w-6 h-6 text-cyan-400" />
                  </div>
                  <span className="text-sm font-semibold text-slate-200 block mb-1">
                    Klik untuk memilih tanda tangan asli
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    Format PNG, JPG, WEBP (Bisa 1-5 file)
                  </span>
                  <input type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={handleUploadRef} />
                </label>
              )
            ) : (
              <div className="w-full flex flex-col items-center">
                <canvas
                  ref={refCanvasRef}
                  width={360}
                  height={150}
                  className="bg-white rounded-lg border border-slate-700 cursor-crosshair touch-none shadow-inner"
                  onMouseDown={(e) => startDraw(e, 'ref')}
                  onMouseMove={(e) => draw(e, 'ref')}
                  onMouseUp={() => stopDraw('ref')}
                  onMouseLeave={() => stopDraw('ref')}
                />
                <button
                  type="button"
                  onClick={() => clearCanvas('ref')}
                  className="mt-3 text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Bersihkan Goresan Kanvas
                </button>
              </div>
            )}
          </div>
        </div>

        {/* SLOT 2: YANG DIPERIKSA */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 relative">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <div>
              <span className="text-[11px] font-mono text-indigo-400 uppercase tracking-wider block">SLOT UJI</span>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Search className="w-4 h-4 text-indigo-400" />
                Tanda Tangan yang Diuji
              </h3>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-mono">
              1 Sampel Uji
            </span>
          </div>

          {/* Mode Tabs */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setQueryTab('upload')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                queryTab === 'upload'
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              Unggah Berkas
            </button>
            <button
              onClick={() => {
                setQueryTab('draw');
                setTimeout(() => clearCanvas('query'), 50);
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                queryTab === 'draw'
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <PenTool className="w-3.5 h-3.5" />
              Kanvas Digital
            </button>
            <label className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800 cursor-pointer transition-all">
              <Camera className="w-3.5 h-3.5" />
              Ambil Foto
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleUploadQuery}
              />
            </label>
          </div>

          {/* Viewport Area */}
          <div className="bg-slate-950/80 rounded-xl border border-dashed border-slate-800 min-h-[220px] flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {queryTab === 'upload' ? (
              queryPreview ? (
                <div className="w-full text-center">
                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-700/80 max-w-xs mx-auto mb-3">
                    <img src={queryPreview} alt="Tanda tangan uji" className="max-h-28 object-contain mx-auto invert brightness-90 filter" />
                  </div>
                  <label className="text-xs text-indigo-400 hover:text-indigo-300 cursor-pointer font-medium">
                    Ganti sampel tanda tangan uji
                    <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleUploadQuery} />
                  </label>
                </div>
              ) : (
                <label className="cursor-pointer text-center p-6 w-full flex flex-col items-center">
                  <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 mb-3">
                    <Scan className="w-6 h-6 text-indigo-400" />
                  </div>
                  <span className="text-sm font-semibold text-slate-200 block mb-1">
                    Pilih tanda tangan yang ingin diverifikasi
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    Format PNG, JPG, WEBP (1 berkas)
                  </span>
                  <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleUploadQuery} />
                </label>
              )
            ) : (
              <div className="w-full flex flex-col items-center">
                <canvas
                  ref={queryCanvasRef}
                  width={360}
                  height={150}
                  className="bg-white rounded-lg border border-slate-700 cursor-crosshair touch-none shadow-inner"
                  onMouseDown={(e) => startDraw(e, 'query')}
                  onMouseMove={(e) => draw(e, 'query')}
                  onMouseUp={() => stopDraw('query')}
                  onMouseLeave={() => stopDraw('query')}
                />
                <button
                  type="button"
                  onClick={() => clearCanvas('query')}
                  className="mt-3 text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Bersihkan Goresan Kanvas
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Execution CTA Button */}
      <div className="text-center mb-16">
        <button
          onClick={() => jalankanPemeriksaan()}
          disabled={isLoading || refFiles.length === 0 || !queryFile}
          className="group relative px-9 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-base shadow-glow-cyan transition-all duration-200 inline-flex items-center gap-3 cursor-pointer active:scale-95"
        >
          {isLoading ? (
            <>
              <Activity className="w-5 h-5 animate-spin text-white" />
              <span>Memproses Inferensi Neural Network...</span>
            </>
          ) : (
            <>
              <Scan className="w-5 h-5 text-cyan-200 group-hover:scale-110 transition-transform" />
              <span>Jalankan Verifikasi Siamese CNN</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </div>

      {/* HASIL PEMERIKSAAN VERIFIKASI */}
      {result && (
        <div id="hasil-pemeriksaan" className="pt-6">
          <div className="glass-panel p-6 sm:p-10 rounded-3xl border border-slate-800 shadow-card mb-12 relative overflow-hidden">
            {/* Top Ambient Light Indicator */}
            <div
              className={`absolute top-0 left-0 right-0 h-1.5 ${
                result.verdict === 'asli'
                  ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600'
                  : result.verdict === 'palsu'
                  ? 'bg-gradient-to-r from-rose-500 via-red-400 to-rose-600'
                  : 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600'
              }`}
            ></div>

            {/* Verdict Header Badge */}
            <div className="flex flex-col items-center text-center mb-8">
              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${
                  result.verdict === 'asli'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-glow-emerald'
                    : result.verdict === 'palsu'
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-glow-rose'
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                }`}
              >
                {result.verdict === 'asli' ? (
                  <ShieldCheck className="w-9 h-9" />
                ) : result.verdict === 'palsu' ? (
                  <AlertOctagon className="w-9 h-9" />
                ) : (
                  <AlertTriangle className="w-9 h-9" />
                )}
              </div>

              <span className="text-xs font-mono uppercase tracking-widest text-slate-400 mb-1">
                HASIL ANALISIS MODEL SIAMESE CNN
              </span>

              <h3
                className={`text-3xl sm:text-4xl font-extrabold tracking-tight mb-2 ${
                  result.verdict === 'asli'
                    ? 'text-emerald-400'
                    : result.verdict === 'palsu'
                    ? 'text-rose-400'
                    : 'text-amber-400'
                }`}
              >
                {result.verdict === 'asli'
                  ? 'TERVERIFIKASI ASLI (GENUINE)'
                  : result.verdict === 'palsu'
                  ? 'TERINDIKASI PALSU (FORGERY)'
                  : 'STATUS MERAGUKAN (UNCERTAIN)'}
              </h3>

              <p className="text-slate-400 text-sm max-w-lg">
                {result.verdict === 'asli'
                  ? 'Jarak embedding berada di dalam ambang toleransi variasi alami penanda tangan asli.'
                  : result.verdict === 'palsu'
                  ? 'Jarak embedding melebihi batas keputusan. Karakteristik lekukan dan proporsi menunjukkan pemalsuan.'
                  : 'Jarak embedding sangat dekat dengan garis batas keputusan. Disarankan verifikasi fisik tambahan.'}
              </p>

              {/* Similarity Score Metric */}
              <div className="mt-4 flex items-center gap-3">
                <span className="text-xs font-mono text-slate-400">Tingkat Kemiripan:</span>
                <span className="text-2xl font-mono font-bold text-white">{result.similarity}%</span>
              </div>
            </div>

            {/* Distance Vector Gauge vs Threshold */}
            <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 max-w-2xl mx-auto mb-10">
              <div className="flex justify-between items-center mb-2.5 text-xs font-mono">
                <span className="text-slate-300">
                  Jarak Euclidean: <b className="text-cyan-400 text-sm">{result.distance.toFixed(4)}</b>
                </span>
                <span className="text-slate-400">
                  Threshold: <b className="text-white">{result.threshold.toFixed(4)}</b>
                </span>
              </div>

              {/* Progress Track */}
              <div className="h-6 w-full rounded-lg bg-slate-950 border border-slate-800 flex overflow-hidden relative">
                <div className="w-[48%] bg-emerald-500/20 flex items-center justify-center text-[10px] font-mono text-emerald-400 border-r border-slate-800">
                  Zona Asli (&lt; 0.48)
                </div>
                <div className="w-[12%] bg-amber-500/20 flex items-center justify-center text-[10px] font-mono text-amber-400 border-r border-slate-800">
                  Ragu
                </div>
                <div className="w-[40%] bg-rose-500/20 flex items-center justify-center text-[10px] font-mono text-rose-400">
                  Zona Palsu (&gt; 0.48)
                </div>

                {/* Marker */}
                <div
                  className="absolute top-0 bottom-0 w-2 bg-white rounded shadow-glow-cyan"
                  style={{ left: `${Math.min(97, Math.max(3, (result.distance / 1.0) * 100))}%` }}
                ></div>
              </div>

              <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-2">
                <span>0.0 (Identik)</span>
                <span>Ambang Batas ({result.threshold.toFixed(2)})</span>
                <span>1.0 (Deviasi Maksimal)</span>
              </div>
            </div>

            {/* Preprocessing Steps Real Inspection */}
            {result.steps && result.steps.length > 0 && (
              <div className="mb-10">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-cyan-400" />
                    Tahapan Preprocessing Citra Uji
                  </h4>
                  <span className="text-xs font-mono text-slate-500">5 Transformasi Selesai</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {result.steps.map((st, i) => (
                    <div key={i} className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-center">
                      <span className="text-[11px] font-mono text-slate-400 block mb-2 truncate">
                        {st.nama}
                      </span>
                      <div className="bg-slate-950 p-1.5 rounded-lg border border-slate-800/80 h-20 flex items-center justify-center">
                        <img src={st.gambar} alt={st.nama} className="max-h-full max-w-full object-contain" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Forensic Classic Features Grid */}
            <div className="mb-10">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-indigo-400" />
                  Analisis 8 Parameter Forensik Goresan Pena
                </h4>
                <span className="text-xs font-mono text-slate-500">Morfologi Citra Klasik</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {result.forensics.map((f, i) => (
                  <div key={i} className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 flex justify-between items-center">
                    <div>
                      <span className="text-xs font-semibold text-slate-200 block">{f.label}</span>
                      <span className="text-[11px] font-mono text-slate-400">
                        Ref: {f.pembanding} vs Uji: {f.diperiksa}
                      </span>
                    </div>
                    <span
                      className={`text-xs font-mono px-2.5 py-1 rounded-full border ${
                        f.tingkat === 'mirip'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : f.tingkat === 'agak beda'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                      }`}
                    >
                      {f.tingkat === 'mirip' ? 'Cocok' : f.tingkat === 'agak beda' ? 'Deviasi Kecil' : 'Deviasi Signifikan'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Shake Stability & Fusion Score Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider block mb-1">
                  Uji Stabilitas Goyang (Shake Invariance)
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {result.confidence && result.confidence.z >= 1.74
                    ? "Invarian dan stabil terhadap rotasi kecil dan translasi spasial. Tingkat keyakinan tinggi."
                    : "Skor berada dekat zona kritis. Disarankan menambah 1 sampel referensi untuk memastikan stabilitas inferensi."}
                </p>
              </div>

              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                <span className="text-[11px] font-mono text-indigo-400 uppercase tracking-wider block mb-1">
                  Cross-Validation Fusi Morfologis
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {result.fusion
                    ? `Kombinasi parameter fisik morfologi mengindikasikan goresan ${result.fusion.condongPalsu ? 'TIRUAN' : 'ASLI'}.`
                    : "Analisis statistik bentuk dan kerapatan selaras dengan inferensi embedding neural network."}
                </p>
              </div>
            </div>

            {/* Reset Button */}
            <div className="text-center">
              <button
                onClick={resetPemeriksaan}
                className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold inline-flex items-center gap-2 cursor-pointer transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                <span>Uji Sampel Lain</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
