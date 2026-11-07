import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "../components/Navbar";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SignaCheck — Verifikasi Tanda Tangan Berbasis Machine Learning" },
      {
        name: "description",
        content:
          "SignaCheck membantu menganalisis kemiripan tanda tangan melalui teknologi deep learning dan karakteristik citra forensik untuk mendukung proses verifikasi secara lebih informatif.",
      },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-[#010211] font-['Work_Sans',sans-serif] overflow-x-hidden selection:bg-[#0C7AB5] selection:text-white">
      {/* ══════════════════════════════════════════════════════════
           1. NAVBAR
           ══════════════════════════════════════════════════════════ */}
      <Navbar />

      {/* ══════════════════════════════════════════════════════════
           2. HERO
           ══════════════════════════════════════════════════════════ */}
      <section id="beranda" className="hero">
        <div className="hero-overlay"></div>

        <div className="hero-content">
          {/* Badge */}
          <div className="hero-badge" style={{ marginTop: "44px" }}>
            <span>Kenali Polanya. Periksa Keasliannya</span>
          </div>

          {/* Main heading */}
          <h1 className="hero-title">
            Verifikasi Tanda Tangan, Lebih Cermat dengan ML.
          </h1>

          {/* Subtitle */}
          <p className="hero-subtitle">
            SignaCheck membantu menganalisis kemiripan tanda tangan melalui teknologi deep
            learning dan karakteristik citra forensik untuk mendukung proses verifikasi secara
            lebih informatif.
          </p>

          {/* CTA */}
          <Link to="/periksa" className="hero-cta">
            <div className="hero-cta-btn">
              <span>Coba SignaCheck</span>
              <img src="/assets/icons/ic_round-navigate-next.svg" alt="→" />
            </div>
          </Link>
        </div>

        {/* White wave at bottom */}
        <div className="hero-wave">
          <svg viewBox="0 0 1440 90" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M0,60 C200,90 400,90 600,65 C800,40 1000,15 1200,30 C1320,40 1400,55 1440,30 L1440,90 L0,90 Z"
              fill="#ffffff"
            />
          </svg>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
           3. TENTANG SIGNACHECK
           ══════════════════════════════════════════════════════════ */}
      <section id="tentang" className="section-tentang">
        <h2 className="tentang-title">Tentang SignaCheck</h2>

        <div className="tentang-stage">
          {/* Back card */}
          <div className="tentang-card">
            <h3 className="tentang-card-title">Analisis Tanda Tangan Berbasis Machine Learning</h3>
            <div className="tentang-card-body">
              <p>
                SignaCheck adalah sistem verifikasi tanda tangan berbasis citra yang memanfaatkan
                Siamese Convolutional Neural Network (CNN) untuk menganalisis kemiripan pola
                tanda tangan.
              </p>
              <p>
                Sistem ini menggabungkan analisis kemiripan berbasis deep learning dengan
                karakteristik morfologi citra untuk memberikan informasi pendukung dalam proses
                pemeriksaan tanda tangan. Dilengkapi dengan analisis ketahanan terhadap perubahan
                citra dan mekanisme identifikasi hasil yang meragukan, SignaCheck dirancang untuk
                menghasilkan evaluasi yang lebih informatif dan terukur.
              </p>
            </div>
          </div>

          {/* Front photo */}
          <img
            src="/assets/about.jpg"
            alt="Tangan memegang pensil di atas kertas"
            className="tentang-photo"
          />
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
           4. KEUNGGULAN SIGNACHECK
           ══════════════════════════════════════════════════════════ */}
      <section className="section-keunggulan">
        <h2 className="keunggulan-title">Keunggulan SignaCheck</h2>

        <div className="keunggulan-grid">
          {/* Kartu 1: cyan (#1F8EBC) */}
          <div className="k-card">
            <div className="k-icon-wrap cyan">
              <img src="/assets/icons/Keunggulan/flowbite_brain-outline.svg" alt="" />
            </div>
            <div className="k-text">
              <div className="k-title">Analisis Cerdas dengan ML</div>
              <div className="k-desc">
                Menggabungkan Siamese CNN dengan delapan karakteristik morfologi citra tanda tangan.
                Pendekatan ini tidak hanya membandingkan pola tanda tangan, tetapi juga menyediakan
                informasi karakteristik visual yang mendukung analisis hasil verifikasi.
              </div>
            </div>
          </div>

          {/* Kartu 2: teal (#3FA1C1) */}
          <div className="k-card">
            <div className="k-icon-wrap teal">
              <img src="/assets/icons/Keunggulan/carbon_warning-alt-filled.svg" alt="" />
            </div>
            <div className="k-text">
              <div className="k-title">Tidak Asal Menentukan Hasil</div>
              <div className="k-desc">
                Melalui mekanisme Uji Goyang (Shake Invariance Test), sistem mengevaluasi
                kestabilan hasil ketika citra tanda tangan mengalami perubahan kecil. Jika hasil
                berada dalam kondisi yang meragukan, sistem dapat memberikan status Ragu-Ragu untuk
                mendukung pemeriksaan lebih lanjut.
              </div>
            </div>
          </div>

          {/* Kartu 3: cyan (#1F8EBC) */}
          <div className="k-card">
            <div className="k-icon-wrap cyan">
              <img src="/assets/icons/Keunggulan/ant-design_camera-outlined.svg" alt="" />
            </div>
            <div className="k-text">
              <div className="k-title">Adaptif terhadap Kualitas Gambar</div>
              <div className="k-desc">
                Dilengkapi dengan tahapan prapemrosesan citra untuk membantu menangani variasi
                pencahayaan, bayangan, dan posisi tanda tangan. Pendekatan ini dirancang untuk
                mendukung analisis tanda tangan dari citra yang tidak selalu ideal.
              </div>
            </div>
          </div>

          {/* Kartu 4: teal (#3FA1C1) */}
          <div className="k-card">
            <div className="k-icon-wrap teal">
              <img src="/assets/icons/Keunggulan/famicons_documents.svg" alt="" />
            </div>
            <div className="k-text">
              <div className="k-title">Pembanding Lebih dari Satu Sampel</div>
              <div className="k-desc">
                Mendukung penggunaan satu hingga lima sampel tanda tangan asli sebagai referensi.
                Beberapa sampel tersebut digunakan untuk membentuk representasi pembanding yang dapat
                mengakomodasi variasi alami tanda tangan seseorang.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
           5. CARA PAKAI SIGNACHECK
           ══════════════════════════════════════════════════════════ */}
      <section id="cara-pakai" className="section-cara">
        <h2 className="cara-title">Cara Pakai SignaCheck</h2>

        <div className="cara-row">
          {/* Step 1 */}
          <div className="cara-step">
            <div className="cara-box">
              <img src="/assets/icons/Cara Pakai/fa6-solid_file-signature.svg" alt="Unggah Tanda Tangan" />
            </div>
            <div className="cara-label">Unggah Tanda Tangan</div>
          </div>

          {/* Arrow 1 */}
          <div className="cara-arrow">
            <img src="/assets/icons/Cara Pakai/Line 1.svg" alt="→" />
          </div>

          {/* Step 2 */}
          <div className="cara-step">
            <div className="cara-box">
              <img src="/assets/icons/Cara Pakai/hugeicons_ai-brain-05.svg" alt="Pemrosesan Citra" />
            </div>
            <div className="cara-label">Pemrosesan Citra</div>
          </div>

          {/* Arrow 2 */}
          <div className="cara-arrow">
            <img src="/assets/icons/Cara Pakai/Line 2.svg" alt="→" />
          </div>

          {/* Step 3 */}
          <div className="cara-step">
            <div className="cara-box">
              <img src="/assets/icons/Cara Pakai/at-icons_file-magnifying-glass.svg" alt="Analisis dan Perbandingan" />
            </div>
            <div className="cara-label">Analisis dan Perbandingan</div>
          </div>

          {/* Arrow 3 */}
          <div className="cara-arrow">
            <img src="/assets/icons/Cara Pakai/Line 3.svg" alt="→" />
          </div>

          {/* Step 4 */}
          <div className="cara-step">
            <div className="cara-box">
              <img src="/assets/icons/Cara Pakai/famicons_documents-1.svg" alt="Hasil Verifikasi" />
            </div>
            <div className="cara-label">Hasil Verifikasi</div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
           6. FOOTER
           ══════════════════════════════════════════════════════════ */}
      <footer className="footer">
        <div className="footer-inner">
          {/* Col 1: Logo box */}
          <div className="footer-logo-box">
            <img src="/assets/icons/hugeicons_signature.svg" alt="Logo" />
            <span className="footer-logo-name">SignaCheck</span>
          </div>

          {/* Col 2: Description */}
          <div className="footer-desc">
            <div className="footer-desc-title">
              SignaCheck — Sistem Analisis dan Verifikasi Tanda Tangan Berbasis ML.
            </div>
            <div className="footer-desc-body">
              Hasil sistem bersifat indikatif dan digunakan sebagai informasi pendukung.
              Keputusan mengenai keaslian tanda tangan memerlukan pertimbangan lebih lanjut
              sesuai konteks penggunaannya.
            </div>
          </div>

          {/* Col 3: Team */}
          <div className="footer-team">
            <div className="footer-team-title">Tim Pengembang:</div>
            <div className="footer-team-list">
              • Nur'Afia Avanza<br />
              • Zaskia Alyssa Putri<br />
              • Adzkia Nifa Adha
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="footer-copy">
          © 2026 SignaCheck. Dikembangkan sebagai proyek computer vision.
        </div>
      </footer>
    </div>
  );
}