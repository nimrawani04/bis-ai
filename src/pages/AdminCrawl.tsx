import { useState } from 'react';
import { BISHeader } from '@/components/BISHeader';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, CheckCircle2, XCircle, Database, Globe } from 'lucide-react';
import { toast } from 'sonner';

type CrawlResult = {
  url: string;
  status: string;
  chunks?: number;
  error?: string;
};

type CrawlResponse = {
  success: boolean;
  total_chunks: number;
  pages_processed: number;
  results: CrawlResult[];
  error?: string;
};

const AdminCrawl = () => {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<CrawlResponse | null>(null);

  const handleCrawl = async () => {
    setLoading(true);
    setResponse(null);

    try {
      const { data, error } = await supabase.functions.invoke('crawl-bis');

      if (error) {
        toast.error('Crawl failed: ' + error.message);
        return;
      }

      setResponse(data as CrawlResponse);
      toast.success(`Crawl complete! ${data.total_chunks} chunks created from ${data.pages_processed} pages.`);
    } catch (err) {
      toast.error('Unexpected error during crawl');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <BISHeader />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold text-foreground mb-2">RAG Knowledge Ingestion</h1>
        <p className="text-muted-foreground mb-6">
          Crawl official BIS pages using Firecrawl and ingest them into the RAG knowledge base.
        </p>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Crawl bis.gov.in
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              This will scrape 24+ key BIS pages (certification, hallmarking, standards, consumer affairs),
              chunk them into ~500-token passages, and store them in the knowledge base for RAG retrieval.
            </p>
            <Button onClick={handleCrawl} disabled={loading} size="lg">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Crawling... (this may take a few minutes)
                </>
              ) : (
                <>
                  <Database className="mr-2 h-4 w-4" />
                  Start Crawl & Ingest
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {response && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Results
                <Badge variant="secondary">{response.total_chunks} total chunks</Badge>
                <Badge variant="outline">{response.pages_processed} pages</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {response.results?.map((r, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm py-2 border-b border-border last:border-0">
                    {r.status === 'success' ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                    ) : (
                      <XCircle className="h-4 w-4 text-destructive shrink-0" />
                    )}
                    <span className="truncate flex-1 text-foreground">{r.url}</span>
                    {r.chunks && <Badge variant="secondary">{r.chunks} chunks</Badge>}
                    {r.error && <span className="text-destructive text-xs">{r.error}</span>}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default AdminCrawl;
