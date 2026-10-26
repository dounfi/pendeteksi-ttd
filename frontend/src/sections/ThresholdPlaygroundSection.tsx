import React, { useState } from 'react';

export default function ThresholdPlaygroundSection() {
  // Slider nilai batas keputusan (0.2 sampai 0.8)
  const [sliderVal, setSliderVal] = useState(0.48);

  // Estimasi dinamis ilustrasi kurva
  const frrPercent = Math.max(2, Math.min(60, Math.round(Math.pow((0.8 - sliderVal) / 0.6, 2) * 55)));
  const farPercent = Math.max(1, Math.min(55, Math.round(Math.pow((sliderVal - 0.2) / 0.6, 2) * 50)));

  return (
    <section className="py-16 px-4 max-w-5xl mx-auto border-t-2 border-dashed border-ink/20">
      <div className="text-center mb-10">
        <span className="sticker-label bg-mustard text-ink -rotate-1 mb-2 text-xs">
          CARA KERJA 03 // DILEMA PAGAR RUMAH
        </span>
        <h2 className="font-bricolage text-3xl sm:text-5xl font-black text-ink mb-3">
          Pagar rumah vs satpam galak: di mana naruh garis batas?
        </h2>
        <p className="font-instrument text-ink-muted text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          Gak ada pagar yang 100% sempurna di dunia ini. Kalau satpamnya super galak (angka kekecilan), kamunya sendiri yang ditolak masuk pas pulang malem. Tapi kalau terlalu longgar, penyusup pun disapa ramah! Geser slider-nya buat ngerasain dilemanya:
        </p>
      </div>

      <div className="bg-paper-card border-2 border-ink shadow-scrapbook p-6 sm:p-8 max-w-3xl mx-auto relative mb-6">
        <div className="washi-tape washi-tape-yellow"></div>

        {/* Header Bar Slider */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b-2 border-dashed border-ink/20 pb-3 gap-2">
          <span className="sticker-label bg-paper-dark text-ink-muted text-xs">
            🎨 Simulasi Interaktif
          </span>
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-bold text-ink">
              Posisi Garis Batas: <span className="text-bata font-black text-lg">{sliderVal.toFixed(2)}</span>
            </span>
            <button
              onClick={() => setSliderVal(0.48)}
              className="text-xs font-bricolage font-bold text-kobalt underline hover:text-bata transition-colors"
            >
              Reset ke 0.48
            </button>
          </div>
        </div>

        {/* Visualisasi Kurva Distribusi SVG */}
        <div className="relative h-44 bg-paper border-2 border-ink/30 rounded p-2 mb-6 select-none overflow-hidden">
          <svg className="w-full h-full" viewBox="0 0 400 120" preserveAspectRatio="none">
            {/* Sumbu X */}
            <line x1="20" y1="105" x2="380" y2="105" stroke="#2B2118" strokeWidth="2" />
            
            {/* Kurva Pasangan Asli (Hijau di kiri) */}
            <path
              d="M 20 105 Q 110 5 190 105"
              fill="rgba(45, 106, 79, 0.28)"
              stroke="#2D6A4F"
              strokeWidth="2.5"
            />
            {/* Kurva Pasangan Tiruan (Merah di kanan) */}
            <path
              d="M 170 105 Q 260 5 370 105"
              fill="rgba(200, 75, 49, 0.28)"
              stroke="#C84B31"
              strokeWidth="2.5"
            />

            {/* Garis Batas Bergerak sesuai Slider */}
            {(() => {
              const xPos = 20 + ((sliderVal - 0.2) / 0.6) * 360;
              return (
                <g>
                  <line
                    x1={xPos}
                    y1={10}
                    x2={xPos}
                    y2={105}
                    stroke="#2B2118"
                    strokeWidth="3"
                    strokeDasharray="4 3"
                  />
                  <circle cx={xPos} cy={12} r={5} fill="#C84B31" stroke="#2B2118" strokeWidth="1.5" />
                </g>
              );
            })()}
          </svg>

          {/* Legenda Kurva */}
          <div className="absolute top-3 left-4 flex gap-4 text-xs font-mono font-bold">
            <span className="flex items-center gap-1.5 text-daun">
              <span className="w-2.5 h-2.5 rounded-full bg-daun"></span> Pasangan Asli (Jarak Kecil)
            </span>
            <span className="flex items-center gap-1.5 text-bata">
              <span className="w-2.5 h-2.5 rounded-full bg-bata"></span> Pasangan Palsu (Jarak Lebar)
            </span>
          </div>

          <div className="absolute bottom-1 right-3 text-[10px] font-mono text-ink-muted">
            0.2 (Ketat) ───────────── 0.8 (Longgar)
          </div>
        </div>

        {/* Slider Input */}
        <div className="mb-6">
          <input
            type="range"
            min="0.2"
            max="0.8"
            step="0.01"
            value={sliderVal}
            onChange={(e) => setSliderVal(parseFloat(e.target.value))}
            className="w-full accent-bata h-3 bg-paper border-2 border-ink rounded-lg cursor-pointer"
          />
        </div>

        {/* Dua Kartu Dampak Dinamis */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Sisi Kiri: Tanda Tangan Asli Ditolak */}
          <div className="bg-mustard-light p-4 border-2 border-ink shadow-scrapbook-sm">
            <div className="flex justify-between items-center mb-1">
              <span className="font-bricolage text-sm font-bold text-ink">
                Asli Ditolak (FRR)
              </span>
              <span className="font-mono text-lg font-black text-mustard-dark">
                {frrPercent}%
              </span>
            </div>
            <p className="font-instrument text-xs text-ink-muted leading-relaxed">
              {sliderVal < 0.4
                ? "⚠️ Terlalu galak! Kamu yang punya tanda tangan asli bakal sering dibikin kesel karena dibilang palsu."
                : "Aman dan terkendali. Pemilik asli gak gampang salah ditolak."}
            </p>
          </div>

          {/* Sisi Kanan: Tanda Tangan Palsu Lolos */}
          <div className="bg-bata-light p-4 border-2 border-ink shadow-scrapbook-sm">
            <div className="flex justify-between items-center mb-1">
              <span className="font-bricolage text-sm font-bold text-ink">
                Palsu Lolos (FAR)
              </span>
              <span className="font-mono text-lg font-black text-bata">
                {farPercent}%
              </span>
            </div>
            <p className="font-instrument text-xs text-ink-muted leading-relaxed">
              {sliderVal > 0.55
                ? "🚨 Bahaya! Pagarnya terlalu longgar, peniru yang iseng bisa melenggang santai tanpa dicurigai."
                : "Ketat! Sangat sedikit tanda tangan palsu yang bisa lolos."}
            </p>
          </div>
        </div>

        {/* Kesimpulan Kenapa 0.4811 */}
        <div className="mt-6 pt-4 border-t-2 border-dashed border-ink/20 text-center">
          <div className="inline-block bg-daun-light border-2 border-daun/40 px-4 py-2 rounded-sm text-left sm:text-center">
            <p className="font-instrument text-xs sm:text-sm text-daun-dark font-medium">
              🎯 <b>Kenapa kami mengunci di angka 0.4811?</b> Ini adalah titik <i>Equal Error Rate</i> (EER), di mana tingkat salah tolak dan salah lolos saling menyeimbangkan di angka paling minim!
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
