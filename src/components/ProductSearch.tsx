import { useState } from 'react';
import { Search, CheckCircle2, Info, BookOpen } from 'lucide-react';
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
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-4 py-2 text-sm font-medium text-accent mb-4">
              <BookOpen className="h-4 w-4" />
              Smart Product Search
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Find Product Standards
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Search for any product category to learn about required certifications, 
              relevant BIS standards, and essential safety tips.
            </p>
          </div>

          {/* Search */}
          <div className="relative max-w-xl mx-auto mb-8">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search product categories (e.g., Helmet, Pressure Cooker)"
              className="pl-12 h-14 text-base"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Category Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {filteredCategories.map((category) => (
              <Card
                key={category.name}
                className={`cursor-pointer transition-all hover:shadow-elevated ${
                  selectedCategory?.name === category.name
                    ? 'ring-2 ring-primary shadow-elevated'
                    : ''
                }`}
                onClick={() => setSelectedCategory(category)}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-foreground">{category.name}</h3>
                    {category.bisRequired && (
                      <Badge className="bg-success/10 text-success border-0">
                        BIS Required
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground font-mono">
                    {category.relevantStandard}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Selected Category Details */}
          {selectedCategory && (
            <Card className="shadow-elevated animate-fade-in">
              <CardHeader className="border-b border-border">
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-3">
                    <div className="p-2 rounded-lg gradient-hero">
                      <Info className="h-5 w-5 text-primary-foreground" />
                    </div>
                    {selectedCategory.name}
                  </span>
                  <Badge variant="outline" className="font-mono">
                    {selectedCategory.relevantStandard}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                      BIS Certification Status
                    </h4>
                    <div className={`p-4 rounded-lg ${
                      selectedCategory.bisRequired 
                        ? 'bg-success/10 border border-success/20' 
                        : 'bg-muted'
                    }`}>
                      {selectedCategory.bisRequired ? (
                        <>
                          <p className="font-semibold text-success mb-1">Mandatory Certification</p>
                          <p className="text-sm text-muted-foreground">
                            This product category requires BIS certification under {selectedCategory.relevantStandard}. 
                            Always verify the ISI mark before purchase.
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="font-semibold text-foreground mb-1">Voluntary Certification</p>
                          <p className="text-sm text-muted-foreground">
                            BIS certification is recommended but not mandatory for this category.
                          </p>
                        </>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-accent" />
                      Safety Tips
                    </h4>
                    <ul className="space-y-3">
                      {selectedCategory.safetyTips.map((tip, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent/10 text-xs font-semibold text-accent">
                            {index + 1}
                          </span>
                          <span className="text-muted-foreground">{tip}</span>
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
            <Card className="border-dashed">
              <CardContent className="p-8 text-center">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold text-foreground mb-2">No categories found</h3>
                <p className="text-muted-foreground">
                  Try searching with different keywords
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </section>
  );
}
