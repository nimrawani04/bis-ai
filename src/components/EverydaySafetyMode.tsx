import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface EverydayProduct {
  name: string;
  query: string;
}

const everydayProducts: EverydayProduct[] = [
  { name: 'Helmet', query: 'Tell me about Helmet safety: What BIS standard applies? What safety tests are done? What are the risks of buying without ISI mark?' },
  { name: 'Electric Iron', query: 'Tell me about Electric Iron safety: What BIS standard applies? What safety tests are done? What are the risks of buying without ISI mark?' },
  { name: 'Pressure Cooker', query: 'Tell me about Pressure Cooker safety: What BIS standard applies? What safety tests are done? What are the risks of buying without ISI mark?' },
  { name: 'Extension Board', query: 'Tell me about Extension Board safety: What BIS standard applies? What safety tests are done? What are the risks of buying without ISI mark?' },
  { name: 'Gas Regulator', query: 'Tell me about Gas Regulator/LPG Cylinder safety: What BIS standard applies? What safety tests are done? What are the risks of buying without ISI mark?' },
  { name: 'Toys', query: 'Tell me about Toy safety for children: What BIS standard applies? What safety tests are done? What are the risks of buying without ISI mark?' },
  { name: 'Water Purifier', query: 'Tell me about Water Purifier safety: What BIS standard applies? What safety tests are done? What are the risks of buying without ISI mark?' },
  { name: 'Phone Charger', query: 'Tell me about Phone Charger safety: What BIS standard applies? What safety tests are done? What are the risks of buying without ISI mark?' },
];

interface EverydaySafetyModeProps {
  onProductClick: (query: string) => void;
  disabled?: boolean;
}

function EverydaySafetyMode({ onProductClick, disabled }: EverydaySafetyModeProps) {
  return (
    <Card className="border border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-foreground">
          Everyday Safety
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Quick checks for frequently purchased household items.
        </p>
      </CardHeader>
      <CardContent className="pt-0 grid grid-cols-2 gap-2">
        {everydayProducts.map((product) => (
          <button
            key={product.name}
            onClick={() => onProductClick(product.query)}
            disabled={disabled}
            className="text-left text-sm text-foreground bg-secondary/40 hover:bg-secondary/70 border border-border rounded-lg px-3 py-2 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98] disabled:opacity-50"
          >
            {product.name}
          </button>
        ))}
      </CardContent>
    </Card>
  );
}

export { EverydaySafetyMode };
export default EverydaySafetyMode;
