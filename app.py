"""
Aplikasi Web Interaktif: Sistem Deteksi & Forensik Pemalsuan Tanda Tangan
Model: Siamese CNN + Fusi Ciri Forensik Klasik + Uji Ketahanan
"""

import os
import sys
import json
import numpy as np
from PIL import Image
import streamlit as st

# Setup direktori modul
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DEMO_DIR = os.path.join(BASE_DIR, "demo_model_files (5)")
sys.path.insert(0, DEMO_DIR)

import keras
import preprocess
import forensik
import gangguan

# Konfigurasi Halaman Streamlit
st.set_page_config(
    page_title="Deteksi Pemalsuan Tanda Tangan (Siamese CNN)",
    page_icon="✍️",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom Styling CSS Modern
st.markdown("""
<style>
    .main-title {
        font-size: 2.2rem;
        font-weight: 700;
        color: #1E293B;
        margin-bottom: 0.2rem;
    }
    .sub-title {
        font-size: 1.05rem;
        color: #64748B;
        margin-bottom: 1.5rem;
    }
    .card-verdict-genuine {
        background: linear-gradient(135deg, #10B981 0%, #059669 100%);
        color: white;
        padding: 1.5rem;
        border-radius: 12px;
        text-align: center;
        box-shadow: 0 8px 16px rgba(16, 185, 129, 0.25);
    }
    .card-verdict-forgery {
        background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
        color: white;
        padding: 1.5rem;
        border-radius: 12px;
        text-align: center;
        box-shadow: 0 8px 16px rgba(239, 68, 68, 0.25);
    }
    .metric-box {
        background-color: #F8FAFC;
        border: 1px solid #E2E8F0;
        border-radius: 10px;
        padding: 1rem;
        text-align: center;
    }
    .metric-val {
        font-size: 1.8rem;
        font-weight: 700;
        color: #0F172A;
    }
    .metric-lbl {
        font-size: 0.85rem;
        color: #64748B;
        font-weight: 500;
    }
    .badge-mirip {
        background-color: #DEF7EC;
        color: #03543F;
        padding: 4px 10px;
        border-radius: 9999px;
        font-weight: 600;
        font-size: 0.8rem;
    }
    .badge-agak {
        background-color: #FEF08A;
        color: #713F12;
        padding: 4px 10px;
        border-radius: 9999px;
        font-weight: 600;
        font-size: 0.8rem;
    }
    .badge-beda {
        background-color: #FDE8E8;
        color: #9B1C1C;
        padding: 4px 10px;
        border-radius: 9999px;
        font-weight: 600;
        font-size: 0.8rem;
    }
</style>
""", unsafe_allow_html=True)

@st.cache_resource
def load_config_and_model():
    cfg_path = os.path.join(DEMO_DIR, "config.json")
    with open(cfg_path, "r", encoding="utf-8") as f:
        cfg = json.load(f)
    
    model_path = os.path.join(DEMO_DIR, "embedding_model.keras")
    model = keras.models.load_model(model_path, compile=False)
    return cfg, model

# Muat model & config
try:
    CONFIG, MODEL = load_config_and_model()
except Exception as e:
    st.error(f"Gagal memuat model: {e}")
    st.stop()

# Header
st.markdown('<div class="main-title">✍️ Sistem Deteksi Indikasi Pemalsuan Tanda Tangan</div>', unsafe_allow_html=True)
st.markdown('<div class="sub-title">Verifikasi Keaslian Tanda Tangan Berbasis <b>Siamese CNN</b>, Analisis Forensik Citra Klasik, dan Uji Goyang (Keyakinan Keputusan).</div>', unsafe_allow_html=True)

# Sidebar
st.sidebar.header("⚙️ Pengaturan & Input")
mode_pilihan = st.sidebar.radio(
    "Sumber Citra Tanda Tangan:",
    ("Gunakan Contoh Sampel", "Unggah Berkas Gambar", "Ambil Foto via Kamera")
)

THRESHOLD = CONFIG.get("threshold", 0.4811)
PREPROCESS_MODE = CONFIG.get("preprocess_mode", "binary")

ref_img_path = None
qry_img_path = None

sample_dir = os.path.join(BASE_DIR, "contoh_ttd")

if mode_pilihan == "Gunakan Contoh Sampel":
    sampel_pilihan = st.sidebar.selectbox(
        "Pilih Pasangan Sampel Uji:",
        [
            "1. TTD Asli vs Asli (Rajshree - Cocok)",
            "2. TTD Asli vs Asli (Gaya Miring - Cocok)",
            "3. TTD Asli vs Palsu (Bentuk & Karakter Beda)"
        ]
    )
    if "1." in sampel_pilihan:
        ref_img_path = os.path.join(sample_dir, "ttd_rajshree_1.png")
        qry_img_path = os.path.join(sample_dir, "ttd_rajshree_2.png")
        label_ekspektasi = "ASLI"
    elif "2." in sampel_pilihan:
        ref_img_path = os.path.join(sample_dir, "ttd_miring_1.png")
        qry_img_path = os.path.join(sample_dir, "ttd_miring_2.png")
        label_ekspektasi = "ASLI"
    else:
        ref_img_path = os.path.join(sample_dir, "palsu_pair3_ref.png")
        qry_img_path = os.path.join(sample_dir, "palsu_pair3_forgery.png")
        label_ekspektasi = "PALSU"

    st.sidebar.info(f"💡 Ekspektasi pasangan ini: **{label_ekspektasi}**")
elif mode_pilihan == "Unggah Berkas Gambar":
    file_ref = st.sidebar.file_uploader("1. Tanda Tangan Pembanding (Asli/Referensi)", type=["png", "jpg", "jpeg"])
    file_qry = st.sidebar.file_uploader("2. Tanda Tangan yang Diperiksa (Uji)", type=["png", "jpg", "jpeg"])
    ref_img_path = file_ref
    qry_img_path = file_qry
else:
    file_ref = st.sidebar.camera_input("1. Jepret Foto Tanda Tangan Pembanding")
    file_qry = st.sidebar.camera_input("2. Jepret Foto Tanda Tangan yang Diperiksa")
    ref_img_path = file_ref
    qry_img_path = file_qry

# Fitur Tambahan
st.sidebar.markdown("---")
st.sidebar.subheader("🔬 Fitur Tambahan")
aktifkan_uji_goyang = st.sidebar.checkbox("Jalankan Uji Goyang (Keyakinan Keputusan)", value=True)
simulasi_gangguan = st.sidebar.checkbox("Simulasi Gangguan Foto HP (Uji Ketahanan)", value=False)
jenis_gangguan = "foto_hp"
if simulasi_gangguan:
    jenis_gangguan = st.sidebar.selectbox(
        "Pilih Jenis Gangguan Foto HP:",
        ["foto_hp", "bayangan", "buram", "miring", "redup", "noise"]
    )

if ref_img_path is None or qry_img_path is None:
    st.warning("⚠️ Silakan pilih contoh sampel di sidebar atau unggah 2 gambar tanda tangan untuk memulai pengujian.")
    st.stop()

# Load Gambar Gray
try:
    gray_ref = preprocess.load_gray(ref_img_path)
    gray_qry = preprocess.load_gray(qry_img_path)
except Exception as err:
    st.error(f"Gagal membaca berkas citra: {err}")
    st.stop()

# Terapkan gangguan jika diminta
if simulasi_gangguan:
    rng = np.random.default_rng(123)
    fn_gangguan = gangguan.KONDISI.get(jenis_gangguan, gangguan.foto_hp)
    gray_qry = fn_gangguan(gray_qry, rng)
    st.info(f"📸 Mode simulasi aktif: Citra yang diperiksa diberi gangguan buatan **{jenis_gangguan}**.")

# Preprocessing
proc_ref, steps_ref = preprocess.preprocess_signature(gray_ref, mode=PREPROCESS_MODE, return_steps=True)
proc_qry, steps_qry = preprocess.preprocess_signature(gray_qry, mode=PREPROCESS_MODE, return_steps=True)

# Tampilan Citra
col_img1, col_img2 = st.columns(2)
with col_img1:
    st.subheader("1️⃣ Tanda Tangan Pembanding (Referensi)")
    st.image(gray_ref, caption="Citra Asli (Grayscale)", use_container_width=True)
    st.image(proc_ref, caption=f"Hasil Preprocessing ({PREPROCESS_MODE}) [128x256]", use_container_width=True, clamp=True)

with col_img2:
    st.subheader("2️⃣ Tanda Tangan yang Diperiksa")
    st.image(gray_qry, caption="Citra Uji" + (" (Dengan Gangguan)" if simulasi_gangguan else ""), use_container_width=True)
    st.image(proc_qry, caption=f"Hasil Preprocessing ({PREPROCESS_MODE}) [128x256]", use_container_width=True, clamp=True)

st.markdown("---")

# Prediksi Model Siamese CNN
inp_ref = proc_ref[np.newaxis, :, :, np.newaxis]
inp_qry = proc_qry[np.newaxis, :, :, np.newaxis]

emb_ref = MODEL.predict(inp_ref, verbose=0)
emb_qry = MODEL.predict(inp_qry, verbose=0)
jarak_cnn = float(np.linalg.norm(emb_ref - emb_qry))

is_asli = jarak_cnn < THRESHOLD
kemiripan_persen = max(0.0, min(100.0, (1.0 - (jarak_cnn / 1.0)) * 100))

# Ekstraksi Forensik Klasik
crop1 = steps_ref.get("potong_biner", steps_ref.get("potong"))
crop2 = steps_qry.get("potong_biner", steps_qry.get("potong"))
feat_ref = forensik.extract_features(crop1)
feat_qry = forensik.extract_features(crop2)

# Fusi
fusi_pred = None
skor_fusi = None
fusi_cfg = CONFIG.get("fusi", None)
if fusi_cfg and feat_ref is not None and feat_qry is not None:
    diffs = forensik.feature_diffs(feat_ref, feat_qry)
    x_fusi = np.array([jarak_cnn] + diffs.tolist())
    x_scaled = (x_fusi - np.array(fusi_cfg["mean"])) / np.array(fusi_cfg["scale"])
    skor_fusi = float(np.dot(x_scaled, np.array(fusi_cfg["coef"])) + fusi_cfg["intercept"])
    fusi_pred = "PALSU" if skor_fusi >= fusi_cfg["threshold"] else "ASLI"

# Tampilan Hasil Utama
st.header("🎯 Hasil Verifikasi Tanda Tangan")

col_res1, col_res2, col_res3, col_res4 = st.columns(4)

with col_res1:
    st.markdown('<div class="metric-box"><div class="metric-lbl">Keputusan Model CNN</div>'
                f'<div class="metric-val" style="color:{"#059669" if is_asli else "#DC2626"};">{"ASLI" if is_asli else "PALSU"}</div>'
                f'<div style="font-size:0.8rem;color:#64748B;">{"Cocok / Identik" if is_asli else "Terindikasi Pemalsuan"}</div></div>', unsafe_allow_html=True)

with col_res2:
    st.markdown('<div class="metric-box"><div class="metric-lbl">Jarak Euclidean</div>'
                f'<div class="metric-val">{jarak_cnn:.4f}</div>'
                f'<div style="font-size:0.8rem;color:#64748B;">Batas Ambang: {THRESHOLD:.4f}</div></div>', unsafe_allow_html=True)

with col_res3:
    st.markdown('<div class="metric-box"><div class="metric-lbl">Indeks Kemiripan</div>'
                f'<div class="metric-val">{kemiripan_persen:.1f}%</div>'
                f'<div style="font-size:0.8rem;color:#64748B;">Margin: 1.0000</div></div>', unsafe_allow_html=True)

with col_res4:
    if fusi_pred:
        warna_fusi = "#059669" if fusi_pred == "ASLI" else "#DC2626"
        st.markdown('<div class="metric-box"><div class="metric-lbl">Keputusan Fusi (CNN + Forensik)</div>'
                    f'<div class="metric-val" style="color:{warna_fusi};">{fusi_pred}</div>'
                    f'<div style="font-size:0.8rem;color:#64748B;">Skor: {skor_fusi:.3f} (Batas: {fusi_cfg["threshold"]:.3f})</div></div>', unsafe_allow_html=True)
    else:
        st.markdown('<div class="metric-box"><div class="metric-lbl">Keputusan Fusi</div>'
                    f'<div class="metric-val" style="color:#64748B;">-</div>'
                    f'<div style="font-size:0.8rem;color:#64748B;">Tidak tersedia</div></div>', unsafe_allow_html=True)

st.markdown("<br>", unsafe_allow_html=True)

# Banner Verdict
if is_asli:
    st.markdown("""
    <div class="card-verdict-genuine">
        <h2 style="margin:0;color:white;">✅ TANDA TANGAN ASLI / IDENTIK</h2>
        <p style="margin:5px 0 0 0;font-size:1.05rem;">Jarak embedding fitur berada di bawah ambang batas deteksi. Tanda tangan ini memiliki karakteristik bentuk, tarikan goresan, dan struktur yang identik dengan pembanding.</p>
    </div>
    """, unsafe_allow_html=True)
else:
    st.markdown("""
    <div class="card-verdict-forgery">
        <h2 style="margin:0;color:white;">⚠️ INDIKASI PEMALSUAN / TIDAK COCOK</h2>
        <p style="margin:5px 0 0 0;font-size:1.05rem;">Jarak embedding melebihi ambang batas deteksi. Model mendeteksi perbedaan signifikan pada goresan tanda tangan yang tidak wajar untuk orang yang sama.</p>
    </div>
    """, unsafe_allow_html=True)

st.markdown("<br>", unsafe_allow_html=True)

# Tab Rincian
tab1, tab2, tab3 = st.tabs(["🔍 Laporan Forensik Mini", "🌊 Uji Goyang (Keyakinan)", "📊 Arsitektur & Informasi Model"])

with tab1:
    st.subheader("Rincian 8 Ciri Forensik Citra Klasik")
    st.write("Analisis ini memeriksa atribut fisik tanda tangan menggunakan pengolahan citra komputer klasik tanpa deep learning untuk menjelaskan **kenapa** model mengambil keputusan tersebut.")

    batas_forensik = CONFIG.get("forensik_batas", {})
    if feat_ref is not None and feat_qry is not None and batas_forensik:
        lap = forensik.explain(feat_ref, feat_qry, batas_forensik)
        
        table_html = """
        <table style="width:100%; border-collapse:collapse; margin-top:10px;">
            <thead>
                <tr style="background-color:#F1F5F9; border-bottom:2px solid #CBD5E1; text-align:left;">
                    <th style="padding:10px;">Ciri Forensik</th>
                    <th style="padding:10px;">Pembanding</th>
                    <th style="padding:10px;">Diperiksa</th>
                    <th style="padding:10px;">Selisih</th>
                    <th style="padding:10px;">Tingkat Kemiripan</th>
                </tr>
            </thead>
            <tbody>
        """
        for item in lap:
            tingkat = item["tingkat"]
            if tingkat == "mirip":
                badge = '<span class="badge-mirip">Mirip</span>'
            elif tingkat == "agak beda":
                badge = '<span class="badge-agak">Agak Beda</span>'
            else:
                badge = '<span class="badge-beda">Beda</span>'
                
            table_html += f"""
                <tr style="border-bottom:1px solid #E2E8F0;">
                    <td style="padding:10px; font-weight:600;">{item['label']}</td>
                    <td style="padding:10px;">{item['pembanding']}</td>
                    <td style="padding:10px;">{item['diperiksa']}</td>
                    <td style="padding:10px;">{item['selisih']:.4f}</td>
                    <td style="padding:10px;">{badge}</td>
                </tr>
            """
        table_html += "</tbody></table>"
        st.markdown(table_html, unsafe_allow_html=True)
    else:
        st.info("Ciri forensik tidak dapat diekstraksi dari citra ini (mungkin goresan tinta terlalu sedikit atau terpotong).")

with tab2:
    st.subheader("Uji Goyang (Shake Test) - Mengukur Keyakinan Keputusan")
    st.write("Uji goyang menguji stabilitas tanda tangan dengan memberikan sedikit rotasi, pergeseran posisi, dan skala minor (6 variasi) lalu mengukur seberapa konsisten model mengambil keputusan.")
    
    if aktifkan_uji_goyang:
        goyang_cfg = CONFIG.get("goyang", {})
        n_shake = goyang_cfg.get("n", 6)
        
        with st.spinner("Menghitung variasi goyang tanda tangan..."):
            var1 = gangguan.shake_variants(proc_ref, n=n_shake, seed=101)
            var2 = gangguan.shake_variants(proc_qry, n=n_shake, seed=101)
            e_var1 = MODEL.predict(var1, verbose=0)
            e_var2 = MODEL.predict(var2, verbose=0)
            dists_g = np.linalg.norm(e_var1 - e_var2, axis=1)
            
            mean_d = float(np.mean(dists_g))
            std_d = float(np.std(dists_g))
            z_score = abs(mean_d - THRESHOLD) / (std_d + 1e-3)
            ragu_z = goyang_cfg.get("ragu_z", 1.74)
            
            is_yakin = z_score >= ragu_z
            
            cg1, cg2, cg3 = st.columns(3)
            with cg1:
                st.metric("Skor Keyakinan Z", f"{z_score:.2f}")
            with cg2:
                st.metric("Batas Keraguan Z", f"{ragu_z:.2f}")
            with cg3:
                status_txt = "✅ Sangat Yakin / Stabil" if is_yakin else "⚠️ Ragu-ragu (Verifikasi Manual)"
                st.metric("Status Stabilitas", status_txt)
                
            if is_yakin:
                st.success(f"Model sangat konsisten pada semua variasi posisi dan sudut (Z = {z_score:.2f} >= {ragu_z:.2f}). Keputusan dapat dipercaya dengan tingkat keyakinan tinggi.")
            else:
                st.warning(f"Keputusan berada di daerah perbatasan/ragu-ragu (Z = {z_score:.2f} < {ragu_z:.2f}). Disarankan meminta tanda tangan pembanding tambahan.")
    else:
        st.info("Uji goyang dinonaktifkan di sidebar.")

with tab3:
    st.subheader("Informasi Model & Metrik Evaluasi")
    st.json({
        "Model": CONFIG.get("model"),
        "Dimensi Input": f"{CONFIG.get('img_h')} x {CONFIG.get('img_w')}",
        "Ambang Batas Jarak": CONFIG.get("threshold"),
        "Mode Pengolahan": CONFIG.get("preprocess_mode"),
        "Akurasi Pengujian D1": f"{CONFIG.get('metrics', {}).get('test_accuracy', 0)*100:.2f}%",
        "AUC Score D1": f"{CONFIG.get('metrics', {}).get('test_auc', 0):.4f}",
        "EER (Equal Error Rate)": f"{CONFIG.get('metrics', {}).get('test_eer', 0):.4f}",
        "FAR (Palsu Lolos)": f"{CONFIG.get('metrics', {}).get('test_FAR', 0)*100:.2f}%",
        "FRR (Asli Ditolak)": f"{CONFIG.get('metrics', {}).get('test_FRR', 0)*100:.2f}%"
    })
