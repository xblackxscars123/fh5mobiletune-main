import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { MessageSquare, Send, X, Loader2, Bot, User, Minimize2, Maximize2, Sparkles, AlertCircle, TrendingUp, Save, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { CarSpecs, TuneType, TuneSettings } from '@/lib/tuningCalculator';
import { supabase } from '@/integrations/supabase/client';
import {
  parseSuggestionsWithImpact,
  calculateTuneImpact,
  getTuneTypeRecommendations,
  TuningSuggestion,
  TuneProfile,
  PerformanceImpact,
} from '@/lib/tuning-utils';

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
const CHAT_HISTORY_KEY = 'tuning-chat-history';
const MAX_MESSAGES = 100;

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



export function TuningExpertChat({ tuneContext, onApplySuggestion }: TuningExpertChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [tuneProfiles, setTuneProfiles] = useState<TuneProfile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);
  const [showProfiles, setShowProfiles] = useState(false);
  const [lastSuggestions, setLastSuggestions] = useState<TuningSuggestion[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const assistantContentRef = useRef('');

  // Load messages from localStorage on mount
  useEffect(() => {
    const loadChatHistory = async () => {
      try {
        const saved = localStorage.getItem(CHAT_HISTORY_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            setMessages(parsed.slice(-MAX_MESSAGES));
          }
        }
      } catch (e) {
        console.error('Failed to load chat history:', e);
      }
    };

    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };

    loadChatHistory();
    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      try {
        localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages));
      } catch (e) {
        console.error('Failed to save chat history:', e);
      }
    }
  }, [messages]);

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
    if (!tuneContext?.carName) {
      return ['Why is my car understeering?', 'Help me reduce oversteer', 'Review tune basics'];
    }

    const base = ['Why is my car understeering?', 'Help me reduce oversteer'];
    
    if (tuneContext?.tuneType === 'drift') {
      return [`Optimize ${tuneContext.carName} for drifting`, 'How do I hold longer drifts?', 'Improve drift initiation'];
    } else if (tuneContext?.tuneType === 'drag') {
      return [`Optimize ${tuneContext.carName} for drag`, 'Better launch setup', 'Reduce wheelspin'];
    } else if (tuneContext?.tuneType === 'rally' || tuneContext?.tuneType === 'offroad') {
      return [`Optimize ${tuneContext.carName} for rally`, 'Handle jumps better', 'Improve loose surface grip'];
    }
    
    return [...base, `Review my ${tuneContext.carName} tune`];
  }, [tuneContext?.carName, tuneContext?.tuneType]);

  const updateAssistant = useCallback((chunk: string) => {
    assistantContentRef.current += chunk;
    setMessages(prev => {
      const last = prev[prev.length - 1];
      if (last?.role === 'assistant') {
        return prev.map((m, i) => 
          i === prev.length - 1 ? { ...m, content: assistantContentRef.current } : m
        );
      }
      return [...prev, { role: 'assistant', content: assistantContentRef.current }];
    });
  }, []);

  // Load tune profiles from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('tune-profiles');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setTuneProfiles(parsed);
        }
      }
    } catch (e) {
      console.error('Failed to load tune profiles:', e);
    }
  }, []);

  const saveTuneProfile = useCallback((name: string, notes?: string) => {
    if (!tuneContext?.currentTune || !tuneContext?.specs) {
      toast.error('No tune to save');
      return;
    }

    const profile: TuneProfile = {
      id: crypto.randomUUID?.() || Date.now().toString(),
      name,
      carName: tuneContext.carName || 'Unknown',
      tuneType: tuneContext.tuneType || 'grip',
      settings: tuneContext.currentTune,
      performance: calculateTuneImpact(tuneContext.currentTune, getTuneTypeRecommendations(tuneContext.tuneType || 'grip') as TuneSettings, tuneContext.specs),
      createdAt: new Date(),
      notes: notes || '',
    };

    const updated = [profile, ...tuneProfiles].slice(0, 10);
    setTuneProfiles(updated);
    localStorage.setItem('tune-profiles', JSON.stringify(updated));
    toast.success(`Saved tune: ${name}`);
  }, [tuneContext]);

  const deleteProfile = useCallback((id: string) => {
    const updated = tuneProfiles.filter(p => p.id !== id);
    setTuneProfiles(updated);
    localStorage.setItem('tune-profiles', JSON.stringify(updated));
    toast.success('Profile deleted');
  }, [tuneProfiles]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    // Check authentication
    if (!isAuthenticated) {
      setError('Please sign in to use the AI tuning expert');
      toast.error('Please sign in to continue');
      return;
    }

    setError(null);
    const userMessage: Message = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    assistantContentRef.current = '';

    await streamChat({
      messages: [...messages, userMessage],
      tuneContext,
      onDelta: updateAssistant,
      onDone: () => {
        setIsLoading(false);
        // Parse suggestions from the assistant response
        if (tuneContext?.currentTune && tuneContext?.specs) {
          const suggestions = parseSuggestionsWithImpact(
            assistantContentRef.current,
            tuneContext.specs,
            tuneContext.currentTune
          );
          setLastSuggestions(suggestions);
        }
      },
      onError: (errorMsg) => {
        setIsLoading(false);
        setError(errorMsg);
        toast.error(errorMsg);
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

  const clearHistory = () => {
    setMessages([]);
    localStorage.removeItem(CHAT_HISTORY_KEY);
    toast.success('Chat history cleared');
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
            {/* Auth/Context Badge */}
            {isAuthenticated === false && (
              <div className="px-3 py-2 bg-red-500/10 border-b border-red-500/30 flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                <span className="text-[10px] text-red-300">
                  Sign in to use the AI tuning expert
                </span>
              </div>
            )}
            
            {tuneContext?.carName && (
              <div className="px-3 py-1.5 bg-[hsl(220,15%,10%)] border-b border-[hsl(220,15%,18%)] flex items-center gap-2">
                <Sparkles className="w-3 h-3 text-[hsl(var(--racing-yellow))]" />
                <span className="text-[10px] text-[hsl(var(--racing-yellow))]">
                  AI knows your {tuneContext.tuneType} tune for {tuneContext.carName}
                </span>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="px-3 py-2 bg-red-500/10 border-b border-red-500/30 flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                <span className="text-[10px] text-red-300">{error}</span>
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
                        onClick={() => {
                          setInput(q);
                          setTimeout(() => inputRef.current?.focus(), 0);
                        }}
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
                    
                    {/* Clickable suggestions for last assistant message with performance impact */}
                    {msg.role === 'assistant' && onApplySuggestion && i === messages.length - 1 && lastSuggestions.length > 0 && (
                      <div className="mt-2 space-y-2">
                        {lastSuggestions.slice(0, 3).map((suggestion, idx) => (
                          <div key={idx} className="text-[10px] space-y-1 p-2 bg-[hsl(220,15%,12%)] rounded border border-[hsl(220,15%,20%)]">
                            <div className="flex items-center justify-between">
                              <button
                                onClick={() => handleApplySuggestion(suggestion.setting, suggestion.value)}
                                className="flex-1 text-left px-2 py-1 rounded bg-[hsl(var(--racing-cyan)/0.2)] text-[hsl(var(--racing-cyan))] hover:bg-[hsl(var(--racing-cyan)/0.3)] transition-colors border border-[hsl(var(--racing-cyan)/0.3)]"
                              >
                                Apply: {suggestion.setting} → {suggestion.value}
                              </button>
                              <span className="text-[8px] text-muted-foreground ml-1 px-1 py-0.5 bg-white/5 rounded">
                                {suggestion.confidence}%
                              </span>
                            </div>
                            
                            <p className="text-[9px] text-muted-foreground">{suggestion.reason}</p>

                            {/* Performance Impact */}
                            <div className="grid grid-cols-2 gap-1 mt-1">
                              <div className="flex items-center justify-between text-[8px]">
                                <span className="text-muted-foreground">Grip:</span>
                                <span className={suggestion.impact.grip > 0 ? 'text-green-400' : suggestion.impact.grip < 0 ? 'text-red-400' : 'text-gray-400'}>
                                  {suggestion.impact.grip > 0 ? '+' : ''}{suggestion.impact.grip}
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-[8px]">
                                <span className="text-muted-foreground">Stability:</span>
                                <span className={suggestion.impact.stability > 0 ? 'text-green-400' : suggestion.impact.stability < 0 ? 'text-red-400' : 'text-gray-400'}>
                                  {suggestion.impact.stability > 0 ? '+' : ''}{suggestion.impact.stability}
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-[8px]">
                                <span className="text-muted-foreground">Responsive:</span>
                                <span className={suggestion.impact.responsiveness > 0 ? 'text-green-400' : suggestion.impact.responsiveness < 0 ? 'text-red-400' : 'text-gray-400'}>
                                  {suggestion.impact.responsiveness > 0 ? '+' : ''}{suggestion.impact.responsiveness}
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-[8px]">
                                <span className="text-muted-foreground">Est. PI:</span>
                                <span className="text-[hsl(var(--racing-yellow))]">{suggestion.impact.estimatedPI}</span>
                              </div>
                            </div>

                            {/* Warnings */}
                            {suggestion.impact.warnings.length > 0 && (
                              <div className="mt-1 p-1 bg-orange-500/10 rounded border border-orange-500/30 space-y-0.5">
                                {suggestion.impact.warnings.map((w, widx) => (
                                  <p key={widx} className="text-[8px] text-orange-300">⚠️ {w}</p>
                                ))}
                              </div>
                            )}

                            {/* Improvements */}
                            {suggestion.impact.improvements.length > 0 && (
                              <div className="mt-1 p-1 bg-green-500/10 rounded border border-green-500/30 space-y-0.5">
                                {suggestion.impact.improvements.map((imp, iidx) => (
                                  <p key={iidx} className="text-[8px] text-green-300">✓ {imp}</p>
                                ))}
                              </div>
                            )}
                          </div>
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
            <div className="border-t border-[hsl(220,15%,20%)] p-3 space-y-2">
              {messages.length > 0 && (
                <div className="flex items-center justify-between text-[10px]">
                  <button
                    onClick={clearHistory}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Clear history
                  </button>
                  <button
                    onClick={() => setShowProfiles(!showProfiles)}
                    className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                  >
                    <TrendingUp className="w-3 h-3" />
                    Profiles {tuneProfiles.length > 0 && `(${tuneProfiles.length})`}
                  </button>
                </div>
              )}

              {/* Profiles List */}
              {showProfiles && tuneProfiles.length > 0 && (
                <div className="max-h-[120px] overflow-y-auto space-y-1 p-2 bg-[hsl(220,15%,10%)] rounded border border-[hsl(220,15%,18%)]">
                  {tuneProfiles.map((profile) => (
                    <div key={profile.id} className="flex items-center justify-between text-[9px] p-1 bg-[hsl(220,15%,15%)] rounded">
                      <div className="flex-1">
                        <p className="font-semibold text-foreground">{profile.name}</p>
                        <p className="text-muted-foreground text-[8px]">{profile.carName} • {profile.tuneType}</p>
                      </div>
                      <button
                        onClick={() => deleteProfile(profile.id)}
                        className="ml-1 p-1 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors"
                        title="Delete profile"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={isAuthenticated === false ? "Sign in to chat..." : tuneContext?.carName ? `Ask about your ${tuneContext.tuneType} tune...` : "Ask about tuning..."}
                  className="flex-1 bg-[hsl(220,15%,12%)] border border-[hsl(220,15%,20%)] rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 disabled:opacity-50"
                  disabled={isLoading || isAuthenticated === false}
                />
                <Button
                  onClick={() => {
                    const name = prompt('Profile name:', tuneContext?.carName);
                    if (name) saveTuneProfile(name);
                  }}
                  disabled={!tuneContext?.currentTune || isAuthenticated === false}
                  variant="ghost"
                  size="sm"
                  title="Save current tune as profile"
                  className="hover:bg-primary/20"
                >
                  <Save className="w-4 h-4" />
                </Button>
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading || isAuthenticated === false}
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
