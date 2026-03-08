import { Shield, Search, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Hero() {
  return (
    <section className="relative overflow-hidden py-20 lg:py-28">
      {/* Background Pattern */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="container">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary animate-fade-in">
            <Shield className="h-4 w-4" />
            Bureau of Indian Standards Verification
          </div>

          {/* Headline */}
          <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl animate-fade-in">
            Verify Product Safety
            <span className="block text-primary">Before You Buy</span>
          </h1>

          {/* Subheadline */}
          <p className="mb-10 text-lg text-muted-foreground max-w-2xl mx-auto animate-fade-in">
            ISI Guardian helps you verify ISI/BIS certifications, detect fake products, 
            and make informed purchasing decisions. Protect your family from unsafe products.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-fade-in">
            <Button variant="hero" size="xl" asChild>
              <a href="#verify">
                <Search className="h-5 w-5" />
                Verify Product Now
              </a>
            </Button>
            <Button variant="outline" size="xl" asChild>
              <a href="#search">
                Learn About Standards
              </a>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto animate-fade-in">
            <div className="flex flex-col items-center p-6 rounded-2xl bg-card shadow-card">
              <CheckCircle2 className="h-10 w-10 text-success mb-3" />
              <div className="text-3xl font-bold text-foreground">25,000+</div>
              <div className="text-sm text-muted-foreground">Certified Products</div>
            </div>
            <div className="flex flex-col items-center p-6 rounded-2xl bg-card shadow-card">
              <AlertTriangle className="h-10 w-10 text-warning mb-3" />
              <div className="text-3xl font-bold text-foreground">500+</div>
              <div className="text-sm text-muted-foreground">Fake Products Detected</div>
            </div>
            <div className="flex flex-col items-center p-6 rounded-2xl bg-card shadow-card">
              <Shield className="h-10 w-10 text-primary mb-3" />
              <div className="text-3xl font-bold text-foreground">100+</div>
              <div className="text-sm text-muted-foreground">Safety Standards</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
