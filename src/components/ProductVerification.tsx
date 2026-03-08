import { useState } from 'react';
import { Search, QrCode, CheckCircle2, AlertTriangle, XCircle, Shield, Calendar, Building2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { searchProducts, getProductByNumber, type Product } from '@/data/products';

export function ProductVerification() {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

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
        return {
          icon: CheckCircle2,
          label: 'Verified',
          className: 'bg-success text-success-foreground',
          bgClass: 'bg-success/10 border-success/20'
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          label: 'Caution Required',
          className: 'bg-warning text-warning-foreground',
          bgClass: 'bg-warning/10 border-warning/20'
        };
      case 'expired':
        return {
          icon: AlertTriangle,
          label: 'Certification Expired',
          className: 'bg-warning text-warning-foreground',
          bgClass: 'bg-warning/10 border-warning/20'
        };
      default:
        return {
          icon: XCircle,
          label: 'Not Found',
          className: 'bg-danger text-danger-foreground',
          bgClass: 'bg-danger/10 border-danger/20'
        };
    }
  };

  return (
    <section id="verify" className="py-20 bg-secondary/30">
      <div className="container">
        <div className="mx-auto max-w-4xl">
          {/* Section Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary mb-4">
              <QrCode className="h-4 w-4" />
              Product Verification
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Verify Product Certification
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Enter the product name or ISI certification number to verify authenticity. 
              Our database contains thousands of BIS-certified products.
            </p>
          </div>

          {/* Search Box */}
          <Card className="shadow-elevated mb-8">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Enter product name or certification number (e.g., CM/L-1234567)"
                    className="pl-12 h-14 text-base"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                <Button variant="hero" size="lg" onClick={handleSearch} className="h-14">
                  <Search className="h-5 w-5" />
                  Verify
                </Button>
              </div>

              {/* Quick Examples */}
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="text-sm text-muted-foreground">Try:</span>
                {['Steelbird Helmet', 'CM/L-1234567', 'Pressure Cooker', 'FAKE-12345'].map((example) => (
                  <button
                    key={example}
                    className="text-sm text-primary hover:underline"
                    onClick={() => {
                      setQuery(example);
                      const directMatch = getProductByNumber(example);
                      if (directMatch) {
                        setSelectedProduct(directMatch);
                        setSearchResults([]);
                      } else {
                        const results = searchProducts(example);
                        setSearchResults(results);
                        setSelectedProduct(null);
                      }
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
              <div className="grid gap-4">
                {searchResults.map((product) => {
                  const statusConfig = getStatusConfig(product.status);
                  return (
                    <Card 
                      key={product.id}
                      className="cursor-pointer hover:shadow-elevated transition-shadow"
                      onClick={() => handleSelectProduct(product)}
                    >
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-lg ${statusConfig.bgClass}`}>
                            <statusConfig.icon className="h-5 w-5" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-foreground">{product.name}</h4>
                            <p className="text-sm text-muted-foreground">{product.manufacturer}</p>
                          </div>
                        </div>
                        <Badge className={statusConfig.className}>
                          {statusConfig.label}
                        </Badge>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* No Results */}
          {hasSearched && searchResults.length === 0 && !selectedProduct && (
            <Card className="mb-8 border-warning/20 bg-warning/5 animate-fade-in">
              <CardContent className="p-6 text-center">
                <AlertTriangle className="h-12 w-12 text-warning mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No Products Found</h3>
                <p className="text-muted-foreground">
                  We couldn't find any products matching your search. This could indicate an unregistered or fake product.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Selected Product Details */}
          {selectedProduct && (
            <div className="animate-fade-in">
              {/* Status Banner */}
              {(() => {
                const statusConfig = getStatusConfig(selectedProduct.status);
                return (
                  <Card className={`mb-6 border-2 ${statusConfig.bgClass}`}>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-full ${statusConfig.className}`}>
                          <statusConfig.icon className="h-8 w-8" />
                        </div>
                        <div>
                          <Badge className={`${statusConfig.className} mb-2`}>
                            {statusConfig.label}
                          </Badge>
                          <h3 className="text-xl font-bold text-foreground">
                            {selectedProduct.status === 'verified' 
                              ? 'This product is BIS certified' 
                              : selectedProduct.status === 'not-found'
                              ? 'Certification not found - Exercise caution'
                              : 'Certification requires attention'}
                          </h3>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })()}

              {/* Product Details */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="shadow-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      Product Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <span className="text-sm text-muted-foreground">Product Name</span>
                      <p className="font-semibold text-foreground">{selectedProduct.name}</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <span className="text-sm text-muted-foreground">Manufacturer</span>
                        <p className="font-semibold text-foreground">{selectedProduct.manufacturer}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Shield className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <span className="text-sm text-muted-foreground">BIS Standard</span>
                        <p className="font-semibold text-foreground">{selectedProduct.standard}</p>
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Certification Number</span>
                      <p className="font-mono font-semibold text-foreground">{selectedProduct.certificationNumber}</p>
                    </div>
                    {selectedProduct.validUntil && (
                      <div className="flex items-start gap-3">
                        <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <span className="text-sm text-muted-foreground">Valid Until</span>
                          <p className="font-semibold text-foreground">
                            {new Date(selectedProduct.validUntil).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="shadow-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                      Safety Checklist
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {selectedProduct.safetyChecklist.map((item, index) => (
                        <li key={index} className="flex items-start gap-3">
                          {item.startsWith('⚠') ? (
                            <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
                          ) : (
                            <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                          )}
                          <span className={item.startsWith('⚠') ? 'text-warning-foreground font-medium' : 'text-foreground'}>
                            {item.replace('⚠ ', '')}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>

              {/* Report Button for fake products */}
              {selectedProduct.status === 'not-found' && (
                <div className="mt-6 text-center">
                  <Button variant="accent" size="lg">
                    <AlertTriangle className="h-5 w-5" />
                    Report This Product to BIS
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
