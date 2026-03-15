import { BISHeader } from '@/components/BISHeader';
import { Footer } from '@/components/Footer';
import { IndiaRiskMap } from '@/components/IndiaRiskMap';

export default function RiskMapPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <BISHeader />
      <main className="flex-1">
        <IndiaRiskMap standalone />
      </main>
      <Footer />
    </div>
  );
}
