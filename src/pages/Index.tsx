import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
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

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <SafetyAlerts />
        <ProductVerification />
        <ProductSearch />
        <HouseholdScanner />
        <CommunityTrustScore />
        <MarketRiskMap />
        <ReportProduct />
        <KnowledgeHub />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
