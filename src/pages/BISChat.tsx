import { useState, useRef, useEffect } from 'react';
import { BISHeader } from '@/components/BISHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Send, Loader2, ExternalLink } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { useSearchParams } from 'react-router-dom';

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/rag-search`;

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

const exampleQuestions = [
  'What BIS standards apply to electric heaters?',
  'How can I verify a BIS certification number?',
  'What is the process for ISI mark certification?',
  'Which products require compulsory BIS registration?',
];

const knowledgeTopics = [
  'Product Certification',
  'BIS Standards',
  'Hallmarking',
  'Compulsory Registration Scheme (CRS)',
  'Consumer Safety',
];

function parseSources(text: string): { body: string; sources: string[] } {
  let body = text;
  let sources: string[] = [];

  const srcIdx = text.indexOf('---SOURCES---');
  if (srcIdx !== -1) {
    const afterSrc = text.slice(srcIdx + 13);
    const sugInSrc = afterSrc.indexOf('---SUGGESTIONS---');
    const srcBlock = sugInSrc !== -1 ? afterSrc.slice(0, sugInSrc) : afterSrc;
    sources = srcBlock.split('\n').map(l => l.replace(/^\-\s*/, '').trim()).filter(l => l.startsWith('http'));
    body = text.slice(0, srcIdx).trim();
  }

  return { body, sources };
}

const offlineKnowledge: Record<string, string> = {
  'what is bis': `The Bureau of Indian Standards (BIS) is the national standards body of India, established under the BIS Act 2016. It operates under the Ministry of Consumer Affairs, Food and Public Distribution. BIS develops Indian Standards, runs product certification (ISI Mark), hallmarking of precious metals, and the Compulsory Registration Scheme (CRS) for electronics.

---SOURCES---
- https://www.bis.gov.in/index.php/about-bis/

---SUGGESTIONS---
- What certification schemes does BIS offer?
- How to apply for BIS certification?
- What is ISI mark?`,
  'how to apply for bis certification': `Steps to apply for BIS certification:
1. Visit manakonline.bis.gov.in and create an account
2. Submit online application with documents (test reports, factory details, quality control plan)
3. BIS reviews and assigns an officer
4. Factory/premises inspection
5. Product samples tested at BIS labs
6. If compliant, license is granted
7. Annual surveillance and periodic renewal required

---SOURCES---
- https://www.bis.gov.in/index.php/certification/product-certification/
- https://manakonline.bis.gov.in

---SUGGESTIONS---
- What documents are needed for BIS certification?
- How long does BIS certification take?
- What are the fees for BIS certification?`,
};

function getOfflineAnswer(query: string): string | null {
  const q = query.toLowerCase().trim().replace(/[?।]/g, '');
  for (const [key, answer] of Object.entries(offlineKnowledge)) {
    if (q.includes(key) || key.includes(q)) return answer;
  }
  return null;
}

export default function BISChat() {
  const [searchParams] = useSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const initialQueryHandled = useRef(false);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isLoading]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    const userMsg: Message = { role: 'user', content: trimmed };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      const offlineAnswer = getOfflineAnswer(trimmed);
      if (offlineAnswer && !navigator.onLine) {
        setMessages(prev => [...prev, { role: 'assistant', content: offlineAnswer }]);
        setIsLoading(false);
        return;
      }

      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: updatedMessages.map(m => ({ role: m.role, content: m.content })),
        }),
      });

      await handleStreamResponse(resp);
    } catch (e) {
      console.error('Chat error:', e);
      toast.error('Failed to get response. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStreamResponse = async (resp: Response) => {
    if (!resp.ok) {
      const err = await resp.json().catch(() => ({ error: 'Request failed' }));
      if (resp.status === 429) toast.error('Rate limit reached. Please wait and try again.');
      else if (resp.status === 402) toast.error('AI usage limit reached.');
      else toast.error(err.error || 'Something went wrong');
      return;
    }

    const reader = resp.body?.getReader();
    if (!reader) throw new Error('No response stream');

    const decoder = new TextDecoder();
    let buffer = '';
    let accumulated = '';

    setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let newlineIdx: number;
      while ((newlineIdx = buffer.indexOf('\n')) !== -1) {
        let line = buffer.slice(0, newlineIdx);
        buffer = buffer.slice(newlineIdx + 1);
        if (line.endsWith('\r')) line = line.slice(0, -1);
        if (line.startsWith(':') || line.trim() === '') continue;
        if (!line.startsWith('data: ')) continue;
        const jsonStr = line.slice(6).trim();
        if (jsonStr === '[DONE]') break;
        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) {
            accumulated += content;
            setMessages(prev => prev.map((m, i) => i === prev.length - 1 ? { ...m, content: accumulated } : m));
          }
        } catch {
          buffer = line + '\n' + buffer;
          break;
        }
      }
    }
  };

  useEffect(() => {
    const q = searchParams.get('q');
    if (q && !initialQueryHandled.current) {
      initialQueryHandled.current = true;
      setInput(q);
      const timer = setTimeout(() => {
        sendMessage(q);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="min-h-screen bg-background">
      <BISHeader />
      <main className="py-6 px-4">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="text-sm text-muted-foreground">Home &gt; Ask BIS AI</div>

          <section className="space-y-3">
            <div className="text-[13px] text-muted-foreground uppercase tracking-[1px]">Digital Knowledge Service</div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">BIS AI Knowledge Assistant</h1>
            <p className="text-sm text-muted-foreground">Government of India – Bureau of Indian Standards</p>
            <p className="text-sm text-muted-foreground max-w-3xl">
              Ask questions about BIS standards, certification procedures, product safety, and regulatory policies.
            </p>
          </section>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about BIS standards or certification procedures"
              className="h-12 rounded-[4px]"
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading || !input.trim()} className="h-12 rounded-[4px] px-5 gap-2 shadow-none">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Ask
            </Button>
          </form>

          <div className="text-xs text-muted-foreground">
            Official AI-powered knowledge service for BIS standards and certification procedures.
          </div>

          <section className="border-t border-border pt-4">
            <h2 className="text-sm font-semibold text-foreground mb-2">Suggested Questions</h2>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              {exampleQuestions.map((q) => (
                <li key={q}>
                  <button
                    type="button"
                    onClick={() => sendMessage(q)}
                    className="text-left text-sm text-primary hover:text-primary/80"
                  >
                    {q}
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <section className="border-t border-border pt-4">
            <h2 className="text-sm font-semibold text-foreground mb-2">Knowledge Topics</h2>
            <div className="flex flex-wrap gap-2">
              {knowledgeTopics.map((topic) => (
                <span key={topic} className="text-xs text-foreground border border-border rounded-[4px] px-2.5 py-1 bg-white">
                  {topic}
                </span>
              ))}
            </div>
          </section>

          <section className="border-t border-border pt-4" ref={scrollRef}>
            <h2 className="text-sm font-semibold text-foreground mb-2">Answer</h2>
            <p className="text-xs text-muted-foreground">
              Answer generated from BIS knowledge repository with source references.
            </p>

            {messages.length === 0 && (
              <div className="mt-3 border border-border bg-white rounded-[2px] p-4 text-sm text-muted-foreground">
                Enter a question above to view the official BIS knowledge response here.
              </div>
            )}

            {messages.map((msg, i) => {
              if (msg.role === 'user') {
                return (
                  <div key={i} className="mt-4 border border-border bg-white rounded-[2px] p-4">
                    <p className="text-[11px] uppercase tracking-[1px] text-muted-foreground">Question</p>
                    <p className="text-sm text-foreground mt-1">{msg.content}</p>
                  </div>
                );
              }

              const { body, sources } = parseSources(msg.content);

              return (
                <div key={i} className="mt-3 border border-border bg-white rounded-[2px] p-4">
                  <p className="text-[11px] uppercase tracking-[1px] text-muted-foreground">Answer</p>
                  <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-li:text-muted-foreground mt-2">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{body}</ReactMarkdown>
                  </div>
                  {sources.length > 0 && (
                    <div className="mt-3 border-t border-border pt-2">
                      <p className="text-xs font-semibold text-foreground mb-1 flex items-center gap-1">
                        <ExternalLink className="h-3 w-3" /> Source References
                      </p>
                      <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1">
                        {sources.map((src) => (
                          <li key={src}>
                            <a href={src} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                              {src}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </section>

          <section className="border-t border-border pt-4">
            <div className="border border-border bg-[#f9fafb] rounded-[2px] p-4 text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">Note:</span> Responses are generated using BIS publications and regulatory documents. Users should refer to official BIS notifications for final verification.
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
