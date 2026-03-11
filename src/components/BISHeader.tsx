import { Shield, Menu, X, Sun, Moon, LogIn, LogOut, HelpCircle, WifiOff } from 'lucide-react';
import { OfflineBanner } from '@/components/OfflineBanner';
import { LowBandwidthToggle } from '@/components/LowBandwidthToggle';
import { Button } from '@/components/ui/button';
import { useState, useRef, useEffect } from 'react';
import { useTheme } from '@/components/ThemeProvider';
import { Link, useLocation } from 'react-router-dom';
import ashokaChakra from '@/assets/ashoka-chakra.png';
import { useAuth } from '@/hooks/useAuth';

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
    <div className="w-full bg-[hsl(var(--flag-navy))] text-white/90 text-[9px] sm:text-xs py-1 px-2 sm:px-4 text-center tracking-wide flex items-center justify-center gap-1.5 sm:gap-2">
      <img src={ashokaChakra} alt="Ashoka Chakra" className="h-3.5 w-3.5 sm:h-5 sm:w-5 invert brightness-200 shrink-0" />
      <span className="truncate">
        <span className="font-medium">भारतीय मानक ब्यूरो</span>
        <span className="mx-1 sm:mx-2 opacity-40">|</span>
        <span className="hidden xs:inline">Bureau of Indian Standards — </span>
        <span className="xs:hidden">BIS — </span>
        <span className="hidden sm:inline">Ministry of Consumer Affairs, Govt. of India</span>
        <span className="sm:hidden">Govt. of India</span>
      </span>
    </div>
  );
}

function UserAvatarDropdown({ user, signOut }: { user: any; signOut: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const initials = user.email
    ? user.email.substring(0, 2).toUpperCase()
    : 'U';

  return (
    <div className="relative ml-1" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold ring-2 ring-primary/20 hover:ring-primary/40 transition-all"
        aria-label="User menu"
      >
        {user.user_metadata?.avatar_url ? (
          <img src={user.user_metadata.avatar_url} alt="Avatar" className="h-9 w-9 rounded-full object-cover" />
        ) : (
          initials
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-64 rounded-xl border border-border bg-card shadow-xl z-50 overflow-hidden animate-fade-in">
          <div className="px-4 py-3 border-b border-border bg-muted/30">
            <p className="text-sm font-medium text-foreground truncate">{user.user_metadata?.full_name || 'User'}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
          <div className="py-1">
            <Link
              to="/about"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-secondary/50 transition-colors"
            >
              <HelpCircle className="h-4 w-4 text-muted-foreground" />
              About BIS
            </Link>
          </div>
          <div className="border-t border-border py-1">
            <button
              onClick={() => { signOut(); setOpen(false); }}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function BISHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const { user, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full">
      <OfflineBanner />
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
            {user ? (
              <UserAvatarDropdown user={user} signOut={signOut} />
            ) : (
              <Link to="/auth">
                <Button size="sm" className="ml-1">
                  <LogIn className="h-3.5 w-3.5 mr-1" /> Sign In
                </Button>
              </Link>
            )}
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
            <div className="border-t border-border mt-2 pt-2">
              {user ? (
                <div className="space-y-2 px-3 py-2">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0">
                      {user.user_metadata?.avatar_url ? (
                        <img src={user.user_metadata.avatar_url} alt="Avatar" className="h-8 w-8 rounded-full object-cover" />
                      ) : (
                        user.email?.substring(0, 2).toUpperCase()
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{user.user_metadata?.full_name || 'User'}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="w-full" onClick={() => { signOut(); setMobileMenuOpen(false); }}>
                    <LogOut className="h-3.5 w-3.5 mr-1" /> Sign Out
                  </Button>
                </div>
              ) : (
                <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                  <Button size="sm" className="w-full">
                    <LogIn className="h-3.5 w-3.5 mr-1" /> Sign In
                  </Button>
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
