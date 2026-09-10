import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Eye, Move } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function CardPreview({
  cardRef,
  backCardRef,
  activeSide,
  cardData,
  photoConfig,
  onPhotoChange,
  isGridVisible,
  customBgUrl,
  companyTemplate = 'gesit',
}) {
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0, initPosX: 0, initPosY: 0 });
  const [isPointerDown, setIsPointerDown] = useState(false);

  // Pointer drag handler (works on mouse & touch)
  const handlePointerDown = useCallback((e) => {
    if (activeSide !== 'front' || !photoConfig.src) return;
    
    e.preventDefault();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch (err) {
      // Ignored
    }

    isDraggingRef.current = true;
    setIsPointerDown(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      initPosX: photoConfig.posX,
      initPosY: photoConfig.posY,
    };
  }, [activeSide, photoConfig.src, photoConfig.posX, photoConfig.posY]);

  const handlePointerMove = useCallback((e) => {
    if (!isDraggingRef.current) return;
    e.preventDefault();

    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;

    onPhotoChange({
      posX: Math.round(dragStartRef.current.initPosX + dx),
      posY: Math.round(dragStartRef.current.initPosY + dy),
    });
  }, [onPhotoChange]);

  const handlePointerUp = useCallback((e) => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      setIsPointerDown(false);
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch (err) {
        // Ignored
      }
    }
  }, []);

  const photoConfigRef = useRef(photoConfig);
  useEffect(() => {
    photoConfigRef.current = photoConfig;
  }, [photoConfig]);

  // Non-passive wheel listener to strictly prevent browser page scroll while zooming
  useEffect(() => {
    const cardEl = cardRef.current;
    if (!cardEl) return;

    const handleWheelNonPassive = (e) => {
      if (activeSide !== 'front') return;
      e.preventDefault();
      e.stopPropagation();
      const delta = e.deltaY > 0 ? -5 : 5;
      const currentZoom = photoConfigRef.current.zoom;
      const newZoom = Math.min(300, Math.max(10, currentZoom + delta));
      onPhotoChange({ zoom: newZoom });
    };

    cardEl.addEventListener('wheel', handleWheelNonPassive, { passive: false });
    return () => {
      cardEl.removeEventListener('wheel', handleWheelNonPassive);
    };
  }, [cardRef, activeSide, onPhotoChange]);

  const transformStyle = {
    transform: `translate(${photoConfig.posX}px, ${photoConfig.posY}px) scale(${photoConfig.zoom / 100}) rotate(${photoConfig.rotation}deg) scaleX(${photoConfig.flipH ? -1 : 1})`,
    filter: `brightness(${photoConfig.brightness}%) contrast(${photoConfig.contrast}%)`,
    cursor: isPointerDown ? 'grabbing' : 'grab',
  };

  return (
    <Card className="p-4 border-border/80 bg-card/95 shadow-md flex flex-col items-center w-full max-w-[420px]">
      {/* Header Info */}
      <div className="w-full flex items-center justify-between pb-3 border-b border-border/70 mb-4">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-cyan-500" />
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Preview Kartu ({activeSide === 'front' ? 'Tampak Depan' : 'Tampak Belakang'})
          </span>
        </div>
        <Badge variant="outline" className="font-mono text-[10px] text-muted-foreground border-border">
          CR80 (54 x 85.6 mm)
        </Badge>
      </div>

      {/* Frame Kartu (Aspect Ratio CR80 ~ 340px x 538.5px) */}
      <div className="card-stage-wrapper">
        {/* ================= TAMPAK DEPAN ================= */}
        <div
          ref={cardRef}
          id="idCardCanvasFront"
          className={`id-card-frame ${activeSide === 'front' ? 'block' : 'hidden'}`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          style={{ touchAction: 'none' }}
        >
          {/* Layer 1: Template Background */}
          <img
            src={customBgUrl || '/assets/bg_id.png'}
            crossOrigin="anonymous"
            className="layer-bg"
            alt="Background Kartu"
          />

          {/* Layer 2: Foto Karyawan dengan gesture drag & zoom */}
          <div className="layer-photo-container">
            {photoConfig.src && (
              <img
                src={photoConfig.src}
                crossOrigin="anonymous"
                className="layer-photo"
                alt="Foto Karyawan"
                style={transformStyle}
                draggable={false}
              />
            )}
          </div>

          {/* Layer 3: Shape Overlay Sesuai Template (Shape 1: GNR, Shape 3: The Gesit Companies) */}
          <img
            src={companyTemplate === 'gesit' ? '/assets/shape_3.png' : '/assets/shape_1.png'}
            crossOrigin="anonymous"
            className="layer-shape"
            alt="Shape Overlay"
          />

          {/* Layer 4: Text Overlay (Nama & Jabatan Saja Tanpa NIK) */}
          <div
            className="layer-text"
            style={{ textAlign: cardData.textAlign || 'left' }}
          >
            <div
              className="card-name-text"
              style={{
                fontSize: `${cardData.nameFontSize}px`,
                color: cardData.nameColor || '#000000',
              }}
            >
              {cardData.name || 'NAMA LENGKAP'}
            </div>

            <div
              className="card-dept-text"
              style={{
                fontSize: `${cardData.deptFontSize}px`,
                color: cardData.deptColor || '#BE913B',
              }}
            >
              {cardData.department || 'DIVISI'}
            </div>
          </div>

          {/* Layer 5: Grid Guidelines Depan */}
          {isGridVisible && (
            <div className="layer-grid">
              <div className="grid-v" title="Sumbu Tengah Simetri" />
              <div className="grid-v-left" title="Batas Margin Kiri" />
              <div className="grid-v-right" title="Batas Margin Kanan" />
              <div className="grid-h-1" title="Level Mata (Eye Level)" />
              <div className="grid-h-2" title="Garis Sumbu Tengah" />
              <div className="grid-h-3" title="Batas Lengkungan Shape Emas" />
            </div>
          )}
        </div>

        {/* ================= TAMPAK BELAKANG (EXACT OFFICIAL DESIGN) ================= */}
        <div
          ref={backCardRef}
          id="idCardCanvasBack"
          className={`id-card-frame card-back-white ${activeSide === 'back' ? 'is-active-back' : 'hidden'}`}
        >
          {/* Bagian Atas: Header + Statements (Mengisi ~51% Kartu) */}
          <div className="gnr-top-half">
            <div className="gnr-header-title">
              {companyTemplate === 'gesit' ? 'THE GESIT COMPANIES' : 'GESIT NATURAL RESOURCES'}
            </div>

            <div className="gnr-statements-container">
              {/* Vision Statement */}
              <div className="gnr-statement-group">
                <div className="gnr-stmt-heading">Vision Statement</div>
                <p className="gnr-stmt-body">
                  To be a Group of Companies Recognised by<br />
                  Stakeholders as Strategic Partner of First Choice
                </p>
              </div>

              {/* Mission Statement */}
              <div className="gnr-statement-group">
                <div className="gnr-stmt-heading">Mission Statement</div>
                <p className="gnr-stmt-body">
                  Establish Resourceful Business Entities that Deliver<br />
                  Sustainable Value to Stakeholders
                </p>
              </div>

              {/* Values */}
              <div className="gnr-statement-group">
                <div className="gnr-stmt-heading">Values</div>
                <p className="gnr-stmt-body">
                  We want to be highly regarded by stakeholders by demonstrating:
                </p>
                <div className="gnr-stmt-highlight">
                  INTEGRITY, RESPECT, COMPETENCY, PASSION
                </div>
              </div>
            </div>
          </div>

          {/* Garis Pembatas Horisontal Cokelat Menempel Penuh ke Pinggir */}
          <div className="gnr-divider-line" />

          {/* Bagian Bawah: PERHATIAN & Alamat (Mengisi ~49% Kartu) */}
          <div className="gnr-bottom-half">
            <div className="gnr-perhatian-heading">PERHATIAN</div>
            
            <div className="gnr-rules-list">
              <div className="gnr-rule-item">
                <span className="gnr-num">1.</span>
                <span>Kartu ini berfungsi sebagai indentitas diri &amp; wajib digunakan di area kerja.</span>
              </div>
              <div className="gnr-rule-item">
                <span className="gnr-num">2.</span>
                <span>Kartu harus digunakan &amp; dijaga dengan baik agar tetap berfungsi dengan baik.</span>
              </div>
              <div className="gnr-rule-item">
                <span className="gnr-num">3.</span>
                <span>Dilarang menitipkan kartu ini kepada karyawan lain.</span>
              </div>
              <div className="gnr-rule-item">
                <span className="gnr-num">4.</span>
                <span>Jika berhenti/pindah, kartu ini harus dikembalikan ke HR &amp; Admin Department.</span>
              </div>
              <div className="gnr-rule-item">
                <span className="gnr-num">5.</span>
                <span>
                  Kartu ini adalah milik {companyTemplate === 'gesit' ? 'The Gesit Companies' : 'Gesit Natural Resources'}, jika menemukan kartu ini harap dikembalikan ke :
                </span>
              </div>
            </div>

            {/* Blok Alamat Kantor */}
            <div className="gnr-address-block">
              <div className="gnr-company-name">
                {companyTemplate === 'gesit' ? 'The Gesit Companies' : 'Gesit Natural Resources'}
              </div>
              <div className="gnr-address-line">
                {companyTemplate === 'gesit'
                  ? 'The City Tower (TCT) Lt. 27, Jl. M.H. Thamrin No. 81, Jakarta 10310'
                  : 'The City Tower (TCT) Lt. 26, Jl. M.H. Thamrin No. 81, Jakarta 10310'}
              </div>
              <div className="gnr-phone-line">
                {companyTemplate === 'gesit' ? '021 - 3101601' : '021 - 23599441'}
              </div>
            </div>
          </div>

          {/* Layer Grid Guidelines Belakang jika aktif */}
          {isGridVisible && (
            <div className="layer-grid">
              <div className="grid-v" title="Sumbu Tengah Vertikal" />
              <div className="grid-v-left" title="Batas Margin Kiri Area Teks" />
              <div className="grid-v-right" title="Batas Margin Kanan Area Teks" />
              <div className="grid-h-top" title="Batas Atas Header" />
              <div className="grid-h-header-bottom" title="Batas Bawah Header" />
              <div className="grid-h-mid" title="Garis Sumbu Pemisah Tengah" />
              <div className="grid-h-bottom" title="Batas Bawah Alamat" />
            </div>
          )}
        </div>
      </div>

      {/* Interactive Drag & Gesture Hint */}
      <div className="flex items-center justify-center gap-2 mt-4 px-3 py-2 rounded-lg bg-secondary/50 border border-border text-xs text-muted-foreground text-center w-full max-w-[340px]">
        <Move className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
        <span>
          {activeSide === 'front'
            ? 'Seret foto langsung dengan mouse / layar sentuh. Scroll roda mouse untuk zoom.'
            : 'Tampak belakang resmi: Vision, Mission, Values, & Perhatian.'}
        </span>
      </div>
    </Card>
  );
}
