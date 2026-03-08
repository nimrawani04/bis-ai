import { Shield, Award, FileCheck, Users, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const knowledgeItems = [
  {
    icon: Shield,
    title: 'What is ISI Mark?',
    description: 'The ISI mark is a certification mark for industrial products in India. It certifies that the product conforms to Indian Standards developed by the Bureau of Indian Standards.',
    color: 'primary'
  },
  {
    icon: Award,
    title: 'Why Certification Matters',
    description: 'BIS certification ensures products meet quality and safety standards. Using uncertified products can lead to accidents, health hazards, and property damage.',
    color: 'accent'
  },
  {
    icon: FileCheck,
    title: 'How BIS Certification Works',
    description: 'Manufacturers apply to BIS, undergo factory inspections, and submit products for testing. Once approved, they can use the ISI mark with a unique license number.',
    color: 'success'
  },
  {
    icon: Users,
    title: 'Consumer Rights',
    description: 'Consumers have the right to safe products. You can report fake ISI marks or unsafe products to BIS. Your complaints help protect others.',
    color: 'primary'
  }
];

export function KnowledgeHub() {
  return (
    <section id="knowledge" className="py-20 bg-secondary/30">
      <div className="container">
        <div className="mx-auto max-w-5xl">
          {/* Section Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary mb-4">
              <Award className="h-4 w-4" />
              BIS Knowledge Hub
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Understanding Product Safety Standards
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Learn about ISI marks, BIS certification process, and why product standards 
              are crucial for your safety. Knowledge is your first line of defense.
            </p>
          </div>

          {/* Knowledge Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {knowledgeItems.map((item, index) => (
              <Card key={index} className="group hover:shadow-elevated transition-all duration-300 overflow-hidden">
                <CardContent className="p-6">
                  <div className={`inline-flex p-3 rounded-xl mb-4 ${
                    item.color === 'primary' ? 'bg-primary/10' :
                    item.color === 'accent' ? 'bg-accent/10' :
                    'bg-success/10'
                  }`}>
                    <item.icon className={`h-6 w-6 ${
                      item.color === 'primary' ? 'text-primary' :
                      item.color === 'accent' ? 'text-accent' :
                      'text-success'
                    }`} />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3 group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* CTA Card */}
          <Card className="gradient-hero text-primary-foreground overflow-hidden">
            <CardContent className="p-8 md:p-12">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <h3 className="text-2xl font-bold mb-2">
                    Found a Fake or Unsafe Product?
                  </h3>
                  <p className="text-primary-foreground/80">
                    Help protect other consumers by reporting counterfeit products. 
                    Your report could prevent accidents and save lives.
                  </p>
                </div>
                <Button variant="secondary" size="lg" className="shrink-0">
                  Report Now
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
