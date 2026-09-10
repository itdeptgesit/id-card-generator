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
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
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
    <Card className="border-border/80 bg-card/95 shadow-md relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-4 left-4 right-4 z-10 flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-sm font-bold text-amber-500 uppercase tracking-wide">
            <FileSpreadsheet className="w-4 h-4 text-amber-500" />
            <span>Antrean Cetak Lembar A4 (10 ID Card)</span>
          </CardTitle>

          <div className="flex items-center gap-2">
            <Badge variant="amber" className="font-mono text-xs px-2 py-1">
              {batchList.length}/10 Terisi
            </Badge>
            {batchList.length > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                className="h-7 text-xs gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10"
                title="Kosongkan Antrean"
              >
                <Trash2 className="w-3.5 h-3.5" /> Reset
              </Button>
            )}
          </div>
        </div>
        <p className="text-[11px] text-muted-foreground mt-1">
          Simpan beberapa kartu karyawan untuk dicetak sekaligus dalam 1 lembar A4 (2 kolom × 5 baris).
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Visual Slot Grid (10 Slots) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {Array.from({ length: 10 }).map((_, idx) => {
            const card = batchList[idx];
            return (
              <div
                key={idx}
                className={cn(
                  'rounded-lg p-2 min-h-[72px] flex flex-col justify-center relative transition-all',
                  card
                    ? 'border border-cyan-500/30 bg-background/60 shadow-sm'
                    : 'border border-dashed border-border bg-background/30 text-center'
                )}
              >
                {card ? (
                  <div className="flex items-center gap-2 relative">
                    <div className="absolute -top-1 -left-1 bg-amber-500 text-slate-950 text-[9px] font-bold px-1.5 py-0.5 rounded">
                      #{idx + 1}
                    </div>
                    <img
                      src={card.frontImage}
                      alt={card.name}
                      className="w-11 h-7 object-cover rounded border border-border/60 bg-white flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] font-bold text-foreground truncate">{card.name}</div>
                      <div className="text-[10px] text-amber-400 font-semibold truncate">{card.department}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveCard(card.id)}
                      className="flex-shrink-0 p-1 rounded bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500 hover:text-white transition-colors"
                      title="Hapus kartu ini dari slot"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-[11px] font-bold text-muted-foreground font-mono">#{idx + 1}</span>
                    <span className="text-[10px] text-muted-foreground/60">Slot Kosong</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <Separator className="bg-border/60" />

        {/* Action Buttons Toolbar */}
        <div className="flex items-center justify-between flex-wrap gap-2.5">
          {/* Tombol Save & Next */}
          <Button
            type="button"
            variant="amber"
            onClick={handleSaveAndNext}
            disabled={isCapturing || batchList.length >= 10}
            className="flex-1 min-w-[200px] gap-2 text-sm h-10"
            title="Simpan kartu saat ini ke antrean dan kosongkan form untuk membuat ID card berikutnya"
          >
            {isCapturing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Menyimpan Kartu...</span>
              </>
            ) : (
              <>
                <PlusCircle className="w-4 h-4" />
                <span>Simpan &amp; Buat ID Lain (Next)</span>
              </>
            )}
          </Button>

          {/* Tombol Duplikasi jika slot belum penuh */}
          {batchList.length > 0 && batchList.length < 10 && (
            <Button
              type="button"
              variant="outline"
              onClick={handleFillRemainingSlots}
              className="gap-2 text-xs h-10 border-border hover:border-cyan-500/40"
              title="Otomatis gandakan kartu yang ada untuk memenuhi seluruh 10 slot lembar A4"
            >
              <Copy className="w-4 h-4 text-cyan-400" />
              <span>Penuhi 10 Slot ({10 - batchList.length} lagi)</span>
            </Button>
          )}

          {/* Tombol Ekspor PDF Lembar A4 (10 Kartu) */}
          <Button
            type="button"
            variant="emerald"
            onClick={handleExportA4Batch}
            disabled={isExportingPdf || (batchList.length === 0 && !frontRef.current)}
            className="gap-2 text-xs h-10"
            title="Cetak/Export PDF Lembar A4 berisi 10 ID card lengkap dengan garis potong (Crop Marks)"
          >
            {isExportingPdf ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Menyiapkan Lembar A4...</span>
              </>
            ) : (
              <>
                <Printer className="w-4 h-4" />
                <span>Cetak Lembar A4 (10 ID Card)</span>
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

