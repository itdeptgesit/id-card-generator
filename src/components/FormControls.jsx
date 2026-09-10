import React from 'react';
import { UserCheck, AlignLeft, AlignCenter, Building2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

export default function FormControls({
  cardData,
  onChange,
  companyTemplate,
  onCompanyTemplateChange,
}) {
  const handleChange = (field, value) => {
    onChange({ ...cardData, [field]: value });
  };

  return (
    <Card className="border-border/80 bg-card/95 shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-bold text-amber-500 uppercase tracking-wide">
          <UserCheck className="w-4 h-4 text-amber-500" />
          <span>Data &amp; Teks Identitas Kartu</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Pilihan Entitas / Template Perusahaan */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-foreground/90 block">
            Template Perusahaan
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              className={cn(
                'flex flex-col text-left p-3 rounded-lg border transition-all text-xs',
                companyTemplate === 'gesit'
                  ? 'border-amber-500 bg-amber-500/10 shadow-sm shadow-amber-500/10'
                  : 'border-border bg-background/50 hover:bg-accent hover:border-border/80'
              )}
              onClick={() => onCompanyTemplateChange('gesit')}
            >
              <span className={cn('font-bold', companyTemplate === 'gesit' ? 'text-amber-400' : 'text-foreground')}>
                The Gesit Companies
              </span>
              <span className="text-[11px] text-muted-foreground mt-0.5">
                Logo The Gesit Companies
              </span>
            </button>

            <button
              type="button"
              className={cn(
                'flex flex-col text-left p-3 rounded-lg border transition-all text-xs',
                companyTemplate === 'gnr'
                  ? 'border-amber-500 bg-amber-500/10 shadow-sm shadow-amber-500/10'
                  : 'border-border bg-background/50 hover:bg-accent hover:border-border/80'
              )}
              onClick={() => onCompanyTemplateChange('gnr')}
            >
              <span className={cn('font-bold', companyTemplate === 'gnr' ? 'text-amber-400' : 'text-foreground')}>
                Gesit Natural Resources
              </span>
              <span className="text-[11px] text-muted-foreground mt-0.5">
                Logo Natural Resources
              </span>
            </button>
          </div>
        </div>

        <Separator className="bg-border/60" />

        {/* Nama Lengkap */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-foreground/90">
              Nama Lengkap <span className="font-normal text-muted-foreground">(Font Arial Bold)</span>
            </label>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono text-[10px] px-1.5 py-0 h-4 border-border text-muted-foreground">
                {(cardData.name || '').length}/21
              </Badge>
              <span className="text-xs font-mono font-semibold text-amber-400">{cardData.nameFontSize}px</span>
              <input
                type="color"
                value={cardData.nameColor || '#000000'}
                onChange={(e) => handleChange('nameColor', e.target.value)}
                className="w-5 h-5 rounded border border-border cursor-pointer bg-transparent p-0"
                title="Ganti warna teks nama"
              />
            </div>
          </div>
          <Input
            type="text"
            value={cardData.name}
            maxLength={21}
            onChange={(e) => handleChange('name', e.target.value.toUpperCase())}
            placeholder="NAMA LENGKAP"
            className="font-bold tracking-wide"
          />
          <input
            type="range"
            min="12"
            max="34"
            value={cardData.nameFontSize}
            onChange={(e) => handleChange('nameFontSize', Number(e.target.value))}
            className="w-full accent-amber-500 cursor-pointer h-1.5 bg-muted rounded-lg appearance-none"
          />
        </div>

        {/* Jabatan / Divisi */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-foreground/90">
              Jabatan / Divisi <span className="font-normal text-muted-foreground">(Font Arial Bold)</span>
            </label>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-semibold text-amber-400">{cardData.deptFontSize}px</span>
              <input
                type="color"
                value={cardData.deptColor || '#BE913B'}
                onChange={(e) => handleChange('deptColor', e.target.value)}
                className="w-5 h-5 rounded border border-border cursor-pointer bg-transparent p-0"
                title="Ganti warna teks divisi"
              />
            </div>
          </div>
          <Input
            type="text"
            value={cardData.department}
            onChange={(e) => handleChange('department', e.target.value.toUpperCase())}
            placeholder="DIVISI"
            className="font-semibold"
          />
          <input
            type="range"
            min="10"
            max="26"
            value={cardData.deptFontSize}
            onChange={(e) => handleChange('deptFontSize', Number(e.target.value))}
            className="w-full accent-amber-500 cursor-pointer h-1.5 bg-muted rounded-lg appearance-none"
          />
        </div>

        <Separator className="bg-border/60" />

        {/* Perataan Teks (Alignment) */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-foreground/90">Perataan Teks</label>
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant={cardData.textAlign === 'left' ? 'secondary' : 'outline'}
              size="sm"
              className={cn(
                'justify-center text-xs gap-2',
                cardData.textAlign === 'left' && 'bg-amber-500/10 border-amber-500/50 text-amber-400 font-semibold'
              )}
              onClick={() => handleChange('textAlign', 'left')}
            >
              <AlignLeft className="w-3.5 h-3.5" /> Rata Kiri
            </Button>
            <Button
              type="button"
              variant={cardData.textAlign === 'center' ? 'secondary' : 'outline'}
              size="sm"
              className={cn(
                'justify-center text-xs gap-2',
                cardData.textAlign === 'center' && 'bg-amber-500/10 border-amber-500/50 text-amber-400 font-semibold'
              )}
              onClick={() => handleChange('textAlign', 'center')}
            >
              <AlignCenter className="w-3.5 h-3.5" /> Rata Tengah
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
