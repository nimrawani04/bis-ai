import { useState, useEffect } from 'react';
import { MapPin, AlertTriangle, Shield, TrendingUp, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';

interface LocationRisk {
  location: string;
  reportCount: number;
  categories: Record<string, number>;
  riskLevel: 'high' | 'medium' | 'low';
  riskScore: number;
}

function getRiskConfig(level: string) {
  switch (level) {
    case 'high':
      return { color: 'text-danger', bg: 'bg-danger/10', border: 'border-danger/30', badge: 'bg-danger text-danger-foreground', dot: 'bg-danger', glow: 'shadow-[0_0_12px_hsl(var(--danger)/0.4)]' };
    case 'medium':
      return { color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/30', badge: 'bg-warning text-warning-foreground', dot: 'bg-warning', glow: 'shadow-[0_0_12px_hsl(var(--warning)/0.4)]' };
    default:
      return { color: 'text-success', bg: 'bg-success/10', border: 'border-success/30', badge: 'bg-success text-success-foreground', dot: 'bg-success', glow: 'shadow-[0_0_12px_hsl(var(--success)/0.4)]' };
  }
}

function computeRisk(count: number): { level: 'high' | 'medium' | 'low'; score: number } {
  if (count >= 4) return { level: 'high', score: Math.min(100, 50 + count * 10) };
  if (count >= 2) return { level: 'medium', score: 30 + count * 10 };
  return { level: 'low', score: count * 15 };
}

export function MarketRiskMap() {
  const [locations, setLocations] = useState<LocationRisk[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState<LocationRisk | null>(null);
  const [totalReports, setTotalReports] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase
        .from('product_reports')
        .select('location, category')
        .not('location', 'is', null);

      if (data) {
        const grouped: Record<string, { count: number; categories: Record<string, number> }> = {};
        for (const row of data) {
          const loc = (row.location ?? '').trim();
          if (!loc) continue;
          if (!grouped[loc]) grouped[loc] = { count: 0, categories: {} };
          grouped[loc].count++;
          grouped[loc].categories[row.category] = (grouped[loc].categories[row.category] || 0) + 1;
        }

        const results: LocationRisk[] = Object.entries(grouped)
          .map(([location, info]) => {
            const { level, score } = computeRisk(info.count);
            return { location, reportCount: info.count, categories: info.categories, riskLevel: level, riskScore: score };
          })
          .sort((a, b) => b.riskScore - a.riskScore);

        setLocations(results);
        setTotalReports(data.length);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const highRisk = locations.filter((l) => l.riskLevel === 'high').length;
  const mediumRisk = locations.filter((l) => l.riskLevel === 'medium').length;
  const lowRisk = locations.filter((l) => l.riskLevel === 'low').length;

  return (
    <section id="riskmap" className="py-20 bg-secondary/30">
      <div className="container">
        <div className="mx-auto max-w-5xl">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 rounded-full bg-danger/10 px-4 py-2 text-sm font-medium text-danger mb-4">
              <MapPin className="h-4 w-4" />
              Market Risk Map
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Unsafe Product Hotspots
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A live risk map showing where unsafe and counterfeit products are being reported most frequently. Helping consumers, authorities, and manufacturers take action.
            </p>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            <Card className="shadow-card text-center">
              <CardContent className="p-5">
                <p className="text-3xl font-bold text-foreground">{totalReports}</p>
                <p className="text-xs text-muted-foreground mt-1">Total Reports</p>
              </CardContent>
            </Card>
            <Card className="shadow-card text-center">
              <CardContent className="p-5">
                <p className="text-3xl font-bold text-danger">{highRisk}</p>
                <p className="text-xs text-muted-foreground mt-1">High Risk Areas</p>
              </CardContent>
            </Card>
            <Card className="shadow-card text-center">
              <CardContent className="p-5">
                <p className="text-3xl font-bold text-warning">{mediumRisk}</p>
                <p className="text-xs text-muted-foreground mt-1">Medium Risk</p>
              </CardContent>
            </Card>
            <Card className="shadow-card text-center">
              <CardContent className="p-5">
                <p className="text-3xl font-bold text-success">{lowRisk}</p>
                <p className="text-xs text-muted-foreground mt-1">Low Risk</p>
              </CardContent>
            </Card>
          </div>

          {/* Visual Risk Map */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Map Visualization */}
            <div className="lg:col-span-2">
              <Card className="shadow-elevated overflow-hidden">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Risk Hotspots
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <p className="text-muted-foreground text-sm py-8 text-center">Loading risk data...</p>
                  ) : locations.length === 0 ? (
                    <p className="text-muted-foreground text-sm py-8 text-center">No location data available yet. Submit reports with location info to populate the map.</p>
                  ) : (
                    <div className="space-y-3">
                      {locations.map((loc) => {
                        const config = getRiskConfig(loc.riskLevel);
                        const isSelected = selectedLocation?.location === loc.location;
                        return (
                          <button
                            key={loc.location}
                            className={`w-full text-left rounded-xl border p-4 transition-all ${
                              isSelected
                                ? `${config.border} ${config.bg} ${config.glow}`
                                : 'border-border hover:border-muted-foreground/30 hover:bg-muted/50'
                            }`}
                            onClick={() => setSelectedLocation(isSelected ? null : loc)}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-3">
                                <div className={`h-3 w-3 rounded-full ${config.dot} animate-pulse`} />
                                <span className="font-semibold text-foreground">{loc.location}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge className={config.badge}>{loc.riskLevel.charAt(0).toUpperCase() + loc.riskLevel.slice(1)}</Badge>
                                <span className="text-xs text-muted-foreground">{loc.reportCount} reports</span>
                              </div>
                            </div>
                            <Progress value={loc.riskScore} className="h-1.5" />
                            {isSelected && (
                              <div className="mt-3 pt-3 border-t border-border/50">
                                <p className="text-xs font-medium text-muted-foreground mb-2">Reported product categories:</p>
                                <div className="flex flex-wrap gap-2">
                                  {Object.entries(loc.categories).map(([cat, count]) => (
                                    <Badge key={cat} variant="outline" className="text-xs">
                                      {cat} ({count})
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Legend & Info Panel */}
            <div className="space-y-6">
              <Card className="shadow-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Eye className="h-4 w-4 text-primary" />
                    Risk Legend
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-4 w-4 rounded-full bg-danger" />
                    <div>
                      <p className="text-sm font-medium text-foreground">High Risk</p>
                      <p className="text-xs text-muted-foreground">4+ reports — avoid purchasing here</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-4 w-4 rounded-full bg-warning" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Medium Risk</p>
                      <p className="text-xs text-muted-foreground">2-3 reports — exercise caution</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-4 w-4 rounded-full bg-success" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Low Risk</p>
                      <p className="text-xs text-muted-foreground">1 report — isolated incident</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" />
                    How It Helps
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <p className="text-muted-foreground"><strong className="text-foreground">Consumers</strong> — avoid high-risk markets</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
                    <p className="text-muted-foreground"><strong className="text-foreground">Authorities</strong> — detect counterfeit distribution networks</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Shield className="h-4 w-4 text-success shrink-0 mt-0.5" />
                    <p className="text-muted-foreground"><strong className="text-foreground">Manufacturers</strong> — identify where fakes are sold</p>
                  </div>
                </CardContent>
              </Card>

              <div className="text-center">
                <a href="#report">
                  <Button variant="accent" size="lg" className="w-full">
                    <AlertTriangle className="h-5 w-5" />
                    Report an Unsafe Product
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
