# ID Card Studio Pro - The Gesit Companies

Aplikasi generator ID Card profesional berbasis Web dengan standar industri CR80 (54 mm x 85.6 mm / 638 x 1011 px @ 300 DPI), didukung oleh antarmuka modern Shadcn UI & Tailwind CSS, AI background removal, gestur sentuh/seret interaktif, serta modul cetak lembar A4 (10 kartu per halaman).

---

## 🚀 Fitur Utama

- **Dual Corporate Template**:
  - **The Gesit Companies** (Default): Sisi depan dengan logo Gesit Group, sisi belakang The City Tower Lt. 27, Jl. M.H. Thamrin No. 81, Jakarta (Telp: 021 - 3101601).
  - **Gesit Natural Resources**: Template khusus divisi natural resources.
- **Standar Cetak CR80 Presisi (300 DPI)**:
  - Dimensi kartu akurat 54 × 85.6 mm (rasio rasmi kartu tanda pengenal / ISO 7810).
  - Garis bantu grid untuk perataan presisi.
- **Kontrol Foto Karyawan Lengkap**:
  - Drag & drop foto (mendukung JPG, PNG, WebP, dan HEIC iPhone).
  - Geser langsung di kanvas, pinch/scroll zoom, rotasi 90°, flip mirror, dan kalibrasi pencahayaan (brightness & contrast).
- **Penghapus Background (AI & Manual)**:
  - AI Selfie Segmentation lokal di browser.
  - Sikat manual (Mode Hapus & Mode Pulihkan) dengan slider ukuran kuas dan kehalusan tepi (blur).
- **Modul Cetak Lembar A4 (Batch Print)**:
  - Susun hingga 10 ID Card per lembar A4 siap potong.
  - Mode Bolak-Balik (Duplex) presisi dengan crop marks & border guideline.
- **Ekspor Cepat**:
  - Unduh format PNG HD (resolusi tinggi).
  - Unduh PDF siap cetak ukuran CR80 tunggal.
  - Dialog cetak langsung ke printer kartu (Evolis, Zebra, Fargo, dll.).

---

## 🛠️ Teknologi yang Digunakan

- **React 18** & **Vite 6**
- **Tailwind CSS 3** & **Shadcn UI** (Radix UI primitives & Lucide Icons)
- **Canvas API** & **HTML2Canvas**
- **jsPDF** untuk ekspor dokumen PDF
- **MediaPipe Selfie Segmentation** & **Libheif/Heic2any** untuk format foto modern

---

## 💻 Cara Menjalankan

1. **Clone repositori**:
   ```bash
   git clone https://github.com/itdeptgesit/id-card-generator.git
   cd id-card-generator
   ```

2. **Install dependensi**:
   ```bash
   npm install
   ```

3. **Jalankan development server**:
   ```bash
   npm run dev
   ```
   Buka `http://localhost:5173` di browser Anda.

4. **Build untuk produksi**:
   ```bash
   npm run build
   ```

---

## 🏢 Hak Cipta

Copyright © 2026 **IT Gesit** • Developed by **Mr Siarudin**  
The Gesit Companies
