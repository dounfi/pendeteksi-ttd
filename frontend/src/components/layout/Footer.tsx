import { Link } from 'react-router-dom';
import { TEAM_MEMBERS, DATASETS, GITHUB_REPOSITORY } from '../../data/references';
import { REFERENCES_LIST } from '../../data/story';

export function Footer() {
  return (
    <footer className="bg-[#F8FAFC] border-t border-slate-200/80 pt-16 pb-12 px-4 sm:px-6 text-[#1E293B]">
      <div className="max-w-[1280px] mx-auto space-y-12">
        {/* Top Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-8 border-b border-slate-200">
          <div>
            <Link to="/" className="flex items-center gap-2 group text-decoration-none">
              <span className="w-8 h-8 rounded-xl bg-[#2563EB] text-white flex items-center justify-center font-extrabold text-base shadow-sm">
                S
              </span>
              <span className="font-extrabold text-2xl tracking-tight text-[#0F172A]">
                Signa<span className="text-[#EA580C]">Check</span>
              </span>
            </Link>
            <p className="text-slate-600 text-sm mt-1">
              Sistem verifikasi keaslian tanda tangan berbasis visi komputer dan Siamese CNN.
            </p>
          </div>

          <div className="space-y-1 text-left md:text-right">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
              Dataset dan Repositori
            </span>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              {DATASETS.map((ds, idx) => (
                <span key={ds.id} className="inline-flex items-center gap-1.5">
                  {ds.url === 'TODO' ? (
                    <span className="text-slate-700 font-medium">{ds.nama}</span>
                  ) : (
                    <a
                      href={ds.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#2563EB] font-semibold hover:underline"
                    >
                      {ds.nama}
                    </a>
                  )}
                  {idx < DATASETS.length - 1 && <span className="text-slate-300">/</span>}
                </span>
              ))}
              <span className="text-slate-300">/</span>
              {GITHUB_REPOSITORY === 'TODO' ? (
                <span className="text-slate-700 font-medium">GitHub Repository</span>
              ) : (
                <a
                  href={GITHUB_REPOSITORY}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#2563EB] font-semibold hover:underline"
                >
                  GitHub Repository
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Team Members in Clean Rounded Cards */}
        <div className="space-y-4">
          <div className="text-center">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-slate-200/70 text-slate-700 text-xs font-bold uppercase tracking-wider">
              Tim Pengembang
            </span>
          </div>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 pt-2">
            {TEAM_MEMBERS.map((member, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow text-center w-52 space-y-2"
              >
                <div className="w-12 h-12 rounded-xl bg-[#EFF6FF] text-[#2563EB] font-bold text-lg flex items-center justify-center mx-auto">
                  {member.initials}
                </div>
                <div className="font-bold text-sm text-[#0F172A] truncate">
                  {member.nama}
                </div>
                <div className="text-xs text-slate-500 font-medium">
                  NIM {member.nim}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Disclaimer */}
        <div className="pt-6 border-t border-slate-200 text-center space-y-2 text-sm text-slate-500">
          <p className="font-semibold text-slate-700">
            Hasil pemeriksaan ini bersifat indikasi teknis, bukan vonis atau alat bukti hukum tetap.
          </p>
          <p className="text-xs">
            {REFERENCES_LIST.length} referensi ilmiah tercatat pada proyek mata kuliah Visual Komputer Cerdas.
          </p>
          <p className="text-xs text-slate-400 pt-2">
            2026 SignaCheck. Dibangun dengan integritas akademik dan transparansi metodologi.
          </p>
        </div>
      </div>
    </footer>
  );
}
