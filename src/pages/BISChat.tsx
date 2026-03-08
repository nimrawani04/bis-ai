import { useState, useRef, useEffect } from 'react';
import { BISHeader } from '@/components/BISHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ReactMarkdown from 'react-markdown';
import { Send, Loader2, MessageSquare, ExternalLink, Lightbulb, Trash2, Shield, Copy, Share2, Check } from 'lucide-react';
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

function TypingIndicator() {
  return (
    <div className="flex justify-start animate-fade-in">
      <div className="bg-card border border-border rounded-2xl rounded-bl-sm px-5 py-4">
        <div className="flex items-center gap-3">
          <Shield className="h-4 w-4 text-primary animate-pulse" />
          <div className="flex gap-1.5">
            <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <span className="text-xs text-muted-foreground">Thinking...</span>
        </div>
      </div>
    </div>
  );
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
  }, [messages, isLoading]);

  const clearConversation = () => {
    setMessages([]);
    setInput('');
  };

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

      {/* Chat header bar with clear button */}
      {messages.length > 0 && (
        <div className="border-b border-border bg-card/50 backdrop-blur px-4 py-2 flex items-center justify-between max-w-7xl mx-auto w-full animate-fade-in">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MessageSquare className="h-4 w-4" />
            <span>{messages.filter(m => m.role === 'user').length} question{messages.filter(m => m.role === 'user').length !== 1 ? 's' : ''}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearConversation}
            className="gap-1.5 text-xs text-muted-foreground hover:text-destructive"
            disabled={isLoading}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Clear conversation
          </Button>
        </div>
      )}

      <div className="flex-1 flex max-w-7xl mx-auto w-full overflow-hidden">
        {/* Sidebar - desktop */}
        <aside className="hidden lg:flex w-72 border-r border-border p-6 flex-col gap-6 shrink-0">
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
        <div className="flex-1 flex flex-col min-w-0">
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 space-y-4 md:space-y-6">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center py-12 sm:py-20 px-4 animate-fade-in">
                <div className="bg-primary/10 rounded-full p-4 mb-4">
                  <Shield className="h-10 w-10 text-primary" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">Ask BIS AI</h2>
                <p className="text-muted-foreground max-w-md mb-8 text-sm sm:text-base">
                  Ask anything about BIS standards, certification, hallmarking, or policies. Get instant answers with source citations.
                </p>
                {/* Example questions grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
                  {exampleQuestions.map((q) => (
                    <button
                      key={q}
                      onClick={() => sendMessage(q)}
                      disabled={isLoading}
                      className="text-left text-sm text-muted-foreground hover:text-foreground bg-card hover:bg-secondary/50 border border-border hover:border-primary/30 px-4 py-3 rounded-xl transition-all hover:shadow-sm"
                    >
                      <span className="text-primary mr-2">→</span>
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => {
              if (msg.role === 'user') {
                return (
                  <div key={i} className="flex justify-end animate-fade-in">
                    <div className="bg-primary text-primary-foreground rounded-2xl rounded-br-sm px-4 py-3 max-w-[85%] sm:max-w-[75%] md:max-w-[60%]">
                      <p className="text-sm">{msg.content}</p>
                    </div>
                  </div>
                );
              }

              const { body, sources, suggestions } = parseSources(msg.content);
              const isLast = i === messages.length - 1;
              const isEmpty = !msg.content;

              if (isEmpty && isLoading) return null; // show typing indicator instead

              return (
                <div key={i} className="flex justify-start animate-fade-in group">
                  <div className="bg-card border border-border rounded-2xl rounded-bl-sm px-4 py-3 max-w-[95%] sm:max-w-[85%] md:max-w-[75%] space-y-3">
                    <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-li:text-muted-foreground">
                      <ReactMarkdown>{body}</ReactMarkdown>
                    </div>

                    {/* Copy & Share buttons */}
                    {body && (
                      <div className="flex items-center gap-1 pt-1">
                        <CopyButton text={body} />
                        <ShareButton text={body} />
                      </div>
                    )}

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
                        <div className="flex flex-col gap-1.5">
                          {suggestions.map((s, j) => (
                            <button
                              key={j}
                              onClick={() => sendMessage(s)}
                              className="text-left text-xs text-primary hover:text-primary/80 hover:bg-primary/5 px-2 py-1 rounded transition-colors"
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

            {isLoading && messages[messages.length - 1]?.role !== 'assistant' && <TypingIndicator />}
            {isLoading && messages[messages.length - 1]?.role === 'assistant' && !messages[messages.length - 1]?.content && <TypingIndicator />}
          </div>

          {/* Input area */}
          <div className="border-t border-border p-3 sm:p-4 bg-background/80 backdrop-blur">
            <form onSubmit={handleSubmit} className="flex gap-2 sm:gap-3 max-w-3xl mx-auto">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about BIS standards..."
                className="h-11 sm:h-12 text-sm sm:text-base"
                disabled={isLoading}
              />
              <Button type="submit" disabled={isLoading || !input.trim()} className="h-11 sm:h-12 px-4 sm:px-6 gap-2 shrink-0">
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                <span className="hidden sm:inline">Send</span>
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
