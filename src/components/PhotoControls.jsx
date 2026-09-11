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
    <Card className="border-border bg-card shadow-sm rounded-2xl">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-foreground uppercase tracking-wide flex items-center gap-2">
          <UploadCloud className="w-4 h-4 text-zinc-400" />
          <span>Upload &amp; Pengaturan Foto Karyawan</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Drag & Drop Upload Zone */}
        <div
          className={cn(
            'border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1.5',
            isDraggingOver
              ? 'border-white/50 bg-secondary'
              : 'border-border bg-secondary/30 hover:border-zinc-500 hover:bg-secondary/50'
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
          <div className="w-10 h-10 rounded-full bg-secondary border border-border flex items-center justify-center text-foreground mb-1">
            <UploadCloud className="w-5 h-5" />
          </div>
          <div className="text-xs font-semibold text-foreground">Klik atau Seret Foto ke Sini</div>
          <div className="text-[11px] text-muted-foreground">Mendukung JPG, PNG, WEBP &amp; HEIC (iPhone)</div>
        </div>

        {/* HEIC Progress Banner */}
        {isConvertingHeic && (
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-secondary border border-border text-foreground text-xs animate-pulse">
            <Loader2 className="w-4 h-4 spin-icon text-foreground" />
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
            className="text-xs gap-1.5 h-8 border-border hover:bg-secondary rounded-xl"
            title="Putar 90 Derajat"
          >
            <RotateCw className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <span className="hidden xs:inline sm:inline">Putar 90°</span>
            <span className="xs:hidden sm:hidden">Putar</span>
          </Button>

          <Button
            type="button"
            variant={photoConfig.flipH ? 'default' : 'outline'}
            size="sm"
            onClick={toggleFlip}
            className={cn(
              'text-xs gap-1.5 h-8 border-border rounded-xl transition-all',
              photoConfig.flipH && 'bg-white text-zinc-950 dark:bg-white dark:text-zinc-950 font-semibold'
            )}
            title="Cermin / Balik Horizontal"
          >
            <FlipHorizontal className={cn('w-3.5 h-3.5 shrink-0', photoConfig.flipH ? 'text-zinc-950' : 'text-muted-foreground')} />
            <span className="hidden xs:inline sm:inline">Cermin (Flip)</span>
            <span className="xs:hidden sm:hidden">Cermin</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={centerPhoto}
            className="text-xs gap-1.5 h-8 border-border hover:bg-secondary rounded-xl"
            title="Kembalikan ke Posisi Ideal"
          >
            <Maximize2 className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <span className="hidden xs:inline sm:inline">Ke Tengah</span>
            <span className="xs:hidden sm:hidden">Tengah</span>
          </Button>
        </div>

        {/* Sliders: Zoom, X, Y, Rotasi */}
        <div className="space-y-3 pt-1">
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-medium text-foreground/90">Zoom Ukuran Foto</span>
              <span className="font-mono text-muted-foreground font-medium">{Math.round(photoConfig.zoom)}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="300"
              value={photoConfig.zoom}
              onChange={(e) => onPhotoChange({ zoom: Number(e.target.value) })}
              className="w-full accent-white cursor-pointer h-1.5 bg-secondary rounded-lg appearance-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-medium text-foreground/90">Geser X</span>
                <span className="font-mono text-muted-foreground font-medium">{photoConfig.posX}px</span>
              </div>
              <input
                type="range"
                min="-350"
                max="350"
                value={photoConfig.posX}
                onChange={(e) => onPhotoChange({ posX: Number(e.target.value) })}
                className="w-full accent-white cursor-pointer h-1.5 bg-secondary rounded-lg appearance-none"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-medium text-foreground/90">Geser Y</span>
                <span className="font-mono text-muted-foreground font-medium">{photoConfig.posY}px</span>
              </div>
              <input
                type="range"
                min="-350"
                max="350"
                value={photoConfig.posY}
                onChange={(e) => onPhotoChange({ posY: Number(e.target.value) })}
                className="w-full accent-white cursor-pointer h-1.5 bg-secondary rounded-lg appearance-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-medium text-foreground/90">Rotasi Sudut Bebas</span>
              <span className="font-mono text-muted-foreground font-medium">{photoConfig.rotation}°</span>
            </div>
            <input
              type="range"
              min="-180"
              max="180"
              value={photoConfig.rotation}
              onChange={(e) => onPhotoChange({ rotation: Number(e.target.value) })}
              className="w-full accent-white cursor-pointer h-1.5 bg-secondary rounded-lg appearance-none"
            />
          </div>
        </div>

        <Separator className="bg-border/60" />

        {/* Color Tuning: Brightness & Contrast */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="flex items-center gap-1 font-medium text-foreground/90">
                <Sun className="w-3.5 h-3.5 text-zinc-400" /> Kecerahan
              </span>
              <span className="font-mono text-muted-foreground font-medium">{photoConfig.brightness}%</span>
            </div>
            <input
              type="range"
              min="60"
              max="150"
              value={photoConfig.brightness}
              onChange={(e) => onPhotoChange({ brightness: Number(e.target.value) })}
              className="w-full accent-white cursor-pointer h-1.5 bg-secondary rounded-lg appearance-none"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="flex items-center gap-1 font-medium text-foreground/90">
                <Contrast className="w-3.5 h-3.5 text-zinc-400" /> Kontras
              </span>
              <span className="font-mono text-muted-foreground font-medium">{photoConfig.contrast}%</span>
            </div>
            <input
              type="range"
              min="60"
              max="150"
              value={photoConfig.contrast}
              onChange={(e) => onPhotoChange({ contrast: Number(e.target.value) })}
              className="w-full accent-white cursor-pointer h-1.5 bg-secondary rounded-lg appearance-none"
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
