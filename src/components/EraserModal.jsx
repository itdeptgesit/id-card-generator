import React, { useRef, useEffect, useState } from 'react';
import { Eraser, RotateCcw, Undo2, Check, X, Sliders } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function EraserModal({
  isOpen,
  onClose,
  currentPhotoSrc,
  originalPhotoSrc,
  onSave,
}) {
  const canvasRef = useRef(null);
  const origCanvasRef = useRef(null);
  const isDrawingRef = useRef(false);

  const [brushMode, setBrushMode] = useState('erase'); // 'erase' | 'restore'
  const [brushSize, setBrushSize] = useState(24);
  const [brushBlur, setBrushBlur] = useState(2);
  const [historyStack, setHistoryStack] = useState([]);

  // Inisialisasi Canvas saat modal dibuka
  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const origCanvas = document.createElement('canvas');
    origCanvasRef.current = origCanvas;
    const origCtx = origCanvas.getContext('2d');

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const w = img.naturalWidth || img.width || 500;
      const h = img.naturalHeight || img.height || 600;

      canvas.width = w;
      canvas.height = h;
      origCanvas.width = w;
      origCanvas.height = h;

      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0, w, h);

      // Simpan snapshot awal ke history
      const initialData = ctx.getImageData(0, 0, w, h);
      setHistoryStack([initialData]);

      // Muat gambar asli untuk restore brush
      const origImg = new Image();
      origImg.crossOrigin = 'anonymous';
      origImg.onload = () => {
        origCtx.drawImage(origImg, 0, 0, w, h);
      };
      origImg.src = originalPhotoSrc || currentPhotoSrc;
    };
    img.src = currentPhotoSrc;
  }, [isOpen, currentPhotoSrc, originalPhotoSrc]);

  // Pointer event handlers (mouse and touch unified)
  const getCanvasCoords = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const drawStroke = (coords) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    ctx.save();
    if (brushBlur > 0) {
      ctx.filter = `blur(${brushBlur}px)`;
    }

    if (brushMode === 'erase') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(coords.x, coords.y, brushSize, 0, Math.PI * 2, false);
      ctx.fill();
    } else if (origCanvasRef.current) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(coords.x, coords.y, brushSize, 0, Math.PI * 2, false);
      ctx.clip();
      ctx.globalCompositeOperation = 'source-over';
      ctx.drawImage(origCanvasRef.current, 0, 0);
      ctx.restore();
    }

    ctx.restore();
  };

  const handlePointerDown = (e) => {
    e.preventDefault();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch (err) {}
    isDrawingRef.current = true;
    const coords = getCanvasCoords(e);
    drawStroke(coords);
  };

  const handlePointerMove = (e) => {
    if (!isDrawingRef.current) return;
    e.preventDefault();
    const coords = getCanvasCoords(e);
    drawStroke(coords);
  };

  const handlePointerUp = (e) => {
    if (isDrawingRef.current) {
      isDrawingRef.current = false;
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch (err) {}

      // Simpan snapshot ke history
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        const snap = ctx.getImageData(0, 0, canvas.width, canvas.height);
        setHistoryStack((prev) => [...prev.slice(-15), snap]);
      }
    }
  };

  // Undo Action
  const handleUndo = () => {
    if (historyStack.length <= 1) return;
    const newStack = [...historyStack];
    newStack.pop(); // buang state terkini
    const previousState = newStack[newStack.length - 1];

    const canvas = canvasRef.current;
    if (canvas && previousState) {
      const ctx = canvas.getContext('2d');
      ctx.putImageData(previousState, 0, 0);
      setHistoryStack(newStack);
    }
  };

  const handleSaveResult = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resultUrl = canvas.toDataURL('image/png');
    onSave(resultUrl);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-2 sm:p-4 animate-in fade-in">
      <div className="w-full max-w-xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] sm:max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-3 sm:px-6 py-3 sm:py-4 border-b border-border bg-secondary/30">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-secondary border border-border text-foreground flex items-center justify-center shrink-0">
              <Eraser className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-sm">Sikat Manual (Hapus &amp; Pulihkan)</h3>
              <p className="text-xs text-muted-foreground hidden sm:block">Sentuh atau usap kursor pada kanvas untuk mengedit</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0 rounded-lg"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Modal Body */}
        <div className="p-3 sm:p-6 overflow-y-auto flex flex-col gap-3 sm:gap-4">
          {/* Mode Buttons & Undo */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1 sm:gap-2 p-1 bg-secondary/40 rounded-xl border border-border/50">
              <Button
                type="button"
                size="sm"
                variant={brushMode === 'erase' ? 'default' : 'ghost'}
                onClick={() => setBrushMode('erase')}
                className={cn(
                  "gap-1.5 text-xs h-8 rounded-lg",
                  brushMode === 'erase' && "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm"
                )}
              >
                <Eraser className="w-3.5 h-3.5 shrink-0" />
                <span>Hapus</span>
              </Button>
              <Button
                type="button"
                size="sm"
                variant={brushMode === 'restore' ? 'default' : 'ghost'}
                onClick={() => setBrushMode('restore')}
                className={cn(
                  "gap-1.5 text-xs h-8 rounded-lg transition-all",
                  brushMode === 'restore' && "bg-white text-zinc-950 dark:bg-white dark:text-zinc-950 font-semibold shadow-sm"
                )}
              >
                <RotateCcw className="w-3.5 h-3.5 shrink-0" />
                <span>Pulihkan</span>
              </Button>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleUndo}
              disabled={historyStack.length <= 1}
              className="gap-1.5 text-xs h-8 text-muted-foreground hover:text-foreground shrink-0 rounded-lg"
              title="Urungkan goresan terakhir"
            >
              <Undo2 className="w-3.5 h-3.5" />
              <span>Undo</span>
            </Button>
          </div>

          {/* Canvas Area with Checkerboard Background */}
          <div className="relative rounded-xl border border-border overflow-hidden bg-zinc-950 flex items-center justify-center min-h-[200px] sm:min-h-[300px] max-h-[300px] sm:max-h-[420px]">
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: 'radial-gradient(circle, #555 10%, transparent 11%)',
                backgroundSize: '16px 16px',
              }}
            />
            <canvas
              ref={canvasRef}
              className="relative max-h-[280px] sm:max-h-[380px] max-w-full object-contain cursor-crosshair drop-shadow-md"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              style={{ touchAction: 'none' }}
            />
          </div>

          {/* Brush Sliders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 p-3 sm:p-3.5 rounded-xl bg-secondary/30 border border-border">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-muted-foreground">Ukuran Sikat</span>
                <span className="text-muted-foreground font-mono">{brushSize}px</span>
              </div>
              <input
                type="range"
                min="4"
                max="90"
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
                className="w-full accent-white h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-muted-foreground">Kehalusan Tepi (Blur)</span>
                <span className="text-muted-foreground font-mono">{brushBlur}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="15"
                value={brushBlur}
                onChange={(e) => setBrushBlur(Number(e.target.value))}
                className="w-full accent-white h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 px-3 sm:px-6 py-3 sm:py-4 border-t border-border bg-secondary/20">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="rounded-xl"
          >
            Batal
          </Button>
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={handleSaveResult}
            className="font-semibold gap-1.5 shadow-sm rounded-xl"
          >
            <Check className="w-4 h-4 shrink-0" /> Gunakan Hasil
          </Button>
        </div>
      </div>
    </div>
  );
}
