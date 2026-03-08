import { useParams, Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ProductPassportCard } from '@/components/ProductPassportCard';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ProductPassport() {
  const { productId } = useParams();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8">
        <Link to="/#verify">
          <Button variant="ghost" size="sm" className="mb-6 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Verification
          </Button>
        </Link>
        <ProductPassportCard productId={productId} />
      </main>
      <Footer />
    </div>
  );
}
