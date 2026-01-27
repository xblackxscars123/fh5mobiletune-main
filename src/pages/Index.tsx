import { useState, useMemo, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { TuneTypeSelector } from '@/components/TuneTypeSelector';
import { CarSpecsForm } from '@/components/CarSpecsForm';
import { SimpleModeForm } from '@/components/SimpleModeForm';
import { CarSelector } from '@/components/CarSelector';
import { BlueprintTunePanel } from '@/components/workspace/BlueprintTunePanel';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { SavedTunesManager } from '@/components/SavedTunesManager';
import { ShopPromoPopup } from '@/components/ShopPromoPopup';
import { ThemeBackground } from '@/components/ThemeBackground';
import { TuningExpertChat, TuneContext } from '@/components/TuningExpertChat';
import { TroubleshootingWizard } from '@/components/TroubleshootingWizard';
import { TemplateSelector } from '@/components/TemplateSelector';
import { BalanceStiffnessSliders, applyBalanceStiffness } from '@/components/BalanceStiffnessSliders';
import { TuneCompare } from '@/components/TuneCompare';
import { AuthModal } from '@/components/AuthModal';
import { ModeSelection } from '@/components/ModeSelection';
import { WorkflowIndicator } from '@/components/WorkflowIndicator';
import { TuneTemplate } from '@/data/tuneTemplates';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CarSpecs, TuneType, TuneVariant, calculateTune, UnitSystem, TuneSettings, tuneVariantsByType, defaultTuneVariantByType } from '@/lib/tuningCalculator';
import { parseTuneFromCurrentURL, copyShareURLToClipboard, generateShareURL } from '@/lib/tuneShare';
import { FH5Car, getCarDisplayName } from '@/data/carDatabase';
import { SavedTune, useSavedTunes } from '@/hooks/useSavedTunes';
import { useAuth } from '@/hooks/useAuth';
import { Calculator, RotateCcw, ShoppingBag, Zap, Settings, Wrench, Share2, Scale, CloudOff, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

const defaultSpecs: CarSpecs = {
  weight: 3000,
  weightDistribution: 52,
  driveType: 'RWD',
  piClass: 'A',
  hasAero: false,
  tireCompound: 'sport',
  horsepower: 400,
  gearCount: 6,
  tireWidth: 245,
  tireProfile: 40,
  rimSize: 19
};

export default function Index() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { savedTunes, syncLocalTunesToCloud } = useSavedTunes();
  const advancedSectionRef = useRef<HTMLDivElement>(null);
  const setupSectionRef = useRef<HTMLDivElement>(null);
  const resultsSectionRef = useRef<HTMLDivElement>(null);
  const tuneTypeSectionRef = useRef<HTMLDivElement>(null);
  const [tuneType, setTuneType] = useState<TuneType>('grip');
  const [variant, setVariant] = useState<TuneVariant>(defaultTuneVariantByType.grip);
  const [specs, setSpecs] = useState<CarSpecs>(defaultSpecs);
  const [showResults, setShowResults] = useState(false);
  const [selectedCar, setSelectedCar] = useState<FH5Car | null>(null);
  const [unitSystem, setUnitSystem] = useState<UnitSystem>('imperial');
  const [isSimpleMode, setIsSimpleMode] = useState(true);
  const [forceShowAdvancedOptions, setForceShowAdvancedOptions] = useState<boolean | undefined>(undefined);
  const [showTroubleshooting, setShowTroubleshooting] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  const [balance, setBalance] = useState(0);
  const [stiffness, setStiffness] = useState(50);
  const [manualOverrides, setManualOverrides] = useState<Partial<TuneSettings>>({});

  const scrollToFirstSpecsInput = () => {
    setTimeout(() => {
      const el = document.getElementById('specs-first-input') as HTMLInputElement | null;
      if (!el) {
        advancedSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }

      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      try {
        el.focus({ preventScroll: true });
      } catch {
        el.focus();
      }
    }, 0);
  };

  useEffect(() => {
    if (location.state?.selectedCar) {
      const car = location.state.selectedCar as FH5Car;
      const tuningMode = location.state.tuningMode as 'simple' | 'advanced' | undefined;
      const scrollTo = location.state.scrollTo as 'specs' | 'tuneType' | undefined;
      const isAdvanced = tuningMode === 'advanced';

      if (tuningMode) {
        setIsSimpleMode(tuningMode === 'simple');
      }

      setSelectedCar(car);
      setSpecs(prev => ({
        ...prev,
        weight: car.weight,
        weightDistribution: car.weightDistribution,
        driveType: car.driveType
      }));
      toast.success(`Loaded ${car.year} ${car.make} ${car.model}`);

      if (scrollTo === 'tuneType') {
        setTimeout(() => {
          tuneTypeSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 0);
      } else if (scrollTo === 'specs') {
        scrollToFirstSpecsInput();

        if (isAdvanced) {
          setForceShowAdvancedOptions(true);
          setTimeout(() => {
            setForceShowAdvancedOptions(undefined);
          }, 0);
        }
      }

      window.history.replaceState({}, document.title);
    }
    
    // Handle loading tune from community page
    if (location.state?.loadTune) {
      const { specs: tuneSpecs, tuneType: loadedTuneType, carName: loadedCarName } = location.state.loadTune;
      setSpecs(tuneSpecs);
      setTuneType(loadedTuneType);
      setVariant(defaultTuneVariantByType[loadedTuneType]);
      setShowResults(true);
      setSelectedCar(null);
      setBalance(0);
      setStiffness(50);
      setManualOverrides({});
      toast.success(`Loaded community tune for ${loadedCarName}`);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    const sharedTune = parseTuneFromCurrentURL();
    if (sharedTune) {
      setSpecs(sharedTune.specs);
      setTuneType(sharedTune.tuneType);
      setVariant(defaultTuneVariantByType[sharedTune.tuneType]);
      setShowResults(true);
      toast.success('Loaded shared tune!');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  useEffect(() => {
    setVariant(defaultTuneVariantByType[tuneType]);
  }, [tuneType]);

  useEffect(() => {
    if (user) {
      syncLocalTunesToCloud();
    }
  }, [user, syncLocalTunesToCloud]);

  const tuneSettings = useMemo(() => {
    const baseTune = calculateTune(specs, tuneType, { variant });
    const { arbFront, arbRear, springsFront, springsRear } = applyBalanceStiffness(
      baseTune.arbFront, baseTune.arbRear, baseTune.springsFront, baseTune.springsRear, balance, stiffness
    );
    return { ...baseTune, arbFront, arbRear, springsFront, springsRear, ...manualOverrides };
  }, [specs, tuneType, variant, balance, stiffness, manualOverrides]);

  const carName = selectedCar ? getCarDisplayName(selectedCar) : 'Custom Car';

  const tuneContext: TuneContext | undefined = showResults ? {
    carName, tuneType, specs, currentTune: tuneSettings, unitSystem
  } : undefined;

  const handleCarSelect = (car: FH5Car) => {
    setSelectedCar(car);
    setSpecs({ ...specs, weight: car.weight, weightDistribution: car.weightDistribution, driveType: car.driveType });
    setVariant(defaultTuneVariantByType[tuneType]);
    setBalance(0);
    setStiffness(50);
    setManualOverrides({});
    toast.success(`Loaded ${car.year} ${car.make} ${car.model}`);
  };

  const handleCalculate = () => {
    setShowResults(true);
    toast.success('Tune calculated!');
    setTimeout(() => {
      resultsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
  };

  const handleReset = () => {
    setSpecs(defaultSpecs);
    setTuneType('grip');
    setVariant(defaultTuneVariantByType.grip);
    setShowResults(false);
    setSelectedCar(null);
    setBalance(0);
    setStiffness(50);
    setManualOverrides({});
  };

  const handleLoadTune = (tune: SavedTune) => {
    setSpecs(tune.specs);
    setTuneType(tune.tuneType);
    setVariant(defaultTuneVariantByType[tune.tuneType]);
    setShowResults(true);
    setSelectedCar(null);
    setBalance(0);
    setStiffness(50);
    setManualOverrides({});
  };

  const handleShare = async () => {
    const success = await copyShareURLToClipboard({ specs, tuneType, carName });
    if (success) toast.success('Share link copied!');
    else toast.error('Failed to copy link');
  };

  const handleShareToReddit = () => {
    const url = generateShareURL({ specs, tuneType, carName });
    if (!url) {
      toast.error('Failed to generate share link');
      return;
    }

    const title = `FH5 Tune: ${carName} (${tuneType})`;
    const redditSubmitUrl = `https://www.reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`;
    window.open(redditSubmitUrl, '_blank', 'noopener,noreferrer');
  };

  const handleApplyAISuggestion = (setting: string, value: number) => {
    const settingMap: Record<string, keyof TuneSettings> = {
      'arb front': 'arbFront', 'arb rear': 'arbRear', 'front arb': 'arbFront', 'rear arb': 'arbRear',
      'springs front': 'springsFront', 'springs rear': 'springsRear',
    };
    const key = settingMap[setting.toLowerCase()];
    if (key) {
      setManualOverrides(prev => ({ ...prev, [key]: value }));
      toast.success(`Applied: ${setting} → ${value}`);
    }
  };

  const handleApplyTemplate = (template: TuneTemplate) => {
    setBalance(template.modifiers.balance);
    setStiffness(template.modifiers.stiffness);
    setManualOverrides({});
    toast.success(`Applied "${template.name}" template`);
  };

  const handleSwitchToAdvanced = () => {
    setIsSimpleMode(false);
    setForceShowAdvancedOptions(true);
    setTimeout(() => {
      advancedSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
    setTimeout(() => {
      setForceShowAdvancedOptions(undefined);
    }, 0);
  };

  const handleModeChange = (mode: 'simple' | 'advanced') => {
    setIsSimpleMode(mode === 'simple');
    navigate('/cars', { state: { tuningMode: mode } });
  };

  const handleConfigureSpecs = () => {
    scrollToFirstSpecsInput();

    if (!isSimpleMode) {
      setForceShowAdvancedOptions(true);
      setTimeout(() => {
        setForceShowAdvancedOptions(undefined);
      }, 0);
    }
  };

  const currentStep = showResults ? 3 : selectedCar ? 2 : 1;

  return (
    <div className="min-h-screen pb-8 md:pb-16 relative overflow-x-hidden">
      <ThemeBackground />
      <ShopPromoPopup />
      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />
      
      <div className="container max-w-7xl mx-auto px-3 sm:px-4 md:px-6 relative z-10">
        <Header onShowAuth={() => setShowAuthModal(true)} />
        
        {/* Dev Banner */}
        <div className="mb-4 md:mb-6 p-3 md:p-4 text-center rounded-lg backdrop-blur-sm" 
          style={{ 
            background: 'hsl(var(--neon-purple) / 0.15)', 
            borderLeft: '3px solid hsl(var(--neon-purple))',
            border: '1px solid hsl(var(--neon-purple) / 0.3)'
          }}>
          <p className="text-xs sm:text-sm font-sketch" style={{ color: 'hsl(var(--neon-purple))' }}>
            🛠️ We'd love your help developing this app! 🛠️
          </p>
          <div className="flex items-center justify-center gap-3 mt-2">
            <a href="https://www.paypal.com/invoice/p/#ZGYJ49YV6B3DQRGL" target="_blank" rel="noopener noreferrer" 
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded text-xs font-medium transition-colors"
              style={{ background: 'hsl(var(--neon-purple) / 0.25)', color: 'hsl(var(--neon-purple))', border: '1px solid hsl(var(--neon-purple) / 0.5)' }}>
              ☕ Support
            </a>
            <Link to="/shop" className="inline-flex items-center gap-2 px-3 py-1.5 rounded text-xs font-medium animate-pulse-neon"
              style={{ background: 'hsl(var(--neon-pink) / 0.2)', color: 'hsl(var(--neon-pink))', border: '1px solid hsl(var(--neon-pink) / 0.4)' }}>
              <ShoppingBag className="w-3 h-3" /> Garage Shop
            </Link>
          </div>
        </div>
        
        {/* Step 1: Pick mode */}
        <div className="module-block p-3 md:p-4 mb-4">
          <div className="flex items-center justify-between gap-3 mb-3">
            <h2 className="font-display text-sm uppercase tracking-wider" style={{ color: 'hsl(var(--neon-cyan))' }}>
              Step 1: Pick Mode
            </h2>
          </div>
          <ModeSelection
            selectedMode={isSimpleMode ? 'simple' : 'advanced'}
            onModeChange={handleModeChange}
          />
        </div>

        <div className="mb-4">
          <WorkflowIndicator
            currentStep={currentStep}
            totalSteps={3}
            onStepClick={(step) => {
              if (step === 1) {
                navigate('/cars', { state: { tuningMode: isSimpleMode ? 'simple' : 'advanced' } });
                return;
              }
              if (step === 2) {
                handleConfigureSpecs();
                return;
              }
              if (step === 3) {
                if (showResults) {
                  setTimeout(() => {
                    resultsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }, 0);
                }
              }
            }}
          />
        </div>
        
        {/* Main Layout */}
        <div className="flex flex-col lg:grid lg:grid-cols-[minmax(320px,400px)_1fr] gap-4 md:gap-6">
          {/* Left Panel */}
          <div className="space-y-3 md:space-y-4">
            {/* Step 2: Pick car + enter specs */}
            <div ref={setupSectionRef} className="module-block p-3 md:p-4">
              <div className="flex items-center justify-between gap-3 mb-3">
                <h2 className="font-display text-sm uppercase tracking-wider" style={{ color: 'hsl(var(--neon-pink))' }}>
                  Step 2: Pick Car + Enter Specs
                </h2>
                {!isSimpleMode && (
                  <Button variant="ghost" size="sm" onClick={handleSwitchToAdvanced} className="text-xs h-7 px-2">
                    <Settings className="w-3.5 h-3.5 mr-1" /> Advanced
                  </Button>
                )}
              </div>

              <div className="space-y-3">
                <CarSelector onSelect={handleCarSelect} selectedCar={selectedCar} />
              </div>
            </div>

            <div ref={tuneTypeSectionRef} className="module-block module-gearing p-3 md:p-4">
              <TuneTypeSelector selected={tuneType} onChange={setTuneType} />
            </div>

            {showResults && (
              <div className="module-block module-gearing p-3 md:p-4">
                <h3 className="font-display text-sm mb-3 uppercase tracking-wider" style={{ color: 'hsl(var(--module-gearing))' }}>
                  Variant
                </h3>
                <Select value={variant} onValueChange={(v) => setVariant(v as TuneVariant)}>
                  <SelectTrigger className="bg-[hsl(220,15%,12%)] border-[hsl(220,15%,20%)]">
                    <SelectValue placeholder="Select variant..." />
                  </SelectTrigger>
                  <SelectContent>
                    {tuneVariantsByType[tuneType].map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {!isSimpleMode && (
              <div className="module-block module-aero p-3 md:p-4">
                <h3 className="font-display text-sm mb-3 uppercase tracking-wider" style={{ color: 'hsl(var(--module-aero))' }}>
                  Advanced Inputs
                </h3>
                <p className="text-xs text-muted-foreground">
                  Switch to Advanced Mode to access extra tuning controls and deeper car selection.
                </p>
              </div>
            )}
            
            <div ref={advancedSectionRef} className="module-block module-tires p-3 md:p-4">
              <h3 className="font-display text-sm mb-3 uppercase tracking-wider flex items-center gap-2" style={{ color: 'hsl(var(--module-tires))' }}>
                {isSimpleMode ? <><Zap className="w-4 h-4" /> Quick Setup</> : 'Car Specifications'}
              </h3>
              {isSimpleMode ? (
                <SimpleModeForm specs={specs} onChange={setSpecs} unitSystem={unitSystem} onUnitSystemChange={setUnitSystem} />
              ) : (
                <CarSpecsForm specs={specs} onChange={setSpecs} unitSystem={unitSystem} onUnitSystemChange={setUnitSystem} forceShowAdvanced={forceShowAdvancedOptions} />
              )}
            </div>

            {showResults && (
              <div className="module-block module-suspension p-3 md:p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-display text-sm uppercase tracking-wider flex items-center gap-2" style={{ color: 'hsl(var(--module-suspension))' }}>
                    <Scale className="w-4 h-4" /> Quick Adjust
                  </h3>
                  {(balance !== 0 || stiffness !== 50) && (
                    <Button variant="ghost" size="sm" onClick={() => { setBalance(0); setStiffness(50); }} className="text-xs h-6 px-2">Reset</Button>
                  )}
                </div>
                <BalanceStiffnessSliders balance={balance} stiffness={stiffness} onBalanceChange={setBalance} onStiffnessChange={setStiffness} />
              </div>
            )}

            <div className="flex gap-2 md:gap-3">
              <Button onClick={handleCalculate} className="flex-1 h-10 md:h-12 font-display uppercase tracking-wider" 
                style={{ background: 'hsl(var(--neon-pink))', color: 'white' }}>
                <Calculator className="w-4 h-4 md:w-5 md:h-5 mr-2" /> Calculate
              </Button>
              <Button variant="outline" onClick={handleReset} className="h-10 md:h-12 px-3 border-border hover:bg-card">
                <RotateCcw className="w-4 h-4 md:w-5 md:h-5" />
              </Button>
              {showResults && (
                <>
                  <Button variant="outline" onClick={handleShare} className="h-10 md:h-12 px-3 border-border hover:bg-card">
                    <Share2 className="w-4 h-4 md:w-5 md:h-5" />
                  </Button>
                  <Button variant="outline" onClick={handleShareToReddit} className="h-10 md:h-12 px-3 border-border hover:bg-card">
                    <ExternalLink className="w-4 h-4 md:w-5 md:h-5" />
                  </Button>
                </>
              )}
            </div>

            {showResults && <TemplateSelector tuneType={tuneType} driveType={specs.driveType} onSelectTemplate={handleApplyTemplate} />}
            
            <Button variant="outline" onClick={() => setShowTroubleshooting(!showTroubleshooting)} 
              className="w-full" style={{ borderColor: 'hsl(var(--module-brakes) / 0.5)', color: 'hsl(var(--module-brakes))' }}>
              <Wrench className="w-4 h-4 mr-2" /> {showTroubleshooting ? 'Hide' : 'Fix My Car'}
            </Button>

            {showTroubleshooting && <TroubleshootingWizard onClose={() => setShowTroubleshooting(false)} />}
            
            <SavedTunesManager carName={carName} tuneType={tuneType} specs={specs} onLoad={handleLoadTune} />
            
            {savedTunes.length >= 1 && showResults && (
              <TuneCompare savedTunes={savedTunes} currentTune={{ name: carName, tune: tuneSettings }} unitSystem={unitSystem} />
            )}
            
            {!user && savedTunes.length > 0 && (
              <div className="p-3 text-center rounded-lg backdrop-blur-sm" 
                style={{ 
                  background: 'hsl(var(--neon-cyan) / 0.1)',
                  borderLeft: '3px solid hsl(var(--neon-cyan))',
                  border: '1px solid hsl(var(--neon-cyan) / 0.25)'
                }}>
                <CloudOff className="w-5 h-5 mx-auto mb-2" style={{ color: 'hsl(var(--neon-cyan))' }} />
                <p className="text-xs text-muted-foreground mb-2">Sign in to sync tunes</p>
                <Button size="sm" onClick={() => setShowAuthModal(true)} style={{ background: 'hsl(var(--neon-cyan) / 0.25)', color: 'hsl(var(--neon-cyan))', border: '1px solid hsl(var(--neon-cyan) / 0.5)' }}>
                  Sign In
                </Button>
              </div>
            )}
          </div>
          
          {/* Right Panel - Results */}
          <div>
            <div ref={resultsSectionRef} />
            {showResults ? (
              <div className="space-y-3">
                <div className="module-block p-3 md:p-4">
                  <h2 className="font-display text-sm uppercase tracking-wider" style={{ color: 'hsl(var(--neon-cyan))' }}>
                    Step 3: Results + Save/Share
                  </h2>
                </div>
                <ErrorBoundary fallbackTitle="Tune Results Crashed">
                  <BlueprintTunePanel tune={tuneSettings} driveType={specs.driveType} tuneType={tuneType} unitSystem={unitSystem} carName={carName} horsepower={specs.horsepower} specs={specs} />
                </ErrorBoundary>
              </div>
            ) : (
              <div className="module-block p-8 text-center h-full flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-20 h-20 rounded-full mb-4 flex items-center justify-center" style={{ background: 'hsl(var(--neon-pink) / 0.1)', border: '2px dashed hsl(var(--neon-pink) / 0.3)' }}>
                  <Calculator className="w-10 h-10" style={{ color: 'hsl(var(--neon-pink) / 0.5)' }} />
                </div>
                <h3 className="font-display text-xl mb-2 text-gradient-neon">Step 3: Results</h3>
                <p className="text-muted-foreground text-sm font-sketch">Complete Step 2, then click Calculate</p>
              </div>
            )}
          </div>
        </div>
        
        <TuningExpertChat tuneContext={tuneContext} onApplySuggestion={handleApplyAISuggestion} />
      </div>
    </div>
  );
}
