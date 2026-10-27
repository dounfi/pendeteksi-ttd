import React from 'react';
import {
  KeyboardCorner,
  MouseWithCable,
  Pen,
  Pencil,
  BinderClip,
  PushPin,
  Magnifier,
  SignatureSheet,
  IdCard,
} from '../components/illustrations/OfficeDeskObjects';

export function AsetPage() {
  return (
    <div className="relative min-h-screen py-10 px-4 max-w-6xl mx-auto space-y-12">
      {/* Edge props peeking */}
      <div className="fixed top-20 -left-12 w-64 pointer-events-none z-0 opacity-70">
        <KeyboardCorner />
      </div>
      <div className="fixed top-28 -right-10 w-44 pointer-events-none z-0 opacity-70">
        <MouseWithCable />
      </div>

      {/* Title */}
      <div className="relative z-10 text-center space-y-3">
        <div className="label-strip text-xl">
          Katalog Komponen dan Aset Meja Kerja
        </div>
        <p className="text-sm text-white/90 max-w-lg mx-auto">
          Halaman tinjauan komponen visual dan palet warna sesuai spesifikasi dokumen desain.
        </p>
      </div>

      {/* Paper Components Section */}
      <section className="relative z-10 space-y-4">
        <div className="label-strip text-base">
          Komponen Kertas dan Folder
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {/* Manila Folder */}
          <div className="folder-manila p-6 pt-8 relative -rotate-1">
            <div className="absolute -top-5 left-4 folder-tab px-4 py-1 text-xs font-heading text-[#14213D]">
              berkas 01
            </div>
            <h3 className="text-lg font-heading mb-2">Folder Manila</h3>
            <p className="text-sm text-[#14213D]/80">
              Folder penyimpanan dokumen dengan tab di bagian atas. Menggunakan warna manila #E2C07C.
            </p>
          </div>

          {/* Paper Sheet */}
          <div className="paper-sheet p-6 relative rotate-1">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-6 tape-strip -rotate-2"></div>
            <h3 className="text-lg font-heading mb-2">Kertas Krem</h3>
            <p className="text-sm text-[#14213D]/80">
              Kertas dokumen utama berwarna #F7F2E6 dengan selotip washi di bagian atas dan bayangan kontak halus.
            </p>
          </div>

          {/* Paper White Sheet */}
          <div className="paper-white p-6 relative -rotate-0.5">
            <div className="absolute -top-3.5 right-4 w-7 pointer-events-none">
              <PushPin color="#1F4FBF" />
            </div>
            <h3 className="text-lg font-heading mb-2">Kertas Putih</h3>
            <p className="text-sm text-[#14213D]/80">
              Kertas lembar kerja #FFFEFA untuk kontras tinggi pada area pemeriksaan dan formulir.
            </p>
          </div>
        </div>
      </section>

      {/* Sticky Notes & Torn Labels */}
      <section className="relative z-10 space-y-4">
        <div className="label-strip text-base">
          Catatan Tempel dan Label Sobek
        </div>

        <div className="flex flex-wrap gap-6 items-center justify-center">
          {/* Yellow Sticky */}
          <div className="sticky-yellow w-44 h-44 p-4 -rotate-2 flex flex-col justify-between">
            <div className="text-2xl leading-snug">
              Bandingkan goresan awal dan akhir
            </div>
            <div className="text-xs text-[#14213D]/60 font-sans">catatan teknis</div>
          </div>

          {/* Pink Sticky */}
          <div className="sticky-pink w-44 h-44 p-4 rotate-1.5 flex flex-col justify-between">
            <div className="text-2xl leading-snug">
              Periksa ketebalan tinta di lekukan
            </div>
            <div className="text-xs text-[#14213D]/60 font-sans">pengamatan mata</div>
          </div>

          {/* Blue Sticky */}
          <div className="sticky-blue w-44 h-44 p-4 -rotate-1 flex flex-col justify-between">
            <div className="text-2xl leading-snug">
              Pastikan orientasi kertas tegak
            </div>
            <div className="text-xs text-[#14213D]/60 font-sans">panduan unggah</div>
          </div>

          {/* Torn Label */}
          <div className="torn-label px-6 py-4 rotate-2 text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-[#14213D]">
              Label Sobek Kertas
            </span>
            <div className="text-xs text-[#14213D]/70 mt-1">Nomor seri [ISI DATA]</div>
          </div>
        </div>
      </section>

      {/* Buttons & Verdict Badges */}
      <section className="relative z-10 space-y-4">
        <div className="label-strip text-base">
          Tombol dan Warna Status Hasil
        </div>

        <div className="paper-white p-6 space-y-6">
          <div>
            <h4 className="text-sm font-heading mb-3">Gaya Tombol</h4>
            <div className="flex flex-wrap gap-4 items-center">
              <button className="btn-label-blue">
                Periksa tanda tangan
              </button>
              <button className="btn-paper-white">
                Pakai contoh
              </button>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-heading mb-3">Warna Status Hasil (Hanya untuk Hasil)</h4>
            <div className="flex flex-wrap gap-4">
              <div className="bg-[#1F7A4F] text-white font-bold px-4 py-2 rounded shadow-sm text-sm flex items-center gap-2">
                <span>Kemungkinan asli</span>
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded font-mono">#1F7A4F</span>
              </div>
              <div className="bg-[#E0A21B] text-[#14213D] font-bold px-4 py-2 rounded shadow-sm text-sm flex items-center gap-2">
                <span>Belum pasti</span>
                <span className="text-xs bg-black/10 px-2 py-0.5 rounded font-mono">#E0A21B</span>
              </div>
              <div className="bg-[#B93A2E] text-white font-bold px-4 py-2 rounded shadow-sm text-sm flex items-center gap-2">
                <span>Terindikasi palsu</span>
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded font-mono">#B93A2E</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8 SVG Objects Showcase */}
      <section className="relative z-10 space-y-4">
        <div className="label-strip text-base">
          8 Objek Vektor Meja Kerja
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 items-center">
          {/* 1. BinderClip */}
          <div className="paper-sheet p-4 text-center space-y-2">
            <div className="h-20 flex items-center justify-center">
              <BinderClip className="w-16" />
            </div>
            <p className="text-xs font-bold text-[#14213D]">01. BinderClip</p>
          </div>

          {/* 2. PushPin */}
          <div className="paper-sheet p-4 text-center space-y-2">
            <div className="h-20 flex items-center justify-center">
              <PushPin className="w-12" />
            </div>
            <p className="text-xs font-bold text-[#14213D]">02. PushPin</p>
          </div>

          {/* 3. Magnifier */}
          <div className="paper-sheet p-4 text-center space-y-2">
            <div className="h-20 flex items-center justify-center">
              <Magnifier className="w-20" />
            </div>
            <p className="text-xs font-bold text-[#14213D]">03. Magnifier</p>
          </div>

          {/* 4. Mouse */}
          <div className="paper-sheet p-4 text-center space-y-2">
            <div className="h-20 flex items-center justify-center overflow-hidden">
              <MouseWithCable className="w-16 -mt-8" />
            </div>
            <p className="text-xs font-bold text-[#14213D]">04. Mouse with cable</p>
          </div>

          {/* 5. Pen */}
          <div className="paper-sheet p-4 text-center space-y-2 sm:col-span-2">
            <div className="h-16 flex items-center justify-center">
              <Pen className="w-64 rotate-1" />
            </div>
            <p className="text-xs font-bold text-[#14213D]">05. Pen</p>
          </div>

          {/* 6. Pencil */}
          <div className="paper-sheet p-4 text-center space-y-2 sm:col-span-2">
            <div className="h-16 flex items-center justify-center">
              <Pencil className="w-64 -rotate-1" />
            </div>
            <p className="text-xs font-bold text-[#14213D]">06. Pencil</p>
          </div>

          {/* 7. SignatureSheet */}
          <div className="paper-sheet p-4 text-center space-y-2 sm:col-span-2">
            <div className="flex justify-center">
              <SignatureSheet className="w-56" />
            </div>
            <p className="text-xs font-bold text-[#14213D] mt-2">07. SignatureSheet</p>
          </div>

          {/* 8. IdCard */}
          <div className="paper-sheet p-4 text-center space-y-2 sm:col-span-2">
            <div className="flex justify-center">
              <IdCard initials="SC" name="Petugas Periksa" role="Laboratorium Visual" className="w-48" />
            </div>
            <p className="text-xs font-bold text-[#14213D] mt-2">08. ID Card (Inisial, tanpa foto wajah)</p>
          </div>
        </div>
      </section>
    </div>
  );
}
