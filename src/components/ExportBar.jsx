import React, { useState } from 'react';
import { Download, FileText, Printer, FileSpreadsheet, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { exportCardPng, exportSingleCardPdf, exportA4SheetPdf } from '../utils/exportPdf';

export default function ExportBar({
  frontRef,
  backRef,
  activeSide,
  personName,
  employeeId,
}) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportLabel, setExportLabel] = useState('');

  const cleanName = (personName || 'ID_Card').trim().replace(/\s+/g, '_');

  const handleExportPng = async () => {
    const targetElement = activeSide === 'front' ? frontRef.current : backRef.current;
    if (!targetElement) return;

    setIsExporting(true);
    setExportLabel('Merender PNG 300 DPI...');
    try {
      const suffix = activeSide === 'front' ? 'DEPAN' : 'BELAKANG';
      await exportCardPng(targetElement, `ID_CARD_${cleanName}_${suffix}.png`);
    } catch (err) {
      console.error('Export PNG failed:', err);
      alert('Gagal mengunduh gambar PNG.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportSinglePdf = async () => {
    const targetElement = activeSide === 'front' ? frontRef.current : backRef.current;
    if (!targetElement) return;

    setIsExporting(true);
    setExportLabel('Merender PDF CR80...');
    try {
      const suffix = activeSide === 'front' ? 'DEPAN' : 'BELAKANG';
      await exportSingleCardPdf(targetElement, `ID_CARD_${cleanName}_${suffix}.pdf`);
    } catch (err) {
      console.error('Export PDF failed:', err);
      alert('Gagal mengunduh PDF.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportA4Sheet = async () => {
    if (!frontRef.current || !backRef.current) return;

    setIsExporting(true);
    setExportLabel('Menyiapkan Lembar A4 & Garis Potong...');
    try {
      await exportA4SheetPdf({
        frontElement: frontRef.current,
        backElement: backRef.current,
        personName: personName,
        employeeId: employeeId,
        filename: `LEMBAR_CETAK_A4_${cleanName}.pdf`,
      });
    } catch (err) {
      console.error('Export A4 failed:', err);
      alert('Gagal membuat lembar cetak A4.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleBrowserPrint = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 mt-4 sm:mt-6">
      {/* Loading overlay */}
      {isExporting && (
        <div className="mb-3 flex items-center gap-3 px-4 py-3 rounded-xl bg-secondary border border-border text-foreground text-sm font-semibold shadow-md">
          <Loader2 className="w-5 h-5 animate-spin shrink-0 text-foreground" />
          <span>{exportLabel}</span>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
        {/* Download PNG HD */}
        <Button
          type="button"
          variant="default"
          onClick={handleExportPng}
          disabled={isExporting}
          className="gap-2 text-xs h-10 rounded-xl"
          title="Unduh gambar PNG resolusi tinggi (300 DPI)"
        >
          <Download className="w-4 h-4 shrink-0" />
          <span>PNG HD</span>
        </Button>

        {/* Export PDF CR80 */}
        <Button
          type="button"
          variant="outline"
          onClick={handleExportSinglePdf}
          disabled={isExporting}
          className="gap-2 text-xs h-10 border-border hover:bg-secondary rounded-xl text-foreground"
          title="Export format PDF ukuran kartu CR80 (54 x 85.6 mm)"
        >
          <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
          <span>PDF CR80</span>
        </Button>

        {/* Export PDF Lembar A4 */}
        <Button
          type="button"
          variant="outline"
          onClick={handleExportA4Sheet}
          disabled={isExporting}
          className="gap-2 text-xs h-10 border-border hover:bg-secondary rounded-xl text-foreground"
          title="Export lembar cetak A4 berisi kartu Depan & Belakang dengan garis potong"
        >
          <FileSpreadsheet className="w-4 h-4 text-muted-foreground shrink-0" />
          <span>PDF Lembar A4</span>
        </Button>

        {/* Cetak Langsung */}
        <Button
          type="button"
          variant="outline"
          onClick={handleBrowserPrint}
          disabled={isExporting}
          className="gap-2 text-xs h-10 border-border hover:bg-secondary rounded-xl text-foreground"
          title="Cetak langsung menggunakan dialog printer peramban"
        >
          <Printer className="w-4 h-4 text-muted-foreground shrink-0" />
          <span>Cetak</span>
        </Button>
      </div>
    </div>
  );
}
