import { useState, useRef } from 'react';
import { BISHeader } from '@/components/BISHeader';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import {
  Loader2, CheckCircle2, XCircle, Database, Globe,
  SkipForward, RefreshCw, Zap, AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

const BIS_URLS = [
  "https://www.bis.gov.in/about-bis/",
  "https://www.bis.gov.in/about-bis/organization/",
  "https://www.bis.gov.in/about-bis/vision-mission/",
  "https://www.bis.gov.in/product-certification/",
  "https://www.bis.gov.in/product-certification/isi-mark-scheme/",
  "https://www.bis.gov.in/product-certification/compulsory-registration-scheme/",
  "https://www.bis.gov.in/product-certification/foreign-manufacturers-certification-scheme-fmcs/",
  "https://www.bis.gov.in/product-certification/eco-mark-scheme/",
  "https://www.bis.gov.in/product-certification/mandatory-certification/",
  "https://www.bis.gov.in/hallmarking/",
  "https://www.bis.gov.in/hallmarking/hallmarking-overview/",
  "https://www.bis.gov.in/hallmarking/hallmarking-of-gold-jewellery/",
  "https://www.bis.gov.in/hallmarking/hallmarking-of-silver-jewellery/",
  "https://www.bis.gov.in/hallmarking/huid/",
  "https://www.bis.gov.in/standardization/",
  "https://www.bis.gov.in/standardization/how-standards-are-formulated/",
  "https://www.bis.gov.in/standardization/national-standards-body/",
  "https://www.bis.gov.in/standardization/indian-standards/",
  "https://www.bis.gov.in/management-system-certification/",
  "https://www.bis.gov.in/laboratory-services/",
  "https://www.bis.gov.in/consumer-affairs/",
  "https://www.bis.gov.in/consumer-affairs/lodge-complaint/",
  "https://www.bis.gov.in/consumer-affairs/consumer-engagement/",
  "https://www.bis.gov.in/bis-care-app/",
  "https://www.bis.gov.in/index.php/standards/bis-standards/is-10500-drinking-water/",
  "https://www.bis.gov.in/index.php/standards/technical-department/civil-engineering/",
  "https://www.bis.gov.in/index.php/standards/technical-department/metallurgical-engineering/",
  "https://www.bis.gov.in/index.php/standards/technical-department/food-and-agriculture/",
  "https://www.bis.gov.in/index.php/standards/technical-department/electrotechnical/",
  "https://www.bis.gov.in/index.php/standards/technical-department/electronics-and-information-technology/",
  "https://www.bis.gov.in/index.php/standards/technical-department/chemical/",
  "https://www.bis.gov.in/index.php/standards/technical-department/textile/",
  "https://www.bis.gov.in/index.php/standards/technical-department/mechanical-engineering/",
  "https://www.bis.gov.in/index.php/standards/technical-department/petroleum-coal-and-related-products/",
  "https://www.bis.gov.in/index.php/standards/technical-department/medical-equipment-and-hospital-planning/",
  "https://www.bis.gov.in/index.php/standards/technical-department/water-resources/",
  "https://www.bis.gov.in/index.php/standards/technical-department/transport-engineering/",
  "https://www.bis.gov.in/index.php/standards/technical-department/production-and-general-engineering/",
  "https://www.bis.gov.in/index.php/standards/technical-department/management-and-systems/",
  "https://www.bis.gov.in/index.php/certification/product-certification/",
  "https://www.bis.gov.in/index.php/certification/hallmarking/",
  "https://www.bis.gov.in/index.php/certification/scheme-for-compulsory-registration/",
  "https://www.bis.gov.in/index.php/about-bis/",
  "https://www.bis.gov.in/index.php/consumer-affairs/",
];

type UrlStatus = 'pending' | 'crawling' | 'success' | 'failed' | 'skipped';

type UrlState = {
  url: string;
  status: UrlStatus;
  chunks?: number;
  error?: string;
};

type Phase = 'idle' | 'crawling' | 'embedding' | 'done';

const AdminCrawl = () => {
  const [phase, setPhase] = useState<Phase>('idle');
  const [urlStates, setUrlStates] = useState<UrlState[]>(
    BIS_URLS.map(url => ({ url, status: 'pending' }))
  );
  const [crawledCount, setCrawledCount] = useState(0);
  const [totalChunks, setTotalChunks] = useState(0);
  const [embeddingProgress, setEmbeddingProgress] = useState({ done: 0, total: 0 });
  const [dbStats, setDbStats] = useState<{ total: number; with_embeddings: number } | null>(null);
  const abortRef = useRef(false);

  const updateUrl = (url: string, patch: Partial<UrlState>) =>
    setUrlStates(prev => prev.map(u => u.url === url ? { ...u, ...patch } : u));

  const fetchDbStats = async () => {
    const { data } = await supabase
      .from('bis_knowledge_chunks')
      .select('id, embedding', { count: 'exact' });
    if (data) {
      setDbStats({
        total: data.length,
        with_embeddings: data.filter((r: any) => r.embedding !== null).length,
      });
    }
  };

  const runCrawl = async () => {
    abortRef.current = false;
    setPhase('crawling');
    setCrawledCount(0);
    setTotalChunks(0);
    setUrlStates(BIS_URLS.map(url => ({ url, status: 'pending' })));

    let chunks = 0;
    let done = 0;

    for (const url of BIS_URLS) {
      if (abortRef.current) break;
      updateUrl(url, { status: 'crawling' });

      try {
        const { data, error } = await supabase.functions.invoke('crawl-bis', {
          body: { urls: [url] },
        });

        if (error) throw new Error(error.message);

        const result = data?.results?.[0];
        if (result?.status === 'success') {
          updateUrl(url, { status: 'success', chunks: result.chunks });
          chunks += result.chunks || 0;
        } else if (result?.status === 'skipped') {
          updateUrl(url, { status: 'skipped', error: result.error });
        } else {
          updateUrl(url, { status: 'failed', error: result?.error || 'Unknown error' });
        }
      } catch (err: any) {
        updateUrl(url, { status: 'failed', error: err.message });
      }

      done++;
      setCrawledCount(done);
      setTotalChunks(chunks);
    }

    // Now generate embeddings
    setPhase('embedding');
    await runEmbeddings();
  };

  const runEmbeddings = async () => {
    // Get total chunks without embeddings
    const { count } = await supabase
      .from('bis_knowledge_chunks')
      .select('*', { count: 'exact', head: true })
      .is('embedding', null);

    const total = count || 0;
    setEmbeddingProgress({ done: 0, total });

    if (total === 0) {
      toast.success('All chunks already have embeddings!');
      setPhase('done');
      await fetchDbStats();
      return;
    }

    let processed = 0;
    const batchSize = 10;

    while (processed < total && !abortRef.current) {
      const { data } = await supabase.functions.invoke('regenerate-embeddings', {
        body: { batch_size: batchSize, offset: 0 }, // always offset 0 since we process nulls
      });

      const batchDone = data?.processed || 0;
      if (batchDone === 0) break; // nothing left

      processed += batchDone;
      setEmbeddingProgress({ done: Math.min(processed, total), total });
    }

    setPhase('done');
    await fetchDbStats();
    toast.success(`Done! Knowledge base populated with embeddings.`);
  };

  const handleStop = () => {
    abortRef.current = true;
  };

  const successCount = urlStates.filter(u => u.status === 'success').length;
  const failedCount = urlStates.filter(u => u.status === 'failed').length;
  const skippedCount = urlStates.filter(u => u.status === 'skipped').length;
  const crawlProgress = (crawledCount / BIS_URLS.length) * 100;
  const embedProgress = embeddingProgress.total > 0
    ? (embeddingProgress.done / embeddingProgress.total) * 100
    : 0;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <BISHeader />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">RAG Knowledge Base</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Crawl {BIS_URLS.length} BIS pages with Firecrawl and generate embeddings for the AI chatbot.
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Total URLs', value: BIS_URLS.length },
            { label: 'Chunks in DB', value: dbStats?.total ?? totalChunks },
            { label: 'With Embeddings', value: dbStats?.with_embeddings ?? embeddingProgress.done },
            { label: 'Crawled', value: crawledCount },
          ].map(s => (
            <Card key={s.label} className="p-3">
              <div className="text-2xl font-bold text-foreground">{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </Card>
          ))}
        </div>

        {/* Controls */}
        <Card className="mb-6">
          <CardContent className="pt-5 flex flex-wrap gap-3 items-center">
            <Button
              onClick={runCrawl}
              disabled={phase === 'crawling' || phase === 'embedding'}
              size="lg"
            >
              {phase === 'crawling' || phase === 'embedding' ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Running...</>
              ) : (
                <><Globe className="mr-2 h-4 w-4" /> Crawl All {BIS_URLS.length} URLs + Generate Embeddings</>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={runEmbeddings}
              disabled={phase === 'crawling' || phase === 'embedding'}
            >
              <Zap className="mr-2 h-4 w-4" /> Embeddings Only
            </Button>

            <Button variant="outline" onClick={fetchDbStats} disabled={phase === 'crawling' || phase === 'embedding'}>
              <RefreshCw className="h-4 w-4 mr-2" /> Refresh Stats
            </Button>

            {(phase === 'crawling' || phase === 'embedding') && (
              <Button variant="destructive" size="sm" onClick={handleStop}>
                Stop
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Progress */}
        {phase !== 'idle' && (
          <Card className="mb-6">
            <CardContent className="pt-5 space-y-4">
              {(phase === 'crawling' || phase === 'done') && (
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Crawling pages</span>
                    <span className="font-medium">{crawledCount} / {BIS_URLS.length}</span>
                  </div>
                  <Progress value={crawlProgress} className="h-2" />
                  <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
                    <span className="text-green-600">✓ {successCount} ok</span>
                    <span className="text-red-500">✗ {failedCount} failed</span>
                    <span>⊘ {skippedCount} skipped</span>
                    <span>{totalChunks} chunks</span>
                  </div>
                </div>
              )}

              {(phase === 'embedding' || phase === 'done') && embeddingProgress.total > 0 && (
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Generating embeddings</span>
                    <span className="font-medium">{embeddingProgress.done} / {embeddingProgress.total}</span>
                  </div>
                  <Progress value={embedProgress} className="h-2" />
                </div>
              )}

              {phase === 'done' && (
                <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                  <CheckCircle2 className="h-4 w-4" /> Knowledge base ready
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* URL list */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Database className="h-4 w-4" /> URL Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 max-h-[500px] overflow-y-auto pr-1">
              {urlStates.map((u, i) => (
                <div key={i} className="flex items-center gap-2 py-1.5 border-b border-border/50 last:border-0 text-sm">
                  {u.status === 'pending' && <div className="h-4 w-4 rounded-full border-2 border-muted shrink-0" />}
                  {u.status === 'crawling' && <Loader2 className="h-4 w-4 animate-spin text-primary shrink-0" />}
                  {u.status === 'success' && <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />}
                  {u.status === 'failed' && <XCircle className="h-4 w-4 text-destructive shrink-0" />}
                  {u.status === 'skipped' && <SkipForward className="h-4 w-4 text-muted-foreground shrink-0" />}
                  <span className="truncate flex-1 text-muted-foreground font-mono text-xs">{u.url}</span>
                  {u.chunks != null && <Badge variant="secondary" className="text-xs shrink-0">{u.chunks} chunks</Badge>}
                  {u.error && (
                    <span className="text-destructive text-xs shrink-0 max-w-[120px] truncate" title={u.error}>
                      {u.error}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Warning */}
        <div className="mt-4 flex items-start gap-2 text-xs text-muted-foreground">
          <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
          <span>Crawling all 44 URLs takes ~3–5 minutes. Embedding generation adds another ~2 minutes. Keep this tab open.</span>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminCrawl;
