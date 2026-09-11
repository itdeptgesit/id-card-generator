import React from 'react';
import { CreditCard, Sun, Moon, ChevronDown, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

function Segment({ active, onClick, title, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={cn(
        'relative inline-flex h-7 items-center gap-1.5 rounded-[6px] px-2.5 text-xs font-medium whitespace-nowrap transition-colors duration-150',
        active
          ? 'bg-card text-foreground shadow-sm ring-1 ring-border'
          : 'text-muted-foreground hover:text-foreground'
      )}
    >
      {children}
    </button>
  );
}

function Group({ children, className }) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-0.5 rounded-lg border border-border/70 bg-muted/50 p-0.5',
        className
      )}
    >
      {children}
    </div>
  );
}

export default function Header({
  companyTemplate,
  setCompanyTemplate,
  theme = 'dark',
  toggleTheme,
}) {
  const isGesit = companyTemplate === 'gesit';

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/70 bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/85 transition-colors duration-200">
      {/* Brand accent line */}
      <div className="h-[3px] w-full flex">
        <span className="h-full w-16 bg-[#BE913B]" />
        <span className="h-full w-6 bg-[#BE913B]/40" />
        <span className="h-full flex-1 bg-transparent" />
      </div>

      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-2 px-3 sm:px-6">

        {/* ── Brand ── */}
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-foreground shadow-sm">
            <CreditCard className="h-[18px] w-[18px] text-background" strokeWidth={2.25} />
            <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-background bg-[#BE913B]" />
          </div>
          <div className="flex min-w-0 flex-col leading-tight">
            <span className="truncate text-sm font-semibold tracking-tight text-foreground uppercase sm:text-[15px]">
              ID Card Maker
            </span>
            <span className="hidden items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground sm:flex">
              <span className="h-1 w-1 rounded-full bg-[#BE913B]" />
              CR80 Standard Generator
            </span>
          </div>
        </div>

        {/* ── Toolbar (Desktop) ── */}
        <div className="hidden items-center gap-2.5 sm:flex">
          <span className="hidden text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground lg:inline">
            Template
          </span>
          <Group>
            {[
              { id: 'gesit', label: 'The Gesit Companies', short: 'Gesit' },
              { id: 'gnr', label: 'Gesit Natural Resources', short: 'GNR' },
            ].map(({ id, label, short }) => (
              <Segment
                key={id}
                active={companyTemplate === id}
                onClick={() => setCompanyTemplate(id)}
              >
                <Building2 className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
                <span className="hidden xl:inline">{label}</span>
                <span className="xl:hidden">{short}</span>
              </Segment>
            ))}
          </Group>
        </div>

        {/* ── Utilities ── */}
        <div className="flex shrink-0 items-center gap-1.5">
          {/* Mobile: compact template selector */}
          <button
            type="button"
            onClick={() => setCompanyTemplate(isGesit ? 'gnr' : 'gesit')}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border/70 bg-muted/50 px-2.5 text-xs font-medium text-foreground transition-colors hover:bg-muted sm:hidden"
          >
            <Building2 className="h-3.5 w-3.5 shrink-0 text-muted-foreground" strokeWidth={2} />
            <span>{isGesit ? 'Gesit' : 'GNR'}</span>
            <ChevronDown className="h-3 w-3 text-muted-foreground" />
          </button>

          <button
            type="button"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Mode terang' : 'Mode gelap'}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-transparent text-muted-foreground transition-colors duration-150 hover:border-border/70 hover:bg-muted/50 hover:text-foreground"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4" strokeWidth={2} />
            ) : (
              <Moon className="h-4 w-4" strokeWidth={2} />
            )}
          </button>
        </div>

      </div>
    </header>
  );
}