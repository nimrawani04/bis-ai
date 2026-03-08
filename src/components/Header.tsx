import { Shield, Menu, X, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useTheme } from '@/components/ThemeProvider';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <a href="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-hero">
            <Shield className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">
            ISI <span className="text-primary">Guardian</span>
          </span>
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-5">
          <a href="#alerts" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Alerts
          </a>
          <a href="#verify" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Verify
          </a>
          <a href="#scanner" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Scanner
          </a>
          <a href="#community" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Community
          </a>
          <a href="#knowledge" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Knowledge
          </a>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </button>
          <a href="#report">
            <Button variant="accent" size="sm">
              Report Unsafe Product
            </Button>
          </a>
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background p-4 animate-fade-in">
          <nav className="flex flex-col gap-4">
            <a href="#alerts" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Safety Alerts
            </a>
            <a href="#verify" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Verify Product
            </a>
            <a href="#scanner" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Safety Scanner
            </a>
            <a href="#community" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Community
            </a>
            <a href="#knowledge" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Knowledge Hub
            </a>
            <a href="#report">
              <Button variant="accent" size="sm" className="w-full">
                Report Unsafe Product
              </Button>
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
