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
    <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4 flex-wrap">
        {/* Brand Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shadow-sm">
            <BadgeCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight text-foreground">
                ID Card Studio Pro
              </h1>
              <Badge variant="amber" className="text-[10px] px-1.5 py-0 h-4">
                v2.0
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              The Gesit Companies • Standar Presisi CR80
            </p>
          </div>
        </div>

        {/* Company Template Switcher */}
        <div className="flex items-center bg-muted/70 p-1 rounded-lg border border-border">
          <Button
            type="button"
            variant={companyTemplate === 'gesit' ? 'amber' : 'ghost'}
            size="sm"
            onClick={() => setCompanyTemplate('gesit')}
            className={cn(
              'h-7 text-xs font-semibold gap-1.5 px-3',
              companyTemplate !== 'gesit' && 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>The Gesit Companies</span>
          </Button>

          <Button
            type="button"
            variant={companyTemplate === 'gnr' ? 'amber' : 'ghost'}
            size="sm"
            onClick={() => setCompanyTemplate('gnr')}
            className={cn(
              'h-7 text-xs font-semibold gap-1.5 px-3',
              companyTemplate !== 'gnr' && 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Gesit Natural Resources</span>
          </Button>
        </div>

        {/* Side Switcher, Grid Toggle & Theme Switcher */}
        <div className="flex items-center gap-2">
          {/* Tampak Depan / Belakang */}
          <div className="flex items-center bg-muted/70 p-1 rounded-lg border border-border">
            <Button
              type="button"
              variant={activeSide === 'front' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setActiveSide('front')}
              className={cn(
                'h-7 text-xs gap-1.5 px-3',
                activeSide === 'front'
                  ? 'bg-background shadow text-foreground font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Tampak Depan</span>
            </Button>

            <Button
              type="button"
              variant={activeSide === 'back' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setActiveSide('back')}
              className={cn(
                'h-7 text-xs gap-1.5 px-3',
                activeSide === 'back'
                  ? 'bg-background shadow text-foreground font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Tampak Belakang</span>
            </Button>
          </div>

          {/* Grid Toggle */}
          <Button
            type="button"
            variant={isGridVisible ? 'outline' : 'ghost'}
            size="sm"
            onClick={toggleGrid}
            className={cn(
              'h-8 text-xs gap-1.5 border-border',
              isGridVisible
                ? 'text-cyan-600 dark:text-cyan-400 border-cyan-500/30 bg-cyan-500/10'
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
            className="h-8 w-8 border-border text-foreground hover:bg-secondary transition-all"
            title={theme === 'dark' ? 'Beralih ke Mode Terang (Light Mode)' : 'Beralih ke Mode Gelap (Dark Mode)'}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400 animate-in spin-in-90 duration-300" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700 animate-in spin-in-90 duration-300" />
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
