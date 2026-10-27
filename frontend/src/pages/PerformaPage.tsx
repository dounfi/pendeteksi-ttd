import {
  PERFORMANCE_METRICS,
  CONFUSION_MATRIX,
  ROC_POINTS,
  PREPROCESSING_COMPARISON,
  ROBUSTNESS_BENCHMARK,
  CATATAN_JUJUR,
} from '../data/results';

export function PerformaPage() {
  return (
    <div className="page-wrap space-y-10">
      {/* Header */}
      <header className="page-header space-y-3" data-desk-enter>
        <span className="mono-label chapter-label">ARSIP / EVALUASI MODEL</span>
        <div>
          <span className="label-strip text-base">Performa model</span>
        </div>
        <p className="text-[#FFFEFA]/85 text-sm sm:text-base max-w-xl leading-relaxed">
          Hasil evaluasi empiris pada korpus tanda tangan terbuka. Angka yang belum selesai divalidasi ditandai TODO dan grafik tanpa data menampilkan keadaan kosong (empty state).
        </p>
      </header>

      {/* Main Clipboard Container */}
      <section
        className="clipboard-board relative"
        aria-label="Ringkasan performa model"
        data-desk-enter
        style={{ transform: 'rotate(-0.4deg)' }}
      >
        <div className="clipboard-clip" aria-hidden="true">
          <span />
        </div>

        <div className="clipboard-content space-y-8">
          <div className="flex justify-between items-center border-b border-[#14213D]/10 pb-2">
            <span className="font-mono text-xs font-bold text-[#1F4FBF]">
              LEMBAR EVALUASI EMPIRIS / TODO
            </span>
            <span className="font-mono text-xs text-[#14213D]/50">
              STATUS: DOKUMEN UJI
            </span>
          </div>

          {/* Metric Cards fed from results.ts */}
          <div>
            <h2 className="font-heading text-base text-[#14213D] mb-3">
              Metrik Kunci Verifikasi
            </h2>
            <div className="metric-grid">
              {PERFORMANCE_METRICS.map((metric) => (
                <article className="metric-card" key={metric.label}>
                  <span className="mono-label">{metric.label}</span>
                  <strong>{metric.value}</strong>
                  <p>{metric.keterangan}</p>
                </article>
              ))}
            </div>
          </div>

          {/* Charts: ROC Curve & Confusion Matrix */}
          <div className="performance-grid">
            {/* Inline SVG ROC Curve */}
            <article className="desk-paper chart-card p-5 space-y-3" style={{ transform: 'rotate(-0.6deg)' }}>
              <div className="flex justify-between items-center">
                <h3 className="font-heading text-sm text-[#14213D]">Kurva ROC</h3>
                <span className="font-mono text-[10px] text-[#14213D]/50">TPR vs FPR</span>
              </div>
              
              <div className="bg-[#FFFEFA] rounded border border-[#14213D]/10 p-3">
                <svg viewBox="0 0 300 200" className="w-full h-auto block" role="img" aria-label="Kurva ROC">
                  {/* Axes */}
                  <line x1="38" y1="15" x2="38" y2="165" stroke="#14213D" strokeWidth="1.5" />
                  <line x1="38" y1="165" x2="286" y2="165" stroke="#14213D" strokeWidth="1.5" />
                  {/* Diagonal reference line */}
                  <line x1="38" y1="165" x2="286" y2="15" stroke="#8C93A0" strokeWidth="1.2" strokeDasharray="4 4" />
                  
                  {/* Labels */}
                  <text x="162" y="188" textAnchor="middle" fill="#14213D" fontSize="10" fontFamily="JetBrains Mono">
                    False Positive Rate (FPR)
                  </text>
                  <text x="16" y="90" textAnchor="middle" fill="#14213D" fontSize="10" fontFamily="JetBrains Mono" transform="rotate(-90 16 90)">
                    True Positive Rate (TPR)
                  </text>

                  {/* If ROC points exist, draw them; otherwise show empty state */}
                  {ROC_POINTS.length > 0 ? (
                    <polyline
                      fill="none"
                      stroke="#1F4FBF"
                      strokeWidth="2.5"
                      points={ROC_POINTS.map((p) => `${38 + p.fpr * 248},${165 - p.tpr * 150}`).join(' ')}
                    />
                  ) : null}
                </svg>
              </div>

              {ROC_POINTS.length === 0 && (
                <div className="empty-chart bg-[#F7F2E6] rounded p-2.5 border border-[#14213D]/10">
                  Data titik kurva ROC belum tersedia (TODO).
                </div>
              )}
            </article>

            {/* Confusion Matrix fed from results.ts */}
            <article className="desk-paper chart-card p-5 space-y-3" style={{ transform: 'rotate(0.8deg)' }}>
              <div className="flex justify-between items-center">
                <h3 className="font-heading text-sm text-[#14213D]">Matriks Konfusi</h3>
                <span className="font-mono text-[10px] text-[#14213D]/50">2x2 KLASIFIKASI</span>
              </div>

              <div className="confusion-matrix">
                <div>
                  <span>Benar Asli (True Positive)</span>
                  <strong>{CONFUSION_MATRIX.tp}</strong>
                </div>
                <div>
                  <span>Salah Lolos (False Positive)</span>
                  <strong>{CONFUSION_MATRIX.fp}</strong>
                </div>
                <div>
                  <span>Salah Tolak (False Negative)</span>
                  <strong>{CONFUSION_MATRIX.fn}</strong>
                </div>
                <div>
                  <span>Benar Palsu (True Negative)</span>
                  <strong>{CONFUSION_MATRIX.tn}</strong>
                </div>
              </div>

              <div className="empty-chart bg-[#F7F2E6] rounded p-2.5 border border-[#14213D]/10">
                Total sampel uji: {CONFUSION_MATRIX.totalSampel}. Data konfusi menunggu kalibrasi ambang akhir.
              </div>
            </article>
          </div>

          {/* Table raw vs grayscale vs binary fed from results.ts */}
          <div className="table-scroll desk-paper p-5 space-y-3" style={{ transform: 'rotate(-0.3deg)' }}>
            <div className="tape absolute -top-3 left-8 w-20 h-5" style={{ transform: 'rotate(1deg)' }} />
            <div className="flex justify-between items-center">
              <h3 className="font-heading text-sm text-[#14213D]">
                Perbandingan Tahap Prapemrosesan Citra
              </h3>
              <span className="font-mono text-[10px] text-[#14213D]/50">3 METODE</span>
            </div>
            <div className="overflow-x-auto">
              <table>
                <thead>
                  <tr>
                    <th>Metode Masukan</th>
                    <th>Akurasi Uji</th>
                    <th>EER</th>
                    <th>Catatan Forensik</th>
                  </tr>
                </thead>
                <tbody>
                  {PREPROCESSING_COMPARISON.map((row) => (
                    <tr key={row.metode}>
                      <th scope="row" className="font-normal font-sans text-xs">
                        {row.metode}
                      </th>
                      <td>{row.akurasi}</td>
                      <td>{row.eer}</td>
                      <td className="text-xs text-[#14213D]/70">{row.catatan}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Robustness chart fed from results.ts */}
          <article className="desk-paper p-5 space-y-3" style={{ transform: 'rotate(0.5deg)' }}>
            <div className="flex justify-between items-center">
              <h3 className="font-heading text-sm text-[#14213D]">
                Tolok Ukur Ketahanan Foto Ponsel
              </h3>
              <span className="font-mono text-[10px] text-[#14213D]/50">UJI ROBUSTNESS</span>
            </div>
            <div className="space-y-2.5">
              {ROBUSTNESS_BENCHMARK.map((r, i) => (
                <div key={i} className="bg-[#FFFEFA] p-3 rounded border border-[#14213D]/10 text-xs space-y-1">
                  <div className="flex justify-between items-center font-heading">
                    <span className="text-[#14213D]">{r.kondisi}</span>
                    <span className="font-mono text-[#1F4FBF]">
                      Dengan Olah: {r.denganOlah} | Tanpa Olah: {r.tanpaOlah}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#14213D]/70">{r.keterangan}</p>
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>

      {/* Sticky note: Catatan jujur */}
      <aside
        className="sticky-note sticky-yellow max-w-md mx-auto"
        style={{ transform: 'rotate(-1.5deg)' }}
      >
        <strong className="block font-body font-bold text-sm mb-1 text-[#14213D]">
          Catatan jujur
        </strong>
        <p className="font-caveat text-lg leading-snug">
          {CATATAN_JUJUR}
        </p>
      </aside>
    </div>
  );
}
