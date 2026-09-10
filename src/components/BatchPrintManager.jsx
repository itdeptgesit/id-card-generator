import React, { useState } from 'react';
import {
  Layers,
  PlusCircle,
  Printer,
  Trash2,
  Copy,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Loader2,
} from 'lucide-react';
import {
  captureElementToCanvas,
  rotateCanvas90Deg,
  exportA4BatchTenCardsPdf,
} from '../utils/exportPdf';

export default function BatchPrintManager({
  frontRef,
  backRef,
  cardData,
  photoConfig,
  onResetForNextCard,
  batchList,
  setBatchList,
}) {
  const [isCapturing, setIsCapturing] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 1. Simpan Kartu Saat Ini ke Slot Antrean & Reset untuk Buat Kartu Berikutnya
  const handleSaveAndNext = async () => {
    if (!frontRef.current) return;
    if (batchList.length >= 10) {
      alert('Antrean lembar A4 sudah penuh (10/10 kartu). Silakan cetak lembar A4 atau hapus slot yang tidak diperlukan.');
      return;
    }

    setIsCapturing(true);
    try {
      // Tangkap gambar tampak depan saat ini
      const fCanvas = await captureElementToCanvas(frontRef.current, 3.5);
      const rFrontCanvas = rotateCanvas90Deg(fCanvas);
      const frontImgData = rFrontCanvas.toDataURL('image/png', 1.0);

      // Tangkap gambar tampak belakang
      let backImgData = null;
      if (backRef.current) {
        const bCanvas = await captureElementToCanvas(backRef.current, 3.5);
        const rBackCanvas = rotateCanvas90Deg(bCanvas);
        backImgData = rBackCanvas.toDataURL('image/png', 1.0);
      }

      const newCardItem = {
        id: Date.now() + Math.random().toString(36).substr(2, 5),
        name: cardData.name || 'NAMA LENGKAP',
        department: cardData.department || 'DIVISI',
        frontImage: frontImgData,
        backImage: backImgData,
        createdAt: new Date().toLocaleTimeString('id-ID'),
      };

      setBatchList((prev) => [...prev, newCardItem]);
      showToast(`Kartu "${newCardItem.name}" tersimpan ke Slot #${batchList.length + 1}! Form siap untuk kartu berikutnya.`);

      // Reset form untuk membuat kartu berikutnya
      onResetForNextCard();
    } catch (err) {
      console.error('Gagal menyimpan kartu ke antrean:', err);
      alert('Terjadi kesalahan saat menyimpan kartu.');
    } finally {
      setIsCapturing(false);
    }
  };

  // 2. Duplikasi Kartu untuk Memenuhi 10 Slot
  const handleFillRemainingSlots = () => {
    if (batchList.length === 0) {
      alert('Belum ada kartu di antrean. Simpan minimal 1 kartu terlebih dahulu.');
      return;
    }
    const needed = 10 - batchList.length;
    if (needed <= 0) return;

    const fillItems = [];
    for (let i = 0; i < needed; i++) {
      const sourceItem = batchList[i % batchList.length];
      fillItems.push({
        ...sourceItem,
        id: Date.now() + Math.random().toString(36).substr(2, 5),
      });
    }

    setBatchList((prev) => [...prev, ...fillItems]);
    showToast(`Berhasil memenuhi 10 slot kartu untuk lembar cetak A4!`);
  };

  // 3. Hapus 1 Kartu dari Slot
  const handleRemoveCard = (id) => {
    setBatchList((prev) => prev.filter((item) => item.id !== id));
  };

  // 4. Reset Semua Antrean
  const handleClearAll = () => {
    if (window.confirm('Yakin ingin mengosongkan seluruh antrean cetak 10 kartu?')) {
      setBatchList([]);
    }
  };

  // 5. Ekspor PDF Lembar A4 (10 Kartu per Lembar)
  const handleExportA4Batch = async () => {
    setIsExportingPdf(true);
    try {
      await exportA4BatchTenCardsPdf({
        cardList: batchList,
        defaultFrontElement: frontRef.current,
        defaultBackElement: backRef.current,
        includeBackPage: true,
        filename: `LEMBAR_CETAK_A4_10_ID_CARD_${Date.now()}.pdf`,
      });
      showToast('PDF Lembar A4 (10 Kartu) berhasil diunduh!');
    } catch (err) {
      console.error('Gagal export PDF A4 10 kartu:', err);
      alert('Gagal mengekspor PDF lembar A4.');
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div className="panel batch-panel">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="toast-banner">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Panel */}
      <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-amber-500" />
          <div>
            <h3 className="font-bold text-white text-sm">
              Antrean Cetak Lembar A4 (10 ID Card)
            </h3>
            <p className="text-[11px] text-slate-400">
              Simpan beberapa kartu karyawan untuk dicetak sekaligus dalam 1 lembar A4 (2 kolom × 5 baris).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="badge-counter">
            {batchList.length}/10 Terisi
          </span>
          {batchList.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
              title="Kosongkan Antrean"
            >
              <Trash2 className="w-3.5 h-3.5" /> Reset
            </button>
          )}
        </div>
      </div>

      {/* Visual Slot Grid (10 Slots) */}
      <div className="batch-grid">
        {Array.from({ length: 10 }).map((_, idx) => {
          const card = batchList[idx];
          return (
            <div
              key={idx}
              className={`batch-slot-box ${card ? 'filled' : 'empty'}`}
            >
              {card ? (
                <div className="slot-content">
                  <div className="slot-badge">#{idx + 1}</div>
                  <img
                    src={card.frontImage}
                    alt={card.name}
                    className="slot-thumbnail"
                  />
                  <div className="slot-info">
                    <div className="slot-name">{card.name}</div>
                    <div className="slot-dept">{card.department}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveCard(card.id)}
                    className="btn-slot-delete"
                    title="Hapus kartu ini dari slot"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="slot-placeholder">
                  <span className="slot-empty-num">#{idx + 1}</span>
                  <span className="slot-empty-text">Slot Kosong</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Action Buttons Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-2.5 mt-4 pt-3 border-t border-slate-800">
        {/* Tombol Save & Next */}
        <button
          type="button"
          onClick={handleSaveAndNext}
          disabled={isCapturing || batchList.length >= 10}
          className="btn-primary flex-1 min-w-[200px]"
          title="Simpan kartu saat ini ke antrean dan kosongkan form untuk membuat ID card berikutnya"
        >
          {isCapturing ? (
            <>
              <Loader2 className="w-4 h-4 spin-icon text-slate-900" />
              <span>Menyimpan Kartu...</span>
            </>
          ) : (
            <>
              <PlusCircle className="w-4 h-4" />
              <span>Simpan &amp; Buat ID Lain (Next)</span>
            </>
          )}
        </button>

        {/* Tombol Duplikasi jika slot belum penuh */}
        {batchList.length > 0 && batchList.length < 10 && (
          <button
            type="button"
            onClick={handleFillRemainingSlots}
            className="btn-secondary"
            title="Otomatis gandakan kartu yang ada untuk memenuhi seluruh 10 slot lembar A4"
          >
            <Copy className="w-4 h-4 text-cyan-400" />
            <span>Penuhi 10 Slot ({10 - batchList.length} lagi)</span>
          </button>
        )}

        {/* Tombol Ekspor PDF Lembar A4 (10 Kartu) */}
        <button
          type="button"
          onClick={handleExportA4Batch}
          disabled={isExportingPdf || (batchList.length === 0 && !frontRef.current)}
          className="btn-batch-print"
          title="Cetak/Export PDF Lembar A4 berisi 10 ID card lengkap dengan garis potong (Crop Marks)"
        >
          {isExportingPdf ? (
            <>
              <Loader2 className="w-4 h-4 spin-icon text-white" />
              <span>Menyiapkan Lembar A4...</span>
            </>
          ) : (
            <>
              <Printer className="w-4 h-4 text-amber-300" />
              <span>Cetak Lembar A4 (10 ID Card)</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
