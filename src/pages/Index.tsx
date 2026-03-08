import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { ProductVerification } from '@/components/ProductVerification';
import { ProductSearch } from '@/components/ProductSearch';
import { HouseholdScanner } from '@/components/HouseholdScanner';
import { CommunityTrustScore } from '@/components/CommunityTrustScore';
import { KnowledgeHub } from '@/components/KnowledgeHub';
import { ReportProduct } from '@/components/ReportProduct';
import { Footer } from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <ProductVerification />
        <ProductSearch />
        <HouseholdScanner />
        <CommunityTrustScore />
        <ReportProduct />
        <KnowledgeHub />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
