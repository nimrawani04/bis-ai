import { WifiOff, Download, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { useState } from 'react';
import { toast } from '@/components/ui/sonner';
import { offlineKnowledgeBase } from '@/data/offlineKnowledgeBase';

export function OfflineBanner() {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="w-full bg-warning/15 border-b border-warning/30 px-4 py-2.5 flex items-center justify-center gap-2 text-sm">
      <WifiOff className="h-4 w-4 text-warning shrink-0" />
      <span className="text-foreground font-medium">Offline Mode</span>
      <span className="text-muted-foreground hidden sm:inline">
        — You are currently offline. Showing cached BIS information.
      </span>
    </div>
  );
}

export function DownloadOfflinePack() {
  const [downloaded, setDownloaded] = useState(() => {
    return localStorage.getItem('bis-offline-pack-downloaded') === 'true';
  });
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      // Store knowledge base in localStorage for offline access
      localStorage.setItem('bis-offline-knowledge', JSON.stringify(offlineKnowledgeBase));
      localStorage.setItem('bis-offline-pack-downloaded', 'true');
      localStorage.setItem('bis-offline-pack-date', new Date().toISOString());

      // Simulate a small delay to show progress
      await new Promise((r) => setTimeout(r, 800));

      setDownloaded(true);
      toast.success('BIS Offline Pack downloaded! You can now access BIS info without internet.');
    } catch {
      toast.error('Failed to download offline pack. Try again.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 p-4 rounded-xl border border-border bg-card">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Download className="h-4 w-4" />
        <span>BIS Offline Knowledge Pack (~5 KB)</span>
      </div>
      {downloaded ? (
        <div className="flex items-center gap-2 text-sm text-success font-medium">
          <CheckCircle2 className="h-4 w-4" />
          Offline pack ready
        </div>
      ) : (
        <Button onClick={handleDownload} disabled={downloading} size="sm" className="gap-2">
          {downloading ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Downloading...
            </>
          ) : (
            <>
              <Download className="h-3.5 w-3.5" />
              Download BIS Offline Pack
            </>
          )}
        </Button>
      )}
    </div>
  );
}
