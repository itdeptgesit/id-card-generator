import React from 'react';
import { BadgeCheck, Grid, Layers, Building2, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
}) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 dark:bg-[#0d0d0d]/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 dark:supports-[backdrop-filter]:bg-[#0d0d0d]/80 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 h-auto min-h-[64px] flex items-center justify-between gap-2 sm:gap-4 flex-wrap py-2 sm:py-0">
        {/* Brand Header */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-secondary border border-border flex items-center justify-center text-foreground shadow-sm">
            <BadgeCheck className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-bold tracking-tight text-foreground">
                ID Card Studio Pro
              </h1>
              <Badge variant="amber" className="text-[10px] px-1.5 py-0 h-4 rounded-full">
                v2.0
              </Badge>
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground hidden xs:block sm:block">
              The Gesit Companies • Standar Presisi CR80
            </p>
          </div>
        </div>

        {/* Company Template Switcher - scrollable on mobile */}
        <div className="flex items-center bg-secondary/80 p-1 rounded-xl border border-border overflow-x-auto max-w-full scrollbar-hide">
          <Button
            type="button"
            variant={companyTemplate === 'gesit' ? 'amber' : 'ghost'}
            size="sm"
            onClick={() => setCompanyTemplate('gesit')}
            className={cn(
              'h-7 text-xs font-semibold gap-1.5 px-2.5 sm:px-3 whitespace-nowrap rounded-lg transition-all',
              companyTemplate !== 'gesit' && 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Building2 className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">The Gesit Companies</span>
            <span className="sm:hidden">Gesit</span>
          </Button>

          <Button
            type="button"
            variant={companyTemplate === 'gnr' ? 'amber' : 'ghost'}
            size="sm"
            onClick={() => setCompanyTemplate('gnr')}
            className={cn(
              'h-7 text-xs font-semibold gap-1.5 px-2.5 sm:px-3 whitespace-nowrap rounded-lg transition-all',
              companyTemplate !== 'gnr' && 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Building2 className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">Gesit Natural Resources</span>
            <span className="sm:hidden">GNR</span>
          </Button>
        </div>

        {/* Side Switcher, Grid Toggle & Theme Switcher */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Tampak Depan / Belakang */}
          <div className="flex items-center bg-secondary/80 p-1 rounded-xl border border-border">
            <Button
              type="button"
              variant={activeSide === 'front' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setActiveSide('front')}
              className={cn(
                'h-7 text-xs gap-1.5 px-2 sm:px-3 rounded-lg transition-all',
                activeSide === 'front'
                  ? 'bg-white text-zinc-950 dark:bg-white dark:text-zinc-950 font-semibold shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Tampak Depan</span>
              <span className="md:hidden">Depan</span>
            </Button>

            <Button
              type="button"
              variant={activeSide === 'back' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setActiveSide('back')}
              className={cn(
                'h-7 text-xs gap-1.5 px-2 sm:px-3 rounded-lg transition-all',
                activeSide === 'back'
                  ? 'bg-white text-zinc-950 dark:bg-white dark:text-zinc-950 font-semibold shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Tampak Belakang</span>
              <span className="md:hidden">Blkg</span>
            </Button>
          </div>

          {/* Grid Toggle */}
          <Button
            type="button"
            variant={isGridVisible ? 'secondary' : 'ghost'}
            size="sm"
            onClick={toggleGrid}
            className={cn(
              'h-8 w-8 sm:w-auto sm:px-3 text-xs gap-1.5 border border-border justify-center rounded-lg',
              isGridVisible
                ? 'text-foreground bg-secondary font-medium'
                : 'text-muted-foreground hover:text-foreground'
            )}
            title="Nyalakan/Matikan Panduan Garis Grid"
          >
            <Grid className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Grid: {isGridVisible ? 'ON' : 'OFF'}</span>
          </Button>

          {/* Theme Toggle (Light / Dark Mode) */}
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={toggleTheme}
            className="h-8 w-8 border-border text-foreground hover:bg-secondary transition-all shrink-0 rounded-lg"
            title={theme === 'dark' ? 'Beralih ke Mode Terang (Light Mode)' : 'Beralih ke Mode Gelap (Dark Mode)'}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-zinc-200 animate-in spin-in-90 duration-300" />
            ) : (
              <Moon className="w-4 h-4 text-zinc-800 animate-in spin-in-90 duration-300" />
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
