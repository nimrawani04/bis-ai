import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { ProductVerification } from '@/components/ProductVerification';
import { ProductSearch } from '@/components/ProductSearch';
import { KnowledgeHub } from '@/components/KnowledgeHub';
import { Footer } from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <ProductVerification />
        <ProductSearch />
        <KnowledgeHub />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
