import { useState, useRef } from 'react';
import { AlertTriangle, Camera, MapPin, Send, Upload, X, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ReportFormData {
  productName: string;
  category: string;
  issueType: string;
  description: string;
  location: string;
  purchasePlace: string;
}

const issueTypes = [
  '🔥 Fire risk',
  '⚡ Electrical hazard',
  '📛 Fake certification',
  '💥 Structural failure',
  '🔋 Overheating',
  '☠️ Toxic / Harmful material',
  '🔧 Missing safety features',
  'Other',
];

const categories = [
  'Helmets', 'Pressure Cookers', 'Electrical Wires', 'Electric Appliances',
  'Chargers', 'LPG Cylinders', 'Toys', 'Other',
];

export function ReportProduct() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photos, setPhotos] = useState<{ file: File; preview: string }[]>([]);
  const [form, setForm] = useState<ReportFormData>({
    productName: '', category: '', issueType: '', description: '', location: '', purchasePlace: '',
  });

  const updateField = (field: keyof ReportFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newPhotos = Array.from(files).slice(0, 4 - photos.length).map((file) => ({
      file, preview: URL.createObjectURL(file),
    }));
    setPhotos((prev) => [...prev, ...newPhotos].slice(0, 4));
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => { URL.revokeObjectURL(prev[index].preview); return prev.filter((_, i) => i !== index); });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.productName.trim() || !form.category || !form.issueType || !form.description.trim()) {
      toast({ title: 'Missing Information', description: 'Please fill in all required fields.', variant: 'destructive' });
      return;
    }
    setIsSubmitting(true);
    try {
      const photoUrls: string[] = [];
      for (const photo of photos) {
        const fileExt = photo.file.name.split('.').pop();
        const filePath = `${crypto.randomUUID()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('report-photos').upload(filePath, photo.file);
        if (!uploadError) {
          const { data: urlData } = supabase.storage.from('report-photos').getPublicUrl(filePath);
          photoUrls.push(urlData.publicUrl);
        }
      }
      const { error } = await supabase.from('product_reports').insert({
        product_name: form.productName.trim(), category: form.category, issue_type: form.issueType,
        description: form.description.trim(), location: form.location.trim() || null,
        purchase_place: form.purchasePlace.trim() || null, photo_urls: photoUrls.length > 0 ? photoUrls : null,
      });
      if (error) throw error;
      setSubmitted(true);
      toast({ title: 'Report Submitted', description: 'Thank you for helping keep consumers safe.' });
    } catch {
      toast({ title: 'Submission Failed', description: 'Something went wrong. Please try again.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    photos.forEach((p) => URL.revokeObjectURL(p.preview));
    setPhotos([]);
    setForm({ productName: '', category: '', issueType: '', description: '', location: '', purchasePlace: '' });
  };

  if (submitted) {
    return (
      <section id="report" className="py-20 bg-background">
        <div className="container">
          <div className="mx-auto max-w-2xl">
            <Card className="shadow-elevated border-success/20 rounded-2xl">
              <CardContent className="p-12 text-center">
                <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-success/10">
                  <CheckCircle2 className="h-12 w-12 text-success" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-3">Report Submitted Successfully</h3>
                <p className="text-muted-foreground mb-2">Thank you for helping improve consumer safety.</p>
                <p className="text-sm text-muted-foreground mb-8">
                  Reference: <span className="font-mono font-bold text-foreground">RPT-{Date.now().toString(36).toUpperCase()}</span>
                </p>
                <Button variant="hero" size="lg" className="rounded-xl" onClick={handleReset}>
                  Submit Another Report
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="report" className="py-20 bg-background">
      <div className="container">
        <div className="mx-auto max-w-3xl">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-danger/10 px-4 py-2 text-sm font-medium text-danger mb-4">
              <AlertTriangle className="h-4 w-4" />
              Report Unsafe Product
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-3">Found a Dangerous Product?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Report unsafe or counterfeit products to protect other consumers.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Product Info */}
            <Card className="shadow-card rounded-2xl mb-5">
              <CardHeader><CardTitle className="text-lg">Product Information</CardTitle></CardHeader>
              <CardContent className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Product Name <span className="text-danger">*</span></label>
                    <Input placeholder="e.g., XYZ Mobile Charger" className="rounded-xl" value={form.productName} onChange={(e) => updateField('productName', e.target.value.slice(0, 100))} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Category <span className="text-danger">*</span></label>
                    <Select value={form.category} onValueChange={(v) => updateField('category', v)}>
                      <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select category" /></SelectTrigger>
                      <SelectContent>{categories.map((cat) => (<SelectItem key={cat} value={cat}>{cat}</SelectItem>))}</SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Issue Type <span className="text-danger">*</span></label>
                  <Select value={form.issueType} onValueChange={(v) => updateField('issueType', v)}>
                    <SelectTrigger className="rounded-xl"><SelectValue placeholder="What went wrong?" /></SelectTrigger>
                    <SelectContent>{issueTypes.map((type) => (<SelectItem key={type} value={type}>{type}</SelectItem>))}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Describe the Problem <span className="text-danger">*</span></label>
                  <Textarea placeholder="Tell us what happened…" className="min-h-[120px] resize-none rounded-xl" value={form.description} onChange={(e) => updateField('description', e.target.value.slice(0, 1000))} />
                  <p className="text-xs text-muted-foreground text-right">{form.description.length}/1000</p>
                </div>
              </CardContent>
            </Card>

            {/* Upload Photos */}
            <Card className="shadow-card rounded-2xl mb-5">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Camera className="h-5 w-5 text-primary" />
                  Upload Photo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-3">
                  {photos.map((photo, i) => (
                    <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-border group">
                      <img src={photo.preview} alt={`Upload ${i+1}`} className="h-full w-full object-cover" />
                      <button type="button" onClick={() => removePhoto(i)} className="absolute top-1.5 right-1.5 rounded-full bg-danger p-1 text-danger-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  {photos.length < 4 && (
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="aspect-square rounded-xl border-2 border-dashed border-border hover:border-primary/50 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                      <Upload className="h-6 w-6" />
                      <span className="text-xs font-medium">Add Photo</span>
                    </button>
                  )}
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoUpload} />
              </CardContent>
            </Card>

            {/* Location */}
            <Card className="shadow-card rounded-2xl mb-8">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Location
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">City / Town</label>
                    <Input placeholder="e.g., Mumbai" className="rounded-xl" value={form.location} onChange={(e) => updateField('location', e.target.value.slice(0, 100))} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Where did you buy it?</label>
                    <Input placeholder="e.g., Local market, Amazon" className="rounded-xl" value={form.purchasePlace} onChange={(e) => updateField('purchasePlace', e.target.value.slice(0, 100))} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="text-center">
              <Button type="submit" variant="accent" size="lg" className="rounded-xl px-10" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                {isSubmitting ? 'Submitting…' : 'Report Unsafe Product'}
              </Button>
              <p className="text-xs text-muted-foreground mt-3">Your identity will remain anonymous.</p>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
