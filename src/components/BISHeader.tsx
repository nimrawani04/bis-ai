import { Shield, Menu, X, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useTheme } from '@/components/ThemeProvider';
import { Link, useLocation } from 'react-router-dom';
import ashokaChakra from '@/assets/ashoka-chakra.png';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/chat', label: 'Ask BIS' },
  { to: '/certification', label: 'Certification Guide' },
  { to: '/standards', label: 'Standards Explorer' },
  { to: '/about', label: 'About BIS' },
];

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

export function BISHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 w-full">
      <TricolorStrip />
      <GovBanner />
      <div className="border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary shadow-sm">
              <Shield className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-base font-bold text-foreground tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                BIS<span className="text-primary"> Smart</span>
              </span>
              <span className="text-[9px] font-medium text-muted-foreground tracking-wider uppercase">
                Assistant
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                  location.pathname === link.to
                    ? 'text-primary bg-primary/10'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="w-px h-6 bg-border mx-2" />
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </button>
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
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                  location.pathname === link.to
                    ? 'text-primary bg-primary/10'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
