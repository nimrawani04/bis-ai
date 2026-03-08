import { useState, useRef, useEffect, useCallback } from 'react';
import { BISHeader } from '@/components/BISHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Send, Loader2, MessageSquare, ExternalLink, Lightbulb, Trash2, Shield,
  Copy, Share2, Check, ThumbsUp, ThumbsDown, History, Filter, ChevronDown, ChevronUp, Quote,
  Mic, MicOff, Volume2, VolumeX, ImagePlus, Globe, X, FileText
} from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { Badge } from '@/components/ui/badge';
import { useSearchParams } from 'react-router-dom';
import { RiskMeter } from '@/components/RiskMeter';
import { EverydaySafetyMode } from '@/components/EverydaySafetyMode';
import { supabase } from '@/integrations/supabase/client';

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/bis-chat`;

type Message = {
  role: 'user' | 'assistant';
  content: string;
  feedback?: 'up' | 'down';
  imageUrl?: string;
};

const exampleQuestions = [
  'What is BIS?',
  'How do I apply for BIS certification?',
  'What schemes does BIS offer?',
  'How can consumers file complaints?',
  'What is BIS hallmarking?',
  'What is the ISI mark?',
];

const topicFilters = [
  { id: 'all', label: 'All Topics' },
  { id: 'certification', label: 'Certification' },
  { id: 'standards', label: 'Standards' },
  { id: 'hallmarking', label: 'Hallmarking' },
  { id: 'consumer', label: 'Consumer Programs' },
  { id: 'laboratories', label: 'Laboratories' },
  { id: 'publications', label: 'Publications' },
];

const languages = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिन्दी (Hindi)' },
  { code: 'bn', label: 'বাংলা (Bengali)' },
  { code: 'ta', label: 'தமிழ் (Tamil)' },
  { code: 'te', label: 'తెలుగు (Telugu)' },
  { code: 'ur', label: 'اردو (Urdu)' },
  { code: 'ks', label: 'کٲشُر (Kashmiri)' },
  { code: 'mr', label: 'मराठी (Marathi)' },
  { code: 'gu', label: 'ગુજરાતી (Gujarati)' },
  { code: 'kn', label: 'ಕನ್ನಡ (Kannada)' },
  { code: 'ml', label: 'മലയാളം (Malayalam)' },
  { code: 'pa', label: 'ਪੰਜਾਬੀ (Punjabi)' },
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
    sources = srcBlock.split('\n').map(l => l.replace(/^-\s*/, '').trim()).filter(l => l.startsWith('http'));
    body = text.slice(0, srcIdx).trim();
  }

  if (sugIdx !== -1) {
    const sugBlock = text.slice(sugIdx + 17);
    suggestions = sugBlock.split('\n').map(l => l.replace(/^-\s*/, '').trim()).filter(Boolean);
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
          <span className="text-xs text-muted-foreground">Searching BIS knowledge base...</span>
        </div>
      </div>
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handleCopy} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors p-1 rounded">
      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

function ShareButton({ text }: { text: string }) {
  const handleShare = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: 'BIS AI Answer', text }); } catch {}
    } else {
      await navigator.clipboard.writeText(text);
      toast.success('Answer copied for sharing');
    }
  };
  return (
    <button onClick={handleShare} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors p-1 rounded">
      <Share2 className="h-3 w-3" /> Share
    </button>
  );
}

// Language code to BCP 47 mapping for TTS
const langToTTS: Record<string, string> = {
  en: 'en-IN', hi: 'hi-IN', bn: 'bn-IN', ta: 'ta-IN', te: 'te-IN',
  ur: 'ur-PK', mr: 'mr-IN', gu: 'gu-IN', kn: 'kn-IN', ml: 'ml-IN', pa: 'pa-IN', ks: 'ks-IN'
};

function speakText(text: string, lang = 'en', onEnd?: () => void) {
  window.speechSynthesis.cancel();
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.95;
  utterance.pitch = 1;
  utterance.volume = 1;

  // Pick voice matching selected language
  const ttsLang = langToTTS[lang] || 'en-IN';
  const voices = window.speechSynthesis.getVoices();
  const langPrefix = ttsLang.split('-')[0];
  const matchedVoice = voices.find(v => v.lang === ttsLang)
    || voices.find(v => v.lang.startsWith(langPrefix) && v.name.includes('Google'))
    || voices.find(v => v.lang.startsWith(langPrefix))
    || voices.find(v => v.lang.startsWith('en') && v.name.includes('Google'))
    || voices[0];
  if (matchedVoice) {
    utterance.voice = matchedVoice;
    utterance.lang = ttsLang;
  }

  utterance.onend = () => onEnd?.();
  utterance.onerror = (e) => {
    console.error('Speech error:', e);
    onEnd?.();
  };

  setTimeout(() => {
    window.speechSynthesis.speak(utterance);
    const keepAlive = setInterval(() => {
      if (!window.speechSynthesis.speaking) {
        clearInterval(keepAlive);
        return;
      }
      window.speechSynthesis.pause();
      window.speechSynthesis.resume();
    }, 10000);
    utterance.onend = () => {
      clearInterval(keepAlive);
      onEnd?.();
    };
    utterance.onerror = () => {
      clearInterval(keepAlive);
      onEnd?.();
    };
  }, 100);
}

function ReadAloudButton({ text, lang = 'en' }: { text: string; lang?: string }) {
  const [speaking, setSpeaking] = useState(false);

  const handleToggle = () => {
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
    } else {
      setSpeaking(true);
      speakText(text, lang, () => setSpeaking(false));
    }
  };

  useEffect(() => {
    return () => { window.speechSynthesis.cancel(); };
  }, []);

  return (
    <button onClick={handleToggle} className={`inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-md transition-colors ${speaking ? 'text-primary bg-primary/10 font-medium' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'}`} title={speaking ? 'Stop reading' : 'Read aloud'}>
      {speaking ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
      {speaking ? '⏹ Stop' : '🔊 Listen'}
    </button>
  );
}

function FeedbackButtons({ feedback, onFeedback }: { feedback?: 'up' | 'down'; onFeedback: (type: 'up' | 'down') => void }) {
  return (
    <div className="inline-flex items-center gap-1">
      <button onClick={() => onFeedback('up')} className={`inline-flex items-center gap-1 text-xs p-1 rounded transition-colors ${feedback === 'up' ? 'text-green-600 bg-green-500/10' : 'text-muted-foreground hover:text-green-600'}`} title="Helpful">
        <ThumbsUp className="h-3 w-3" />
      </button>
      <button onClick={() => onFeedback('down')} className={`inline-flex items-center gap-1 text-xs p-1 rounded transition-colors ${feedback === 'down' ? 'text-red-600 bg-red-500/10' : 'text-muted-foreground hover:text-red-600'}`} title="Not helpful">
        <ThumbsDown className="h-3 w-3" />
      </button>
    </div>
  );
}

function CitationPreview({ url }: { url: string }) {
  const [expanded, setExpanded] = useState(false);
  const getDescription = (u: string): { title: string; quote: string } => {
    if (u.includes('certification/product-certification')) return { title: '📋 BIS Product Certification', quote: 'The product certification scheme allows manufacturers to obtain ISI Mark by submitting application, undergoing factory inspection, and product testing at BIS-recognized laboratories.' };
    if (u.includes('certification/hallmarking')) return { title: '💎 BIS Hallmarking', quote: 'BIS Hallmarking certifies purity of gold and silver jewelry. Each piece receives a HUID (Hallmark Unique Identification) number. Mandatory for gold jewelry since June 2021.' };
    if (u.includes('certification/scheme-for-compulsory-registration') || u.includes('crs')) return { title: '🔌 Compulsory Registration Scheme', quote: 'The CRS applies to electronic and IT goods across 15 product categories. Manufacturers must get self-declaration with testing at BIS-recognized labs before selling in India.' };
    if (u.includes('certification/foreign-manufacturers')) return { title: '🌍 FMCS', quote: 'Foreign Manufacturers Certification Scheme enables overseas manufacturers to obtain BIS certification. Requires factory inspection by BIS officers and an authorized Indian representative.' };
    if (u.includes('consumer-affairs')) return { title: '🛡️ Consumer Affairs', quote: 'Consumers can file complaints about sub-standard ISI marked products through the BIS portal. BIS conducts market surveillance and consumer awareness campaigns.' };
    if (u.includes('standards')) return { title: '📐 BIS Standards', quote: 'BIS has published over 22,000 Indian Standards covering food, electronics, textiles, civil engineering, chemicals, and mechanical sectors. Developed through Technical Committees.' };
    if (u.includes('laboratory')) return { title: '🔬 BIS Laboratories', quote: 'BIS operates NABL-accredited testing laboratories in Mumbai, Kolkata, Chandigarh, Chennai, and Sahibabad for gold/silver, electronics, chemicals, food, and textiles.' };
    if (u.includes('about-bis')) return { title: '🏛️ About BIS', quote: 'The Bureau of Indian Standards is India\'s national standards body, established under BIS Act 2016. Headquarters in New Delhi with 5 Regional and 21 Branch Offices.' };
    if (u.includes('manakonline')) return { title: '💻 Manak Online Portal', quote: 'BIS Manak Online is the official portal for all certification applications, tracking status, paying fees, downloading certificates, and license renewal.' };
    return { title: '🔗 BIS Official', quote: 'Official BIS website page with relevant information about Bureau of Indian Standards services and certifications.' };
  };

  const { title, quote } = getDescription(url);

  return (
    <div className="group border border-border/50 rounded-lg overflow-hidden hover:border-primary/30 transition-colors">
      <button onClick={() => setExpanded(!expanded)} className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-secondary/30 transition-colors">
        <ExternalLink className="h-3 w-3 text-primary shrink-0" />
        <span className="text-xs font-medium text-foreground flex-1 truncate">{title}</span>
        {expanded ? <ChevronUp className="h-3 w-3 text-muted-foreground shrink-0" /> : <ChevronDown className="h-3 w-3 text-muted-foreground shrink-0" />}
      </button>
      {expanded && (
        <div className="px-3 pb-2 animate-fade-in">
          <div className="bg-secondary/40 border-l-2 border-primary/50 rounded px-3 py-2 text-xs text-muted-foreground italic mb-2">
            "{quote}"
          </div>
          <a href={url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-primary hover:underline flex items-center gap-1">
            <ExternalLink className="h-2.5 w-2.5" /> {url}
          </a>
        </div>
      )}
    </div>
  );
}

// Offline knowledge cache for common BIS questions
const offlineKnowledge: Record<string, string> = {
  'what is bis': 'The Bureau of Indian Standards (BIS) is the national standards body of India, established under the BIS Act 2016. It operates under the Ministry of Consumer Affairs, Food and Public Distribution. BIS develops Indian Standards, runs product certification (ISI Mark), hallmarking of precious metals, and the Compulsory Registration Scheme (CRS) for electronics.\n\n---SOURCES---\n- https://www.bis.gov.in/index.php/about-bis/\n\n---SUGGESTIONS---\n- What certification schemes does BIS offer?\n- How to apply for BIS certification?\n- What is ISI mark?',
  'what is isi mark': 'The ISI Mark is a certification mark issued by BIS for products that conform to Indian Standards. It applies to over 900 products. Manufacturers must apply via manakonline.bis.gov.in, undergo factory inspection and product testing. The ISI Mark assures consumers that the product meets quality and safety standards.\n\n---SOURCES---\n- https://www.bis.gov.in/index.php/certification/product-certification/\n\n---SUGGESTIONS---\n- How to check if ISI mark is genuine?\n- Which products require ISI mark?\n- How to apply for ISI mark?',
  'what is hallmarking': 'BIS Hallmarking is a purity certification for gold and silver jewelry. Gold jewelry is hallmarked in grades: 14K (585), 18K (750), 20K (833), 22K (916), and 24K (999). Each piece gets a HUID (Hallmark Unique Identification) number. Hallmarking has been mandatory for gold jewelry since June 2021.\n\n---SOURCES---\n- https://www.bis.gov.in/index.php/certification/hallmarking/\n\n---SUGGESTIONS---\n- How to verify hallmark on gold jewelry?\n- What is HUID number?\n- Where are hallmarking centers located?',
  'how to apply for bis certification': 'Steps to apply for BIS certification:\n1. Visit manakonline.bis.gov.in and create an account\n2. Submit online application with documents (test reports, factory details, quality control plan)\n3. BIS reviews and assigns an officer\n4. Factory/premises inspection\n5. Product samples tested at BIS labs\n6. If compliant, license is granted\n7. Annual surveillance and periodic renewal required\n\n---SOURCES---\n- https://www.bis.gov.in/index.php/certification/product-certification/\n- https://manakonline.bis.gov.in\n\n---SUGGESTIONS---\n- What documents are needed for BIS certification?\n- How long does BIS certification take?\n- What are the fees for BIS certification?',
  'how to file consumer complaint': 'To file a complaint about sub-standard ISI marked products:\n1. Visit the BIS Consumer Affairs portal\n2. Provide details about the product and the issue\n3. BIS will investigate through market surveillance\n4. You can also contact BIS regional/branch offices\n\nBIS also conducts consumer awareness campaigns and workshops.\n\n---SOURCES---\n- https://www.bis.gov.in/index.php/consumer-affairs/\n\n---SUGGESTIONS---\n- What happens after filing a complaint?\n- How does BIS conduct market surveillance?\n- What are BIS consumer awareness programs?',
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
  const [activeFilter, setActiveFilter] = useState('all');
  const [showHistory, setShowHistory] = useState(false);
  const [selectedLang, setSelectedLang] = useState('en');
  const [isRecording, setIsRecording] = useState(false);
  const [simpleMode, setSimpleMode] = useState(false);
  const [autoReadAloud, setAutoReadAloud] = useState(false);
  const lastQueryWasVoice = useRef(false);
  
  // Pre-load voices (Chrome loads them asynchronously)
  useEffect(() => {
    window.speechSynthesis.getVoices();
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.getVoices();
    };
  }, []);

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const initialQueryHandled = useRef(false);

  const [questionHistory, setQuestionHistory] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('bis-question-history') || '[]'); } catch { return []; }
  });

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isLoading]);

  useEffect(() => {
    localStorage.setItem('bis-question-history', JSON.stringify(questionHistory));
  }, [questionHistory]);




  const clearConversation = () => { setMessages([]); setInput(''); };

  const handleFeedback = (index: number, type: 'up' | 'down') => {
    setMessages(prev => prev.map((m, i) => i === index ? { ...m, feedback: type } : m));
    toast.success(type === 'up' ? 'Thanks for the feedback!' : 'We\'ll work to improve this answer.');
  };

  // Voice input using Web Speech API
  const toggleRecording = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error('Speech recognition is not supported in this browser.');
      return;
    }
    if (isRecording) {
      setIsRecording(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = selectedLang === 'en' ? 'en-IN' : selectedLang === 'hi' ? 'hi-IN' : selectedLang === 'bn' ? 'bn-IN' : selectedLang === 'ta' ? 'ta-IN' : selectedLang === 'te' ? 'te-IN' : selectedLang === 'mr' ? 'mr-IN' : selectedLang === 'gu' ? 'gu-IN' : selectedLang === 'kn' ? 'kn-IN' : selectedLang === 'ml' ? 'ml-IN' : selectedLang === 'pa' ? 'pa-IN' : 'en-IN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsRecording(false);
      lastQueryWasVoice.current = true;
      toast.success('Voice captured! Sending...');
      // Auto-send voice query
      setTimeout(() => sendMessage(transcript), 200);
    };
    recognition.onerror = () => {
      setIsRecording(false);
      toast.error('Could not recognize speech. Please try again.');
    };
    recognition.onend = () => setIsRecording(false);

    recognition.start();
    setIsRecording(true);
    toast.info('Listening... Speak your question.');
  }, [isRecording, selectedLang]);

  // Image upload handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      toast.error('Please upload an image or PDF file.');
      return;
    }

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      // PDF - show filename as preview
      setImagePreview(`pdf:${file.name}`);
    }

    // Upload to storage
    setIsUploadingImage(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `chat-uploads/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from('product-images').upload(path, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(path);
      setImagePreview(publicUrl);
      toast.success('File uploaded! Ask a question about it.');
    } catch (err) {
      console.error('Upload error:', err);
      toast.error('Failed to upload file.');
      setImagePreview(null);
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    setQuestionHistory(prev => {
      const updated = [trimmed, ...prev.filter(q => q !== trimmed)].slice(0, 20);
      return updated;
    });

    const userMsg: Message = { role: 'user', content: trimmed, imageUrl: imagePreview?.startsWith('http') ? imagePreview : undefined };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    const currentImage = imagePreview;
    setImagePreview(null);
    setIsLoading(true);

    const isVoiceQuery = lastQueryWasVoice.current;
    lastQueryWasVoice.current = false;

    try {
      // Check offline cache first
      if (!currentImage) {
        const offlineAnswer = getOfflineAnswer(trimmed);
        if (offlineAnswer && !navigator.onLine) {
          setMessages(prev => [...prev, { role: 'assistant', content: offlineAnswer }]);
          setIsLoading(false);
          if (isVoiceQuery || autoReadAloud) {
            const { body } = parseSources(offlineAnswer);
            speakText(body, selectedLang);
          }
          return;
        }
      }

      // If there's an image, use vision analysis
      if (currentImage && currentImage.startsWith('http')) {
        // First analyze the image
        const { data: analysisData, error: analysisError } = await supabase.functions.invoke('analyze-product-image', {
          body: { imageUrl: currentImage }
        });

        const imageContext = analysisData?.analysis
          ? `[Image Analysis Result: ${JSON.stringify(analysisData.analysis)}]\n\nUser question about the uploaded image: ${trimmed}`
          : trimmed;

        // Then send to chat with image context
        const messagesForApi = [
          ...messages.map(m => ({ role: m.role, content: m.content })),
          { role: 'user' as const, content: imageContext }
        ];

        const resp = await fetch(CHAT_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ messages: messagesForApi, topic_filter: activeFilter, language: selectedLang, simple_mode: simpleMode }),
        });

        await handleStreamResponse(resp, isVoiceQuery || autoReadAloud);
      } else {
        const resp = await fetch(CHAT_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            messages: updatedMessages.map(m => ({ role: m.role, content: m.content })),
            topic_filter: activeFilter,
            language: selectedLang,
            simple_mode: simpleMode,
          }),
        });

        await handleStreamResponse(resp, isVoiceQuery || autoReadAloud);
      }
    } catch (e) {
      console.error('Chat error:', e);
      toast.error('Failed to get response. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle query from Standards Explorer - run once on mount
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

  const handleStreamResponse = async (resp: Response, shouldReadAloud = false) => {
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

    // Auto read-aloud if voice query or autoReadAloud enabled
    if (shouldReadAloud && accumulated) {
      const { body } = parseSources(accumulated);
      speakText(body, selectedLang);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const userQuestions = messages.filter(m => m.role === 'user');

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <BISHeader />

      {/* Topic Filters */}
      <div className="border-b border-border bg-card/50 backdrop-blur px-2 sm:px-4 py-2">
        <div className="max-w-7xl mx-auto flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none">
          <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
          {topicFilters.map(f => (
            <Badge key={f.id} variant={activeFilter === f.id ? 'default' : 'outline'}
              className={`cursor-pointer shrink-0 text-[10px] sm:text-xs transition-all ${activeFilter === f.id ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'hover:bg-secondary'}`}
              onClick={() => setActiveFilter(f.id)}>
              {f.label}
            </Badge>
          ))}
        </div>
      </div>

      {/* Language Selector - prominent row */}
      <div className="border-b border-border bg-secondary/20 px-4 py-2">
        <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto scrollbar-none">
          <Globe className="h-4 w-4 text-primary shrink-0" />
          <span className="text-xs font-medium text-muted-foreground shrink-0">Language:</span>
          {languages.map(lang => (
            <button key={lang.code}
              onClick={() => setSelectedLang(lang.code)}
              className={`shrink-0 text-xs px-2.5 py-1 rounded-full border transition-all ${
                selectedLang === lang.code
                  ? 'bg-primary text-primary-foreground border-primary font-medium'
                  : 'border-border text-muted-foreground hover:text-foreground hover:bg-secondary hover:border-foreground/20'
              }`}>
              {lang.label}
            </button>
          ))}
        </div>
      </div>

      {/* Mode toggles */}
      <div className="border-b border-border bg-card/30 px-4 py-2">
        <div className="max-w-7xl mx-auto flex items-center gap-4 flex-wrap">
          <button
            onClick={() => setSimpleMode(!simpleMode)}
            className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border transition-all ${
              simpleMode
                ? 'bg-accent text-accent-foreground border-accent font-medium'
                : 'border-border text-muted-foreground hover:text-foreground hover:bg-secondary'
            }`}
          >
            <span className="text-sm">🧑‍🌾</span>
            {simpleMode ? 'Simple Mode ON' : 'Simple Mode'}
          </button>
          <button
            onClick={() => setAutoReadAloud(!autoReadAloud)}
            className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border transition-all ${
              autoReadAloud
                ? 'bg-primary text-primary-foreground border-primary font-medium'
                : 'border-border text-muted-foreground hover:text-foreground hover:bg-secondary'
            }`}
          >
            <Volume2 className="h-3.5 w-3.5" />
            {autoReadAloud ? 'Auto Read ON' : 'Auto Read Aloud'}
          </button>
          {simpleMode && (
            <span className="text-xs text-muted-foreground italic">
              Answers will use simple, easy-to-understand language
            </span>
          )}
        </div>
      </div>

      {/* Chat header bar */}
      {messages.length > 0 && (
        <div className="border-b border-border bg-card/50 backdrop-blur px-4 py-2 flex items-center justify-between max-w-7xl mx-auto w-full animate-fade-in">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MessageSquare className="h-4 w-4" />
            <span>{userQuestions.length} question{userQuestions.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setShowHistory(!showHistory)} className="gap-1.5 text-xs text-muted-foreground hover:text-foreground lg:hidden">
              <History className="h-3.5 w-3.5" /> History
            </Button>
            <Button variant="ghost" size="sm" onClick={clearConversation} className="gap-1.5 text-xs text-muted-foreground hover:text-destructive" disabled={isLoading}>
              <Trash2 className="h-3.5 w-3.5" /> Clear
            </Button>
          </div>
        </div>
      )}

      <div className="flex-1 flex max-w-7xl mx-auto w-full overflow-hidden">
        {/* Sidebar */}
        <aside className="hidden lg:flex w-72 border-r border-border p-6 flex-col gap-6 shrink-0 overflow-y-auto">
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-1 flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-primary" /> Try asking:
            </h3>
            <div className="flex flex-col gap-2 mt-3">
              {exampleQuestions.map(q => (
                <button key={q} onClick={() => sendMessage(q)} disabled={isLoading}
                  className="text-left text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 px-3 py-2 rounded-lg transition-colors border border-transparent hover:border-border">
                  {q}
                </button>
              ))}
            </div>
          </div>
          {questionHistory.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-1 flex items-center gap-2">
                <History className="h-4 w-4 text-primary" /> Recent Questions
              </h3>
              <div className="flex flex-col gap-1 mt-3">
                {questionHistory.slice(0, 10).map((q, i) => (
                  <button key={i} onClick={() => sendMessage(q)} disabled={isLoading}
                    className="text-left text-xs text-muted-foreground hover:text-foreground hover:bg-secondary/50 px-3 py-1.5 rounded-lg transition-colors truncate" title={q}>
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* Mobile history panel */}
        {showHistory && (
          <div className="lg:hidden absolute inset-x-0 top-auto z-40 bg-background border-b border-border p-4 animate-fade-in shadow-lg">
            <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
              <History className="h-4 w-4 text-primary" /> Recent Questions
            </h3>
            <div className="flex flex-col gap-1 max-h-48 overflow-y-auto">
              {questionHistory.length === 0 && <p className="text-xs text-muted-foreground">No questions yet.</p>}
              {questionHistory.slice(0, 10).map((q, i) => (
                <button key={i} onClick={() => { sendMessage(q); setShowHistory(false); }}
                  className="text-left text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 px-3 py-2 rounded-lg transition-colors">
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chat area */}
        <div className="flex-1 flex flex-col min-w-0">
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 space-y-4 md:space-y-6">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center py-12 sm:py-20 px-4 animate-fade-in">
                <div className="bg-primary/10 rounded-full p-4 mb-4">
                  <Shield className="h-10 w-10 text-primary" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">Ask BIS AI</h2>
                <p className="text-muted-foreground max-w-md mb-3 text-sm sm:text-base">
                  Ask anything about BIS standards, certification, hallmarking, or policies. Get instant answers with source citations.
                </p>
                <div className="flex flex-wrap gap-2 justify-center mb-6 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Mic className="h-3 w-3" /> Voice input</span>
                  <span>•</span>
                  <span className="flex items-center gap-1"><ImagePlus className="h-3 w-3" /> Image upload</span>
                  <span>•</span>
                  <span className="flex items-center gap-1"><Globe className="h-3 w-3" /> 12 languages</span>
                  <span>•</span>
                  <span className="flex items-center gap-1"><Volume2 className="h-3 w-3" /> Read aloud</span>
                </div>

                {/* Quick Help Buttons */}
                <div className="flex flex-wrap gap-2 justify-center mb-6">
                  <button onClick={() => sendMessage('How to check if ISI mark is genuine?')} disabled={isLoading}
                    className="flex items-center gap-1.5 text-xs bg-primary/10 text-primary hover:bg-primary/20 px-3 py-2 rounded-full transition-colors font-medium">
                    ✅ Check ISI Mark
                  </button>
                  <button onClick={() => sendMessage('How to apply for BIS certification?')} disabled={isLoading}
                    className="flex items-center gap-1.5 text-xs bg-primary/10 text-primary hover:bg-primary/20 px-3 py-2 rounded-full transition-colors font-medium">
                    📋 Apply for Certification
                  </button>
                  <button onClick={() => sendMessage('How to file a consumer complaint about fake products?')} disabled={isLoading}
                    className="flex items-center gap-1.5 text-xs bg-primary/10 text-primary hover:bg-primary/20 px-3 py-2 rounded-full transition-colors font-medium">
                    🛡️ File Consumer Complaint
                  </button>
                  <button onClick={() => sendMessage('What are BIS standards and why are they important?')} disabled={isLoading}
                    className="flex items-center gap-1.5 text-xs bg-primary/10 text-primary hover:bg-primary/20 px-3 py-2 rounded-full transition-colors font-medium">
                    📖 Understand Standards
                  </button>
                  <button onClick={() => sendMessage('Compare BIS hallmarking and product certification schemes')} disabled={isLoading}
                    className="flex items-center gap-1.5 text-xs bg-primary/10 text-primary hover:bg-primary/20 px-3 py-2 rounded-full transition-colors font-medium">
                    ⚖️ Compare Standards
                  </button>
                </div>

                {/* Risk Meter & Everyday Safety Mode */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg mb-6">
                  <RiskMeter />
                  <EverydaySafetyMode onProductClick={sendMessage} disabled={isLoading} />
                </div>

                {/* Check My Product - prominent CTA */}
                <div className="w-full max-w-lg bg-card border-2 border-primary/20 rounded-2xl p-4 mb-6">
                  <h3 className="text-sm font-bold text-foreground mb-1 flex items-center gap-2">
                    📦 Check My Product
                  </h3>
                  <p className="text-xs text-muted-foreground mb-3">
                    Type a product name or upload a photo to check if it needs BIS certification
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => sendMessage('Is BIS certification required for electric heaters? What should I check before buying?')} disabled={isLoading}
                      className="text-xs bg-secondary hover:bg-secondary/80 text-foreground px-3 py-1.5 rounded-lg transition-colors">
                      🔌 Electric Heater
                    </button>
                    <button onClick={() => sendMessage('Is BIS certification required for phone chargers? What should I check before buying?')} disabled={isLoading}
                      className="text-xs bg-secondary hover:bg-secondary/80 text-foreground px-3 py-1.5 rounded-lg transition-colors">
                      🔋 Phone Charger
                    </button>
                    <button onClick={() => sendMessage('Is BIS certification required for helmets? What should I check before buying?')} disabled={isLoading}
                      className="text-xs bg-secondary hover:bg-secondary/80 text-foreground px-3 py-1.5 rounded-lg transition-colors">
                      ⛑️ Helmet
                    </button>
                    <button onClick={() => sendMessage('Is BIS certification required for water purifiers? What should I check before buying?')} disabled={isLoading}
                      className="text-xs bg-secondary hover:bg-secondary/80 text-foreground px-3 py-1.5 rounded-lg transition-colors">
                      💧 Water Purifier
                    </button>
                    <button onClick={() => fileInputRef.current?.click()} disabled={isLoading}
                      className="text-xs bg-primary/10 text-primary hover:bg-primary/20 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
                      <ImagePlus className="h-3 w-3" /> Upload Product Photo
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
                  {exampleQuestions.map(q => (
                    <button key={q} onClick={() => sendMessage(q)} disabled={isLoading}
                      className="text-left text-sm text-muted-foreground hover:text-foreground bg-card hover:bg-secondary/50 border border-border hover:border-primary/30 px-4 py-3 rounded-xl transition-all hover:shadow-sm">
                      <span className="text-primary mr-2">→</span>{q}
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
                      {msg.imageUrl && (
                        <img src={msg.imageUrl} alt="Uploaded" className="max-w-full max-h-40 rounded-lg mb-2" />
                      )}
                      <p className="text-sm">{msg.content}</p>
                    </div>
                  </div>
                );
              }

              const { body, sources, suggestions } = parseSources(msg.content);
              const isLast = i === messages.length - 1;
              const isEmpty = !msg.content;
              if (isEmpty && isLoading) return null;

              return (
                <div key={i} className="flex justify-start animate-fade-in group">
                  <div className="bg-card border border-border rounded-2xl rounded-bl-sm px-4 py-3 max-w-[95%] sm:max-w-[85%] md:max-w-[75%] space-y-3">
                    <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-li:text-muted-foreground prose-table:text-muted-foreground prose-th:text-foreground prose-th:bg-secondary/50 prose-td:border-border prose-th:border-border prose-th:px-3 prose-th:py-1.5 prose-td:px-3 prose-td:py-1.5">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{body}</ReactMarkdown>
                    </div>

                    {body && (
                      <div className="flex items-center gap-2 pt-1 border-t border-border/50 flex-wrap">
                        <CopyButton text={body} />
                        <ShareButton text={body} />
                        <ReadAloudButton text={body} lang={selectedLang} />
                        <div className="w-px h-4 bg-border" />
                        <FeedbackButtons feedback={msg.feedback} onFeedback={(type) => handleFeedback(i, type)} />
                      </div>
                    )}

                    {sources.length > 0 && (
                      <div className="border-t border-border pt-3">
                        <p className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1">
                          <ExternalLink className="h-3 w-3" /> Sources
                        </p>
                        <div className="flex flex-col gap-2">
                          {sources.map((src, j) => <CitationPreview key={j} url={src} />)}
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
                            <button key={j} onClick={() => sendMessage(s)}
                              className="text-left text-xs text-primary hover:text-primary/80 hover:bg-primary/5 px-2 py-1 rounded transition-colors">
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

          {/* Image preview bar */}
          {imagePreview && (
            <div className="border-t border-border px-4 py-2 bg-secondary/30 flex items-center gap-3 animate-fade-in">
              {imagePreview.startsWith('pdf:') ? (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <FileText className="h-5 w-5 text-primary" />
                  <span>{imagePreview.replace('pdf:', '')}</span>
                </div>
              ) : (
                <img src={imagePreview} alt="Upload preview" className="h-12 w-12 rounded-lg object-cover border border-border" />
              )}
              <span className="text-xs text-muted-foreground flex-1">
                {isUploadingImage ? 'Uploading...' : 'File attached. Ask a question about it.'}
              </span>
              <button onClick={() => setImagePreview(null)} className="text-muted-foreground hover:text-foreground p-1">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Input area */}
          <div className="border-t border-border p-3 sm:p-4 bg-background/80 backdrop-blur">
            <form onSubmit={handleSubmit} className="flex gap-2 max-w-3xl mx-auto items-center">
              {/* Image upload */}
              <input ref={fileInputRef} type="file" accept="image/*,.pdf" className="hidden" onChange={handleImageUpload} />
              <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isLoading || isUploadingImage}
                className="p-2.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors shrink-0" title="Upload image or PDF">
                <ImagePlus className="h-5 w-5" />
              </button>

              {/* Mic button */}
              <button type="button" onClick={toggleRecording} disabled={isLoading}
                className={`p-2.5 rounded-lg transition-colors shrink-0 ${isRecording ? 'bg-red-500/10 text-red-500 animate-pulse' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'}`}
                title={isRecording ? 'Stop recording' : 'Voice input'}>
                {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </button>

              <Input value={input} onChange={(e) => setInput(e.target.value)}
                placeholder={selectedLang === 'hi' ? 'BIS के बारे में पूछें...' : 'Ask about BIS standards, certification...'}
                className="h-11 sm:h-12 text-sm sm:text-base flex-1" disabled={isLoading} />

              <Button type="submit" disabled={isLoading || (!input.trim() && !imagePreview)} className="h-11 sm:h-12 px-4 sm:px-6 gap-2 shrink-0">
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
