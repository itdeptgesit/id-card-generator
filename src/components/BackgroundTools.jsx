import React, { useState, useRef } from 'react';
import { Sparkles, Wand2, Sun, Eraser, Loader2, Image as ImageIcon, RotateCcw } from 'lucide-react';
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
    <div className="panel">
      <div className="panel-title">
        <Sparkles className="w-4 h-4 text-cyan-400" />
        <span>Pemotong & Penghapus Latar Belakang</span>
      </div>

      {/* AI One-Click Remover */}
      <div className="ai-box">
        <button
          type="button"
          onClick={handleRemoveAI}
          disabled={isProcessingAI || !currentPhotoSrc}
          className="btn-ai"
        >
          {isProcessingAI ? (
            <>
              <Loader2 className="w-4 h-4 spin-icon text-cyan-300" />
              <span>Memproses Segmentasi AI Potret...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-cyan-300" />
              <span>Hapus Latar AI Otomatis (Presisi)</span>
            </>
          )}
        </button>
        <p className="text-[11px] text-slate-400 text-center mt-1.5">
          Model AI memisahkan rambut, wajah & pakaian secara akurat tanpa merusak objek.
        </p>
      </div>

      {/* Smart Color Detect Tools */}
      <div className="grid grid-cols-2 gap-2 mt-3">
        <button
          type="button"
          onClick={() => handleRemoveColor('auto')}
          className="btn-tool"
          title="Otomatis deteksi warna dominan di sudut latar foto"
        >
          <Wand2 className="w-3.5 h-3.5 text-amber-400" />
          <span>Hapus Warna Latar</span>
        </button>

        <button
          type="button"
          onClick={() => handleRemoveColor('white')}
          className="btn-tool"
          title="Hapus latar belakang putih atau terang"
        >
          <Sun className="w-3.5 h-3.5 text-amber-400" />
          <span>Hapus Latar Putih</span>
        </button>
      </div>

      {/* Tolerance Slider */}
      <div className="slider-group mt-2">
        <div className="slider-header">
          <span>Toleransi Warna Latar</span>
          <span className="slider-val">{tolerance}</span>
        </div>
        <input
          type="range"
          min="10"
          max="110"
          value={tolerance}
          onChange={(e) => setTolerance(Number(e.target.value))}
          className="slider-range"
        />
      </div>

      {/* Manual Eraser / Restore Brush Button */}
      <div className="mt-3">
        <button
          type="button"
          onClick={onOpenEraser}
          className="btn-tool w-full justify-center"
        >
          <Eraser className="w-4 h-4 text-amber-400" />
          <span>Sikat Manual (Hapus & Pulihkan Bagian Foto)</span>
        </button>
      </div>

      {/* Custom Template Background Uploader */}
      <div className="mt-3 pt-3 border-t border-slate-800">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-300 font-medium flex items-center gap-1.5">
            <ImageIcon className="w-3.5 h-3.5 text-slate-400" /> Template Background
          </span>
          {customBgUrl && (
            <button
              type="button"
              onClick={() => onCustomBgChange(null)}
              className="text-[11px] text-amber-400 hover:underline flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> Standar Gesit
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={() => bgInputRef.current?.click()}
          className="btn-outline-small w-full mt-1.5"
        >
          {customBgUrl ? 'Ganti Template Background Custom' : 'Upload Template Kartu Sendiri (Opsional)'}
        </button>
        <input
          ref={bgInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleBgUpload}
        />
      </div>
    </div>
  );
}
