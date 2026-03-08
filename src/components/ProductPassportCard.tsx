import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  Building2, 
  Calendar, 
  Award, 
  FileCheck, 
  AlertTriangle, 
  Star,
  Lightbulb,
  Clock,
  Users,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { products } from '@/data/products';

interface ProductPassportCardProps {
  productId?: string;
}

interface Review {
  id: string;
  rating: number;
  review_text: string | null;
  reviewer_name: string;
  is_complaint: boolean;
  created_at: string;
}

export function ProductPassportCard({ productId }: ProductPassportCardProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const product = products.find(p => p.id === productId);

  useEffect(() => {
    async function fetchReviews() {
      if (!productId) return;
      
      const { data } = await supabase
        .from('product_reviews')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: false });
      
      setReviews(data || []);
      setLoading(false);
    }
    
    fetchReviews();
  }, [productId]);

  if (!product) {
    return (
      <Card className="max-w-3xl mx-auto">
        <CardContent className="py-16 text-center">
          <XCircle className="h-16 w-16 mx-auto text-danger mb-4" />
          <h2 className="text-2xl font-bold mb-2">Product Not Found</h2>
          <p className="text-muted-foreground">
            No digital passport exists for this product ID.
          </p>
        </CardContent>
      </Card>
    );
  }

  const avgRating = reviews.length > 0 
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
    : 0;
  const complaints = reviews.filter(r => r.is_complaint).length;
  const certificationValid = product.verified;
  const validUntil = new Date();
  validUntil.setFullYear(validUntil.getFullYear() + 2);

  const safetyTips: Record<string, string[]> = {
    'Helmets': [
      'Replace helmet after 5 years of use',
      'Never use a helmet that has been in an accident',
      'Avoid storing in extreme temperatures',
      'Check for cracks before each use',
      'Ensure proper fit and secure strap'
    ],
    'Electrical': [
      'Never overload electrical outlets',
      'Replace frayed or damaged cords immediately',
      'Keep away from water and moisture',
      'Use surge protectors for sensitive devices',
      'Unplug when not in use'
    ],
    'LPG Equipment': [
      'Check for leaks regularly using soapy water',
      'Ensure proper ventilation when in use',
      'Keep away from ignition sources',
      'Replace hoses every 2 years',
      'Never modify gas equipment'
    ],
    'Toys': [
      'Check for small parts that could be choking hazards',
      'Inspect regularly for broken pieces',
      'Follow age recommendations strictly',
      'Clean toys regularly',
      'Store properly to prevent damage'
    ]
  };

  const tips = safetyTips[product.category] || [
    'Always follow manufacturer guidelines',
    'Inspect product regularly for wear and damage',
    'Store in appropriate conditions',
    'Report any safety concerns immediately'
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header Card */}
      <Card className="overflow-hidden">
        <div className="gradient-hero p-6 text-primary-foreground">
          <div className="flex items-center gap-3 mb-2">
            <FileCheck className="h-8 w-8" />
            <span className="text-sm font-medium opacity-90">Digital Product Passport</span>
          </div>
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <p className="opacity-90 mt-1">{product.brand}</p>
        </div>
        
        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Left Column - Product Details */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-secondary">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Manufacturer</p>
                  <p className="font-semibold">{product.manufacturer}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-secondary">
                  <Award className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">ISI Standard</p>
                  <p className="font-semibold">{product.standard}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-secondary">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Certificate Number</p>
                  <p className="font-semibold font-mono">{product.certNumber}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-secondary">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Valid Until</p>
                  <p className="font-semibold">{validUntil.toLocaleDateString('en-IN', { year: 'numeric', month: 'long' })}</p>
                </div>
              </div>
            </div>

            {/* Right Column - Status */}
            <div className="space-y-4">
              <div className="p-4 rounded-xl border-2 border-border bg-card">
                <p className="text-sm text-muted-foreground mb-2">Certification Status</p>
                {certificationValid ? (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-6 w-6 text-success" />
                    <Badge className="bg-success text-success-foreground text-base px-3 py-1">
                      Valid & Verified
                    </Badge>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <XCircle className="h-6 w-6 text-danger" />
                    <Badge className="bg-danger text-danger-foreground text-base px-3 py-1">
                      Unverified
                    </Badge>
                  </div>
                )}
              </div>

              <div className="p-4 rounded-xl border-2 border-border bg-card">
                <p className="text-sm text-muted-foreground mb-2">Community Safety Rating</p>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star} 
                      className={`h-6 w-6 ${star <= Math.round(avgRating) ? 'text-warning fill-warning' : 'text-muted'}`} 
                    />
                  ))}
                  <span className="ml-2 font-semibold">
                    {avgRating > 0 ? avgRating.toFixed(1) : 'No ratings'}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl border-2 border-border bg-card">
                <p className="text-sm text-muted-foreground mb-2">User Reports</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    <span className="font-semibold">{reviews.length} Reviews</span>
                  </div>
                  {complaints > 0 && (
                    <Badge variant="outline" className="text-warning border-warning">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      {complaints} Complaints
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trust Score Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Trust Score Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm">Certification</span>
              <span className="text-sm font-medium">{certificationValid ? '100%' : '0%'}</span>
            </div>
            <Progress value={certificationValid ? 100 : 0} className="h-2" />
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm">Community Rating</span>
              <span className="text-sm font-medium">{avgRating > 0 ? `${(avgRating / 5 * 100).toFixed(0)}%` : 'N/A'}</span>
            </div>
            <Progress value={avgRating > 0 ? (avgRating / 5) * 100 : 0} className="h-2" />
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm">Complaint Rate</span>
              <span className="text-sm font-medium">
                {reviews.length > 0 ? `${(100 - (complaints / reviews.length) * 100).toFixed(0)}%` : 'N/A'}
              </span>
            </div>
            <Progress 
              value={reviews.length > 0 ? 100 - (complaints / reviews.length) * 100 : 100} 
              className="h-2" 
            />
          </div>
        </CardContent>
      </Card>

      {/* Safety Tips Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-warning" />
            Consumer Safety Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {tips.map((tip, index) => (
              <li key={index} className="flex items-start gap-3">
                <div className="mt-1 h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                <span className="text-muted-foreground">{tip}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Recent Reviews */}
      {reviews.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Recent Community Feedback
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {reviews.slice(0, 3).map((review) => (
              <div key={review.id} className="p-4 rounded-lg bg-secondary/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{review.reviewer_name}</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star} 
                        className={`h-4 w-4 ${star <= review.rating ? 'text-warning fill-warning' : 'text-muted'}`} 
                      />
                    ))}
                  </div>
                </div>
                {review.review_text && (
                  <p className="text-sm text-muted-foreground">{review.review_text}</p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {new Date(review.created_at).toLocaleDateString('en-IN')}
                  </span>
                  {review.is_complaint && (
                    <Badge variant="outline" className="text-warning border-warning text-xs">
                      Complaint
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Footer Note */}
      <div className="text-center text-sm text-muted-foreground py-4">
        <p>This Digital Product Passport is generated by ISI Guardian.</p>
        <p className="flex items-center justify-center gap-1 mt-1">
          <Clock className="h-3 w-3" />
          Last updated: {new Date().toLocaleDateString('en-IN')}
        </p>
      </div>
    </div>
  );
}
