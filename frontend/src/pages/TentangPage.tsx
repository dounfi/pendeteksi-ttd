import {
  TEAM_MEMBERS,
  DATASETS,
  ACADEMIC_REFERENCES,
  PRIVACY_NOTE,
} from '../data/references';

const LIMITATIONS = [
  'Variasi alami pada tarikan garis pemilik sah dapat mendekati batas toleransi ambang keputusan.',
  'Foto yang buram, tertutup bayangan tebal, atau diambil pada kertas bermotif dapat mengacaukan pemisahan kontur tinta.',
  'Hasil sistem merupakan indikasi berbasis pemrosesan citra dan tidak dapat menggantikan peran ahli forensik grafologi.',
];

export function TentangPage() {
  return (
    <div className="page-wrap space-y-10">
      {/* Page Header */}
      <header className="page-header space-y-3" data-desk-enter>
        <span className="mono-label chapter-label">ARSIP / LATAR DAN METODOLOGI</span>
        <div>
          <span className="label-strip text-base">Tentang SignaCheck</span>
        </div>
        <p className="text-[#FFFEFA]/85 text-sm sm:text-base max-w-xl leading-relaxed">
          Dokumentasi teknis proyek verifikasi keaslian tanda tangan digital untuk mata kuliah Visual Komputer Cerdas dan Pemrosesan Citra.
        </p>
      </header>

      {/* Manila Folder: Background and Method */}
      <section
        className="folder relative"
        data-desk-enter
        style={{ transform: 'rotate(-0.5deg)' }}
      >
        <span className="folder-tab">latar belakang</span>

        <article className="desk-paper p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-[#14213D]/10 pb-2">
            <h2 className="font-heading text-lg text-[#14213D]">
              Latar Belakang dan Rumusan Masalah
            </h2>
            <span className="font-mono text-xs text-[#14213D]/50">METODE PENELITIAN</span>
          </div>

          <p className="text-sm text-[#14213D]/85 leading-relaxed">
            Pemalsuan tanda tangan pada dokumen cetak konvensional tetap menjadi tantangan keamanan autentikasi dokumen offline. Sistem SignaCheck dibangun untuk menguji seberapa andal arsitektur Siamese CNN dalam membedakan variasi alami tanda tangan asli dari pemalsuan terampil (skilled forgery).
          </p>

          {/* Method Flow Pipeline */}
          <div className="bg-[#FFFEFA] p-4 rounded border border-[#14213D]/10 space-y-2">
            <span className="font-mono text-xs font-bold text-[#1F4FBF]">
              PIPELINE VERIFIKASI LENGKAP:
            </span>
            <div className="flex flex-wrap items-center gap-2 text-xs font-heading">
              <span className="bg-[#2B58B5]/10 text-[#2B58B5] px-2.5 py-1 rounded">1. Citra Masukan</span>
              <span className="text-[#14213D]/40">→</span>
              <span className="bg-[#2B58B5]/10 text-[#2B58B5] px-2.5 py-1 rounded">2. Binerisasi Otsu</span>
              <span className="text-[#14213D]/40">→</span>
              <span className="bg-[#2B58B5]/10 text-[#2B58B5] px-2.5 py-1 rounded">3. Crop & Kanvas 128x256</span>
              <span className="text-[#14213D]/40">→</span>
              <span className="bg-[#1F4FBF] text-white px-2.5 py-1 rounded">4. Siamese CNN Kembar</span>
              <span className="text-[#14213D]/40">→</span>
              <span className="bg-[#E2C07C] text-[#14213D] px-2.5 py-1 rounded">5. Jarak Euclidean</span>
              <span className="text-[#14213D]/40">→</span>
              <span className="bg-[#1F7A4F] text-white px-2.5 py-1 rounded">6. Laporan Indikasi</span>
            </div>
          </div>
        </article>
      </section>

      {/* Team Section: ID Cards fed from references.ts */}
      <section className="space-y-4" data-desk-enter>
        <div className="section-heading">
          <span className="mono-label chapter-label">TIM PENELITI / DOKUMEN ID</span>
          <h2 className="text-[#FFFEFA] text-xl sm:text-2xl font-heading mt-1">
            Tim pengembang
          </h2>
        </div>

        <div className="about-cards">
          {TEAM_MEMBERS.map((member, idx) => (
            <article
              className="about-id w-52"
              key={idx}
              style={{ transform: `rotate(${[-1.5, 1.2, -0.8][idx % 3]}deg)` }}
            >
              <span className="mono-label">SIGNACHECK / LAB</span>
              <div className="about-initials">{member.initials}</div>
              <h3 className="font-heading text-base text-[#14213D]">{member.nama}</h3>
              <p className="text-xs text-[#14213D]/70 font-medium mt-0.5">{member.peran}</p>
              <div className="mt-3 pt-2 border-t border-[#14213D]/10">
                <span className="font-mono text-[11px] text-[#1F4FBF] font-bold">
                  NIM: {member.nim}
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Datasets Section: TornLabels fed from references.ts */}
      <section
        className="desk-paper p-6 space-y-4"
        data-desk-enter
        style={{ transform: 'rotate(0.4deg)' }}
      >
        <div className="tape absolute -top-3 left-10 w-20 h-5" style={{ transform: 'rotate(-1deg)' }} />
        <div className="flex justify-between items-center border-b border-[#14213D]/10 pb-2">
          <span className="font-heading text-sm text-[#14213D]">Sumber Dataset Tolok Ukur</span>
          <span className="font-mono text-xs text-[#14213D]/50">KORPUS TERBUKA</span>
        </div>

        <div className="dataset-labels">
          {DATASETS.map((ds) => (
            <div key={ds.id} className="torn-label">
              <span className="font-mono text-xs block text-[#14213D]/60">{ds.id}</span>
              <span className="text-sm font-bold text-[#1F4FBF]">{ds.nama}</span>
              <span className="text-xs block text-[#14213D]/70 font-normal font-sans mt-0.5">
                {ds.deskripsi} (Tautan: {ds.url})
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Limitations & Privacy Note */}
      <section className="space-y-4" data-desk-enter>
        <div className="section-heading">
          <span className="mono-label chapter-label">BATASAN & ETIKA</span>
          <h2 className="text-[#FFFEFA] text-xl sm:text-2xl font-heading mt-1">
            Batasan teknis dan privasi data
          </h2>
        </div>

        <div className="limitations-grid">
          {LIMITATIONS.map((lim, i) => (
            <article
              key={i}
              className={`sticky-note ${i % 2 === 0 ? 'sticky-yellow' : 'sticky-pink'}`}
              style={{ transform: `rotate(${[-1.2, 1.5, -0.6][i % 3]}deg)` }}
            >
              <strong className="block font-body font-bold text-sm mb-1 text-[#14213D]">
                Batasan #{i + 1}
              </strong>
              <p className="font-caveat text-lg leading-snug">{lim}</p>
            </article>
          ))}

          {/* Privacy Note from references.ts */}
          <article
            className="sticky-note sticky-blue"
            style={{ transform: 'rotate(1.1deg)' }}
          >
            <strong className="block font-body font-bold text-sm mb-1 text-[#14213D]">
              Kebijakan Privasi
            </strong>
            <p className="font-caveat text-lg leading-snug">{PRIVACY_NOTE}</p>
          </article>
        </div>
      </section>

      {/* References Section: Academic citations from references.ts */}
      <section
        className="desk-paper p-6 space-y-4"
        data-desk-enter
        style={{ transform: 'rotate(-0.5deg)' }}
      >
        <div className="tape absolute -top-3 right-12 w-20 h-5" style={{ transform: 'rotate(2deg)' }} />
        <div className="flex justify-between items-center border-b border-[#14213D]/10 pb-2">
          <h2 className="font-heading text-sm text-[#14213D]">Pustaka Ilmiah dan Rujukan</h2>
          <span className="font-mono text-xs text-[#14213D]/50">REFERENSI</span>
        </div>

        <ol className="reference-list space-y-3">
          {ACADEMIC_REFERENCES.map((ref) => (
            <li key={ref.no} className="border-l-2 border-[#1F4FBF] pl-3 py-1">
              <strong className="font-heading text-sm text-[#14213D]">{ref.judul}</strong>
              <span className="font-mono text-xs text-[#14213D]/70">{ref.penulis} ({ref.tahun})</span>
              <span className="text-xs text-[#14213D]/60 italic">{ref.publikasi}</span>
            </li>
          ))}
        </ol>
      </section>

      <p className="about-disclaimer">
        Hasil ini adalah indikasi, bukan bukti hukum.
      </p>
    </div>
  );
}
