import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface LowBandwidthContextType {
  isLowBandwidth: boolean;
  toggleLowBandwidth: () => void;
  setLowBandwidth: (value: boolean) => void;
}

const LowBandwidthContext = createContext<LowBandwidthContextType>({
  isLowBandwidth: false,
  toggleLowBandwidth: () => {},
  setLowBandwidth: () => {},
});

export function LowBandwidthProvider({ children }: { children: ReactNode }) {
  const [isLowBandwidth, setIsLowBandwidth] = useState(() => {
    return localStorage.getItem('bis-low-bandwidth') === 'true';
  });

  // Auto-detect slow connection
  useEffect(() => {
    const nav = navigator as any;
    if (nav.connection) {
      const conn = nav.connection;
      const checkConnection = () => {
        const slow = conn.effectiveType === 'slow-2g' || conn.effectiveType === '2g';
        if (slow && !isLowBandwidth) {
          setIsLowBandwidth(true);
          localStorage.setItem('bis-low-bandwidth', 'true');
        }
      };
      checkConnection();
      conn.addEventListener('change', checkConnection);
      return () => conn.removeEventListener('change', checkConnection);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('bis-low-bandwidth', String(isLowBandwidth));
    if (isLowBandwidth) {
      document.documentElement.classList.add('low-bandwidth');
    } else {
      document.documentElement.classList.remove('low-bandwidth');
    }
  }, [isLowBandwidth]);

  const toggleLowBandwidth = () => setIsLowBandwidth(prev => !prev);

  return (
    <LowBandwidthContext.Provider value={{ isLowBandwidth, toggleLowBandwidth, setLowBandwidth: setIsLowBandwidth }}>
      {children}
    </LowBandwidthContext.Provider>
  );
}

export function useLowBandwidth() {
  return useContext(LowBandwidthContext);
}
