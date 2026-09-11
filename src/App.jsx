import React, { useState, useRef, useEffect } from 'react';
import Header from './components/Header';
import CardPreview from './components/CardPreview';
import FormControls from './components/FormControls';
import PhotoControls from './components/PhotoControls';
import BackgroundTools from './components/BackgroundTools';
import BatchPrintManager from './components/BatchPrintManager';
import EraserModal from './components/EraserModal';
import ExportBar from './components/ExportBar';
import './App.css';

export default function App() {
  const frontCardRef = useRef(null);
  const backCardRef = useRef(null);

  // Tema Aplikasi (Light / Dark Mode)
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('idcard_theme') || 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }
    localStorage.setItem('idcard_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const [activeSide, setActiveSide] = useState('front'); // 'front' | 'back'
  const [isGridVisible, setIsGridVisible] = useState(true);
  const [companyTemplate, setCompanyTemplate] = useState('gesit'); // 'gesit' | 'gnr'

  // Data Identitas Kartu
  const [cardData, setCardData] = useState({
    name: 'NAMA LENGKAP',
    department: 'DIVISI',
    nameFontSize: 22,
    deptFontSize: 14,
    nameColor: '#000000',
    deptColor: '#BE913B',
    textAlign: 'left',
  });

  // Konfigurasi Transformasi & Filter Foto
const DEFAULT_PHOTO_PRESET = {
  zoom: 22,
  posX: 22,
  posY: 50,
  rotation: 0,
  flipH: false,
  brightness: 100,
  contrast: 100,
};

const TEMPLATE_DEFAULTS = {
  gesit: { src: '/assets/model-woman.png', preset: { ...DEFAULT_PHOTO_PRESET, zoom: 42 } },
  gnr: { src: '/assets/model-man.png', preset: { ...DEFAULT_PHOTO_PRESET, zoom: 40 } },
};

const getTemplateState = (tpl) => TEMPLATE_DEFAULTS[tpl] || TEMPLATE_DEFAULTS.gesit;

const initialTemplate = getTemplateState('gesit');

  const [photoConfig, setPhotoConfig] = useState({
    src: initialTemplate.src,
    ...initialTemplate.preset,
  });

  const [originalPhotoSrc, setOriginalPhotoSrc] = useState(initialTemplate.src);
  const [customBgUrl, setCustomBgUrl] = useState(null);
  const [isEraserOpen, setIsEraserOpen] = useState(false);

  // Antrean 10 Kartu Lembar A4
  const [batchList, setBatchList] = useState([]);

  const handlePhotoChange = (updates) => {
    setPhotoConfig((prev) => ({ ...prev, ...updates }));
  };

  const handleNewPhotoUploaded = (newSrc) => {
    setOriginalPhotoSrc(newSrc);
    setPhotoConfig({ src: newSrc, ...DEFAULT_PHOTO_PRESET });
  };

  const handlePhotoProcessed = (processedDataUrl) => {
    setPhotoConfig((prev) => ({ ...prev, src: processedDataUrl }));
  };

  const handleResetPhoto = () => {
    setPhotoConfig({ src: originalPhotoSrc, ...DEFAULT_PHOTO_PRESET });
  };

  const handleResetForNextCard = () => {
    setCardData({
      name: 'NAMA LENGKAP',
      department: 'DIVISI',
      nameFontSize: 22,
      deptFontSize: 14,
      nameColor: '#000000',
      deptColor: '#BE913B',
      textAlign: 'left',
    });
    const t = getTemplateState(companyTemplate);
    setPhotoConfig({ src: t.src, ...t.preset });
    setOriginalPhotoSrc(t.src);
  };

  const handleCompanyTemplateChange = (next) => {
    const t = getTemplateState(next);
    setCompanyTemplate(next);
    setOriginalPhotoSrc(t.src);
    setPhotoConfig({ src: t.src, ...t.preset });
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <Header
        companyTemplate={companyTemplate}
        setCompanyTemplate={handleCompanyTemplateChange}
        theme={theme}
        toggleTheme={toggleTheme}
      />

      {/* Main Grid Layout */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8 items-start">
        {/* Kolom Kiri: Formulir & Kontrol Editing */}
        <div className="flex flex-col gap-3 sm:gap-4">
          <FormControls
            cardData={cardData}
            onChange={setCardData}
            companyTemplate={companyTemplate}
            onCompanyTemplateChange={handleCompanyTemplateChange}
          />

          <PhotoControls
            photoConfig={photoConfig}
            onPhotoChange={handlePhotoChange}
            onNewPhotoUploaded={handleNewPhotoUploaded}
            onResetPhoto={handleResetPhoto}
            originalPhotoSrc={originalPhotoSrc}
          />

          <BackgroundTools
            currentPhotoSrc={photoConfig.src}
            originalPhotoSrc={originalPhotoSrc}
            onPhotoProcessed={handlePhotoProcessed}
            onOpenEraser={() => setIsEraserOpen(true)}
            customBgUrl={customBgUrl}
            onCustomBgChange={setCustomBgUrl}
          />
        </div>

        {/* Kolom Kanan: Kanvas Preview CR80 */}
        <div className="flex flex-col items-center lg:sticky lg:top-20 self-start">
          <CardPreview
            cardRef={frontCardRef}
            backCardRef={backCardRef}
            activeSide={activeSide}
            setActiveSide={setActiveSide}
            cardData={cardData}
            photoConfig={photoConfig}
            onPhotoChange={handlePhotoChange}
            isGridVisible={isGridVisible}
            toggleGrid={() => setIsGridVisible((prev) => !prev)}
            customBgUrl={customBgUrl}
            companyTemplate={companyTemplate}
          />
        </div>
      </main>

      {/* Antrean & Cetak Lembar A4 */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 mt-4 sm:mt-6">
        <BatchPrintManager
          frontRef={frontCardRef}
          backRef={backCardRef}
          cardData={cardData}
          photoConfig={photoConfig}
          onResetForNextCard={handleResetForNextCard}
          batchList={batchList}
          setBatchList={setBatchList}
        />
      </div>

      {/* Bar Ekspor Tunggal */}
      <ExportBar
        frontRef={frontCardRef}
        backRef={backCardRef}
        activeSide={activeSide}
        personName={cardData.name}
      />

      {/* Footer */}
      <footer className="mt-8 sm:mt-12 py-4 sm:py-6 px-3 sm:px-4 border-t border-border/60 bg-card/50 backdrop-blur-sm text-center">
        <div className="max-w-7xl mx-auto flex flex-col gap-1 items-center">
          <p className="text-xs sm:text-sm font-medium text-muted-foreground">
            Copyright © {new Date().getFullYear()} <strong className="text-foreground font-semibold">IT Gesit</strong> • Developed by <strong className="text-foreground font-semibold">Mr Siarudin</strong>
          </p>
          <p className="text-[10px] sm:text-xs text-muted-foreground/60">
            The Gesit Companies • ID Card Studio Pro
          </p>
        </div>
      </footer>

      <EraserModal
        isOpen={isEraserOpen}
        onClose={() => setIsEraserOpen(false)}
        currentPhotoSrc={photoConfig.src}
        originalPhotoSrc={originalPhotoSrc}
        onSave={handlePhotoProcessed}
      />
    </div>
  );
}
