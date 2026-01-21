import { useState, useRef, useEffect, useMemo } from 'react';
import { MessageSquare, Send, X, Loader2, Bot, User, Minimize2, Maximize2, Sparkles, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { CarSpecs, TuneType, TuneSettings } from '@/lib/tuningCalculator';
import { supabase } from '@/integrations/supabase/client';

type Message = { role: 'user' | 'assistant'; content: string };

export interface TuneContext {
  carName?: string;
  tuneType?: TuneType;
  specs?: CarSpecs;
  currentTune?: TuneSettings;
}

interface TuningExpertChatProps {
  tuneContext?: TuneContext;
  onApplySuggestion?: (setting: string, value: number) => void;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/tuning-expert`;

async function streamChat({
  messages,
  tuneContext,
  onDelta,
  onDone,
  onError,
}: {
  messages: Message[];
  tuneContext?: TuneContext;
  onDelta: (deltaText: string) => void;
  onDone: () => void;
  onError: (error: string) => void;
}) {
  try {
    // Get the current user session for authentication
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      throw new Error("Please sign in to use the AI tuning expert");
    }

    const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ messages, tuneContext }),
    });

    if (!resp.ok) {
      const errorData = await resp.json().catch(() => ({}));
      throw new Error(errorData.error || `Request failed with status ${resp.status}`);
    }

    if (!resp.body) throw new Error("No response body");

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = "";
    let streamDone = false;

    while (!streamDone) {
      const { done, value } = await reader.read();
      if (done) break;
      textBuffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
        let line = textBuffer.slice(0, newlineIndex);
        textBuffer = textBuffer.slice(newlineIndex + 1);

        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (line.startsWith(":") || line.trim() === "") continue;
        if (!line.startsWith("data: ")) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === "[DONE]") {
          streamDone = true;
          break;
        }

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) onDelta(content);
        } catch {
          textBuffer = line + "\n" + textBuffer;
          break;
        }
      }
    }

    onDone();
  } catch (error) {
    onError(error instanceof Error ? error.message : "Failed to connect");
  }
}

// Parse AI response for clickable suggestions
function parseSuggestions(content: string): Array<{ setting: string; value: number; text: string }> {
  const suggestions: Array<{ setting: string; value: number; text: string }> = [];
  
  // Match patterns like "ARB Front to 28" or "Tire Pressure Rear to 30"
  const patterns = [
    /(?:set|try setting|adjust|change)\s+(?:the\s+)?([A-Za-z\s]+?)\s+to\s+(\d+(?:\.\d+)?)/gi,
    /([A-Za-z\s]+?)\s+(?:to|at)\s+(\d+(?:\.\d+)?)\s*(?:PSI|%|°|degrees)?/gi,
  ];
  
  const settingMap: Record<string, string> = {
    'arb front': 'arbFront',
    'arb rear': 'arbRear',
    'anti-roll bar front': 'arbFront',
    'anti-roll bar rear': 'arbRear',
    'tire pressure front': 'tirePressureFront',
    'tire pressure rear': 'tirePressureRear',
    'front tire pressure': 'tirePressureFront',
    'rear tire pressure': 'tirePressureRear',
    'springs front': 'springsFront',
    'springs rear': 'springsRear',
    'front springs': 'springsFront',
    'rear springs': 'springsRear',
    'camber front': 'camberFront',
    'camber rear': 'camberRear',
    'front camber': 'camberFront',
    'rear camber': 'camberRear',
    'toe front': 'toeFront',
    'toe rear': 'toeRear',
    'caster': 'caster',
    'rebound front': 'reboundFront',
    'rebound rear': 'reboundRear',
    'bump front': 'bumpFront',
    'bump rear': 'bumpRear',
    'brake pressure': 'brakePressure',
    'brake balance': 'brakeBalance',
    'diff accel': 'diffAccelRear',
    'diff decel': 'diffDecelRear',
    'final drive': 'finalDrive',
    'ride height front': 'rideHeightFront',
    'ride height rear': 'rideHeightRear',
  };
  
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const settingText = match[1].toLowerCase().trim();
      const value = parseFloat(match[2]);
      
      const settingKey = settingMap[settingText];
      if (settingKey && !isNaN(value)) {
        // Avoid duplicates
        if (!suggestions.find(s => s.setting === settingKey && s.value === value)) {
          suggestions.push({
            setting: settingKey,
            value,
            text: `${match[1].trim()}: ${value}`,
          });
        }
      }
    }
  }
  
  return suggestions;
}

export function TuningExpertChat({ tuneContext, onApplySuggestion }: TuningExpertChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

  // Quick queries based on tune type
  const quickQueries = useMemo(() => {
    const base = ['Why is my car understeering?', 'Help me reduce oversteer'];
    
    if (tuneContext?.tuneType === 'drift') {
      return ['How do I hold longer drifts?', 'Improve drift initiation', 'More angle tips'];
    } else if (tuneContext?.tuneType === 'drag') {
      return ['Better launch setup', 'Reduce wheelspin', 'Top speed vs acceleration'];
    } else if (tuneContext?.tuneType === 'rally' || tuneContext?.tuneType === 'offroad') {
      return ['Handle jumps better', 'Improve loose surface grip', 'Reduce bouncing'];
    }
    
    return [...base, 'Review my current tune'];
  }, [tuneContext?.tuneType]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    let assistantContent = '';
    
    const updateAssistant = (chunk: string) => {
      assistantContent += chunk;
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === 'assistant') {
          return prev.map((m, i) => 
            i === prev.length - 1 ? { ...m, content: assistantContent } : m
          );
        }
        return [...prev, { role: 'assistant', content: assistantContent }];
      });
    };

    await streamChat({
      messages: [...messages, userMessage],
      tuneContext,
      onDelta: updateAssistant,
      onDone: () => setIsLoading(false),
      onError: (error) => {
        setIsLoading(false);
        toast.error(error);
      },
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleApplySuggestion = (setting: string, value: number) => {
    if (onApplySuggestion) {
      onApplySuggestion(setting, value);
      toast.success(`Applied: ${setting} → ${value}`);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-gradient-to-br from-primary to-[hsl(var(--racing-cyan))] text-black shadow-lg shadow-primary/40 hover:shadow-primary/60 hover:scale-110 transition-all duration-300 group"
        aria-label="Open Tuning Expert Chat"
      >
        <MessageSquare className="w-6 h-6" />
        <span className="absolute -top-2 -right-2 w-5 h-5 bg-[hsl(var(--racing-yellow))] rounded-full flex items-center justify-center text-[10px] font-bold animate-pulse">
          AI
        </span>
      </button>
    );
  }

  return (
    <div 
      className={`fixed z-50 transition-all duration-300 ${
        isMinimized 
          ? 'bottom-6 right-6 w-auto h-auto' 
          : 'bottom-6 right-6 w-[90vw] max-w-[400px] h-[500px] max-h-[70vh]'
      }`}
    >
      <div className="bg-card/20 backdrop-blur-md border border-border/30 rounded-xl shadow-2xl shadow-black/50 overflow-hidden h-full flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/20 to-[hsl(var(--racing-cyan)/0.2)] border-b border-[hsl(220,15%,20%)] p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/20 border border-primary/40">
              <Bot className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="font-display text-sm font-semibold text-foreground uppercase tracking-wider">Tuning Expert</h3>
              {!isMinimized && tuneContext?.carName && (
                <p className="text-[10px] text-muted-foreground truncate max-w-[180px]">
                  Tuning: {tuneContext.carName}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 hover:bg-white/10"
              onClick={() => setIsMinimized(!isMinimized)}
            >
              {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 hover:bg-white/10"
              onClick={() => setIsOpen(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Context Badge */}
            {tuneContext?.carName && (
              <div className="px-3 py-1.5 bg-[hsl(220,15%,10%)] border-b border-[hsl(220,15%,18%)] flex items-center gap-2">
                <Sparkles className="w-3 h-3 text-[hsl(var(--racing-yellow))]" />
                <span className="text-[10px] text-[hsl(var(--racing-yellow))]">
                  AI knows your {tuneContext.tuneType} tune for {tuneContext.carName}
                </span>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {messages.length === 0 && (
                <div className="text-center py-6 px-4">
                  <Bot className="w-10 h-10 mx-auto text-primary/60 mb-3" />
                  <p className="text-sm text-muted-foreground mb-3">
                    {tuneContext?.carName 
                      ? `Ask me about tuning your ${tuneContext.carName}!` 
                      : 'Ask me anything about FH5 tuning!'}
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {quickQueries.map((q) => (
                      <button
                        key={q}
                        onClick={() => setInput(q)}
                        className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors border border-primary/30"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                      <Bot className="w-3.5 h-3.5 text-primary" />
                    </div>
                  )}
                  <div className="max-w-[85%]">
                    <div
                      className={`rounded-lg px-3 py-2 text-sm ${
                        msg.role === 'user'
                          ? 'bg-primary text-black'
                          : 'bg-[hsl(220,15%,15%)] text-foreground'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                    
                    {/* Clickable suggestions for assistant messages */}
                    {msg.role === 'assistant' && onApplySuggestion && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {parseSuggestions(msg.content).slice(0, 3).map((suggestion, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleApplySuggestion(suggestion.setting, suggestion.value)}
                            className="text-[10px] px-2 py-0.5 rounded bg-[hsl(var(--racing-cyan)/0.2)] text-[hsl(var(--racing-cyan))] hover:bg-[hsl(var(--racing-cyan)/0.3)] transition-colors border border-[hsl(var(--racing-cyan)/0.3)]"
                          >
                            Apply: {suggestion.text}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-6 h-6 rounded-full bg-[hsl(var(--racing-cyan)/0.2)] flex items-center justify-center flex-shrink-0 mt-1">
                      <User className="w-3.5 h-3.5 text-[hsl(var(--racing-cyan))]" />
                    </div>
                  )}
                </div>
              ))}

              {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
                <div className="flex gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                    <Bot className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <div className="bg-[hsl(220,15%,15%)] rounded-lg px-3 py-2">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-[hsl(220,15%,20%)] p-3">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={tuneContext?.carName ? `Ask about your ${tuneContext.tuneType} tune...` : "Ask about tuning..."}
                  className="flex-1 bg-[hsl(220,15%,12%)] border border-[hsl(220,15%,20%)] rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
                  disabled={isLoading}
                />
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="bg-primary hover:bg-primary/80 text-black px-3"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
