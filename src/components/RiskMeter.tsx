import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, ShieldAlert, ShieldCheck, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface RiskItem {
  product: string;
  emoji: string;
  risk: 'HIGH' | 'MEDIUM' | 'LOW';
  reason: string;
}

const riskData: RiskItem[] = [
  { product: 'Helmet', emoji: '⛑️', risk: 'HIGH', reason: 'Head injury or death in accidents without ISI-certified helmet (IS 4151)' },
  { product: 'Electric Heater', emoji: '🔌', risk: 'HIGH', reason: 'Fire hazard, electrocution risk without BIS certification (IS 302)' },
  { product: 'Pressure Cooker', emoji: '🍳', risk: 'HIGH', reason: 'Explosion risk if safety valve fails — ISI mark mandatory (IS 2347)' },
  { product: 'Food Container', emoji: '🥡', risk: 'MEDIUM', reason: 'Chemical leaching into food from non-certified plastics (IS 15410)' },
  { product: 'Toys', emoji: '🧸', risk: 'MEDIUM', reason: 'Choking hazard, toxic paint risk for children (IS 9873)' },
  { product: 'Extension Board', emoji: '🔋', risk: 'HIGH', reason: 'Short circuit, electrical fire risk without ISI mark (IS 694)' },
  { product: 'Gas Regulator', emoji: '⛽', risk: 'HIGH', reason: 'LPG leak leading to fire/explosion (IS 3196)' },
  { product: 'Water Purifier', emoji: '💧', risk: 'MEDIUM', reason: 'Waterborne diseases if filtration is sub-standard' },
];

const riskConfig = {
  HIGH: { color: 'bg-destructive text-destructive-foreground', bar: 'bg-destructive', icon: ShieldAlert, label: 'HIGH RISK', percent: 100 },
  MEDIUM: { color: 'bg-accent text-accent-foreground', bar: 'bg-accent', icon: AlertTriangle, label: 'MEDIUM', percent: 66 },
  LOW: { color: 'bg-primary/20 text-primary', bar: 'bg-primary', icon: ShieldCheck, label: 'LOW', percent: 33 },
};

export function RiskMeter() {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  return (
    <Card className="border-2 border-destructive/20 overflow-hidden">
      <CardHeader className="pb-3 bg-destructive/5">
        <CardTitle className="text-sm font-bold flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-destructive" />
          ⚠️ Risk Without BIS Certification
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-3.5 w-3.5 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs max-w-[200px]">Shows the safety risk level when buying products without proper BIS/ISI certification</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-3 space-y-2.5">
        {riskData.map((item, i) => {
          const cfg = riskConfig[item.risk];
          const Icon = cfg.icon;
          return (
            <motion.div
              key={item.product}
              className="group cursor-default"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, delay: i * 0.07, ease: 'easeOut' }}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm">{item.emoji}</span>
                <span className="text-xs font-medium text-foreground flex-1">{item.product}</span>
                <Badge className={`${cfg.color} text-[10px] px-1.5 py-0 gap-1`}>
                  <Icon className="h-2.5 w-2.5" />
                  {cfg.label}
                </Badge>
              </div>
              <div className="h-2 rounded-full bg-secondary overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${cfg.bar}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${cfg.percent}%` }}
                  transition={{ duration: 0.6, delay: 0.2 + i * 0.07, ease: [0.25, 0.46, 0.45, 0.94] }}
                />
              </div>
              <AnimatePresence>
                {hoveredIdx === i && (
                  <motion.p
                    className="text-[10px] text-muted-foreground mt-1 leading-tight"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {item.reason}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </CardContent>
    </Card>
  );
}
