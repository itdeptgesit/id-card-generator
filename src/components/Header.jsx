import React from 'react';
import { BadgeCheck, Grid, Eye, RotateCcw, Smartphone, Layers } from 'lucide-react';

export default function Header({
  isGridVisible,
  toggleGrid,
  activeSide,
  setActiveSide,
  companyTemplate,
  setCompanyTemplate,
}) {
  return (
    <header className="app-header">
      <div className="header-container">
        {/* Brand */}
        <div className="header-brand">
          <div className="brand-badge">
            <BadgeCheck className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="brand-title">ID Card Studio Pro</h1>
              <span className="badge-pro">v2.0</span>
            </div>
            <p className="brand-subtitle">The Gesit Companies • Standar Presisi CR80</p>
          </div>
        </div>

        {/* Company Template Switcher (The Gesit Companies vs GNR) */}
        <div className="company-switcher">
          <button
            type="button"
            className={`btn-company ${companyTemplate === 'gesit' ? 'active' : ''}`}
            onClick={() => setCompanyTemplate('gesit')}
            title="Pilih Template The Gesit Companies"
          >
            <span>The Gesit Companies</span>
          </button>
          <button
            type="button"
            className={`btn-company ${companyTemplate === 'gnr' ? 'active' : ''}`}
            onClick={() => setCompanyTemplate('gnr')}
            title="Pilih Template Gesit Natural Resources"
          >
            <span>Gesit Natural Resources</span>
          </button>
        </div>

        {/* Side Switcher (Front / Back) & Controls */}
        <div className="header-actions">
          <div className="side-switcher">
            <button
              type="button"
              className={`btn-side ${activeSide === 'front' ? 'active' : ''}`}
              onClick={() => setActiveSide('front')}
              title="Tampilkan Tampak Depan"
            >
              <Layers className="w-4 h-4" />
              <span>Tampak Depan</span>
            </button>
            <button
              type="button"
              className={`btn-side ${activeSide === 'back' ? 'active' : ''}`}
              onClick={() => setActiveSide('back')}
              title="Tampilkan Tampak Belakang"
            >
              <Layers className="w-4 h-4" />
              <span>Tampak Belakang</span>
            </button>
          </div>

          <button
            type="button"
            onClick={toggleGrid}
            className={`btn-grid ${isGridVisible ? 'active' : ''}`}
            title="Nyalakan/Matikan Panduan Garis Grid"
          >
            <Grid className="w-4 h-4" />
            <span className="hide-mobile">Grid: {isGridVisible ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
