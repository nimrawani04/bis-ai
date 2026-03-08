import { Shield, Menu, X, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useTheme } from '@/components/ThemeProvider';

function TricolorStrip() {
  return <div className="tricolor-strip w-full" />;
}

function GovBanner() {
  return (
    <div className="w-full bg-[hsl(var(--flag-navy))] text-white/90 text-[10px] sm:text-xs py-1 px-4 text-center tracking-wide">
      <span className="font-medium">भारतीय मानक ब्यूरो</span>
      <span className="mx-2 opacity-40">|</span>
      <span>Bureau of Indian Standards — Ministry of Consumer Affairs, Govt. of India</span>
    </div>
  );
}

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  return (
    <header className="sticky top-0 z-50 w-full">
      <TricolorStrip />
      <GovBanner />
      <div className="border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <a href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-hero shadow-sm">
              <Shield className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-base font-bold text-foreground tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Standard<span className="text-primary">Shield</span>
              </span>
              <span className="text-[9px] font-medium text-muted-foreground tracking-wider uppercase">
                Product Safety
              </span>
            </div>
          </a>

          <nav className="hidden md:flex items-center gap-1">
            {[
              { href: '#alerts', label: 'Alerts' },
              { href: '#verify', label: 'Verify' },
              { href: '#safety-assistant', label: 'AI Guide' },
              { href: '#scanner', label: 'Scanner' },
              { href: '#community', label: 'Community' },
              { href: '#knowledge', label: 'Knowledge' },
            ].map(link => (
              <a
                key={link.href}
                href={link.href}
                className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-lg transition-all"
              >
                {link.label}
              </a>
            ))}
            <div className="w-px h-6 bg-border mx-2" />
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </button>
            <a href="#report">
              <Button size="sm" className="ml-1 bg-danger hover:bg-danger/90 text-danger-foreground">
                Report Unsafe
              </Button>
            </a>
          </nav>

          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background p-4 animate-fade-in">
          <nav className="flex flex-col gap-1">
            {[
              { href: '#alerts', label: 'Safety Alerts' },
              { href: '#verify', label: 'Verify Product' },
              { href: '#safety-assistant', label: 'AI Safety Guide' },
              { href: '#scanner', label: 'Home Scanner' },
              { href: '#community', label: 'Community' },
              { href: '#knowledge', label: 'Knowledge Hub' },
            ].map(link => (
              <a
                key={link.href}
                href={link.href}
                className="px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <a href="#report" onClick={() => setMobileMenuOpen(false)}>
              <Button size="sm" className="w-full mt-2 bg-danger hover:bg-danger/90 text-danger-foreground">
                Report Unsafe Product
              </Button>
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
