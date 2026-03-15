import { Search, AlertTriangle, BookOpen, ShoppingCart, FileWarning, Award, CheckCircle2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLowBandwidth } from '@/hooks/useLowBandwidth';

const quickLinks = [
  { icon: Search, title: 'Verify Product', description: 'Check ISI/BIS certification by product name or certificate number', href: '#verify', color: 'border-l-primary' },
  { icon: ShoppingCart, title: 'Check Before Buying', description: 'AI-powered safety guide before making a purchase', href: '#safety-assistant', color: 'border-l-[hsl(var(--flag-saffron))]' },
  { icon: FileWarning, title: 'Report Unsafe Product', description: 'Report counterfeit or dangerous products to BIS', href: '#report', color: 'border-l-danger' },
  { icon: BookOpen, title: 'Standards & Certification', description: 'Learn about BIS certifications, ISI marks and consumer rights', href: '#knowledge', color: 'border-l-success' },
];

const stats = [
  { value: '22,000+', label: 'Indian Standards Published', icon: CheckCircle2 },
  { value: '900+', label: 'Mandatory ISI Products', icon: Award },
  { value: '1,240', label: 'Products Verified', icon: Search },
];

const notices = [
  { date: '15 Mar 2026', text: 'BIS mandates hallmarking for gold jewellery — HUID required for all pieces above 2g.' },
  { date: '10 Mar 2026', text: 'New CRS product categories added: Smart Meters, EV Chargers, and Solar Panels.' },
  { date: '05 Mar 2026', text: 'Consumer awareness drive launched in 50 cities — verify ISI mark before purchase.' },
];

export function Hero() {
  const { isLowBandwidth } = useLowBandwidth();

  return (
    <section>
      {/* Hero banner — GoI portal style */}
      <div className="gradient-hero py-8 sm:py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-6 items-start">
            {/* Main headline */}
            <div className="lg:col-span-2">
              <div className="inline-flex items-center gap-2 bg-[hsl(var(--flag-saffron))/20] border border-[hsl(var(--flag-saffron))/30] text-[hsl(var(--flag-saffron))] px-3 py-1 text-xs font-semibold uppercase tracking-widest rounded-sm mb-4">
                Official Consumer Safety Portal
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight mb-3" style={{ fontFamily: "'Noto Sans', sans-serif" }}>
                BIS AI — Consumer Product Safety
              </h1>
              <p className="text-sm sm:text-base text-white/70 max-w-xl mb-6 leading-relaxed">
                Verify ISI/BIS certifications, detect counterfeit products, and access official Bureau of Indian Standards information. Powered by AI, grounded in official BIS data.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button asChild className="bg-[hsl(var(--flag-saffron))] hover:bg-[hsl(28,100%,44%)] text-white rounded-sm h-9 px-5 text-sm font-semibold shadow-none border-0">
                  <a href="#verify"><Search className="h-4 w-4 mr-2" />Verify Product</a>
                </Button>
                <Button asChild variant="outline" className="border-white/30 text-white hover:bg-white/10 hover:text-white rounded-sm h-9 px-5 text-sm">
                  <a href="#knowledge">Standards Library</a>
                </Button>
                <Button asChild variant="outline" className="border-white/30 text-white hover:bg-white/10 hover:text-white rounded-sm h-9 px-5 text-sm">
                  <a href="https://www.bis.gov.in" target="_blank" rel="noreferrer">
                    <ExternalLink className="h-3.5 w-3.5 mr-1.5" />bis.gov.in
                  </a>
                </Button>
              </div>
            </div>

            {/* Notice board — classic GoI portal element */}
            <div className="bg-white/5 border border-white/10 rounded-sm p-4">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/10">
                <div className="h-2 w-2 rounded-full bg-[hsl(var(--flag-saffron))] animate-pulse" />
                <span className="text-xs font-bold text-white uppercase tracking-widest">Latest Updates</span>
              </div>
              <div className="space-y-3">
                {notices.map((n, i) => (
                  <div key={i} className="flex gap-2 text-xs">
                    <span className="text-white/40 shrink-0 tabular-nums">{n.date}</span>
                    <p className="text-white/75 leading-relaxed">{n.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="bg-primary/95 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-center sm:justify-start gap-6 sm:gap-10">
          {stats.map((s) => (
            <div key={s.label} className="flex items-center gap-2">
              <s.icon className="h-4 w-4 text-[hsl(var(--flag-saffron))]" />
              <span className="text-white font-bold text-sm">{s.value}</span>
              <span className="text-white/60 text-xs">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick access cards — GoI portal grid */}
      <div className="bg-secondary/40 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {quickLinks.map((card) => (
              <a
                key={card.title}
                href={card.href}
                className={`bg-white dark:bg-card border border-border border-l-4 ${card.color} rounded-sm p-4 hover:shadow-md transition-shadow group`}
              >
                <div className="flex items-start gap-3">
                  <card.icon className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{card.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{card.description}</p>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
