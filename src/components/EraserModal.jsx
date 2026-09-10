import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Eraser, RotateCcw, Undo2, Check, X } from 'lucide-react';

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
    <div className="modal-overlay">
      <div className="modal-content">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Eraser className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-white text-base">Sikat Manual (Hapus & Pulihkan)</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Instructions */}
        <p className="text-xs text-slate-400 mt-2 text-left">
          Pilih <strong>Mode Hapus</strong> untuk membersihkan sisa background, atau <strong>Mode Pulihkan</strong> untuk mengembalikan bagian baju/rambut yang terpotong. Sentuh/geser kursor pada kanvas.
        </p>

        {/* Mode Buttons & Undo */}
        <div className="flex items-center justify-between gap-2 mt-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setBrushMode('erase')}
              className={`btn-brush-mode ${brushMode === 'erase' ? 'active-erase' : ''}`}
            >
              <Eraser className="w-3.5 h-3.5" />
              <span>Mode Hapus</span>
            </button>
            <button
              type="button"
              onClick={() => setBrushMode('restore')}
              className={`btn-brush-mode ${brushMode === 'restore' ? 'active-restore' : ''}`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Mode Pulihkan</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleUndo}
            disabled={historyStack.length <= 1}
            className="btn-undo"
            title="Urungkan goresan sikat terakhir"
          >
            <Undo2 className="w-4 h-4" />
            <span className="hide-mobile">Undo</span>
          </button>
        </div>

        {/* Canvas Area */}
        <div className="canvas-viewport mt-3">
          <canvas
            ref={canvasRef}
            className="eraser-canvas"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            style={{ touchAction: 'none' }}
          />
        </div>

        {/* Brush Sliders */}
        <div className="grid grid-cols-2 gap-3 mt-3 text-left">
          <div className="slider-group">
            <div className="slider-header">
              <span>Ukuran Sikat</span>
              <span className="slider-val">{brushSize}px</span>
            </div>
            <input
              type="range"
              min="4"
              max="90"
              value={brushSize}
              onChange={(e) => setBrushSize(Number(e.target.value))}
              className="slider-range"
            />
          </div>

          <div className="slider-group">
            <div className="slider-header">
              <span>Kehalusan Tepi (Blur)</span>
              <span className="slider-val">{brushBlur}px</span>
            </div>
            <input
              type="range"
              min="0"
              max="15"
              value={brushBlur}
              onChange={(e) => setBrushBlur(Number(e.target.value))}
              className="slider-range"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2.5 mt-4 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary py-2 px-4"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSaveResult}
            className="btn-primary py-2 px-5"
          >
            <Check className="w-4 h-4" /> Gunakan Hasil
          </button>
        </div>
      </div>
    </div>
  );
}
