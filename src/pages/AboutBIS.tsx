import { BISHeader } from '@/components/BISHeader';
import { Footer } from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Target, Users, Globe } from 'lucide-react';

export default function AboutBIS() {
  return (
    <div className="min-h-screen bg-background">
      <BISHeader />
      <main className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">About BIS</h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Bureau of Indian Standards — India's National Standards Body
            </p>
          </div>

          <div className="prose prose-lg max-w-none dark:prose-invert mb-12">
            <p className="text-muted-foreground">
              The <strong className="text-foreground">Bureau of Indian Standards (BIS)</strong> is the national standards body of India established under the BIS Act, 2016. It is responsible for the harmonious development of standardization, marking, and quality certification of goods.
            </p>
            <p className="text-muted-foreground">
              BIS develops Indian Standards, operates product certification schemes (ISI Mark), runs the Hallmarking scheme for gold and silver articles, and manages the Compulsory Registration Scheme for electronic and IT goods.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {[
              {
                icon: Shield,
                title: 'Standards Development',
                desc: 'BIS formulates Indian Standards covering products, services, and systems across all sectors of the economy.',
              },
              {
                icon: Target,
                title: 'Product Certification',
                desc: 'Through ISI Mark certification, BIS ensures products meet quality and safety requirements defined by Indian Standards.',
              },
              {
                icon: Users,
                title: 'Consumer Protection',
                desc: 'BIS safeguards consumer interests by ensuring products in the market conform to established quality standards.',
              },
              {
                icon: Globe,
                title: 'International Cooperation',
                desc: 'BIS represents India in ISO, IEC, and other international standards organizations for global harmonization.',
              },
            ].map((item) => (
              <Card key={item.title}>
                <CardContent className="p-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary mb-3">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-sm">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-secondary/30">
            <CardContent className="p-8">
              <h2 className="text-xl font-bold text-foreground mb-4">Key Facts</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                {[
                  { value: '20,000+', label: 'Standards' },
                  { value: '1947', label: 'Established' },
                  { value: '5', label: 'Regional Offices' },
                  { value: '36', label: 'Branch Offices' },
                ].map((fact) => (
                  <div key={fact.label}>
                    <p className="text-2xl font-bold text-primary">{fact.value}</p>
                    <p className="text-xs text-muted-foreground">{fact.label}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
