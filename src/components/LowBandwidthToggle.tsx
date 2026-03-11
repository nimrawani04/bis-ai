import { Gauge, Zap } from 'lucide-react';
import { useLowBandwidth } from '@/hooks/useLowBandwidth';
import { toast } from '@/components/ui/sonner';

export function LowBandwidthToggle() {
  const { isLowBandwidth, toggleLowBandwidth } = useLowBandwidth();

  const handleToggle = () => {
    toggleLowBandwidth();
    toast.success(
      isLowBandwidth
        ? 'Full mode enabled — animations and graphics restored'
        : 'Low bandwidth mode — text-only, faster loading'
    );
  };

  return (
    <button
      onClick={handleToggle}
      className={`p-2 rounded-lg transition-colors ${
        isLowBandwidth
          ? 'text-warning bg-warning/10 hover:bg-warning/20'
          : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
      }`}
      aria-label={isLowBandwidth ? 'Disable low bandwidth mode' : 'Enable low bandwidth mode'}
      title={isLowBandwidth ? 'Low Bandwidth Mode (ON)' : 'Low Bandwidth Mode'}
    >
      {isLowBandwidth ? <Gauge className="h-4 w-4" /> : <Zap className="h-4 w-4" />}
    </button>
  );
}
