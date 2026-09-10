import React, { useState } from 'react';
import { Download, FileText, Printer, FileSpreadsheet, Loader2 } from 'lucide-react';
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
    <div className="export-panel">
      {isExporting && (
        <div className="export-loader-overlay">
          <Loader2 className="w-5 h-5 spin-icon text-amber-500" />
          <span>{exportLabel}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {/* Download PNG HD */}
        <button
          type="button"
          onClick={handleExportPng}
          disabled={isExporting}
          className="btn-primary"
          title="Unduh gambar PNG resolusi tinggi (300 DPI)"
        >
          <Download className="w-4 h-4" />
          <span>Download PNG HD</span>
        </button>

        {/* Export PDF CR80 */}
        <button
          type="button"
          onClick={handleExportSinglePdf}
          disabled={isExporting}
          className="btn-secondary"
          title="Export format PDF ukuran kartu CR80 (54 x 85.6 mm)"
        >
          <FileText className="w-4 h-4 text-cyan-400" />
          <span>PDF Kartu CR80</span>
        </button>

        {/* Export PDF Lembar A4 */}
        <button
          type="button"
          onClick={handleExportA4Sheet}
          disabled={isExporting}
          className="btn-secondary"
          title="Export lembar cetak A4 berisi kartu Depan & Belakang dengan garis potong"
        >
          <FileSpreadsheet className="w-4 h-4 text-amber-400" />
          <span>PDF Cetak Lembar A4</span>
        </button>

        {/* Cetak Langsung */}
        <button
          type="button"
          onClick={handleBrowserPrint}
          disabled={isExporting}
          className="btn-secondary"
          title="Cetak langsung menggunakan dialog printer peramban"
        >
          <Printer className="w-4 h-4 text-emerald-400" />
          <span>Cetak Printer</span>
        </button>
      </div>
    </div>
  );
}
