import { useState, useEffect } from 'react';
import { Star, Users, MessageSquare, AlertTriangle, ThumbsUp, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { mockProducts } from '@/data/products';
import { useToast } from '@/hooks/use-toast';

interface ReviewStats {
  productId: string;
  productName: string;
  avgRating: number;
  totalReviews: number;
  complaints: number;
  trustScore: number;
}

interface Review {
  id: string;
  product_id: string;
  reviewer_name: string;
  rating: number;
  review_text: string | null;
  is_complaint: boolean;
  created_at: string;
}

function StarRating({ rating, onRate, interactive = false }: { rating: number; onRate?: (r: number) => void; interactive?: boolean }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-5 w-5 transition-colors ${
            star <= (interactive ? hovered || rating : rating)
              ? 'fill-accent text-accent'
              : 'text-muted-foreground/30'
          } ${interactive ? 'cursor-pointer' : ''}`}
          onMouseEnter={() => interactive && setHovered(star)}
          onMouseLeave={() => interactive && setHovered(0)}
          onClick={() => interactive && onRate?.(star)}
        />
      ))}
    </div>
  );
}

function calcTrustScore(avgRating: number, totalReviews: number, complaints: number): number {
  if (totalReviews === 0) return 50;
  const ratingScore = (avgRating / 5) * 60;
  const volumeScore = Math.min(totalReviews / 10, 1) * 20;
  const complaintPenalty = Math.min((complaints / totalReviews) * 40, 20);
  return Math.round(ratingScore + volumeScore - complaintPenalty);
}

function getTrustConfig(score: number) {
  if (score >= 70) return { label: 'Trusted', color: 'text-success', bg: 'bg-success/10', border: 'border-success/30' };
  if (score >= 40) return { label: 'Mixed', color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/30' };
  return { label: 'Low Trust', color: 'text-danger', bg: 'bg-danger/10', border: 'border-danger/30' };
}

export function CommunityTrustScore() {
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [reviewerName, setReviewerName] = useState('');
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [isComplaint, setIsComplaint] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    const { data } = await supabase
      .from('product_reviews')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setReviews(data);
    setLoading(false);
  };

  useEffect(() => { fetchReviews(); }, []);

  // Compute stats per product
  const productStats: ReviewStats[] = mockProducts
    .filter((p) => p.status === 'verified')
    .map((product) => {
      const productReviews = reviews.filter((r) => r.product_id === product.id);
      const totalReviews = productReviews.length;
      const avgRating = totalReviews > 0
        ? productReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
        : 0;
      const complaints = productReviews.filter((r) => r.is_complaint).length;
      return {
        productId: product.id,
        productName: product.name,
        avgRating: Math.round(avgRating * 10) / 10,
        totalReviews,
        complaints,
        trustScore: calcTrustScore(avgRating, totalReviews, complaints),
      };
    })
    .sort((a, b) => b.trustScore - a.trustScore);

  const handleSubmit = async () => {
    if (!selectedProduct || !reviewerName.trim() || rating === 0) {
      toast({ title: 'Missing Fields', description: 'Please fill in all required fields and select a rating.', variant: 'destructive' });
      return;
    }
    if (reviewerName.trim().length > 100) {
      toast({ title: 'Name too long', description: 'Name must be under 100 characters.', variant: 'destructive' });
      return;
    }
    if (reviewText.length > 1000) {
      toast({ title: 'Review too long', description: 'Review must be under 1000 characters.', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    const { error } = await supabase.from('product_reviews').insert({
      product_id: selectedProduct,
      reviewer_name: reviewerName.trim(),
      rating,
      review_text: reviewText.trim() || null,
      is_complaint: isComplaint,
    });

    if (error) {
      toast({ title: 'Error', description: 'Failed to submit review. Please try again.', variant: 'destructive' });
    } else {
      toast({ title: 'Review Submitted!', description: 'Thank you for helping the community.' });
      setSelectedProduct('');
      setReviewerName('');
      setRating(0);
      setReviewText('');
      setIsComplaint(false);
      fetchReviews();
    }
    setIsSubmitting(false);
  };

  const recentReviews = reviews.slice(0, 5);

  return (
    <section id="community" className="py-20 bg-secondary/30">
      <div className="container">
        <div className="mx-auto max-w-5xl">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary mb-4">
              <Users className="h-4 w-4" />
              Community Trust Score
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-4">
              What the Community Says
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Real ratings from real users. See trust scores based on community reviews and complaint history.
            </p>
          </div>

          {/* Trust Score Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
            {productStats.map((stat) => {
              const config = getTrustConfig(stat.trustScore);
              return (
                <Card key={stat.productId} className="shadow-card hover:shadow-elevated transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-semibold text-foreground text-sm leading-tight flex-1 mr-2">
                        {stat.productName}
                      </h4>
                      <Badge className={`${config.bg} ${config.color} border ${config.border} text-xs shrink-0`}>
                        {config.label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`text-2xl font-bold ${config.color}`}>{stat.trustScore}</span>
                      <span className="text-xs text-muted-foreground">/100</span>
                    </div>
                    <Progress value={stat.trustScore} className="h-2 mb-3" />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <StarRating rating={Math.round(stat.avgRating)} />
                        <span className="ml-1">{stat.avgRating || '—'}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="h-3 w-3" />{stat.totalReviews}
                        </span>
                        {stat.complaints > 0 && (
                          <span className="flex items-center gap-1 text-danger">
                            <AlertTriangle className="h-3 w-3" />{stat.complaints}
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Submit Review */}
            <Card className="shadow-elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  Submit a Review
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Product *</label>
                  <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a product" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockProducts.filter((p) => p.status === 'verified').map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Your Name *</label>
                  <Input
                    placeholder="Enter your name"
                    value={reviewerName}
                    onChange={(e) => setReviewerName(e.target.value)}
                    maxLength={100}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Rating *</label>
                  <StarRating rating={rating} onRate={setRating} interactive />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Review (optional)</label>
                  <Textarea
                    placeholder="Share your experience with this product..."
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    maxLength={1000}
                    rows={3}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="complaint"
                    checked={isComplaint}
                    onCheckedChange={(checked) => setIsComplaint(checked === true)}
                  />
                  <label htmlFor="complaint" className="text-sm text-muted-foreground cursor-pointer">
                    This is a complaint / safety concern
                  </label>
                </div>
                <Button variant="hero" className="w-full" onClick={handleSubmit} disabled={isSubmitting}>
                  <Send className="h-4 w-4" />
                  {isSubmitting ? 'Submitting...' : 'Submit Review'}
                </Button>
              </CardContent>
            </Card>

            {/* Recent Reviews */}
            <Card className="shadow-elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <ThumbsUp className="h-5 w-5 text-primary" />
                  Recent Reviews
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-muted-foreground text-sm">Loading reviews...</p>
                ) : recentReviews.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No reviews yet. Be the first to share your experience!</p>
                ) : (
                  <div className="space-y-4">
                    {recentReviews.map((review) => {
                      const product = mockProducts.find((p) => p.id === review.product_id);
                      return (
                        <div key={review.id} className="border-b border-border pb-4 last:border-0 last:pb-0">
                          <div className="flex items-start justify-between mb-1">
                            <div>
                              <p className="font-semibold text-sm text-foreground">{review.reviewer_name}</p>
                              <p className="text-xs text-muted-foreground">{product?.name ?? 'Unknown Product'}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              {review.is_complaint && (
                                <Badge className="bg-danger/10 text-danger border border-danger/30 text-xs">Complaint</Badge>
                              )}
                              <StarRating rating={review.rating} />
                            </div>
                          </div>
                          {review.review_text && (
                            <p className="text-sm text-muted-foreground mt-1">{review.review_text}</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(review.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
