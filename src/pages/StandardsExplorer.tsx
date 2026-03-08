import { BISHeader } from '@/components/BISHeader';
import { Footer } from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';
import { useState, useMemo } from 'react';
import {
  Cpu, Building2, UtensilsCrossed, Shirt, FlaskConical,
  Cog, Zap, Droplets, Car, MessageSquare, Search, X,
} from 'lucide-react';

const categories = [
  {
    name: 'Electronics & IT',
    icon: Cpu,
    count: '500+',
    description: 'Standards for electronic devices, IT equipment, batteries, and telecom products. Includes CRS requirements.',
    examples: ['IS 616 - Audio equipment', 'IS 13252 - IT equipment safety', 'IS 1293 - Batteries'],
  },
  {
    name: 'Construction & Building',
    icon: Building2,
    count: '800+',
    description: 'Standards for cement, steel, bricks, pipes, and building materials for safe construction.',
    examples: ['IS 269 - Ordinary Portland Cement', 'IS 1786 - Steel bars', 'IS 2062 - Structural steel'],
  },
  {
    name: 'Food Safety',
    icon: UtensilsCrossed,
    count: '400+',
    description: 'Standards for food products, packaging, and safety including drinking water.',
    examples: ['IS 10500 - Drinking water', 'IS 7466 - Packaged food', 'IS 4162 - Edible oil'],
  },
  {
    name: 'Textiles',
    icon: Shirt,
    count: '300+',
    description: 'Standards for fabrics, garments, and textile products ensuring quality and safety.',
    examples: ['IS 1390 - Cotton fabrics', 'IS 3871 - Handloom products', 'IS 7064 - Wool products'],
  },
  {
    name: 'Chemical',
    icon: FlaskConical,
    count: '350+',
    description: 'Standards for chemicals, pesticides, fertilizers, and related products.',
    examples: ['IS 4707 - Paints', 'IS 5182 - Air quality', 'IS 10500 - Water quality'],
  },
  {
    name: 'Mechanical Engineering',
    icon: Cog,
    count: '600+',
    description: 'Standards for machinery, tools, fasteners, and mechanical components.',
    examples: ['IS 2062 - Steel products', 'IS 1367 - Fasteners', 'IS 5765 - LPG cylinders'],
  },
  {
    name: 'Electrical',
    icon: Zap,
    count: '450+',
    description: 'Standards for electrical equipment, wiring, switches, and safety devices.',
    examples: ['IS 694 - PVC cables', 'IS 3854 - Switches', 'IS 1293 - Batteries'],
  },
  {
    name: 'Water Resources',
    icon: Droplets,
    count: '200+',
    description: 'Standards related to water supply, irrigation, and water quality management.',
    examples: ['IS 10500 - Drinking water', 'IS 4984 - HDPE pipes', 'IS 12235 - Water meters'],
  },
  {
    name: 'Transport',
    icon: Car,
    count: '250+',
    description: 'Standards for vehicles, helmets, automotive parts, and transportation safety.',
    examples: ['IS 4151 - Helmets', 'IS 14164 - Seat belts', 'IS 2553 - Automotive glass'],
  },
];

export default function StandardsExplorer() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return categories;
    const q = search.toLowerCase();
    return categories.filter(
      cat =>
        cat.name.toLowerCase().includes(q) ||
        cat.description.toLowerCase().includes(q) ||
        cat.examples.some(ex => ex.toLowerCase().includes(q))
    );
  }, [search]);

  return (
    <div className="min-h-screen bg-background">
      <BISHeader />
      <main className="py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              Standards Explorer
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Browse BIS standards across product categories
            </p>
          </div>

          {/* Search bar */}
          <div className="max-w-lg mx-auto mb-10">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search standards by keyword (e.g. cement, helmet, food)..."
                className="pl-10 pr-10 h-12 text-base"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            {search && (
              <p className="text-xs text-muted-foreground mt-2 text-center">
                {filtered.length} categor{filtered.length !== 1 ? 'ies' : 'y'} found
              </p>
            )}
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-16 animate-fade-in">
              <Search className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">No categories match "{search}"</p>
              <Button variant="ghost" size="sm" onClick={() => setSearch('')} className="mt-2">
                Clear search
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((cat) => {
                const isOpen = expanded === cat.name;
                return (
                  <Card
                    key={cat.name}
                    className={`cursor-pointer transition-all hover:shadow-md animate-fade-in ${isOpen ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => setExpanded(isOpen ? null : cat.name)}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <cat.icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold text-foreground">{cat.name}</h3>
                          <Badge variant="secondary" className="text-[10px] mt-1">{cat.count} standards</Badge>
                        </div>
                      </div>
                      <p className="text-muted-foreground text-xs mb-2">{cat.description}</p>
                      {isOpen && (
                        <div className="mt-3 pt-3 border-t border-border animate-fade-in">
                          <p className="text-xs font-medium text-foreground mb-2">Example Standards:</p>
                          <ul className="space-y-1">
                            {cat.examples.map((ex) => (
                              <li key={ex} className="text-xs text-muted-foreground">• {ex}</li>
                            ))}
                          </ul>
                          <Link to="/chat" onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="sm" className="mt-3 text-xs gap-1">
                              <MessageSquare className="h-3 w-3" />
                              Ask AI about {cat.name}
                            </Button>
                          </Link>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
