import React, { useState, useRef } from 'react';
import {
  Sparkles, Wand2, Sun, Eraser, Loader2,
  Image as ImageIcon, RotateCcw, CheckCircle2, AlertCircle,
} from 'lucide-react';
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
  const [aiState, setAiState] = useState('idle'); // idle | loading | done | error
  const [aiProgress, setAiProgress] = useState(0);
  const [aiStage, setAiStage] = useState('');
  const [tolerance, setTolerance] = useState(40);
  const bgInputRef = useRef(null);

  // ── 1. AI Background Removal (imgly ONNX — 100% gratis, no API key) ──
  const handleRemoveAI = async () => {
    if (!currentPhotoSrc) return;
    setAiState('loading');
    setAiProgress(0);
    setAiStage('Memuat model AI...');

    try {
      const src = originalPhotoSrc || currentPhotoSrc;

      const resultDataUrl = await segmentPortraitAI(src, (progress) => {
        setAiProgress(Math.round(progress * 100));
        if (progress < 0.3) setAiStage('Memuat model AI...');
        else if (progress < 0.7) setAiStage('Menganalisis foto...');
        else setAiStage('Memfinalisasi hasil...');
      });

      onPhotoProcessed(resultDataUrl);
      setAiState('done');
      setTimeout(() => setAiState('idle'), 3000);
    } catch (err) {
      console.error('AI removal error:', err);
      setAiState('error');
      setTimeout(() => setAiState('idle'), 4000);
    }
  };

  // ── 2. Smart Color Removal ──
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
      console.error('Color removal error:', err);
      alert('Gagal memproses warna latar belakang.');
    }
  };

  // ── 3. Custom Card Background Upload ──
  const handleBgUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => onCustomBgChange(event.target.result);
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const isLoading = aiState === 'loading';

  return (
    <Card className="border-border bg-card shadow-sm rounded-2xl">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-foreground uppercase tracking-wide flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-muted-foreground" />
          <span>Hapus Latar Belakang</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">

        {/* ── AI One-Click Remover ── */}
        <div className="rounded-xl border border-border bg-secondary/30 p-3 space-y-3">

          {/* Button */}
          <Button
            type="button"
            onClick={handleRemoveAI}
            disabled={isLoading || !currentPhotoSrc}
            className={cn(
              'w-full gap-2 text-xs h-9 font-semibold shadow-sm rounded-xl transition-all',
              aiState === 'done'
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : aiState === 'error'
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-foreground text-background hover:bg-foreground/90',
            )}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{aiStage}</span>
              </>
            ) : aiState === 'done' ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Selesai! Background Berhasil Dihapus</span>
              </>
            ) : aiState === 'error' ? (
              <>
                <AlertCircle className="w-4 h-4" />
                <span>Gagal — Coba Lagi</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Hapus Background Otomatis (AI)</span>
              </>
            )}
          </Button>

          {/* Progress Bar */}
          {isLoading && (
            <div className="space-y-1">
              <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-foreground rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${aiProgress}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>Model AI ONNX · Berjalan di browser</span>
                <span className="font-mono">{aiProgress}%</span>
              </div>
            </div>
          )}

          {/* Info */}
          {!isLoading && aiState === 'idle' && (
            <p className="text-[11px] text-muted-foreground text-center">
              Gratis · Tanpa API key · AI berjalan di browser Anda
            </p>
          )}
        </div>

        {/* ── Smart Color Tools ── */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleRemoveColor('auto')}
            disabled={isLoading}
            className="text-xs gap-1.5 h-8 border-border hover:bg-secondary rounded-xl"
            title="Otomatis deteksi warna dominan di sudut latar foto"
          >
            <Wand2 className="w-3.5 h-3.5 text-muted-foreground" />
            <span>Hapus Warna Latar</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleRemoveColor('white')}
            disabled={isLoading}
            className="text-xs gap-1.5 h-8 border-border hover:bg-secondary rounded-xl"
            title="Hapus latar belakang putih"
          >
            <Sun className="w-3.5 h-3.5 text-muted-foreground" />
            <span>Hapus Latar Putih</span>
          </Button>
        </div>

        {/* ── Tolerance Slider ── */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="font-medium text-foreground/90">Toleransi Warna</span>
            <span className="font-mono text-muted-foreground">{tolerance}</span>
          </div>
          <input
            type="range"
            min="10"
            max="110"
            value={tolerance}
            onChange={(e) => setTolerance(Number(e.target.value))}
            disabled={isLoading}
            className="w-full accent-foreground cursor-pointer h-1.5 bg-secondary rounded-lg appearance-none disabled:opacity-50"
          />
        </div>

        {/* ── Manual Eraser ── */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onOpenEraser}
          disabled={isLoading}
          className="w-full gap-2 text-xs h-8 border-border hover:bg-secondary justify-center rounded-xl"
        >
          <Eraser className="w-3.5 h-3.5 text-muted-foreground" />
          <span>Sikat Manual (Hapus &amp; Pulihkan Bagian Foto)</span>
        </Button>

        <Separator className="bg-border/60" />

        {/* ── Custom Template Background ── */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-foreground/90 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-muted-foreground" />
              Template Background
            </span>
            {customBgUrl && (
              <button
                type="button"
                onClick={() => onCustomBgChange(null)}
                className="text-[11px] text-muted-foreground hover:text-foreground hover:underline flex items-center gap-1 transition-colors"
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
