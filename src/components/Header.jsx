import React from 'react';
import { Grid3X3, CreditCard, FlipHorizontal, Building2, Sun, Moon, ChevronDown, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Header({
  isGridVisible,
  toggleGrid,
  activeSide,
  setActiveSide,
  companyTemplate,
  setCompanyTemplate,
  theme = 'dark',
  toggleTheme,
  activePage = 'idcard',
  setActivePage,
}) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/70 bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-3">

        {/* ── Brand ── */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Logo mark */}
          <div className="relative w-8 h-8 rounded-lg bg-foreground flex items-center justify-center shadow-sm shrink-0">
            {activePage === 'poseflow' ? (
              <Sparkles className="w-4 h-4 text-background" />
            ) : (
              <CreditCard className="w-4 h-4 text-background" />
            )}
          </div>
          <div className="hidden sm:flex flex-col leading-tight">
            <span className="text-sm font-semibold tracking-tight text-foreground">
              {activePage === 'poseflow' ? 'PoseFlow AI' : 'ID Card Studio'}
            </span>
            <span className="text-[10px] text-muted-foreground font-medium tracking-wide uppercase">
              {activePage === 'poseflow' ? 'Gemini 3.1 Multimodal' : 'Pro — CR80 Standard'}
            </span>
          </div>
          <span className="sm:hidden text-sm font-semibold text-foreground">
            {activePage === 'poseflow' ? 'PoseFlow AI' : 'ID Card Studio'}
          </span>
        </div>

        {/* ── Page Switcher (Sub Menu) ── */}
        <div className="flex items-center rounded-lg border border-border bg-muted/40 p-0.5 gap-0.5">
          {[
            { id: 'idcard', label: 'ID Card', icon: CreditCard },
            { id: 'poseflow', label: 'PoseFlow AI', icon: Sparkles },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActivePage(id)}
              className={cn(
                'flex items-center gap-1.5 px-3 h-7 text-xs font-medium rounded-md transition-all duration-150 whitespace-nowrap',
                activePage === id
                  ? 'bg-background text-foreground shadow-sm border border-border/60'
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
              )}
            >
              <Icon className="w-3 h-3 shrink-0" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* ── Center Controls (ID Card only) ── */}
        {activePage === 'idcard' && (
          <div className="flex items-center gap-2">

            {/* Company Switcher */}
            <div className="hidden sm:flex items-center rounded-lg border border-border bg-muted/40 p-0.5 gap-0.5">
              {[
                { id: 'gesit', label: 'The Gesit Companies', short: 'Gesit' },
                { id: 'gnr',   label: 'Gesit Natural Resources', short: 'GNR' },
              ].map(({ id, label, short }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setCompanyTemplate(id)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 h-7 text-xs font-medium rounded-md transition-all duration-150 whitespace-nowrap',
                    companyTemplate === id
                      ? 'bg-background text-foreground shadow-sm border border-border/60'
                      : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                  )}
                >
                  <Building2 className="w-3 h-3 shrink-0" />
                  <span className="hidden md:inline">{label}</span>
                  <span className="md:hidden">{short}</span>
                </button>
              ))}
            </div>

            {/* Mobile: Company selector compact */}
            <button
              type="button"
              onClick={() => setCompanyTemplate(companyTemplate === 'gesit' ? 'gnr' : 'gesit')}
              className="sm:hidden flex items-center gap-1.5 px-2.5 h-8 text-xs font-medium rounded-lg border border-border bg-muted/40 text-muted-foreground hover:text-foreground transition-all"
            >
              <Building2 className="w-3 h-3" />
              <span>{companyTemplate === 'gesit' ? 'Gesit' : 'GNR'}</span>
              <ChevronDown className="w-3 h-3" />
            </button>

            {/* Divider */}
            <div className="hidden sm:block w-px h-5 bg-border/60" />

            {/* Side Switcher */}
            <div className="flex items-center rounded-lg border border-border bg-muted/40 p-0.5 gap-0.5">
              {[
                { id: 'front', label: 'Depan', labelFull: 'Tampak Depan' },
                { id: 'back',  label: 'Belakang', labelFull: 'Tampak Belakang' },
              ].map(({ id, label, labelFull }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveSide(id)}
                  className={cn(
                    'flex items-center gap-1.5 px-2.5 sm:px-3 h-7 text-xs font-medium rounded-md transition-all duration-150 whitespace-nowrap',
                    activeSide === id
                      ? 'bg-background text-foreground shadow-sm border border-border/60'
                      : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                  )}
                >
                  <FlipHorizontal className="w-3 h-3 shrink-0" />
                  <span className="hidden sm:inline">{labelFull}</span>
                  <span className="sm:hidden">{label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Right Controls ── */}
        <div className="flex items-center gap-1.5 shrink-0">

          {/* Grid Toggle (ID Card only) */}
          {activePage === 'idcard' && (
            <button
              type="button"
              onClick={toggleGrid}
              title="Toggle Grid Guide"
              className={cn(
                'flex items-center gap-1.5 px-2.5 h-8 text-xs font-medium rounded-lg border transition-all duration-150',
                isGridVisible
                  ? 'border-border bg-secondary text-foreground'
                  : 'border-transparent bg-transparent text-muted-foreground hover:text-foreground hover:border-border hover:bg-muted/40'
              )}
            >
              <Grid3X3 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px]">Grid</span>
            </button>
          )}

          {/* Divider */}
          <div className="w-px h-5 bg-border/60" />

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-transparent text-muted-foreground hover:text-foreground hover:border-border hover:bg-muted/40 transition-all duration-150"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </button>
        </div>

      </div>
    </header>
  );
}
