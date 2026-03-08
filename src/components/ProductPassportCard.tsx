import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/components/ui/sonner';
import {
  Shield, Building2, Calendar, Award, FileCheck, AlertTriangle, Star,
  Lightbulb, Clock, Users, CheckCircle2, XCircle, Share2, Link as LinkIcon, QrCode,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { mockProducts, type Product } from '@/data/products';

interface Review {
  id: string; rating: number; review_text: string | null;
  reviewer_name: string; is_complaint: boolean; created_at: string;
}

const safetyTips: Record<string, string[]> = {
  'Helmets': ['Replace helmet after 5 years of use', 'Never use a helmet that has been in an accident', 'Avoid storing in extreme temperatures', 'Check for cracks before each use', 'Ensure proper fit and secure strap'],
  'Electrical': ['Never overload electrical outlets', 'Replace frayed cords immediately', 'Keep away from water', 'Use surge protectors', 'Unplug when not in use'],
  'LPG Equipment': ['Check for leaks with soapy water', 'Ensure proper ventilation', 'Keep away from ignition sources', 'Replace hoses every 2 years', 'Never modify gas equipment'],
  'Toys': ['Check for choking hazards', 'Inspect for broken pieces', 'Follow age recommendations', 'Clean regularly', 'Store properly'],
};

export function ProductPassportCard({ productId }: { productId?: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const product = mockProducts.find(p => p.id === productId);

  useEffect(() => {
    if (!productId) return;
    supabase.from('product_reviews').select('*').eq('product_id', productId).order('created_at', { ascending: false })
      .then(({ data }) => { setReviews(data || []); setLoading(false); });
  }, [productId]);

  if (!product) {
    return (
      <Card className="max-w-3xl mx-auto rounded-2xl">
        <CardContent className="py-16 text-center">
          <XCircle className="h-16 w-16 mx-auto text-danger mb-4" />
          <h2 className="text-2xl font-bold mb-2">Product Not Found</h2>
          <p className="text-muted-foreground">No digital passport exists for this product ID.</p>
        </CardContent>
      </Card>
    );
  }

  const avgRating = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
  const complaints = reviews.filter(r => r.is_complaint).length;
  const certValid = product.status === 'verified';
  const validUntil = product.validUntil ? new Date(product.validUntil) : new Date(Date.now() + 2 * 365 * 86400000);
  const tips = safetyTips[product.category] || ['Follow manufacturer guidelines', 'Inspect regularly', 'Store in appropriate conditions', 'Report safety concerns'];
  const passportUrl = `${window.location.origin}/passport/${productId}`;
  const handleCopyLink = () => { navigator.clipboard.writeText(passportUrl); toast('Link copied!'); };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <Card className="overflow-hidden rounded-2xl">
        <div className="gradient-hero p-8 text-primary-foreground">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <FileCheck className="h-7 w-7" />
              <span className="text-sm font-medium opacity-90">Digital Product Passport</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-9 w-9 text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10" onClick={handleCopyLink}>
                <LinkIcon className="h-4 w-4" />
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9 text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10">
                    <QrCode className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2"><Share2 className="h-5 w-5 text-primary" />Share Passport</DialogTitle>
                  </DialogHeader>
                  <div className="flex flex-col items-center gap-6 py-4">
                    <div className="p-4 bg-card rounded-2xl border border-border">
                      <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(passportUrl)}&color=1E3A8A&bgcolor=ffffff&format=svg`} alt="QR Code" width={200} height={200} />
                    </div>
                    <p className="text-sm text-muted-foreground text-center">Scan to view passport for <strong>{product.name}</strong></p>
                    <div className="flex items-center gap-2 w-full">
                      <div className="flex-1 truncate rounded-xl border border-border bg-secondary px-3 py-2 text-sm text-muted-foreground">{passportUrl}</div>
                      <Button variant="outline" size="sm" className="rounded-xl" onClick={handleCopyLink}><LinkIcon className="h-4 w-4 mr-1" />Copy</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <p className="opacity-80 mt-1">{product.manufacturer}</p>
        </div>

        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Details */}
            <div className="space-y-4">
              {[
                { icon: Building2, label: 'Manufacturer', value: product.manufacturer },
                { icon: Award, label: 'ISI Standard', value: product.standard },
                { icon: Shield, label: 'Certificate Number', value: product.certificationNumber, mono: true },
                { icon: Calendar, label: 'Valid Until', value: validUntil.toLocaleDateString('en-IN', { year: 'numeric', month: 'long' }) },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-secondary"><item.icon className="h-5 w-5 text-primary" /></div>
                  <div>
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    <p className={`font-semibold ${item.mono ? 'font-mono' : ''}`}>{item.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Status */}
            <div className="space-y-4">
              <div className="p-5 rounded-2xl border-2 border-border bg-card">
                <p className="text-xs text-muted-foreground mb-2">Certification Status</p>
                {certValid ? (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-6 w-6 text-success" />
                    <Badge className="bg-success text-success-foreground text-base px-4 py-1 rounded-full">🟢 Valid & Verified</Badge>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <XCircle className="h-6 w-6 text-danger" />
                    <Badge className="bg-danger text-danger-foreground text-base px-4 py-1 rounded-full">🔴 Unverified</Badge>
                  </div>
                )}
              </div>
              <div className="p-5 rounded-2xl border-2 border-border bg-card">
                <p className="text-xs text-muted-foreground mb-2">Safety Score</p>
                <div className="flex items-center gap-2">
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} className={`h-6 w-6 ${s <= Math.round(avgRating) ? 'text-warning fill-warning' : 'text-muted'}`} />
                  ))}
                  <span className="ml-2 font-bold">{avgRating > 0 ? avgRating.toFixed(1) : 'No ratings'}</span>
                </div>
              </div>
              <div className="p-5 rounded-2xl border-2 border-border bg-card">
                <p className="text-xs text-muted-foreground mb-2">Community</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2"><Users className="h-5 w-5 text-primary" /><span className="font-semibold">{reviews.length} Reviews</span></div>
                  {complaints > 0 && <Badge variant="outline" className="text-warning border-warning rounded-full"><AlertTriangle className="h-3 w-3 mr-1" />{complaints} Complaints</Badge>}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trust Score */}
      <Card className="rounded-2xl">
        <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5 text-primary" />Trust Score Breakdown</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {[
            { label: 'Certification', value: certValid ? 100 : 0 },
            { label: 'Community Rating', value: avgRating > 0 ? (avgRating / 5) * 100 : 0 },
            { label: 'Complaint Rate', value: reviews.length > 0 ? 100 - (complaints / reviews.length) * 100 : 100 },
          ].map(item => (
            <div key={item.label}>
              <div className="flex justify-between mb-2"><span className="text-sm">{item.label}</span><span className="text-sm font-medium">{item.value.toFixed(0)}%</span></div>
              <Progress value={item.value} className="h-2" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Safety Tips */}
      <Card className="rounded-2xl">
        <CardHeader><CardTitle className="flex items-center gap-2"><Lightbulb className="h-5 w-5 text-warning" />Safety Tips</CardTitle></CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                <span className="text-muted-foreground">{tip}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Reviews */}
      {reviews.length > 0 && (
        <Card className="rounded-2xl">
          <CardHeader><CardTitle className="flex items-center gap-2"><Users className="h-5 w-5 text-primary" />Consumer Reviews</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {reviews.slice(0, 3).map((review) => (
              <div key={review.id} className="p-4 rounded-xl bg-secondary/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{review.reviewer_name}</span>
                  <div className="flex items-center gap-1">
                    {[1,2,3,4,5].map(s => <Star key={s} className={`h-4 w-4 ${s <= review.rating ? 'text-warning fill-warning' : 'text-muted'}`} />)}
                  </div>
                </div>
                {review.review_text && <p className="text-sm text-muted-foreground">"{review.review_text}"</p>}
                <div className="flex items-center gap-2 mt-2">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{new Date(review.created_at).toLocaleDateString('en-IN')}</span>
                  {review.is_complaint && <Badge variant="outline" className="text-warning border-warning text-xs rounded-full">Complaint</Badge>}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="text-center text-sm text-muted-foreground py-4">
        <p>Digital Product Passport by StandardShield</p>
        <p className="flex items-center justify-center gap-1 mt-1"><Clock className="h-3 w-3" />Last updated: {new Date().toLocaleDateString('en-IN')}</p>
      </div>
    </div>
  );
}
