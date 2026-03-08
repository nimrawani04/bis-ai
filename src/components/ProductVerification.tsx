import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, QrCode, CheckCircle2, AlertTriangle, XCircle, Shield,
  Calendar, Building2, FileText, ExternalLink, Camera, Upload, Star,
  ScanBarcode, Loader2, X, ImageIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { searchProducts, getProductByNumber, type Product } from '@/data/products';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
type ScanMode = 'barcode' | 'certificate' | 'image';

export function ProductVerification() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [scanMode, setScanMode] = useState<ScanMode>('certificate');

  const handleSearch = () => {
    if (!query.trim()) return;
    const directMatch = getProductByNumber(query);
    if (directMatch) {
      setSelectedProduct(directMatch);
      setSearchResults([]);
    } else {
      const results = searchProducts(query);
      setSearchResults(results);
      setSelectedProduct(null);
    }
    setHasSearched(true);
  };

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setSearchResults([]);
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'verified':
        return { icon: CheckCircle2, label: 'BIS Certified', className: 'bg-success text-success-foreground', bgClass: 'bg-success/10 border-success/20' };
      case 'warning':
        return { icon: AlertTriangle, label: 'Caution Required', className: 'bg-warning text-warning-foreground', bgClass: 'bg-warning/10 border-warning/20' };
      case 'expired':
        return { icon: AlertTriangle, label: 'Expired', className: 'bg-warning text-warning-foreground', bgClass: 'bg-warning/10 border-warning/20' };
      default:
        return { icon: XCircle, label: 'Not Found', className: 'bg-danger text-danger-foreground', bgClass: 'bg-danger/10 border-danger/20' };
    }
  };

  const scanModes: { key: ScanMode; icon: typeof ScanBarcode; label: string }[] = [
    { key: 'barcode', icon: ScanBarcode, label: 'Scan Barcode' },
    { key: 'certificate', icon: QrCode, label: 'Enter Certification Number' },
    { key: 'image', icon: Camera, label: 'Upload Product Image' },
  ];

  return (
    <section id="verify" className="py-20 bg-secondary/30">
      <div className="container">
        <div className="mx-auto max-w-4xl">
          {/* Section Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary mb-4">
              <QrCode className="h-4 w-4" />
              Product Scanner
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-3">
              Scan & Verify Products
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Verify product authenticity using barcode, certification number, or product image.
            </p>
          </div>

          {/* Scanner Box */}
          <Card className="shadow-elevated mb-8 overflow-hidden">
            {/* Scanner Visual */}
            <div className="relative bg-primary/5 border-b-2 border-dashed border-primary/20 py-12">
              <div className="mx-auto w-48 h-48 rounded-3xl border-4 border-primary/30 bg-card shadow-card flex flex-col items-center justify-center gap-3">
                {scanMode === 'barcode' && <ScanBarcode className="h-16 w-16 text-primary/40" />}
                {scanMode === 'certificate' && <QrCode className="h-16 w-16 text-primary/40" />}
                {scanMode === 'image' && <Camera className="h-16 w-16 text-primary/40" />}
                <span className="text-sm font-medium text-muted-foreground">
                  {scanMode === 'barcode' ? 'Point camera at barcode' : scanMode === 'image' ? 'Upload product photo' : 'Enter cert. number'}
                </span>
              </div>
              {/* Animated scan line */}
              <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-52 h-0.5 bg-gradient-to-r from-transparent via-primary/60 to-transparent animate-pulse" />
            </div>

            {/* Scan Mode Tabs */}
            <div className="flex border-b border-border">
              {scanModes.map((mode) => (
                <button
                  key={mode.key}
                  onClick={() => setScanMode(mode.key)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-medium transition-all ${
                    scanMode === mode.key
                      ? 'text-primary border-b-2 border-primary bg-primary/5'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  <mode.icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{mode.label}</span>
                </button>
              ))}
            </div>

            {/* Input Area */}
            <CardContent className="p-6">
              {scanMode === 'image' ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="w-full max-w-sm border-2 border-dashed border-border rounded-2xl p-8 text-center hover:border-primary/40 transition-colors cursor-pointer">
                    <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm font-medium text-foreground mb-1">Drag & drop product image</p>
                    <p className="text-xs text-muted-foreground">or click to browse files</p>
                  </div>
                  <p className="text-xs text-muted-foreground">Supports JPG, PNG — Max 5MB</p>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      placeholder={scanMode === 'barcode' ? 'Enter barcode number manually' : 'Enter product name or certification number (e.g., CM/L-1234567)'}
                      className="pl-12 h-14 text-base rounded-xl"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                  </div>
                  <Button variant="hero" size="lg" onClick={handleSearch} className="h-14 rounded-xl px-8">
                    <Search className="h-5 w-5" />
                    Verify
                  </Button>
                </div>
              )}

              {/* Quick Examples */}
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="text-sm text-muted-foreground">Try:</span>
                {['Steelbird Helmet', 'CM/L-1234567', 'Pressure Cooker', 'FAKE-12345'].map((example) => (
                  <button
                    key={example}
                    className="text-sm text-primary hover:underline rounded-full bg-primary/5 px-3 py-1"
                    onClick={() => {
                      setQuery(example);
                      const directMatch = getProductByNumber(example);
                      if (directMatch) { setSelectedProduct(directMatch); setSearchResults([]); }
                      else { setSearchResults(searchProducts(example)); setSelectedProduct(null); }
                      setHasSearched(true);
                    }}
                  >
                    {example}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="mb-8 animate-fade-in">
              <h3 className="text-lg font-semibold mb-4">Search Results ({searchResults.length})</h3>
              <div className="grid gap-3">
                {searchResults.map((product) => {
                  const sc = getStatusConfig(product.status);
                  return (
                    <Card key={product.id} className="cursor-pointer hover:shadow-elevated transition-all rounded-2xl" onClick={() => handleSelectProduct(product)}>
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`p-2.5 rounded-xl ${sc.bgClass}`}>
                            <sc.icon className="h-5 w-5" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-foreground">{product.name}</h4>
                            <p className="text-sm text-muted-foreground">{product.manufacturer}</p>
                          </div>
                        </div>
                        <Badge className={`${sc.className} rounded-full`}>{sc.label}</Badge>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* No Results */}
          {hasSearched && searchResults.length === 0 && !selectedProduct && (
            <Card className="mb-8 border-warning/20 bg-warning/5 rounded-2xl animate-fade-in">
              <CardContent className="p-8 text-center">
                <AlertTriangle className="h-14 w-14 text-warning mx-auto mb-4" />
                <h3 className="text-xl font-bold text-foreground mb-2">Product Not Found</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  No matching products found. This could indicate an unregistered or counterfeit product.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Verification Result Card */}
          {selectedProduct && (
            <div className="animate-fade-in">
              {(() => {
                const sc = getStatusConfig(selectedProduct.status);
                const isVerified = selectedProduct.status === 'verified';
                return (
                  <>
                    {/* Status Banner */}
                    <Card className={`mb-6 border-2 rounded-2xl ${sc.bgClass} overflow-hidden`}>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-5">
                          <div className={`p-4 rounded-2xl ${sc.className}`}>
                            <sc.icon className="h-10 w-10" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground mb-1">Verification Status</p>
                            <h3 className="text-2xl font-bold text-foreground">
                              {isVerified ? 'Product Verified ✓' : 'Verification Failed'}
                            </h3>
                            <Badge className={`${sc.className} mt-2 rounded-full text-sm px-4 py-1`}>
                              {isVerified ? '🟢 BIS Certified' : '🔴 Not Certified'}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Product Info + Safety Checklist */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <Card className="shadow-card rounded-2xl">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-lg">
                            <FileText className="h-5 w-5 text-primary" />
                            Product Details
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <DetailRow icon={null} label="Product" value={selectedProduct.name} />
                          <DetailRow icon={<Shield className="h-4 w-4 text-primary" />} label="Standard" value={selectedProduct.standard} />
                          <DetailRow icon={<Building2 className="h-4 w-4 text-primary" />} label="Manufacturer" value={selectedProduct.manufacturer} />
                          <DetailRow icon={null} label="Cert. Number" value={selectedProduct.certificationNumber} mono />
                          {selectedProduct.validUntil && (
                            <DetailRow icon={<Calendar className="h-4 w-4 text-primary" />} label="Valid Until" value={new Date(selectedProduct.validUntil).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} />
                          )}
                          {isVerified && (
                            <div className="pt-2">
                              <p className="text-sm text-muted-foreground mb-1">Safety Score</p>
                              <div className="flex items-center gap-1">
                                {[1,2,3,4,5].map(s => (
                                  <Star key={s} className={`h-5 w-5 ${s <= 4 ? 'text-warning fill-warning' : 'text-muted'}`} />
                                ))}
                                <span className="ml-2 font-bold text-foreground">4.5</span>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      <Card className="shadow-card rounded-2xl">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-lg">
                            <CheckCircle2 className="h-5 w-5 text-success" />
                            Safety Checklist
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-3">
                            {selectedProduct.safetyChecklist.map((item, i) => {
                              const isWarning = item.startsWith('⚠');
                              return (
                                <li key={i} className="flex items-start gap-3">
                                  {isWarning ? (
                                    <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
                                  ) : (
                                    <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                                  )}
                                  <span className={`text-sm ${isWarning ? 'text-warning font-medium' : 'text-foreground'}`}>
                                    {item.replace('⚠ ', '')}
                                  </span>
                                </li>
                              );
                            })}
                          </ul>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Actions */}
                    <div className="mt-8 flex flex-wrap gap-4 justify-center">
                      <Button variant="hero" size="lg" className="rounded-xl" onClick={() => navigate(`/passport/${selectedProduct.id}`)}>
                        <ExternalLink className="h-5 w-5" />
                        View Digital Passport
                      </Button>
                      {!isVerified && (
                        <a href="#report">
                          <Button variant="accent" size="lg" className="rounded-xl">
                            <AlertTriangle className="h-5 w-5" />
                            Report This Product
                          </Button>
                        </a>
                      )}
                    </div>
                  </>
                );
              })()}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function DetailRow({ icon, label, value, mono }: { icon: React.ReactNode; label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start gap-3">
      {icon && <div className="mt-1 shrink-0">{icon}</div>}
      <div className={icon ? '' : 'pl-0'}>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={`font-semibold text-foreground ${mono ? 'font-mono' : ''}`}>{value}</p>
      </div>
    </div>
  );
}
