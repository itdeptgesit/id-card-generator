import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  RotateCw,
  FlipHorizontal,
  Maximize2,
  RotateCcw,
  Sun,
  Contrast,
  Move,
  Loader2,
} from 'lucide-react';
import { convertHeicToBlob } from '../utils/heicConverter';

export default function PhotoControls({
  photoConfig,
  onPhotoChange,
  onNewPhotoUploaded,
  onResetPhoto,
}) {
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [isConvertingHeic, setIsConvertingHeic] = useState(false);
  const fileInputRef = useRef(null);

  // File Upload Processor (Supports Drag & Drop and File Input)
  const processFile = async (file) => {
    if (!file) return;

    const fileName = file.name.toLowerCase();
    const fileType = (file.type || '').toLowerCase();
    const isHeic =
      fileName.endsWith('.heic') ||
      fileName.endsWith('.heif') ||
      fileType.includes('heic') ||
      fileType.includes('heif');

    try {
      if (isHeic) {
        setIsConvertingHeic(true);
        try {
          const blob = await convertHeicToBlob(file);
          const url = URL.createObjectURL(blob);
          onNewPhotoUploaded(url);
        } catch (err) {
          console.error('Gagal konversi HEIC:', err);
          alert('Format Apple HEIC tidak dapat didekode langsung oleh browser ini. Silakan gunakan format JPG/PNG atau screenshot foto tersebut.');
        } finally {
          setIsConvertingHeic(false);
        }
      } else {
        const reader = new FileReader();
        reader.onload = (e) => {
          onNewPhotoUploaded(e.target.result);
        };
        reader.onerror = () => {
          alert('Gagal membaca file gambar.');
        };
        reader.readAsDataURL(file);
      }
    } catch (e) {
      console.error('Upload error:', e);
      alert('Gagal mengunggah file foto.');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDraggingOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const file = e.dataTransfer.files && e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const handleInputChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) processFile(file);
    e.target.value = '';
  };

  const rotate90 = () => {
    const nextRot = (photoConfig.rotation + 90) % 360;
    onPhotoChange({ rotation: nextRot });
  };

  const toggleFlip = () => {
    onPhotoChange({ flipH: !photoConfig.flipH });
  };

  const centerPhoto = () => {
    onPhotoChange({ posX: 22, posY: 50 });
  };

  return (
    <div className="panel">
      <div className="panel-title">
        <UploadCloud className="w-4 h-4 text-amber-500" />
        <span>Upload & Pengaturan Foto Karyawan</span>
      </div>

      {/* Drag & Drop Upload Zone */}
      <div
        className={`upload-zone ${isDraggingOver ? 'drag-over' : ''}`}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.heic,.heif,image/heic,image/heif"
          className="hidden"
          onChange={handleInputChange}
        />
        <div className="upload-icon-circle">
          <UploadCloud className="w-6 h-6 text-amber-500" />
        </div>
        <div className="upload-title">Klik atau Seret Foto ke Sini</div>
        <div className="upload-desc">Mendukung JPG, PNG, WEBP & HEIC (iPhone)</div>
      </div>

      {/* HEIC Progress Banner */}
      {isConvertingHeic && (
        <div className="info-banner animate-pulse mt-3">
          <Loader2 className="w-4 h-4 spin-icon text-amber-400" />
          <span>Sedang mengonversi format foto Apple HEIC/HEIF...</span>
        </div>
      )}

      {/* Quick Transform Toolbar */}
      <div className="quick-tools-grid mt-3">
        <button
          type="button"
          onClick={rotate90}
          className="btn-quick-tool"
          title="Putar 90 Derajat"
        >
          <RotateCw className="w-3.5 h-3.5 text-amber-400" />
          <span>Putar 90°</span>
        </button>

        <button
          type="button"
          onClick={toggleFlip}
          className={`btn-quick-tool ${photoConfig.flipH ? 'active' : ''}`}
          title="Cermin / Balik Horizontal"
        >
          <FlipHorizontal className="w-3.5 h-3.5 text-cyan-400" />
          <span>Cermin (Flip)</span>
        </button>

        <button
          type="button"
          onClick={centerPhoto}
          className="btn-quick-tool"
          title="Kembalikan ke Posisi Tengah"
        >
          <Maximize2 className="w-3.5 h-3.5 text-slate-300" />
          <span>Ke Tengah</span>
        </button>
      </div>

      {/* Sliders: Zoom, X, Y, Rotasi */}
      <div className="slider-group mt-3">
        <div className="slider-header">
          <span>Zoom Ukuran Foto</span>
          <span className="slider-val">{Math.round(photoConfig.zoom)}%</span>
        </div>
        <input
          type="range"
          min="10"
          max="300"
          value={photoConfig.zoom}
          onChange={(e) => onPhotoChange({ zoom: Number(e.target.value) })}
          className="slider-range"
        />
      </div>

      <div className="grid grid-cols-2 gap-3 mt-2">
        <div className="slider-group">
          <div className="slider-header">
            <span>Geser X</span>
            <span className="slider-val">{photoConfig.posX}px</span>
          </div>
          <input
            type="range"
            min="-350"
            max="350"
            value={photoConfig.posX}
            onChange={(e) => onPhotoChange({ posX: Number(e.target.value) })}
            className="slider-range"
          />
        </div>

        <div className="slider-group">
          <div className="slider-header">
            <span>Geser Y</span>
            <span className="slider-val">{photoConfig.posY}px</span>
          </div>
          <input
            type="range"
            min="-350"
            max="350"
            value={photoConfig.posY}
            onChange={(e) => onPhotoChange({ posY: Number(e.target.value) })}
            className="slider-range"
          />
        </div>
      </div>

      <div className="slider-group mt-2">
        <div className="slider-header">
          <span>Rotasi Sudut Bebas</span>
          <span className="slider-val">{photoConfig.rotation}°</span>
        </div>
        <input
          type="range"
          min="-180"
          max="180"
          value={photoConfig.rotation}
          onChange={(e) => onPhotoChange({ rotation: Number(e.target.value) })}
          className="slider-range"
        />
      </div>

      {/* Color Tuning: Brightness & Contrast */}
      <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-800">
        <div className="slider-group">
          <div className="slider-header">
            <span className="flex items-center gap-1">
              <Sun className="w-3 h-3 text-amber-400" /> Kecerahan
            </span>
            <span className="slider-val">{photoConfig.brightness}%</span>
          </div>
          <input
            type="range"
            min="60"
            max="150"
            value={photoConfig.brightness}
            onChange={(e) => onPhotoChange({ brightness: Number(e.target.value) })}
            className="slider-range"
          />
        </div>

        <div className="slider-group">
          <div className="slider-header">
            <span className="flex items-center gap-1">
              <Contrast className="w-3 h-3 text-cyan-400" /> Kontras
            </span>
            <span className="slider-val">{photoConfig.contrast}%</span>
          </div>
          <input
            type="range"
            min="60"
            max="150"
            value={photoConfig.contrast}
            onChange={(e) => onPhotoChange({ contrast: Number(e.target.value) })}
            className="slider-range"
          />
        </div>
      </div>

      {/* Reset Photo Settings */}
      <button
        type="button"
        onClick={onResetPhoto}
        className="btn-reset mt-3"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        <span>Reset Transformasi Foto</span>
      </button>
    </div>
  );
}
