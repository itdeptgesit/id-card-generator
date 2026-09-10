import React, { useState, useRef } from 'react';
import { Sparkles, Wand2, Sun, Eraser, Loader2, Image as ImageIcon, RotateCcw } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { segmentPortraitAI, removeColorBackground } from '../utils/aiSegmentation';

export default function BackgroundTools({
  currentPhotoSrc,
  originalPhotoSrc,
  onPhotoProcessed,
  onOpenEraser,
  customBgUrl,
  onCustomBgChange,
}) {
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [tolerance, setTolerance] = useState(40);
  const bgInputRef = useRef(null);

  // 1. AI Background Removal
  const handleRemoveAI = async () => {
    if (!currentPhotoSrc) return;
    setIsProcessingAI(true);
    try {
      const resultDataUrl = await segmentPortraitAI(originalPhotoSrc || currentPhotoSrc);
      onPhotoProcessed(resultDataUrl);
    } catch (err) {
      console.warn('AI Segmentation error, trying smart color fallback:', err);
      alert('Model AI sedang memuat atau memerlukan koneksi. Mencoba metode deteksi warna otomatis...');
      handleRemoveColor('auto');
    } finally {
      setIsProcessingAI(false);
    }
  };

  // 2. Smart Color Background Removal
  const handleRemoveColor = async (mode) => {
    if (!currentPhotoSrc) return;
    try {
      const resultDataUrl = await removeColorBackground(
        originalPhotoSrc || currentPhotoSrc,
        mode,
        tolerance
      );
      onPhotoProcessed(resultDataUrl);
    } catch (err) {
      console.error('Error color removal:', err);
      alert('Gagal memproses warna latar belakang.');
    }
  };

  // 3. Custom Card Background Template Upload
  const handleBgUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      onCustomBgChange(event.target.result);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <Card className="border-border/80 bg-card/95 shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-bold text-cyan-400 uppercase tracking-wide">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>Pemotong &amp; Penghapus Latar Belakang</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* AI One-Click Remover */}
        <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-3 space-y-2">
          <Button
            type="button"
            onClick={handleRemoveAI}
            disabled={isProcessingAI || !currentPhotoSrc}
            variant="cyan"
            className="w-full gap-2 text-xs h-9"
          >
            {isProcessingAI ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Memproses Segmentasi AI Potret...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Hapus Latar AI Otomatis (Presisi)</span>
              </>
            )}
          </Button>
          <p className="text-[11px] text-muted-foreground text-center">
            Model AI memisahkan rambut, wajah &amp; pakaian secara akurat tanpa merusak objek.
          </p>
        </div>

        {/* Smart Color Detect Tools */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleRemoveColor('auto')}
            className="text-xs gap-1.5 h-8 border-border hover:border-amber-500/40"
            title="Otomatis deteksi warna dominan di sudut latar foto"
          >
            <Wand2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Hapus Warna Latar</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleRemoveColor('white')}
            className="text-xs gap-1.5 h-8 border-border hover:border-amber-500/40"
            title="Hapus latar belakang putih atau terang"
          >
            <Sun className="w-3.5 h-3.5 text-amber-400" />
            <span>Hapus Latar Putih</span>
          </Button>
        </div>

        {/* Tolerance Slider */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-foreground/90">Toleransi Warna Latar</span>
            <span className="font-mono text-amber-400 font-semibold">{tolerance}</span>
          </div>
          <input
            type="range"
            min="10"
            max="110"
            value={tolerance}
            onChange={(e) => setTolerance(Number(e.target.value))}
            className="w-full accent-amber-500 cursor-pointer h-1.5 bg-muted rounded-lg appearance-none"
          />
        </div>

        {/* Manual Eraser / Restore Brush Button */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onOpenEraser}
          className="w-full gap-2 text-xs h-8 border-border hover:border-amber-500/40 justify-center"
        >
          <Eraser className="w-3.5 h-3.5 text-amber-400" />
          <span>Sikat Manual (Hapus &amp; Pulihkan Bagian Foto)</span>
        </Button>

        <Separator className="bg-border/60" />

        {/* Custom Template Background Uploader */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground/90 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-muted-foreground" /> Template Background
            </span>
            {customBgUrl && (
              <button
                type="button"
                onClick={() => onCustomBgChange(null)}
                className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
              >
                <RotateCcw className="w-3 h-3" /> Standar Gesit
              </button>
            )}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => bgInputRef.current?.click()}
            className="w-full text-xs h-8 border-dashed border-border hover:border-border/80 text-muted-foreground hover:text-foreground"
          >
            {customBgUrl ? 'Ganti Template Background Custom' : 'Upload Template Kartu Sendiri (Opsional)'}
          </Button>
          <input
            ref={bgInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleBgUpload}
          />
        </div>
      </CardContent>
    </Card>
  );
}
