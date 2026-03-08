import { useState } from 'react';
import { Search, CheckCircle2, Info, BookOpen, Shield } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { productCategories, type ProductCategory } from '@/data/products';

export function ProductSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | null>(null);

  const filteredCategories = productCategories.filter(cat =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <section id="search" className="py-20">
      <div className="container">
        <div className="mx-auto max-w-4xl">
          {/* Section Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-4 py-2 text-sm font-medium text-accent mb-4">
              <BookOpen className="h-4 w-4" />
              Safety Guide — Check Before Buying
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-3">
              Product Safety Guides
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Search any product category to see required certifications, safety checklists, and buying tips before you purchase.
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-xl mx-auto mb-10">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search product (helmet, charger, heater…)"
              className="pl-12 h-14 text-base rounded-xl shadow-card"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Category Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
            {filteredCategories.map((category) => (
              <Card
                key={category.name}
                className={`cursor-pointer transition-all rounded-2xl hover:shadow-elevated hover:-translate-y-0.5 ${
                  selectedCategory?.name === category.name ? 'ring-2 ring-primary shadow-elevated' : ''
                }`}
                onClick={() => setSelectedCategory(category)}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Shield className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="font-bold text-foreground">{category.name}</h3>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground font-mono">{category.relevantStandard}</p>
                    {category.bisRequired && (
                      <Badge className="bg-success/10 text-success border-0 rounded-full text-xs">
                        ISI Required
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Selected Category Detail — Checklist Style */}
          {selectedCategory && (
            <Card className="shadow-elevated animate-fade-in rounded-2xl overflow-hidden">
              <CardHeader className="border-b border-border bg-primary/5">
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl gradient-hero">
                      <Info className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div>
                      <span className="block">{selectedCategory.name} Safety Guide</span>
                      <span className="block text-sm font-normal text-muted-foreground mt-0.5">Required Certification: ISI Mark</span>
                    </div>
                  </span>
                  <Badge variant="outline" className="font-mono rounded-full">
                    {selectedCategory.relevantStandard}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Certification Status */}
                  <div>
                    <h4 className="font-bold text-foreground mb-4 flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-success" />
                      Certification Status
                    </h4>
                    <div className={`p-5 rounded-2xl ${
                      selectedCategory.bisRequired ? 'bg-success/10 border border-success/20' : 'bg-muted'
                    }`}>
                      {selectedCategory.bisRequired ? (
                        <>
                          <div className="flex items-center gap-2 mb-2">
                            <div className="h-3 w-3 rounded-full bg-success" />
                            <p className="font-bold text-success">Mandatory Certification</p>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Products must carry ISI mark under {selectedCategory.relevantStandard}. Always verify before purchase.
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="font-bold text-foreground mb-1">Voluntary Certification</p>
                          <p className="text-sm text-muted-foreground">BIS certification is recommended but not mandatory.</p>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Checklist */}
                  <div>
                    <h4 className="font-bold text-foreground mb-4 flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-primary" />
                      Buying Checklist
                    </h4>
                    <ul className="space-y-3">
                      {selectedCategory.safetyTips.map((tip, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <div className="mt-0.5 h-6 w-6 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0">
                            <CheckCircle2 className="h-4 w-4 text-success" />
                          </div>
                          <span className="text-sm text-foreground">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Empty State */}
          {filteredCategories.length === 0 && (
            <Card className="border-dashed rounded-2xl">
              <CardContent className="p-10 text-center">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-bold text-foreground mb-2">No categories found</h3>
                <p className="text-muted-foreground">Try searching with different keywords</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </section>
  );
}
