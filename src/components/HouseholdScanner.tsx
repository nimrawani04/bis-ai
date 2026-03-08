import { useState } from 'react';
import { Home, Plus, Trash2, ShieldCheck, ShieldAlert, ShieldX, AlertTriangle, CheckCircle2, Search, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { searchProducts, getProductByNumber, type Product } from '@/data/products';

interface ScannedProduct {
  query: string;
  product: Product | null;
}

function getOverallScore(items: ScannedProduct[]): number {
  if (items.length === 0) return 0;
  const scores = items.map((item) => {
    if (!item.product) return 0;
    if (item.product.status === 'verified') return 100;
    if (item.product.status === 'warning' || item.product.status === 'expired') return 50;
    return 10;
  });
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
}

function getScoreConfig(score: number) {
  if (score >= 80) return { label: 'Excellent', icon: ShieldCheck, color: 'text-success', bg: 'bg-success/10', border: 'border-success/30', bar: 'bg-success' };
  if (score >= 50) return { label: 'Needs Attention', icon: ShieldAlert, color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/30', bar: 'bg-warning' };
  return { label: 'At Risk', icon: ShieldX, color: 'text-danger', bg: 'bg-danger/10', border: 'border-danger/30', bar: 'bg-danger' };
}

export function HouseholdScanner() {
  const [items, setItems] = useState<ScannedProduct[]>([]);
  const [currentQuery, setCurrentQuery] = useState('');
  const [showReport, setShowReport] = useState(false);

  const addProduct = () => {
    if (!currentQuery.trim()) return;
    const directMatch = getProductByNumber(currentQuery);
    if (directMatch) {
      setItems((prev) => [...prev, { query: currentQuery, product: directMatch }]);
    } else {
      const results = searchProducts(currentQuery);
      setItems((prev) => [...prev, { query: currentQuery, product: results[0] ?? null }]);
    }
    setCurrentQuery('');
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
    if (items.length <= 1) setShowReport(false);
  };

  const score = getOverallScore(items);
  const config = getScoreConfig(score);
  const verified = items.filter((i) => i.product?.status === 'verified').length;
  const unverified = items.filter((i) => !i.product || i.product.status === 'not-found').length;
  const warnings = items.filter((i) => i.product?.status === 'warning' || i.product?.status === 'expired').length;

  return (
    <section id="scanner" className="py-20">
      <div className="container">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-4 py-2 text-sm font-medium text-accent mb-4">
              <Home className="h-4 w-4" />
              Household Safety Scanner
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Scan Your Home Products
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Add the products in your household to get an overall safety score and actionable recommendations.
            </p>
          </div>

          {/* Add Products */}
          <Card className="shadow-elevated mb-8">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Enter product name or certification number"
                    className="pl-12 h-14 text-base"
                    value={currentQuery}
                    onChange={(e) => setCurrentQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addProduct()}
                  />
                </div>
                <Button variant="hero" size="lg" onClick={addProduct} className="h-14">
                  <Plus className="h-5 w-5" />
                  Add Product
                </Button>
              </div>

              {/* Quick add suggestions */}
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="text-sm text-muted-foreground">Quick add:</span>
                {['Steelbird Helmet', 'Prestige Cooker', 'Finolex Cable', 'FAKE-12345'].map((example) => (
                  <button
                    key={example}
                    className="text-sm text-primary hover:underline"
                    onClick={() => {
                      const directMatch = getProductByNumber(example);
                      if (directMatch) {
                        setItems((prev) => [...prev, { query: example, product: directMatch }]);
                      } else {
                        const results = searchProducts(example);
                        setItems((prev) => [...prev, { query: example, product: results[0] ?? null }]);
                      }
                    }}
                  >
                    {example}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Scanned Products List */}
          {items.length > 0 && (
            <div className="space-y-3 mb-8 animate-fade-in">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Scanned Products ({items.length})
              </h3>
              {items.map((item, index) => (
                <Card key={index} className="shadow-card">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {item.product ? (
                        <div className={`p-2 rounded-lg ${
                          item.product.status === 'verified'
                            ? 'bg-success/10'
                            : item.product.status === 'not-found'
                            ? 'bg-danger/10'
                            : 'bg-warning/10'
                        }`}>
                          {item.product.status === 'verified' ? (
                            <CheckCircle2 className="h-5 w-5 text-success" />
                          ) : item.product.status === 'not-found' ? (
                            <ShieldX className="h-5 w-5 text-danger" />
                          ) : (
                            <AlertTriangle className="h-5 w-5 text-warning" />
                          )}
                        </div>
                      ) : (
                        <div className="p-2 rounded-lg bg-danger/10">
                          <ShieldX className="h-5 w-5 text-danger" />
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-foreground">
                          {item.product?.name ?? item.query}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {item.product ? item.product.manufacturer : 'Product not found in database'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={
                        item.product?.status === 'verified'
                          ? 'bg-success text-success-foreground'
                          : !item.product || item.product.status === 'not-found'
                          ? 'bg-danger text-danger-foreground'
                          : 'bg-warning text-warning-foreground'
                      }>
                        {item.product?.status === 'verified'
                          ? 'Verified'
                          : !item.product || item.product.status === 'not-found'
                          ? 'Not Found'
                          : 'Caution'}
                      </Badge>
                      <Button variant="ghost" size="icon" onClick={() => removeItem(index)} className="text-muted-foreground hover:text-danger">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Generate Report */}
              <div className="text-center pt-4">
                <Button variant="hero" size="lg" onClick={() => setShowReport(true)}>
                  <BarChart3 className="h-5 w-5" />
                  Generate Safety Report
                </Button>
              </div>
            </div>
          )}

          {/* Safety Report */}
          {showReport && items.length > 0 && (
            <div className="animate-fade-in space-y-6">
              {/* Score Card */}
              <Card className={`border-2 ${config.border} ${config.bg}`}>
                <CardContent className="p-8">
                  <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className="flex flex-col items-center">
                      <div className={`relative h-32 w-32 rounded-full border-8 ${config.border} flex items-center justify-center ${config.bg}`}>
                        <span className={`text-4xl font-extrabold ${config.color}`}>{score}</span>
                      </div>
                      <Badge className={`mt-3 ${config.color} ${config.bg} border ${config.border}`}>
                        {config.label}
                      </Badge>
                    </div>
                    <div className="flex-1 text-center md:text-left">
                      <h3 className="text-2xl font-bold text-foreground mb-2">
                        Home Safety Score
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        Based on {items.length} scanned product{items.length > 1 ? 's' : ''} in your household.
                      </p>
                      <Progress value={score} className="h-3 mb-4" />
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="bg-card rounded-lg p-3 shadow-card">
                          <p className="text-2xl font-bold text-success">{verified}</p>
                          <p className="text-xs text-muted-foreground">Verified</p>
                        </div>
                        <div className="bg-card rounded-lg p-3 shadow-card">
                          <p className="text-2xl font-bold text-warning">{warnings}</p>
                          <p className="text-xs text-muted-foreground">Caution</p>
                        </div>
                        <div className="bg-card rounded-lg p-3 shadow-card">
                          <p className="text-2xl font-bold text-danger">{unverified}</p>
                          <p className="text-xs text-muted-foreground">Unverified</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recommendations */}
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                    Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {unverified > 0 && (
                      <li className="flex items-start gap-3">
                        <ShieldX className="h-5 w-5 text-danger flex-shrink-0 mt-0.5" />
                        <span className="text-foreground">
                          <strong>{unverified} product{unverified > 1 ? 's' : ''}</strong> could not be verified. Replace them with ISI-certified alternatives immediately.
                        </span>
                      </li>
                    )}
                    {warnings > 0 && (
                      <li className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
                        <span className="text-foreground">
                          <strong>{warnings} product{warnings > 1 ? 's' : ''}</strong> require attention — check certification validity and condition.
                        </span>
                      </li>
                    )}
                    {verified > 0 && (
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                        <span className="text-foreground">
                          <strong>{verified} product{verified > 1 ? 's' : ''}</strong> verified — keep checking expiry dates periodically.
                        </span>
                      </li>
                    )}
                    <li className="flex items-start gap-3">
                      <ShieldCheck className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-foreground">
                        Run this scan every 6 months to keep your household safety score up to date.
                      </span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
