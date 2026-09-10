import React from 'react';
import { UserCheck, AlignLeft, AlignCenter } from 'lucide-react';

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
    <div className="panel">
      <div className="panel-title">
        <UserCheck className="w-4 h-4 text-amber-500" />
        <span>Data &amp; Teks Identitas Kartu</span>
      </div>

      {/* Pilihan Entitas / Template Perusahaan */}
      <div className="form-group mb-3 pb-3 border-b border-slate-800">
        <label className="form-label mb-1.5 block">Template Perusahaan</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            className={`btn-company-card ${companyTemplate === 'gesit' ? 'active' : ''}`}
            onClick={() => onCompanyTemplateChange('gesit')}
          >
            <span className="btn-company-title">The Gesit Companies</span>
            <span className="btn-company-sub">Logo The Gesit Companies</span>
          </button>
          <button
            type="button"
            className={`btn-company-card ${companyTemplate === 'gnr' ? 'active' : ''}`}
            onClick={() => onCompanyTemplateChange('gnr')}
          >
            <span className="btn-company-title">Gesit Natural Resources</span>
            <span className="btn-company-sub">Logo Natural Resources</span>
          </button>
        </div>
      </div>

      {/* Nama Lengkap */}
      <div className="form-group">
        <div className="flex items-center justify-between mb-1.5">
          <label className="form-label">
            Nama Lengkap <span className="font-normal text-slate-400">(Font Arial Bold)</span>
          </label>
          <div className="flex items-center gap-2">
            <span className="char-badge" title="Maksimal 21 Karakter">
              {(cardData.name || '').length}/21
            </span>
            <span className="slider-val">{cardData.nameFontSize}px</span>
            <input
              type="color"
              value={cardData.nameColor || '#000000'}
              onChange={(e) => handleChange('nameColor', e.target.value)}
              className="color-picker-input"
              title="Ganti warna teks nama"
            />
          </div>
        </div>
        <input
          type="text"
          value={cardData.name}
          maxLength={21}
          onChange={(e) => handleChange('name', e.target.value.toUpperCase())}
          placeholder="NAMA LENGKAP"
          className="form-input"
        />
        <div className="slider-row mt-1.5">
          <input
            type="range"
            min="12"
            max="34"
            value={cardData.nameFontSize}
            onChange={(e) => handleChange('nameFontSize', Number(e.target.value))}
            className="slider-range"
          />
        </div>
      </div>

      {/* Jabatan / Divisi */}
      <div className="form-group mt-3">
        <div className="flex items-center justify-between mb-1.5">
          <label className="form-label">
            Jabatan / Divisi <span className="font-normal text-slate-400">(Font Arial Bold)</span>
          </label>
          <div className="flex items-center gap-2">
            <span className="slider-val">{cardData.deptFontSize}px</span>
            <input
              type="color"
              value={cardData.deptColor || '#BE913B'}
              onChange={(e) => handleChange('deptColor', e.target.value)}
              className="color-picker-input"
              title="Ganti warna teks divisi"
            />
          </div>
        </div>
        <input
          type="text"
          value={cardData.department}
          onChange={(e) => handleChange('department', e.target.value.toUpperCase())}
          placeholder="DIVISI"
          className="form-input"
        />
        <div className="slider-row mt-1.5">
          <input
            type="range"
            min="10"
            max="26"
            value={cardData.deptFontSize}
            onChange={(e) => handleChange('deptFontSize', Number(e.target.value))}
            className="slider-range"
          />
        </div>
      </div>

      {/* Perataan Teks (Alignment) */}
      <div className="mt-3 pt-3 border-t border-slate-800">
        <label className="form-label">Perataan Teks</label>
        <div className="flex gap-2 mt-1.5">
          <button
            type="button"
            className={`btn-align ${cardData.textAlign === 'left' ? 'active' : ''}`}
            onClick={() => handleChange('textAlign', 'left')}
          >
            <AlignLeft className="w-4 h-4" /> Rata Kiri
          </button>
          <button
            type="button"
            className={`btn-align ${cardData.textAlign === 'center' ? 'active' : ''}`}
            onClick={() => handleChange('textAlign', 'center')}
          >
            <AlignCenter className="w-4 h-4" /> Rata Tengah
          </button>
        </div>
      </div>
    </div>
  );
}
