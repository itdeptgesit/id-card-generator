import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

// Helper function to capture HTML element to sharp Canvas
export async function captureElementToCanvas(element, scale = 3.5) {
  if (!element) return null;

  // Sembunyikan garis grid sementara jika ada
  const gridEl = element.querySelector('.layer-grid');
  const originalGridDisplay = gridEl ? gridEl.style.display : null;
  if (gridEl) gridEl.style.display = 'none';

  // Simpan properti gaya awal
  const prevStyle = {
    opacity: element.style.opacity,
    visibility: element.style.visibility,
    transition: element.style.transition,
    borderRadius: element.style.borderRadius,
  };

  // Pastikan elemen ber-opacity 1 dan terlihat saat proses capture html2canvas
  element.style.transition = 'none';
  element.style.visibility = 'visible';
  element.style.opacity = '1';
  element.style.borderRadius = '0px';

  try {
    const canvas = await html2canvas(element, {
      scale: scale,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      windowWidth: element.offsetWidth || 340,
      windowHeight: element.offsetHeight || 539,
    });
    return canvas;
  } catch (err) {
    console.error('Gagal saat capture element to canvas:', err);
    throw err;
  } finally {
    // Kembalikan gaya awal
    element.style.opacity = prevStyle.opacity;
    element.style.visibility = prevStyle.visibility;
    element.style.transition = prevStyle.transition;
    element.style.borderRadius = prevStyle.borderRadius;
    if (gridEl) gridEl.style.display = originalGridDisplay || '';
  }
}

// Helper: Rotasi canvas 90 derajat searah jarum jam untuk slot landscape A4
export function rotateCanvas90Deg(canvas) {
  if (!canvas || !canvas.width || !canvas.height) return canvas;
  const rotCanvas = document.createElement('canvas');
  rotCanvas.width = canvas.height;
  rotCanvas.height = canvas.width;
  const ctx = rotCanvas.getContext('2d');
  ctx.translate(rotCanvas.width / 2, rotCanvas.height / 2);
  ctx.rotate((90 * Math.PI) / 180);
  ctx.drawImage(canvas, -canvas.width / 2, -canvas.height / 2);
  return rotCanvas;
}

// 1. Export Ultra-HD PNG (300+ DPI)
export async function exportCardPng(element, filename = 'ID_Card.png') {
  const canvas = await captureElementToCanvas(element, 4);
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png', 1.0);
  link.click();
}

// 2. Export Single CR80 Card PDF (54 x 85.6 mm)
export async function exportSingleCardPdf(element, filename = 'ID_Card.pdf') {
  const canvas = await captureElementToCanvas(element, 3.5);
  const imgData = canvas.toDataURL('image/png', 1.0);

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [54, 85.6],
  });

  pdf.addImage(imgData, 'PNG', 0, 0, 54, 85.6, undefined, 'FAST');
  pdf.save(filename);
}

// 3. Export Lembar A4 Berisi 10 ID Card (Standar 2 Kolom x 5 Baris = 10 Kartu per Lembar)
export async function exportA4BatchTenCardsPdf({
  cardList = [],
  defaultFrontElement = null,
  defaultBackElement = null,
  includeBackPage = true,
  filename = 'LEMBAR_CETAK_A4_10_KARTU.pdf',
}) {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4', // 210 x 297 mm
  });

  // Ambil data default front & back jika diperlukan
  let defaultFrontImg = null;
  let defaultBackImg = null;

  if (defaultFrontElement) {
    const fCanvas = await captureElementToCanvas(defaultFrontElement, 3.5);
    const rCanvas = rotateCanvas90Deg(fCanvas);
    defaultFrontImg = rCanvas.toDataURL('image/png', 1.0);
  }

  if (defaultBackElement) {
    const bCanvas = await captureElementToCanvas(defaultBackElement, 3.5);
    const rCanvas = rotateCanvas90Deg(bCanvas);
    defaultBackImg = rCanvas.toDataURL('image/png', 1.0);
  }

  // Dimensi grid 10 kartu pada A4 (2 kolom x 5 baris)
  // Slot kartu landscape: 85.6 mm (lebar) x 54 mm (tinggi)
  const cardW = 85.6;
  const cardH = 54;
  const colGap = 8;
  const rowGap = 4;

  const totalGridW = 2 * cardW + colGap; // 179.2 mm
  const startX = (210 - totalGridW) / 2; // 15.4 mm (margin kiri-kanan simetris)

  const totalGridH = 5 * cardH + 4 * rowGap; // 286 mm
  const startY = (297 - totalGridH) / 2; // 5.5 mm (margin atas-bawah simetris)

  // ================= HALAMAN 1: 10 KARTU DEPAN =================
  for (let slot = 0; slot < 10; slot++) {
    const col = slot % 2;
    const row = Math.floor(slot / 2);
    const x = startX + col * (cardW + colGap);
    const y = startY + row * (cardH + rowGap);

    const cardItem = cardList[slot];
    let imgToDraw = cardItem ? cardItem.frontImage : defaultFrontImg;

    if (imgToDraw) {
      pdf.addImage(imgToDraw, 'PNG', x, y, cardW, cardH, undefined, 'FAST');
      drawCropMarks(pdf, x, y, cardW, cardH);
    } else {
      // Slot kosong dengan garis putus-putus
      pdf.setDrawColor(203, 213, 225);
      pdf.setLineDashPattern([2, 2], 0);
      pdf.rect(x, y, cardW, cardH);
      pdf.setLineDashPattern([], 0);
      pdf.setFont('helvetica', 'italic');
      pdf.setFontSize(8);
      pdf.setTextColor(148, 163, 184);
      pdf.text(`Slot #${slot + 1} (Kosong)`, x + cardW / 2, y + cardH / 2, { align: 'center' });
    }
  }

  // ================= HALAMAN 2: 10 KARTU BELAKANG (UNTUK DUPLEX / BOLAK-BALIK) =================
  if (includeBackPage && defaultBackImg) {
    pdf.addPage('a4', 'portrait');

    for (let slot = 0; slot < 10; slot++) {
      const originalCol = slot % 2;
      // Kolom dibalik (0 -> 1, 1 -> 0) agar tepat simetris saat dicetak bolak-balik (duplex print)
      const flippedCol = 1 - originalCol;
      const row = Math.floor(slot / 2);
      const x = startX + flippedCol * (cardW + colGap);
      const y = startY + row * (cardH + rowGap);

      const cardItem = cardList[slot];
      const imgToDraw = cardItem && cardItem.backImage ? cardItem.backImage : defaultBackImg;

      pdf.addImage(imgToDraw, 'PNG', x, y, cardW, cardH, undefined, 'FAST');
      drawCropMarks(pdf, x, y, cardW, cardH);
    }
  }

  pdf.save(filename);
}

// 4. Export A4 Sheet PDF (Single Front & Back with Cutting Guides)
export async function exportA4SheetPdf({
  frontElement,
  backElement,
  personName = 'Karyawan',
  filename = 'ID_Card_Print_Sheet_A4.pdf',
}) {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4', // 210 x 297 mm
  });

  // Header Dokumen
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(14);
  pdf.setTextColor(15, 23, 42);
  pdf.text('LEMBAR CETAK ID CARD RESMI - THE GESIT COMPANIES', 15, 18);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.setTextColor(100, 116, 139);
  const printDate = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  pdf.text(`Nama: ${personName.toUpperCase()}  |  Dicetak: ${printDate}`, 15, 25);
  pdf.text('Standar Kartu: CR80 (54 x 85.6 mm). Cetak pada skala 100% (Actual Size).', 15, 30);

  // Garis Pembatas Header
  pdf.setDrawColor(226, 232, 240);
  pdf.setLineWidth(0.5);
  pdf.line(15, 34, 195, 34);

  const cardW = 54;
  const cardH = 85.6;
  const startY = 46;

  // Render Front Card
  if (frontElement) {
    const frontCanvas = await captureElementToCanvas(frontElement, 3.5);
    const frontImg = frontCanvas.toDataURL('image/png', 1.0);
    const posX = 38;

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);
    pdf.setTextColor(30, 41, 59);
    pdf.text('TAMPAK DEPAN (FRONT)', posX, startY - 4);

    pdf.addImage(frontImg, 'PNG', posX, startY, cardW, cardH, undefined, 'FAST');
    drawCropMarks(pdf, posX, startY, cardW, cardH);
  }

  // Render Back Card
  if (backElement) {
    const backCanvas = await captureElementToCanvas(backElement, 3.5);
    const backImg = backCanvas.toDataURL('image/png', 1.0);
    const posX = 118;

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);
    pdf.setTextColor(30, 41, 59);
    pdf.text('TAMPAK BELAKANG (BACK)', posX, startY - 4);

    pdf.addImage(backImg, 'PNG', posX, startY, cardW, cardH, undefined, 'FAST');
    drawCropMarks(pdf, posX, startY, cardW, cardH);
  }

  // Petunjuk Pemotongan di Bawah
  const guideY = startY + cardH + 18;
  pdf.setDrawColor(241, 245, 249);
  pdf.setFillColor(248, 250, 252);
  pdf.roundedRect(15, guideY, 180, 28, 3, 3, 'FD');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  pdf.setTextColor(30, 41, 59);
  pdf.text('PETUNJUK CETAK & PEMOTONGAN:', 20, guideY + 8);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8.5);
  pdf.setTextColor(71, 85, 105);
  pdf.text('1. Pastikan pengaturan printer disetel ke "Actual Size" atau "Skala 100%" (bukan Fit to Page).', 20, guideY + 14);
  pdf.text('2. Gunakan kertas PVC Card Printable atau kertas Art Paper / Glossy Photo Paper 260-310 gsm.', 20, guideY + 19);
  pdf.text('3. Potong kartu mengikuti tanda garis potong (Crop Marks) sudut di sekeliling kartu.', 20, guideY + 24);

  pdf.save(filename);
}

// Helper: Menggambar Crop Marks (Garis potong sudut percetakan)
function drawCropMarks(pdf, x, y, w, h) {
  const markLen = 3.5; // panjang garis 3.5mm
  const offset = 1.5; // jarak 1.5mm dari tepi kartu

  pdf.setDrawColor(148, 163, 184); // warna slate abu-abu
  pdf.setLineWidth(0.2);

  // Kiri Atas
  pdf.line(x - offset - markLen, y, x - offset, y);
  pdf.line(x, y - offset - markLen, x, y - offset);

  // Kanan Atas
  pdf.line(x + w + offset, y, x + w + offset + markLen, y);
  pdf.line(x + w, y - offset - markLen, x + w, y - offset);

  // Kiri Bawah
  pdf.line(x - offset - markLen, y + h, x - offset, y + h);
  pdf.line(x, y + h + offset, x, y + h + offset + markLen);

  // Kanan Bawah
  pdf.line(x + w + offset, y + h, x + w + offset + markLen, y + h);
  pdf.line(x + w, y + h + offset, x + w, y + h + offset + markLen);
}
