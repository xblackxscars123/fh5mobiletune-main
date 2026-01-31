import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { MessageSquare, Send, X, Loader2, Bot, User, Minimize2, Maximize2, Sparkles, AlertCircle, TrendingUp, Save, Trash2, Gauge, Zap, Wind } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { CarSpecs, TuneType, TuneSettings, UnitSystem } from '@/lib/tuningCalculator';
import { sendGeminiMessage } from '@/lib/gemini';
import { sanitizeChatMessage, safeJsonParse } from '@/lib/security';
import {
  parseSuggestionsWithImpact,
  calculateTuneImpact,
  getTuneTypeRecommendations,
  getTuningTips,
  getQuickAdjustments,
  TuningSuggestion,
  TuneProfile,
  PerformanceImpact,
} from '@/lib/tuning-utils';
import {
  calculateFullPerformance,
  comparePerformance,
  PerformancePrediction,
  HandlingCharacteristics,
  analyzeHandling,
} from '@/lib/fh5-physics';

type Message = { role: 'user' | 'assistant'; content: string };

export interface TuneContext {
  carName?: string;
  tuneType?: TuneType;
  specs?: CarSpecs;
  currentTune?: TuneSettings;
  unitSystem?: UnitSystem;
  userName?: string;
}

interface TuningExpertChatProps {
  tuneContext?: TuneContext;
  onApplySuggestion?: (setting: string, value: number) => void;
  user?: SupabaseUser | null;
}

const CHAT_HISTORY_KEY = 'tuning-chat-history';
const MAX_MESSAGES = 100;

export function TuningExpertChat({ tuneContext, onApplySuggestion, user }: TuningExpertChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tuneProfiles, setTuneProfiles] = useState<TuneProfile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);
  const [showProfiles, setShowProfiles] = useState(false);
  const [lastSuggestions, setLastSuggestions] = useState<TuningSuggestion[]>([]);
  const [performancePrediction, setPerformancePrediction] = useState<PerformancePrediction | null>(null);
  const [handlingAnalysis, setHandlingAnalysis] = useState<HandlingCharacteristics | null>(null);
  const [showDetailedAnalysis, setShowDetailedAnalysis] = useState(false);
  const [compareProfile1, setCompareProfile1] = useState<TuneProfile | null>(null);
  const [compareProfile2, setCompareProfile2] = useState<TuneProfile | null>(null);
  const [comparison, setComparison] = useState<ReturnType<typeof comparePerformance> | null>(null);
  const [showTips, setShowTips] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const assistantContentRef = useRef('');

  // Load messages from localStorage on mount
  useEffect(() => {
    const loadChatHistory = async () => {
      try {
        const saved = localStorage.getItem(CHAT_HISTORY_KEY);
        if (saved) {
          const parsed = safeJsonParse(saved, []);
          if (Array.isArray(parsed)) {
            setMessages(parsed.slice(-MAX_MESSAGES));
          }
        }
      } catch (e) {
        console.error('Failed to load chat history:', e);
      }
    };

    loadChatHistory();
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

  // Calculate performance prediction when tune changes
  useEffect(() => {
    if (tuneContext?.specs && tuneContext?.currentTune) {
      try {
        const prediction = calculateFullPerformance(tuneContext.specs, tuneContext.currentTune);
        const handling = analyzeHandling(tuneContext.specs, tuneContext.currentTune);
        setPerformancePrediction(prediction);
        setHandlingAnalysis(handling);
      } catch (e) {
        console.error('Error calculating performance:', e);
      }
    }
  }, [tuneContext?.specs, tuneContext?.currentTune]);

  // Compare two profiles when both are selected
  useEffect(() => {
    if (compareProfile1 && compareProfile2 && tuneContext?.specs) {
      try {
        const comp = comparePerformance(tuneContext.specs, compareProfile1.settings, compareProfile2.settings);
        setComparison(comp);
      } catch (e) {
        console.error('Error comparing profiles:', e);
      }
    }
  }, [compareProfile1, compareProfile2, tuneContext?.specs]);

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

    setTuneProfiles(prev => {
      const updated = [profile, ...prev].slice(0, 10);
      localStorage.setItem('tune-profiles', JSON.stringify(updated));
      return updated;
    });
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

    // Sanitize user input
    const sanitizedInput = sanitizeChatMessage(input.trim());
    if (!sanitizedInput) return;

    setError(null);
    const userMessage: Message = { role: 'user', content: sanitizedInput };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    assistantContentRef.current = '';

    try {
      const contextWithUser = {
        ...tuneContext,
        userName: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Racer'
      };

      const stream = await sendGeminiMessage(
        messages.map(m => ({ role: m.role === 'user' ? 'user' : 'model', parts: m.content })),
        userMessage.content,
        contextWithUser
      );

      for await (const chunk of stream) {
        const chunkText = chunk.text();
        updateAssistant(chunkText);
      }
      
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
    } catch (err) {
      setIsLoading(false);
      const errorMsg = err instanceof Error ? err.message : "Failed to connect";
      setError(errorMsg);
      toast.error(errorMsg);
    }
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
              onClick={() => setShowTips(!showTips)}
              title="Show tuning tips"
            >
              <Sparkles className="w-4 h-4" />
            </Button>
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

        {!isMinimized && !user ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
            <div className="p-4 rounded-full bg-primary/10 animate-pulse">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h3 className="font-display text-lg text-foreground mb-2">AI Tuning Expert</h3>
              <p className="text-sm text-muted-foreground">
                Sign in to unlock personalized tuning advice powered by Gemini Pro.
              </p>
            </div>
            <div className="text-xs text-[hsl(var(--racing-yellow))] bg-[hsl(var(--racing-yellow))/0.1] px-3 py-1 rounded-full border border-[hsl(var(--racing-yellow))/0.2]">
              Logged-in users only
            </div>
          </div>
        ) : !isMinimized && (
          <>
            
            {tuneContext?.carName && (
              <div className="px-3 py-1.5 bg-[hsl(220,15%,10%)] border-b border-[hsl(220,15%,18%)] flex items-center gap-2">
                <Sparkles className="w-3 h-3 text-[hsl(var(--racing-yellow))]" />
                <span className="text-[10px] text-[hsl(var(--racing-yellow))]">
                  AI knows your {tuneContext.tuneType} tune for {tuneContext.carName}
                </span>
              </div>
            )}

            {/* Performance Metrics */}
            {performancePrediction && (
              <div className="px-3 py-2 bg-[hsl(var(--racing-cyan)/0.1)] border-b border-[hsl(var(--racing-cyan)/0.3)] grid grid-cols-4 gap-2 text-[9px]">
                <div className="text-center">
                  <p className="text-muted-foreground">0-60</p>
                  <p className="text-[hsl(var(--racing-cyan))] font-semibold">{performancePrediction.zeroToSixty}s</p>
                </div>
                <div className="text-center">
                  <p className="text-muted-foreground">Top Speed</p>
                  <p className="text-[hsl(var(--racing-yellow))] font-semibold">{Math.round(performancePrediction.topSpeed)} mph</p>
                </div>
                <div className="text-center">
                  <p className="text-muted-foreground">Grip</p>
                  <p className="text-green-400 font-semibold">{performancePrediction.tireGrip}%</p>
                </div>
                <div className="text-center">
                  <p className="text-muted-foreground">Cornering</p>
                  <p className="text-purple-400 font-semibold">{performancePrediction.corneringG}G</p>
                </div>
              </div>
            )}

            {/* Handling Analysis - Expandable */}
            {handlingAnalysis && (
              <div className="space-y-0">
                <button
                  onClick={() => setShowDetailedAnalysis(!showDetailedAnalysis)}
                  className="w-full px-3 py-2 bg-[hsl(220,15%,10%)] border-b border-[hsl(220,15%,18%)] hover:bg-[hsl(220,15%,12%)] transition-colors"
                >
                  <div className="grid grid-cols-4 gap-2 text-[9px] items-center">
                    <div className="flex items-center gap-1">
                      <span className="text-muted-foreground">Balance:</span>
                      <span className={handlingAnalysis.understeerTendency > 10 ? 'text-blue-400' : handlingAnalysis.understeerTendency < -10 ? 'text-red-400' : 'text-green-400'}>
                        {handlingAnalysis.understeerTendency > 0 ? 'Oversteer' : handlingAnalysis.understeerTendency < 0 ? 'Understeer' : 'Neutral'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-muted-foreground">Response:</span>
                      <span className="text-[hsl(var(--racing-cyan))]">{handlingAnalysis.responsiveness}%</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-muted-foreground">Recovery:</span>
                      <span className="text-[hsl(var(--racing-yellow))]">{handlingAnalysis.recoveryTime}s</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-muted-foreground">{showDetailedAnalysis ? '▼' : '▶'}</span>
                    </div>
                  </div>
                </button>

                {/* Detailed Analysis */}
                {showDetailedAnalysis && performancePrediction && (
                  <div className="px-3 py-2 bg-[hsl(220,15%,8%)] border-b border-[hsl(220,15%,18%)] space-y-2">
                    {/* Acceleration Curve */}
                    <div className="space-y-1">
                      <p className="text-[9px] font-semibold text-[hsl(var(--racing-yellow))]">Acceleration Curve</p>
                      <div className="text-[8px] space-y-0.5 max-h-24 overflow-y-auto bg-[hsl(220,15%,5%)] rounded p-2">
                        <div className="grid grid-cols-4 gap-1 text-muted-foreground border-b border-[hsl(220,15%,20%)] pb-1 font-semibold">
                          <span>Gear</span>
                          <span>Speed</span>
                          <span>Time</span>
                          <span>Accel</span>
                        </div>
                        {performancePrediction.accelerationCurve.slice(0, 12).map((point, idx) => (
                          <div key={idx} className={`grid grid-cols-4 gap-1 ${point.speed > 80 ? 'text-red-300/70' : point.speed > 60 ? 'text-yellow-300/70' : 'text-green-300/70'}`}>
                            <span>{point.gear}</span>
                            <span>{point.speed.toFixed(0)} mph</span>
                            <span>{point.time.toFixed(1)}s</span>
                            <span>{point.acceleration.toFixed(1)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Detailed Handling Metrics */}
                    <div className="grid grid-cols-2 gap-2 text-[9px]">
                      <div className="bg-[hsl(220,15%,5%)] rounded p-1.5 space-y-0.5">
                        <p className="text-muted-foreground text-[8px]">Turn-In Speed</p>
                        <p className="font-semibold text-[hsl(var(--racing-cyan))]">{handlingAnalysis.turnInSpeed.toFixed(1)} mph</p>
                      </div>
                      <div className="bg-[hsl(220,15%,5%)] rounded p-1.5 space-y-0.5">
                        <p className="text-muted-foreground text-[8px]">Mid-Corner Stability</p>
                        <p className="font-semibold text-[hsl(var(--racing-yellow))]">{(handlingAnalysis.midCornerStability * 100).toFixed(0)}%</p>
                      </div>
                      <div className="bg-[hsl(220,15%,5%)] rounded p-1.5 space-y-0.5">
                        <p className="text-muted-foreground text-[8px]">Exit Traction</p>
                        <p className="font-semibold text-green-400">{(handlingAnalysis.exitTraction * 100).toFixed(0)}%</p>
                      </div>
                      <div className="bg-[hsl(220,15%,5%)] rounded p-1.5 space-y-0.5">
                        <p className="text-muted-foreground text-[8px]">Recovery Time</p>
                        <p className="font-semibold text-[hsl(var(--racing-purple))]">{handlingAnalysis.recoveryTime.toFixed(2)}s</p>
                      </div>
                    </div>

                    {/* Tire & Braking Analysis */}
                    <div className="grid grid-cols-2 gap-2 text-[9px]">
                      <div className="bg-[hsl(220,15%,5%)] rounded p-1.5 space-y-0.5">
                        <p className="text-green-400 text-[8px] font-semibold">Tire Grip</p>
                        <div className="text-[8px] space-y-0.5">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Overall</span>
                            <span className={performancePrediction.tireGrip > 1.0 ? 'text-green-300' : 'text-yellow-300'}>
                              {performancePrediction.tireGrip.toFixed(2)}G
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="bg-[hsl(220,15%,5%)] rounded p-1.5 space-y-0.5">
                        <p className="text-red-400 text-[8px] font-semibold">Braking</p>
                        <div className="text-[8px] space-y-0.5">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">60→0 ft</span>
                            <span className="text-red-300">{performancePrediction.brakeDistance.toFixed(0)}</span>
                          </div>
                          <div className="w-full bg-[hsl(220,15%,10%)] rounded h-1.5 overflow-hidden border border-[hsl(220,15%,20%)]">
                            <div 
                              className="h-full bg-red-500"
                              style={{width: `${Math.min(100, (100 / 400) * performancePrediction.brakeDistance)}%`}}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Weight Transfer */}
                    <div className="bg-[hsl(220,15%,5%)] rounded p-1.5 space-y-0.5 text-[9px]">
                      <p className="text-yellow-400 text-[8px] font-semibold">Weight Transfer</p>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground text-[8px]">Suspension Response</span>
                        <span className="text-yellow-300">{performancePrediction.weightTransfer.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-[hsl(220,15%,10%)] rounded h-1.5 overflow-hidden border border-[hsl(220,15%,20%)]">
                        <div 
                          className="h-full bg-yellow-500"
                          style={{width: `${Math.min(100, Math.max(0, performancePrediction.weightTransfer))}%`}}
                        />
                      </div>
                    </div>
                  </div>
                )}
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
              {/* Tuning Tips Section */}
              {showTips && tuneContext?.tuneType && (
                <div className="bg-[hsl(220,15%,10%)] border border-[hsl(var(--racing-yellow)/0.3)] rounded-lg p-3 space-y-2">
                  <p className="text-xs font-semibold text-[hsl(var(--racing-yellow))] flex items-center gap-1">
                    <Sparkles className="w-4 h-4" />
                    FH5 Tuning Tips - {tuneContext.tuneType.toUpperCase()}
                  </p>
                  <div className="text-[9px] space-y-1">
                    {getTuningTips(tuneContext.tuneType).map((tip, idx) => (
                      <p key={idx} className="text-muted-foreground leading-relaxed">
                        {tip}
                      </p>
                    ))}
                  </div>
                  {tuneContext.currentTune && (
                    <div className="mt-3 pt-3 border-t border-[hsl(220,15%,18%)] space-y-1">
                      <p className="text-[9px] font-semibold text-cyan-400">Quick Adjustments to Try:</p>
                      {(['grip', 'speed'] as const).map((target) => (
                        <div key={target} className="text-[8px] text-muted-foreground">
                          <span className="capitalize font-semibold text-cyan-300">{target}:</span>
                          {getQuickAdjustments(tuneContext.currentTune, target).length > 0 ? (
                            getQuickAdjustments(tuneContext.currentTune, target).map((adj, aidx) => (
                              <p key={aidx} className="ml-2">
                                {adj.setting}: {adj.adjustment > 0 ? '+' : ''}{adj.adjustment} ({adj.reason})
                              </p>
                            ))
                          ) : (
                            <p className="ml-2 text-muted-foreground/70">Already optimized</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

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
                    <button
                      key={profile.id}
                      onClick={() => {
                        if (compareProfile1?.id === profile.id) {
                          setCompareProfile1(null);
                        } else if (compareProfile2?.id === profile.id) {
                          setCompareProfile2(null);
                        } else if (!compareProfile1) {
                          setCompareProfile1(profile);
                        } else if (!compareProfile2) {
                          setCompareProfile2(profile);
                        } else {
                          setCompareProfile1(profile);
                          setCompareProfile2(null);
                        }
                      }}
                      className={`w-full flex items-center justify-between text-[9px] p-1 bg-[hsl(220,15%,15%)] rounded transition-colors ${
                        compareProfile1?.id === profile.id || compareProfile2?.id === profile.id 
                          ? 'border border-cyan-500/50 bg-cyan-500/10' 
                          : 'border border-transparent hover:bg-[hsl(220,15%,20%)]'
                      }`}
                    >
                      <div className="flex-1 text-left">
                        <p className="font-semibold text-foreground">{profile.name}</p>
                        <p className="text-muted-foreground text-[8px]">{profile.carName} • {profile.tuneType}</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteProfile(profile.id);
                        }}
                        className="ml-1 p-1 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors"
                        title="Delete profile"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </button>
                  ))}
                </div>
              )}

              {/* Profile Comparison */}
              {comparison && compareProfile1 && compareProfile2 && (
                <div className="p-2 bg-[hsl(220,15%,8%)] rounded border border-[hsl(var(--racing-cyan)/0.3)] space-y-2">
                  <p className="text-[10px] font-semibold text-[hsl(var(--racing-cyan))] flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    {compareProfile1.name} vs {compareProfile2.name}
                  </p>
                  <div className="grid grid-cols-3 gap-1 text-[8px]">
                    <div className="text-center px-1 py-1 bg-[hsl(220,15%,12%)] rounded">
                      <p className="text-muted-foreground">0-60</p>
                      <p className="font-semibold text-cyan-400">{comparison.zeroToSixty.before?.toFixed(2)} vs {comparison.zeroToSixty.after?.toFixed(2)}s</p>
                    </div>
                    <div className="text-center px-1 py-1 bg-[hsl(220,15%,12%)] rounded">
                      <p className="text-muted-foreground">Top Speed</p>
                      <p className="font-semibold text-yellow-400">{comparison.topSpeed.before?.toFixed(0)} vs {comparison.topSpeed.after?.toFixed(0)} mph</p>
                    </div>
                    <div className="text-center px-1 py-1 bg-[hsl(220,15%,12%)] rounded">
                      <p className="text-muted-foreground">Cornering</p>
                      <p className="font-semibold text-green-400">{comparison.corneringG.before?.toFixed(1)} vs {comparison.corneringG.after?.toFixed(1)}G</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setCompareProfile1(null);
                      setCompareProfile2(null);
                      setComparison(null);
                    }}
                    className="w-full text-[9px] py-1 px-2 bg-[hsl(220,15%,12%)] hover:bg-[hsl(220,15%,15%)] rounded text-muted-foreground transition-colors"
                  >
                    Clear Comparison
                  </button>
                </div>
              )}

              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={!user ? "Sign in to chat..." : tuneContext?.carName ? `Ask about your ${tuneContext.tuneType} tune...` : "Ask about tuning..."}
                  className="flex-1 bg-[hsl(220,15%,12%)] border border-[hsl(220,15%,20%)] rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 disabled:opacity-50"
                  disabled={isLoading || !user}
                />
                <Button
                  onClick={() => {
                    const name = prompt('Profile name:', tuneContext?.carName);
                    if (name) saveTuneProfile(name);
                  }}
                  disabled={!tuneContext?.currentTune || !user}
                  variant="ghost"
                  size="sm"
                  title="Save current tune as profile"
                  className="hover:bg-primary/20"
                >
                  <Save className="w-4 h-4" />
                </Button>
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading || !user}
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
