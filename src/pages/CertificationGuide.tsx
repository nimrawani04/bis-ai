import { BISHeader } from '@/components/BISHeader';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { FileText, CheckCircle, Search, Building, Award, MessageSquare, ArrowRight } from 'lucide-react';

const steps = [
  {
    step: 1,
    title: 'Submit Application',
    description: 'Apply online at the BIS Manak Online portal (manakonline.bis.gov.in) with required documents including product details, test reports, and factory information.',
    icon: FileText,
  },
  {
    step: 2,
    title: 'Product Testing',
    description: 'Products are tested at BIS-recognized laboratories to verify conformity with the relevant Indian Standard specifications.',
    icon: Search,
  },
  {
    step: 3,
    title: 'Factory Inspection',
    description: 'BIS officers conduct an inspection of the manufacturing facility to assess quality control systems and production processes.',
    icon: Building,
  },
  {
    step: 4,
    title: 'Certification Approval',
    description: 'Upon successful testing and inspection, BIS grants a licence to use the ISI Mark on the product. The licence is subject to regular surveillance.',
    icon: Award,
  },
];

const schemes = [
  { name: 'ISI Mark (Product Certification)', description: 'For products conforming to Indian Standards', type: 'Voluntary / Mandatory' },
  { name: 'Hallmarking Scheme', description: 'Certifies purity of gold and silver articles', type: 'Mandatory' },
  { name: 'Compulsory Registration (CRS)', description: 'For electronic and IT goods safety', type: 'Mandatory' },
  { name: 'Foreign Manufacturers (FMCS)', description: 'For products manufactured outside India', type: 'Voluntary' },
  { name: 'ECO Mark Scheme', description: 'For environment-friendly products', type: 'Voluntary' },
];

export default function CertificationGuide() {
  return (
    <div className="min-h-screen bg-background">
      <BISHeader />
      <main className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              BIS Certification Guide
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Step-by-step process to obtain BIS certification for your products
            </p>
          </div>

          {/* Steps */}
          <div className="space-y-4 mb-16">
            {steps.map((s) => (
              <Card key={s.step} className="border-l-4 border-l-primary">
                <CardContent className="p-6 flex gap-4 items-start">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-sm">
                    {s.step}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                      <s.icon className="h-4 w-4 text-primary" />
                      {s.title}
                    </h3>
                    <p className="text-muted-foreground text-sm mt-1">{s.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Schemes */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">BIS Certification Schemes</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {schemes.map((s) => (
                <Card key={s.name}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="text-sm font-semibold text-foreground">{s.name}</h3>
                      <Badge variant="secondary" className="text-[10px] shrink-0">{s.type}</Badge>
                    </div>
                    <p className="text-muted-foreground text-xs">{s.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* CTA */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-8 text-center">
              <MessageSquare className="h-8 w-8 text-primary mx-auto mb-3" />
              <h3 className="text-xl font-bold text-foreground mb-2">Have questions about certification?</h3>
              <p className="text-muted-foreground mb-4">Ask our AI assistant for instant answers</p>
              <Link to="/chat">
                <Button className="gap-2">
                  Ask the AI about certification <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
