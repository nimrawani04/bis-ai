import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  GitCompareArrows,
  Shield,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Plus,
  X,
  Star,
  Award,
  Building2,
  Calendar,
  FileCheck,
} from 'lucide-react';
import { mockProducts, type Product } from '@/data/products';

const safetyLevelScore: Record<string, number> = {
  high: 100,
  medium: 60,
  low: 20,
};

const safetyLevelConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  high: { label: 'High', color: 'text-success', icon: CheckCircle2 },
  medium: { label: 'Medium', color: 'text-warning', icon: AlertTriangle },
  low: { label: 'Low', color: 'text-destructive', icon: XCircle },
};

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  verified: { label: 'Verified', variant: 'default' },
  warning: { label: 'Warning', variant: 'secondary' },
  expired: { label: 'Expired', variant: 'destructive' },
  'not-found': { label: 'Not Found', variant: 'destructive' },
};

export function ProductComparison() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const addProduct = (id: string) => {
    if (!selectedIds.includes(id) && selectedIds.length < 4) {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const removeProduct = (id: string) => {
    setSelectedIds(selectedIds.filter(sid => sid !== id));
  };

  const selectedProducts = selectedIds
    .map(id => mockProducts.find(p => p.id === id))
    .filter(Boolean) as Product[];

  const availableProducts = mockProducts.filter(p => !selectedIds.includes(p.id));

  const getBestSafety = () => {
    if (selectedProducts.length === 0) return null;
    return selectedProducts.reduce((best, p) =>
      safetyLevelScore[p.safetyLevel] > safetyLevelScore[best.safetyLevel] ? p : best
    );
  };

  const bestProduct = getBestSafety();

  return (
    <section id="comparison" className="py-16 px-4 bg-secondary/30">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-2 mb-3">
            <GitCompareArrows className="h-7 w-7 text-primary" />
            <h2 className="text-3xl font-bold text-foreground">Compare Products</h2>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Select up to 4 products to compare their safety ratings, certifications, and standards side by side.
          </p>
        </div>

        {/* Product Selector */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm font-medium text-muted-foreground">Add products:</span>
              {selectedIds.length < 4 && (
                <Select onValueChange={addProduct}>
                  <SelectTrigger className="w-[280px]">
                    <SelectValue placeholder="Select a product to compare..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableProducts.map(p => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {selectedIds.length >= 4 && (
                <span className="text-sm text-muted-foreground italic">Maximum 4 products selected</span>
              )}
            </div>

            {selectedProducts.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {selectedProducts.map(p => (
                  <Badge
                    key={p.id}
                    variant="secondary"
                    className="pl-3 pr-1 py-1.5 text-sm gap-2"
                  >
                    {p.name}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 hover:bg-destructive/20 rounded-full"
                      onClick={() => removeProduct(p.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Comparison View */}
        {selectedProducts.length >= 2 ? (
          <div className="space-y-6">
            {/* Safety Score Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Safety Score Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${selectedProducts.length}, 1fr)` }}>
                  {selectedProducts.map(p => {
                    const score = safetyLevelScore[p.safetyLevel];
                    const config = safetyLevelConfig[p.safetyLevel];
                    const isBest = bestProduct?.id === p.id;
                    const StatusIcon = config.icon;
                    return (
                      <div
                        key={p.id}
                        className={`p-4 rounded-xl border-2 text-center transition-all ${
                          isBest ? 'border-primary bg-primary/5' : 'border-border bg-card'
                        }`}
                      >
                        {isBest && (
                          <Badge className="mb-2 bg-primary text-primary-foreground">
                            <Star className="h-3 w-3 mr-1 fill-current" /> Best Pick
                          </Badge>
                        )}
                        <h3 className="font-semibold text-sm mb-3 line-clamp-2">{p.name}</h3>
                        <div className="flex justify-center mb-3">
                          <div className={`p-3 rounded-full bg-secondary ${config.color}`}>
                            <StatusIcon className="h-8 w-8" />
                          </div>
                        </div>
                        <p className={`text-2xl font-bold ${config.color}`}>{score}%</p>
                        <p className="text-xs text-muted-foreground mt-1">Safety Score</p>
                        <Progress value={score} className="h-2 mt-3" />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Detailed Comparison Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileCheck className="h-5 w-5 text-primary" />
                  Detailed Comparison
                </CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[180px]">Attribute</TableHead>
                      {selectedProducts.map(p => (
                        <TableHead key={p.id} className="min-w-[180px]">{p.name}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          Manufacturer
                        </div>
                      </TableCell>
                      {selectedProducts.map(p => (
                        <TableCell key={p.id}>{p.manufacturer}</TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Award className="h-4 w-4 text-muted-foreground" />
                          Category
                        </div>
                      </TableCell>
                      {selectedProducts.map(p => (
                        <TableCell key={p.id}>{p.category}</TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-muted-foreground" />
                          ISI Standard
                        </div>
                      </TableCell>
                      {selectedProducts.map(p => (
                        <TableCell key={p.id}>
                          <code className="text-xs bg-secondary px-2 py-1 rounded">{p.standard}</code>
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <FileCheck className="h-4 w-4 text-muted-foreground" />
                          Certification
                        </div>
                      </TableCell>
                      {selectedProducts.map(p => {
                        const status = statusConfig[p.status];
                        return (
                          <TableCell key={p.id}>
                            <Badge variant={status.variant}>{status.label}</Badge>
                          </TableCell>
                        );
                      })}
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          Valid Until
                        </div>
                      </TableCell>
                      {selectedProducts.map(p => (
                        <TableCell key={p.id}>
                          {p.validUntil
                            ? new Date(p.validUntil).toLocaleDateString('en-IN', { year: 'numeric', month: 'short' })
                            : <span className="text-muted-foreground italic">N/A</span>
                          }
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-muted-foreground" />
                          Safety Level
                        </div>
                      </TableCell>
                      {selectedProducts.map(p => {
                        const config = safetyLevelConfig[p.safetyLevel];
                        const StatusIcon = config.icon;
                        return (
                          <TableCell key={p.id}>
                            <div className={`flex items-center gap-1.5 ${config.color}`}>
                              <StatusIcon className="h-4 w-4" />
                              <span className="font-medium">{config.label}</span>
                            </div>
                          </TableCell>
                        );
                      })}
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-muted-foreground" />
                          Cert. Number
                        </div>
                      </TableCell>
                      {selectedProducts.map(p => (
                        <TableCell key={p.id}>
                          <code className="text-xs bg-secondary px-2 py-1 rounded font-mono">{p.certificationNumber}</code>
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Safety Checklist Comparison */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  Safety Checklist Comparison
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${selectedProducts.length}, 1fr)` }}>
                  {selectedProducts.map(p => (
                    <div key={p.id} className="space-y-2">
                      <h4 className="font-semibold text-sm border-b border-border pb-2">{p.name}</h4>
                      <ul className="space-y-1.5">
                        {p.safetyChecklist.map((item, i) => {
                          const isWarning = item.startsWith('⚠');
                          return (
                            <li key={i} className="flex items-start gap-2 text-sm">
                              {isWarning ? (
                                <AlertTriangle className="h-3.5 w-3.5 mt-0.5 text-destructive flex-shrink-0" />
                              ) : (
                                <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 text-success flex-shrink-0" />
                              )}
                              <span className={isWarning ? 'text-destructive' : 'text-muted-foreground'}>
                                {isWarning ? item.replace('⚠ ', '') : item}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card className="border-dashed">
            <CardContent className="py-16 text-center">
              <GitCompareArrows className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-foreground">Select Products to Compare</h3>
              <p className="text-muted-foreground text-sm max-w-md mx-auto">
                Choose at least 2 products from the dropdown above to see a side-by-side comparison of their safety ratings and certifications.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  );
}
