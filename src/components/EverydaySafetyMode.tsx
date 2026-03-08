import { ShieldCheck, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface EverydayProduct {
  name: string;
  emoji: string;
  query: string;
}

const everydayProducts: EverydayProduct[] = [
  { name: 'Helmet', emoji: '⛑️', query: 'Tell me about Helmet safety: What BIS standard applies? What safety tests are done? What are the risks of buying without ISI mark?' },
  { name: 'Electric Iron', emoji: '🔌', query: 'Tell me about Electric Iron safety: What BIS standard applies? What safety tests are done? What are the risks of buying without ISI mark?' },
  { name: 'Pressure Cooker', emoji: '🍳', query: 'Tell me about Pressure Cooker safety: What BIS standard applies? What safety tests are done? What are the risks of buying without ISI mark?' },
  { name: 'Extension Board', emoji: '🔋', query: 'Tell me about Extension Board safety: What BIS standard applies? What safety tests are done? What are the risks of buying without ISI mark?' },
  { name: 'Gas Regulator', emoji: '⛽', query: 'Tell me about Gas Regulator/LPG Cylinder safety: What BIS standard applies? What safety tests are done? What are the risks of buying without ISI mark?' },
  { name: 'Toys', emoji: '🧸', query: 'Tell me about Toy safety for children: What BIS standard applies? What safety tests are done? What are the risks of buying without ISI mark?' },
  { name: 'Water Purifier', emoji: '💧', query: 'Tell me about Water Purifier safety: What BIS standard applies? What safety tests are done? What are the risks of buying without ISI mark?' },
  { name: 'Phone Charger', emoji: '📱', query: 'Tell me about Phone Charger safety: What BIS standard applies? What safety tests are done? What are the risks of buying without ISI mark?' },
];

interface EverydaySafetyModeProps {
  onProductClick: (query: string) => void;
  disabled?: boolean;
}

export function EverydaySafetyMode({ onProductClick, disabled }: EverydaySafetyModeProps) {
  return (
    <Card className="border-2 border-primary/20 overflow-hidden">
      <CardHeader className="pb-3 bg-primary/5">
        <CardTitle className="text-sm font-bold flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-primary" />
          🏠 Everyday Safety Mode
        </CardTitle>
        <p className="text-[11px] text-muted-foreground mt-1">
          Click any product to learn its BIS standard, safety tests & risks
        </p>
      </CardHeader>
      <CardContent className="pt-3 grid grid-cols-2 gap-2">
        {everydayProducts.map((product) => (
          <button
            key={product.name}
            onClick={() => onProductClick(product.query)}
            disabled={disabled}
            className="flex items-center gap-2 text-left text-xs font-medium text-foreground bg-secondary/50 hover:bg-secondary hover:border-primary/30 border border-border rounded-lg px-3 py-2.5 transition-all group disabled:opacity-50"
          >
            <span className="text-base">{product.emoji}</span>
            <span className="flex-1">{product.name}</span>
            <ChevronRight className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
          </button>
        ))}
      </CardContent>
    </Card>
  );
}
