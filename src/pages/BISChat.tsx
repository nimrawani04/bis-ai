import { useState, useRef, useEffect } from 'react';
import { BISHeader } from '@/components/BISHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import ReactMarkdown from 'react-markdown';
import { Send, Loader2, MessageSquare, ExternalLink, Lightbulb } from 'lucide-react';
import { toast } from '@/components/ui/sonner';

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/bis-chat`;

type Message = { role: 'user' | 'assistant'; content: string };

const exampleQuestions = [
  'What is BIS?',
  'How do I apply for BIS certification?',
  'What schemes does BIS offer?',
  'How can consumers file complaints?',
  'What is BIS hallmarking?',
  'What is the ISI mark?',
];

function parseSources(text: string): { body: string; sources: string[]; suggestions: string[] } {
  let body = text;
  let sources: string[] = [];
  let suggestions: string[] = [];

  const srcIdx = text.indexOf('---SOURCES---');
  const sugIdx = text.indexOf('---SUGGESTIONS---');

  if (srcIdx !== -1) {
    const afterSrc = text.slice(srcIdx + 13);
    const sugInSrc = afterSrc.indexOf('---SUGGESTIONS---');
    const srcBlock = sugInSrc !== -1 ? afterSrc.slice(0, sugInSrc) : afterSrc;
    sources = srcBlock
      .split('\n')
      .map(l => l.replace(/^-\s*/, '').trim())
      .filter(l => l.startsWith('http'));
    body = text.slice(0, srcIdx).trim();
  }

  if (sugIdx !== -1) {
    const sugBlock = text.slice(sugIdx + 17);
    suggestions = sugBlock
      .split('\n')
      .map(l => l.replace(/^-\s*/, '').trim())
      .filter(Boolean);
  }

  return { body, sources, suggestions };
}

export default function BISChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    const userMsg: Message = { role: 'user', content: trimmed };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: 'Request failed' }));
        if (resp.status === 429) toast.error('Rate limit reached. Please wait and try again.');
        else if (resp.status === 402) toast.error('AI usage limit reached.');
        else toast.error(err.error || 'Something went wrong');
        setIsLoading(false);
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
              setMessages(prev =>
                prev.map((m, i) => i === prev.length - 1 ? { ...m, content: accumulated } : m)
              );
            }
          } catch {
            buffer = line + '\n' + buffer;
            break;
          }
        }
      }
    } catch (e) {
      console.error('Chat error:', e);
      toast.error('Failed to get response. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <BISHeader />
      <div className="flex-1 flex max-w-7xl mx-auto w-full">
        {/* Sidebar */}
        <aside className="hidden lg:flex w-72 border-r border-border p-6 flex-col gap-6">
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-1 flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-primary" />
              Try asking:
            </h3>
            <div className="flex flex-col gap-2 mt-3">
              {exampleQuestions.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  disabled={isLoading}
                  className="text-left text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 px-3 py-2 rounded-lg transition-colors border border-transparent hover:border-border"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Chat area */}
        <div className="flex-1 flex flex-col">
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center py-20">
                <MessageSquare className="h-12 w-12 text-primary/30 mb-4" />
                <h2 className="text-xl font-semibold text-foreground mb-2">Ask BIS AI</h2>
                <p className="text-muted-foreground max-w-md mb-6">
                  Ask anything about BIS standards, certification, hallmarking, or policies.
                </p>
                {/* Mobile example questions */}
                <div className="lg:hidden flex flex-wrap gap-2 justify-center max-w-lg">
                  {exampleQuestions.slice(0, 4).map((q) => (
                    <Button
                      key={q}
                      variant="outline"
                      size="sm"
                      onClick={() => sendMessage(q)}
                      disabled={isLoading}
                      className="text-xs"
                    >
                      {q}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => {
              if (msg.role === 'user') {
                return (
                  <div key={i} className="flex justify-end">
                    <div className="bg-primary text-primary-foreground rounded-2xl rounded-br-sm px-4 py-3 max-w-[80%] md:max-w-[60%]">
                      <p className="text-sm">{msg.content}</p>
                    </div>
                  </div>
                );
              }

              const { body, sources, suggestions } = parseSources(msg.content);
              const isLast = i === messages.length - 1;

              return (
                <div key={i} className="flex justify-start">
                  <div className="bg-card border border-border rounded-2xl rounded-bl-sm px-4 py-3 max-w-[90%] md:max-w-[75%] space-y-3">
                    <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-li:text-muted-foreground">
                      <ReactMarkdown>{body}</ReactMarkdown>
                    </div>

                    {sources.length > 0 && (
                      <div className="border-t border-border pt-3">
                        <p className="text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1">
                          <ExternalLink className="h-3 w-3" /> Sources
                        </p>
                        <div className="flex flex-col gap-1">
                          {sources.map((src, j) => (
                            <a
                              key={j}
                              href={src}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-primary hover:underline truncate block"
                            >
                              {src}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {suggestions.length > 0 && isLast && !isLoading && (
                      <div className="border-t border-border pt-3">
                        <p className="text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1">
                          <Lightbulb className="h-3 w-3" /> Related Questions
                        </p>
                        <div className="flex flex-col gap-1">
                          {suggestions.map((s, j) => (
                            <button
                              key={j}
                              onClick={() => sendMessage(s)}
                              className="text-left text-xs text-primary hover:underline"
                            >
                              • {s}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isLoading && messages[messages.length - 1]?.role === 'user' && (
              <div className="flex justify-start">
                <div className="bg-card border border-border rounded-2xl rounded-bl-sm px-4 py-3">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    Thinking...
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-border p-4">
            <form onSubmit={handleSubmit} className="flex gap-3 max-w-3xl mx-auto">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about BIS standards, certification, hallmarking..."
                className="h-12 text-base"
                disabled={isLoading}
              />
              <Button type="submit" disabled={isLoading || !input.trim()} className="h-12 px-6 gap-2">
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Send
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
