import { BISHeader } from '@/components/BISHeader';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { MessageSquare, BookOpen, Search, Sparkles } from 'lucide-react';
import { BISLogo } from '@/components/BISLogo';

const features = [
  {
    icon: MessageSquare,
    title: 'AI Assistant',
    description: 'Find answers instantly about BIS standards, certification, and policies.',
    link: '/chat',
    linkLabel: 'Ask BIS AI',
  },
  {
    icon: BookOpen,
    title: 'Certification Guide',
    description: 'Learn how to apply for BIS certification step by step.',
    link: '/certification',
    linkLabel: 'View Guide',
  },
  {
    icon: Search,
    title: 'Standards Explorer',
    description: 'Discover BIS standards for products across categories.',
    link: '/standards',
    linkLabel: 'Explore Standards',
  },
];

export default function BISHome() {
  return (
    <div className="min-h-screen bg-background">
      <BISHeader />
      <main>
        {/* Hero */}
        <section className="relative py-20 md:py-32 px-4 bg-gradient-to-b from-primary/5 to-background">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              AI-Powered BIS Knowledge Base
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              BIS <span className="text-primary">AI</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Ask anything about BIS standards, certification and policies. Get instant, accurate answers with source citations.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/chat">
                <Button size="xl" className="gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Ask BIS AI
                </Button>
              </Link>
              <Link to="/standards">
                <Button size="xl" variant="outline" className="gap-2">
                  <Search className="h-5 w-5" />
                  Explore Standards
                </Button>
              </Link>
              <Link to="/certification">
                <Button size="xl" variant="secondary" className="gap-2">
                  <BookOpen className="h-5 w-5" />
                  Certification Guide
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-3">Platform Features</h2>
              <p className="text-muted-foreground text-lg">Everything you need to understand BIS standards and certification</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {features.map((f) => (
                <Card key={f.title} className="group hover:shadow-lg transition-shadow border-2 border-transparent hover:border-primary/20">
                  <CardContent className="p-6 flex flex-col items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <f.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-1">{f.title}</h3>
                      <p className="text-muted-foreground text-sm">{f.description}</p>
                    </div>
                    <Link to={f.link}>
                      <Button variant="ghost" size="sm" className="mt-auto gap-1.5">
                        {f.linkLabel} →
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Trust */}
        <section className="py-16 px-4 bg-secondary/30">
          <div className="max-w-3xl mx-auto text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/95 ring-1 ring-border/40 shadow-sm">
              <BISLogo className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-3">Powered by BIS Knowledge</h2>
            <p className="text-muted-foreground">
              Our AI assistant is trained on official BIS website content from bis.gov.in. Every answer includes source citations so you can verify the information directly.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
