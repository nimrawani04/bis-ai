import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { SmartSafetyAssistant } from '@/components/SmartSafetyAssistant';
import { ProductVerification } from '@/components/ProductVerification';
import { ProductSearch } from '@/components/ProductSearch';
import { HouseholdScanner } from '@/components/HouseholdScanner';
import { CommunityTrustScore } from '@/components/CommunityTrustScore';
import { SafetyAlerts } from '@/components/SafetyAlerts';
import { MarketRiskMap } from '@/components/MarketRiskMap';
import { KnowledgeHub } from '@/components/KnowledgeHub';
import { ProductComparison } from '@/components/ProductComparison';
import { ReportProduct } from '@/components/ReportProduct';
import { Footer } from '@/components/Footer';
import { AnimatedSection } from '@/components/AnimatedSection';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <AnimatedSection><SmartSafetyAssistant /></AnimatedSection>
        <AnimatedSection><SafetyAlerts /></AnimatedSection>
        <AnimatedSection><ProductVerification /></AnimatedSection>
        <AnimatedSection><ProductSearch /></AnimatedSection>
        <AnimatedSection><HouseholdScanner /></AnimatedSection>
        <AnimatedSection><CommunityTrustScore /></AnimatedSection>
        <AnimatedSection><MarketRiskMap /></AnimatedSection>
        <AnimatedSection><ProductComparison /></AnimatedSection>
        <AnimatedSection><ReportProduct /></AnimatedSection>
        <AnimatedSection><KnowledgeHub /></AnimatedSection>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
