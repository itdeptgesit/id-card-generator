import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  RotateCw,
  FlipHorizontal,
  Maximize2,
  RotateCcw,
  Sun,
  Contrast,
  Loader2,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
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
    <Card className="border-border/80 bg-card/95 shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-bold text-amber-500 uppercase tracking-wide">
          <UploadCloud className="w-4 h-4 text-amber-500" />
          <span>Upload &amp; Pengaturan Foto Karyawan</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Drag & Drop Upload Zone */}
        <div
          className={cn(
            'border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1.5',
            isDraggingOver
              ? 'border-amber-500 bg-amber-500/10'
              : 'border-border bg-background/50 hover:border-amber-500/50 hover:bg-accent/40'
          )}
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
          <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 mb-1">
            <UploadCloud className="w-5 h-5" />
          </div>
          <div className="text-xs font-semibold text-foreground">Klik atau Seret Foto ke Sini</div>
          <div className="text-[11px] text-muted-foreground">Mendukung JPG, PNG, WEBP &amp; HEIC (iPhone)</div>
        </div>

        {/* HEIC Progress Banner */}
        {isConvertingHeic && (
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs animate-pulse">
            <Loader2 className="w-4 h-4 spin-icon text-amber-400" />
            <span>Sedang mengonversi format foto Apple HEIC/HEIF...</span>
          </div>
        )}

        {/* Quick Transform Toolbar */}
        <div className="grid grid-cols-3 gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={rotate90}
            className="text-xs gap-1.5 h-8 border-border hover:border-amber-500/50"
            title="Putar 90 Derajat"
          >
            <RotateCw className="w-3.5 h-3.5 text-amber-400" />
            <span>Putar 90°</span>
          </Button>

          <Button
            type="button"
            variant={photoConfig.flipH ? 'amber' : 'outline'}
            size="sm"
            onClick={toggleFlip}
            className={cn(
              'text-xs gap-1.5 h-8 border-border',
              !photoConfig.flipH && 'hover:border-cyan-500/50'
            )}
            title="Cermin / Balik Horizontal"
          >
            <FlipHorizontal className={cn('w-3.5 h-3.5', photoConfig.flipH ? 'text-slate-950' : 'text-cyan-400')} />
            <span>Cermin (Flip)</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={centerPhoto}
            className="text-xs gap-1.5 h-8 border-border hover:border-border/80"
            title="Kembalikan ke Posisi Ideal"
          >
            <Maximize2 className="w-3.5 h-3.5 text-slate-300" />
            <span>Ke Tengah</span>
          </Button>
        </div>

        {/* Sliders: Zoom, X, Y, Rotasi */}
        <div className="space-y-3 pt-1">
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-foreground/90">Zoom Ukuran Foto</span>
              <span className="font-mono text-amber-400 font-semibold">{Math.round(photoConfig.zoom)}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="300"
              value={photoConfig.zoom}
              onChange={(e) => onPhotoChange({ zoom: Number(e.target.value) })}
              className="w-full accent-amber-500 cursor-pointer h-1.5 bg-muted rounded-lg appearance-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-foreground/90">Geser X</span>
                <span className="font-mono text-amber-400 font-semibold">{photoConfig.posX}px</span>
              </div>
              <input
                type="range"
                min="-350"
                max="350"
                value={photoConfig.posX}
                onChange={(e) => onPhotoChange({ posX: Number(e.target.value) })}
                className="w-full accent-amber-500 cursor-pointer h-1.5 bg-muted rounded-lg appearance-none"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-foreground/90">Geser Y</span>
                <span className="font-mono text-amber-400 font-semibold">{photoConfig.posY}px</span>
              </div>
              <input
                type="range"
                min="-350"
                max="350"
                value={photoConfig.posY}
                onChange={(e) => onPhotoChange({ posY: Number(e.target.value) })}
                className="w-full accent-amber-500 cursor-pointer h-1.5 bg-muted rounded-lg appearance-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-foreground/90">Rotasi Sudut Bebas</span>
              <span className="font-mono text-amber-400 font-semibold">{photoConfig.rotation}°</span>
            </div>
            <input
              type="range"
              min="-180"
              max="180"
              value={photoConfig.rotation}
              onChange={(e) => onPhotoChange({ rotation: Number(e.target.value) })}
              className="w-full accent-amber-500 cursor-pointer h-1.5 bg-muted rounded-lg appearance-none"
            />
          </div>
        </div>

        <Separator className="bg-border/60" />

        {/* Color Tuning: Brightness & Contrast */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="flex items-center gap-1 font-semibold text-foreground/90">
                <Sun className="w-3.5 h-3.5 text-amber-400" /> Kecerahan
              </span>
              <span className="font-mono text-amber-400 font-semibold">{photoConfig.brightness}%</span>
            </div>
            <input
              type="range"
              min="60"
              max="150"
              value={photoConfig.brightness}
              onChange={(e) => onPhotoChange({ brightness: Number(e.target.value) })}
              className="w-full accent-amber-500 cursor-pointer h-1.5 bg-muted rounded-lg appearance-none"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="flex items-center gap-1 font-semibold text-foreground/90">
                <Contrast className="w-3.5 h-3.5 text-cyan-400" /> Kontras
              </span>
              <span className="font-mono text-cyan-400 font-semibold">{photoConfig.contrast}%</span>
            </div>
            <input
              type="range"
              min="60"
              max="150"
              value={photoConfig.contrast}
              onChange={(e) => onPhotoChange({ contrast: Number(e.target.value) })}
              className="w-full accent-cyan-500 cursor-pointer h-1.5 bg-muted rounded-lg appearance-none"
            />
          </div>
        </div>

        {/* Reset Photo Settings */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onResetPhoto}
          className="w-full gap-2 text-xs border-border hover:bg-muted text-muted-foreground hover:text-foreground"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Transformasi Foto</span>
        </Button>
      </CardContent>
    </Card>
  );
}
