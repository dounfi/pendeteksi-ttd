# DESIGN.md: SignaCheck

## Identity
SignaCheck checks one signature against 1 to 5 genuine references. University course project (Visual Komputer Cerdas), journal-bound. Voice: a calm clerk at a document counter. Helpful, exact, never hyped.

## Mood
Office desk seen from above: documents, manila folder, taped paper, sticky notes, ID card on a lanyard. Serious subject, tactile and friendly surface.

## Dials
ENERGY 3, RHYTHM 3, MOTION 2.
Motion: scroll reveals, one pinned chapter (image processing), verdict stamp landing once, signature drawing itself once. No parallax, no looping motion, no marquee.

## Base Palette
- mat blue: #2B58B5
- deep navy: #14346B
- label blue: #1F4FBF
- ink: #14213D
- paper: #F7F2E6
- paper-white: #FFFEFA
- legal-pad yellow: #FFE27A
- legal-pad line: #E5B820
- manila: #E2C07C
- manila-dark: #C9A55E
- kraft: #C9A063
- sticky-yellow: #FFE27A
- sticky-pink: #F7B5CB
- sticky-blue: #BFE3F5
- Verdict colors (results only): verified #1F7A4F, uncertain #E0A21B, forged #B93A2E

---

## Extension: Home Page Visual & Color Blocking Architecture

### Color Blocking Architecture
Each section is a full-width block with its own distinct background color. Adjacent sections never share a background color.
1. Hero: Mat blue #2B58B5 with 32px cutting mat grid
2. Masalah: Legal-pad yellow #FFE27A with ruled lines (1px #E5B820 every 32px) and a thin blue margin line
3. Empat hal yang diukur: Cream #F7F2E6
4. Tiga langkah: Deep navy #14346B
5. Pengolahan citra (the only pinned chapter): Manila #E2C07C
6. Siamese: Label blue #1F4FBF
7. Hasil: Cream #F7F2E6
8. Foto HP: Deep navy #14346B
9. Batasan: Manila #E2C07C
10. Kuis: Sticky blue #BFE3F5
11. Ajakan akhir: Mat blue #2B58B5 with 32px grid
12. Footer: Manila-dark #C9A55E

### Scale & Typography Tokens
- H1: clamp(48px, 7vw, 96px)
- Section titles: clamp(36px, 5vw, 64px), each with one yellow highlighter swash behind one key word (ink text on swash)
- Body: 18px on desktop (16px on mobile)
- Strict minimum font size: no text below 14px anywhere (including diagram labels and captions)
- Container max width: 1280px
- Section vertical padding: 96px desktop, 64px mobile
- Section title-to-content gap: at most 120px
- Objects minimum width: at least 280px
- Content width: fills at least 70% of viewport container
- Every card carries one flat vector illustration of at least 96px

### Hero Section Composition
- Min-height: 100svh, full-width scene on the mat (#2B58B5 with 32px grid)
- Left 45%: H1 "Satu dokumen, satu pertanyaan: asli atau tiruan?", Sub "Bandingkan tanda tangan dengan 1 sampai 5 pembanding, lalu lihat indikasinya.", buttons "Periksa tanda tangan" and "Lihat cara kerjanya"
- Right: Large manila folder (~420px, rotated 2deg) holding a SignatureSheet whose signature draws itself once; ID card on blue lanyard overlapping folder (initials "SC", wordmark SignaCheck); keyboard corner cropped at bottom-left; mouse with curved cable at bottom-right; pen and sticky note "Hasil berupa indikasi, bukan bukti hukum."
- Mobile: Keep folder, ID card, and sticky note only

### Section Compositions
- 2 Masalah: Three paper cards on legal pad, tilted, each with flat vector illustration (document with signature line; two signatures side by side differing slightly; magnifier over signature).
- 3 Empat hal: Four colored folder cards in a row (manila, sticky blue, sticky pink, paper-white) with tabs: Kemiringan, Ketebalan goresan, Goresan terputus, Proporsi. Each has a drawn icon and one plain sentence.
- 4 Tiga langkah: White thick-border frame with notch title; three large numbered circles 01 to 03 joined by arrows, each with an illustration.
- 5 Pengolahan citra: Large clipboard, five numbered taped cards 01 to 05 (grayscale, denoising, Otsu, crop, resize) with before/after slider. Pinned on desktop, stacked on mobile.
- 6 Siamese: Two sheets feeding one shared "pengukur" card, then distance ruler. Real diagram, labels >= 14px.
- 7 Hasil: Three large verdict tags (Kemungkinan asli, Belum bisa dipastikan, Terindikasi palsu) and sensitivity slider.
- 8 Foto HP: Top-down phone casting shadow over sheet; robustness benchmark bars with empty state "[ISI DATA]" until results exist.
- 9 Batasan: Sticky notes of different colors taped around a folder.
- 10 Kuis: One question on clipboard, answers as paper strips.
- 11 Ajakan akhir: Big yellow button "Mulai pemeriksaan" on mat blue.

### Copy Rules
- Indonesian, calm, "kamu", no slang, no hype, no invented statistics
- No emoji, no em dashes anywhere
- Body text for each card: one plain sentence of at most 20 words
