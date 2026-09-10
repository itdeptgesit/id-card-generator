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

const DEFAULT_PHOTO = '/assets/default_model.png';

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
  const [companyTemplate, setCompanyTemplate] = useState('gesit'); // default: 'gesit' | 'gnr'

  // Data Identitas Kartu (Nama & Divisi, Tanpa NIK)
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

  const [photoConfig, setPhotoConfig] = useState({
    src: DEFAULT_PHOTO,
    ...DEFAULT_PHOTO_PRESET,
  });

  const [originalPhotoSrc, setOriginalPhotoSrc] = useState(DEFAULT_PHOTO);
  const [customBgUrl, setCustomBgUrl] = useState(null);
  const [isEraserOpen, setIsEraserOpen] = useState(false);

  // Antrean 10 Kartu Lembar A4
  const [batchList, setBatchList] = useState([]);

  // Handler update konfigurasi foto
  const handlePhotoChange = (updates) => {
    setPhotoConfig((prev) => ({ ...prev, ...updates }));
  };

  // Handler foto baru diunggah
  const handleNewPhotoUploaded = (newSrc) => {
    setOriginalPhotoSrc(newSrc);
    setPhotoConfig({
      src: newSrc,
      ...DEFAULT_PHOTO_PRESET,
    });
  };

  // Handler hasil olahan foto (AI / color remover / eraser)
  const handlePhotoProcessed = (processedDataUrl) => {
    setPhotoConfig((prev) => ({ ...prev, src: processedDataUrl }));
  };

  // Reset konfigurasi posisi & filter foto
  const handleResetPhoto = () => {
    setPhotoConfig({
      src: originalPhotoSrc,
      ...DEFAULT_PHOTO_PRESET,
    });
  };

  // Reset formulir & foto saat tombol "Save & Next" ditekan
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
    setPhotoConfig({
      src: DEFAULT_PHOTO,
      ...DEFAULT_PHOTO_PRESET,
    });
    setOriginalPhotoSrc(DEFAULT_PHOTO);
  };

  return (
    <div className="min-h-screen">
      {/* Header Aplikasi */}
      <Header
        isGridVisible={isGridVisible}
        toggleGrid={() => setIsGridVisible((prev) => !prev)}
        activeSide={activeSide}
        setActiveSide={setActiveSide}
        companyTemplate={companyTemplate}
        setCompanyTemplate={setCompanyTemplate}
        theme={theme}
        toggleTheme={toggleTheme}
      />

      {/* Main Grid Layout */}
      <main className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Kolom Kiri: Formulir & Kontrol Editing */}
        <div className="flex flex-col gap-4">
          <FormControls
            cardData={cardData}
            onChange={setCardData}
            companyTemplate={companyTemplate}
            onCompanyTemplateChange={setCompanyTemplate}
          />

          <PhotoControls
            photoConfig={photoConfig}
            onPhotoChange={handlePhotoChange}
            onNewPhotoUploaded={handleNewPhotoUploaded}
            onResetPhoto={handleResetPhoto}
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
            cardData={cardData}
            photoConfig={photoConfig}
            onPhotoChange={handlePhotoChange}
            isGridVisible={isGridVisible}
            customBgUrl={customBgUrl}
            companyTemplate={companyTemplate}
          />
        </div>
      </main>

      {/* Antrean & Cetak Lembar A4 (10 ID Card) */}
      <div className="max-w-7xl mx-auto px-4 mt-6">
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

      {/* Bar Ekspor Tunggal (PNG HD, PDF Kartu CR80, Cetak Cepat) */}
      <ExportBar
        frontRef={frontCardRef}
        backRef={backCardRef}
        activeSide={activeSide}
        personName={cardData.name}
      />

      {/* Footer Aplikasi */}
      <footer className="mt-12 py-6 px-4 border-t border-border/60 bg-card/50 backdrop-blur-sm text-center">
        <div className="max-w-7xl mx-auto flex flex-col gap-1 items-center">
          <p className="text-sm font-medium text-muted-foreground">
            Copyright © {new Date().getFullYear()} <strong className="text-amber-500">IT Gesit</strong> • Developed by <strong className="text-amber-500">Mr Siarudin</strong>
          </p>
          <p className="text-xs text-muted-foreground/60">
            The Gesit Companies • ID Card Studio Pro
          </p>
        </div>
      </footer>

      {/* Modal Sikat Manual (Eraser & Restore) */}
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
