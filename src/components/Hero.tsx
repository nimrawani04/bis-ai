import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Search, AlertTriangle, BookOpen, ShoppingCart, CheckCircle2, FileWarning, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useLowBandwidth } from '@/hooks/useLowBandwidth';
import { BISLogo } from '@/components/BISLogo';

const actionCards = [
  { icon: Search, title: 'Scan Product', description: 'Verify ISI/BIS certification by product name or certificate number', href: '#verify', color: 'text-primary', bg: 'bg-primary/10', border: 'hover:border-primary/30' },
  { icon: ShoppingCart, title: 'Check Before Buying', description: 'Get AI-powered safety guides before making a purchase decision', href: '#safety-assistant', color: 'text-accent', bg: 'bg-accent/10', border: 'hover:border-accent/30' },
  { icon: FileWarning, title: 'Report Unsafe Product', description: 'Help protect consumers by reporting counterfeit or dangerous products', href: '#report', color: 'text-danger', bg: 'bg-danger/10', border: 'hover:border-danger/30' },
  { icon: BookOpen, title: 'Learn Standards', description: 'Understand BIS certifications, ISI marks, and consumer safety rights', href: '#knowledge', color: 'text-warning', bg: 'bg-warning/10', border: 'hover:border-warning/30' },
];

const stats = [
  { value: 1240, label: 'Products Verified', icon: CheckCircle2, color: 'text-success' },
  { value: 87, label: 'Unsafe Reports', icon: AlertTriangle, color: 'text-danger' },
  { value: 120, label: 'Certified Brands', icon: Award, color: 'text-primary' },
];

function useCountUp(target: number, duration = 2000, disabled = false) {
  const [count, setCount] = useState(disabled ? target : 0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    if (disabled) { setCount(target); return; }
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const step = (now: number) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.round(eased * target));
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration, disabled]);

  return { count, ref };
}

function StatItem({ value, label, icon: Icon, color, noAnimation }: { value: number; label: string; icon: typeof CheckCircle2; color: string; noAnimation?: boolean }) {
  const { count, ref } = useCountUp(value, 2000, noAnimation);
  const formatted = count.toLocaleString('en-IN');
  return (
    <div ref={ref} className="flex items-center gap-3 text-center sm:text-left">
      <div className="p-2.5 rounded-xl bg-card shadow-card">
        <Icon className={`h-6 w-6 ${color}`} />
      </div>
      <div>
        <div className="text-2xl font-extrabold text-foreground tabular-nums">{formatted}</div>
        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</div>
      </div>
    </div>
  );
}

function ActionCardStatic({ card }: { card: typeof actionCards[0] }) {
  return (
    <a href={card.href}>
      <Card className="h-full border hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className={`inline-flex items-center justify-center h-10 w-10 rounded-lg ${card.bg} mb-3`}>
            <card.icon className={`h-5 w-5 ${card.color}`} />
          </div>
          <h3 className="font-bold text-foreground mb-1 text-sm">{card.title}</h3>
          <p className="text-xs text-muted-foreground">{card.description}</p>
        </CardContent>
      </Card>
    </a>
  );
}

export function Hero() {
  const { isLowBandwidth } = useLowBandwidth();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  if (isLowBandwidth) {
    return (
      <section>
        <div className="py-16 lg:py-24 gradient-hero">
          <div className="container">
            <div className="mx-auto max-w-4xl text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/10 px-4 py-2 text-sm font-medium text-white/90">
                <BISLogo className="h-4 w-4" />
                Bureau of Indian Standards
              </div>
              <h1 className="mb-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
                Verify Product Safety.
                <span className="block mt-2 text-accent">Protect Consumers.</span>
              </h1>
              <p className="mb-8 text-base text-white/70 max-w-2xl mx-auto">
                Verify ISI/BIS certifications, detect fake products, and make informed purchasing decisions.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground" asChild>
                  <a href="#verify"><Search className="h-4 w-4" /> Verify Product Now</a>
                </Button>
                <Button variant="outline" size="lg" className="border-white/20 text-white hover:bg-white/10 hover:text-white" asChild>
                  <a href="#knowledge">Learn Standards</a>
                </Button>
              </div>
            </div>
          </div>
        </div>
        <div className="container -mt-6 z-10 relative pb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 max-w-5xl mx-auto">
            {actionCards.map((card) => <ActionCardStatic key={card.title} card={card} />)}
          </div>
        </div>
        <div className="border-y border-border bg-secondary/30">
          <div className="container py-6">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12 max-w-3xl mx-auto">
              {stats.map((stat) => <StatItem key={stat.label} {...stat} noAnimation />)}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={heroRef} className="relative overflow-hidden">
      <div className="relative py-20 lg:py-28 overflow-hidden">
        <motion.div className="absolute inset-0 gradient-hero" style={{ y: bgY }} />
        <motion.div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px', y: bgY }} />
        <motion.div className="container relative" style={{ y: textY, opacity }}>
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 px-4 py-2 text-sm font-medium text-white/90 animate-fade-in">
              <BISLogo className="h-4 w-4" /> Bureau of Indian Standards Verification
            </div>
            <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl animate-fade-in">
              Verify Product Safety.
              <span className="block mt-2 text-accent">Protect Consumers.</span>
            </h1>
            <p className="mb-10 text-lg text-white/70 max-w-2xl mx-auto animate-fade-in">
              BIS AI helps you verify ISI/BIS certifications, detect fake products, and make informed purchasing decisions. Protect your family from unsafe products.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">
              <Button size="xl" className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg shadow-accent/25" asChild>
                <a href="#verify"><Search className="h-5 w-5" /> Verify Product Now</a>
              </Button>
              <Button variant="outline" size="xl" className="border-white/20 text-white hover:bg-white/10 hover:text-white" asChild>
                <a href="#knowledge">Learn About Standards</a>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
      <div className="container relative -mt-8 z-10 pb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
          {actionCards.map((card, index) => (
            <motion.a key={card.title} href={card.href} className="group" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}>
              <Card className={`h-full shadow-elevated border-2 border-transparent transition-all duration-300 ${card.border} hover:shadow-lg hover:-translate-y-1`}>
                <CardContent className="p-5">
                  <div className={`inline-flex items-center justify-center h-12 w-12 rounded-xl ${card.bg} mb-4`}>
                    <card.icon className={`h-6 w-6 ${card.color}`} />
                  </div>
                  <h3 className="font-bold text-foreground mb-1.5 text-base">{card.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{card.description}</p>
                </CardContent>
              </Card>
            </motion.a>
          ))}
        </div>
      </div>
      <div className="border-y border-border bg-secondary/30">
        <div className="container py-8">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-16 max-w-3xl mx-auto">
            {stats.map((stat) => <StatItem key={stat.label} {...stat} />)}
          </div>
        </div>
      </div>
    </section>
  );
}
