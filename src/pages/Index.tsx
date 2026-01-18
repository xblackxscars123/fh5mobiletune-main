import { useState, useMemo, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Header } from '@/components/Header';
import { TuneTypeSelector } from '@/components/TuneTypeSelector';
import { CarSpecsForm } from '@/components/CarSpecsForm';
import { SimpleModeForm } from '@/components/SimpleModeForm';
import { CarSelector } from '@/components/CarSelector';
import { ForzaTunePanel } from '@/components/ForzaTunePanel';
import { SavedTunesManager } from '@/components/SavedTunesManager';
import { ShopPromoPopup } from '@/components/ShopPromoPopup';
import { JDMStickerBombBackground } from '@/components/JDMStickerBombBackground';
import { TuningExpertChat, TuneContext } from '@/components/TuningExpertChat';
import { TroubleshootingWizard } from '@/components/TroubleshootingWizard';
import { TemplateSelector } from '@/components/TemplateSelector';
import { BalanceStiffnessSliders, applyBalanceStiffness } from '@/components/BalanceStiffnessSliders';
import { TuneCompare } from '@/components/TuneCompare';
import { AuthModal } from '@/components/AuthModal';
import { TuneTemplate } from '@/data/tuneTemplates';
import { Button } from '@/components/ui/button';
import { CarSpecs, TuneType, calculateTune, UnitSystem, TuneSettings } from '@/lib/tuningCalculator';
import { parseTuneFromCurrentURL, copyShareURLToClipboard } from '@/lib/tuneShare';
import { FH5Car, getCarDisplayName } from '@/data/carDatabase';
import { SavedTune, useSavedTunes } from '@/hooks/useSavedTunes';
import { useAuth } from '@/hooks/useAuth';
import { Calculator, RotateCcw, ShoppingBag, Zap, Settings, Wrench, Share2, Scale, CloudOff } from 'lucide-react';
import { toast } from 'sonner';

const defaultSpecs: CarSpecs = {
  weight: 3000,
  weightDistribution: 52,
  driveType: 'RWD',
  piClass: 'A',
  hasAero: false,
  tireCompound: 'sport',
  horsepower: 400,
  gearCount: 6
};

export default function Index() {
  const location = useLocation();
  const { user } = useAuth();
  const { savedTunes, syncLocalTunesToCloud } = useSavedTunes();
  const [tuneType, setTuneType] = useState<TuneType>('grip');
  const [specs, setSpecs] = useState<CarSpecs>(defaultSpecs);
  const [showResults, setShowResults] = useState(false);
  const [selectedCar, setSelectedCar] = useState<FH5Car | null>(null);
  const [unitSystem, setUnitSystem] = useState<UnitSystem>('imperial');
  const [isSimpleMode, setIsSimpleMode] = useState(true);
  const [showTroubleshooting, setShowTroubleshooting] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  // Balance & Stiffness meta-controls
  const [balance, setBalance] = useState(0);
  const [stiffness, setStiffness] = useState(50);
  
  // Manual overrides for AI-suggested changes
  const [manualOverrides, setManualOverrides] = useState<Partial<TuneSettings>>({});

  // Handle car selection from Cars page
  useEffect(() => {
    if (location.state?.selectedCar) {
      const car = location.state.selectedCar as FH5Car;
      setSelectedCar(car);
      setSpecs(prev => ({
        ...prev,
        weight: car.weight,
        weightDistribution: car.weightDistribution,
        driveType: car.driveType
      }));
      toast.success(`Loaded ${car.year} ${car.make} ${car.model}`);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Parse shared tune from URL on mount
  useEffect(() => {
    const sharedTune = parseTuneFromCurrentURL();
    if (sharedTune) {
      setSpecs(sharedTune.specs);
      setTuneType(sharedTune.tuneType);
      setShowResults(true);
      toast.success('Loaded shared tune!');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Sync local tunes when user signs in
  useEffect(() => {
    if (user) {
      syncLocalTunesToCloud();
    }
  }, [user, syncLocalTunesToCloud]);

  // Calculate tune with balance/stiffness modifiers and manual overrides
  const tuneSettings = useMemo(() => {
    const baseTune = calculateTune(specs, tuneType);
    
    // Apply balance & stiffness modifiers
    const { arbFront, arbRear, springsFront, springsRear } = applyBalanceStiffness(
      baseTune.arbFront,
      baseTune.arbRear,
      baseTune.springsFront,
      baseTune.springsRear,
      balance,
      stiffness
    );
    
    return {
      ...baseTune,
      arbFront,
      arbRear,
      springsFront,
      springsRear,
      ...manualOverrides
    };
  }, [specs, tuneType, balance, stiffness, manualOverrides]);

  const carName = selectedCar ? getCarDisplayName(selectedCar) : 'Custom Car';

  // Context for AI tuning expert
  const tuneContext: TuneContext | undefined = showResults ? {
    carName,
    tuneType,
    specs,
    currentTune: tuneSettings
  } : undefined;

  const handleCarSelect = (car: FH5Car) => {
    setSelectedCar(car);
    setSpecs({
      ...specs,
      weight: car.weight,
      weightDistribution: car.weightDistribution,
      driveType: car.driveType
    });
    // Reset modifiers when car changes
    setBalance(0);
    setStiffness(50);
    setManualOverrides({});
    toast.success(`Loaded ${car.year} ${car.make} ${car.model}`);
  };

  const handleCalculate = () => {
    setShowResults(true);
    toast.success('Tune calculated!');
  };

  const handleReset = () => {
    setSpecs(defaultSpecs);
    setTuneType('grip');
    setShowResults(false);
    setSelectedCar(null);
    setBalance(0);
    setStiffness(50);
    setManualOverrides({});
  };

  const handleLoadTune = (tune: SavedTune) => {
    setSpecs(tune.specs);
    setTuneType(tune.tuneType);
    setShowResults(true);
    setSelectedCar(null);
    setBalance(0);
    setStiffness(50);
    setManualOverrides({});
  };

  const handleShare = async () => {
    const success = await copyShareURLToClipboard({ specs, tuneType, carName });
    if (success) {
      toast.success('Share link copied to clipboard!');
    } else {
      toast.error('Failed to copy link');
    }
  };

  // Handler for AI suggestions
  const handleApplyAISuggestion = (setting: string, value: number) => {
    // Map common setting names to tune property keys
    const settingMap: Record<string, keyof TuneSettings> = {
      'arb front': 'arbFront',
      'arb rear': 'arbRear',
      'front arb': 'arbFront',
      'rear arb': 'arbRear',
      'springs front': 'springsFront',
      'springs rear': 'springsRear',
      'front springs': 'springsFront',
      'rear springs': 'springsRear',
      'tire pressure front': 'tirePressureFront',
      'tire pressure rear': 'tirePressureRear',
      'front tire pressure': 'tirePressureFront',
      'rear tire pressure': 'tirePressureRear',
      'camber front': 'camberFront',
      'camber rear': 'camberRear',
      'front camber': 'camberFront',
      'rear camber': 'camberRear',
      'toe front': 'toeFront',
      'toe rear': 'toeRear',
      'front toe': 'toeFront',
      'rear toe': 'toeRear',
      'caster': 'caster',
      'brake pressure': 'brakePressure',
      'brake balance': 'brakeBalance',
      'rebound front': 'reboundFront',
      'rebound rear': 'reboundRear',
      'front rebound': 'reboundFront',
      'rear rebound': 'reboundRear',
      'bump front': 'bumpFront',
      'bump rear': 'bumpRear',
      'front bump': 'bumpFront',
      'rear bump': 'bumpRear',
      'aero front': 'aeroFront',
      'aero rear': 'aeroRear',
      'front aero': 'aeroFront',
      'rear aero': 'aeroRear',
      'final drive': 'finalDrive',
      'diff accel rear': 'diffAccelRear',
      'diff decel rear': 'diffDecelRear',
      'diff accel front': 'diffAccelFront',
      'diff decel front': 'diffDecelFront',
      'rear diff accel': 'diffAccelRear',
      'rear diff decel': 'diffDecelRear',
      'front diff accel': 'diffAccelFront',
      'front diff decel': 'diffDecelFront',
      'center balance': 'centerBalance',
      'ride height front': 'rideHeightFront',
      'ride height rear': 'rideHeightRear',
      'front ride height': 'rideHeightFront',
      'rear ride height': 'rideHeightRear',
    };

    const key = settingMap[setting.toLowerCase()];
    if (key) {
      setManualOverrides(prev => ({
        ...prev,
        [key]: value
      }));
      toast.success(`Applied: ${setting} → ${value}`);
    } else {
      toast.error(`Unknown setting: ${setting}`);
    }
  };

  // Handler for template selection
  const handleApplyTemplate = (template: TuneTemplate) => {
    setBalance(template.modifiers.balance);
    setStiffness(template.modifiers.stiffness);
    setManualOverrides({});
    toast.success(`Applied "${template.name}" template`);
  };

  return (
    <div className="min-h-screen pb-8 md:pb-16 relative overflow-x-hidden">
      <JDMStickerBombBackground />
      <ShopPromoPopup />
      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />
      
      <div className="container max-w-7xl mx-auto px-3 sm:px-4 md:px-6 relative z-10">
        <Header onShowAuth={() => setShowAuthModal(true)} />
        
        {/* Development Help Banner */}
        <div className="mb-4 md:mb-6 bg-gradient-to-r from-[hsl(var(--racing-yellow)/0.15)] via-[hsl(var(--racing-yellow)/0.1)] to-[hsl(var(--racing-yellow)/0.15)] border border-[hsl(var(--racing-yellow)/0.3)] rounded-lg p-3 md:p-4 text-center">
          <p className="text-xs sm:text-sm text-[hsl(var(--racing-yellow))] font-medium">
            🛠️ <span className="font-display uppercase tracking-wide">We'd love your help developing this app!</span> 🛠️
          </p>
          <p className="text-xs text-muted-foreground mt-1 hidden sm:block">
            Got ideas, found bugs, or want to contribute? Drop a comment on the Reddit post!
          </p>
          {/* Desktop: Side by side buttons */}
          <div className="hidden sm:flex items-center justify-center gap-3 mt-2 md:mt-3">
            <a href="https://www.paypal.com/invoice/p/#ZGYJ49YV6B3DQRGL" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-[hsl(var(--racing-yellow))] hover:bg-[hsl(var(--racing-yellow)/0.8)] text-black font-medium text-xs md:text-sm rounded-md transition-colors">
              ☕ Support Development
            </a>
            <Link to="/shop" className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-[hsl(var(--racing-orange))] hover:bg-[hsl(var(--racing-orange)/0.8)] text-black font-medium text-xs md:text-sm rounded-md transition-colors shadow-[0_0_15px_hsl(var(--racing-orange)/0.5),0_0_30px_hsl(var(--racing-orange)/0.3)] hover:shadow-[0_0_20px_hsl(var(--racing-orange)/0.7),0_0_40px_hsl(var(--racing-orange)/0.4)] animate-pulse" style={{ animationDuration: '2s' }}>
              <ShoppingBag className="w-4 h-4" />
              🔥 Garage Shop
            </Link>
          </div>
          {/* Mobile: Stack vertically */}
          <div className="flex sm:hidden flex-col items-center gap-2 mt-2">
            <a href="https://www.paypal.com/invoice/p/#ZGYJ49YV6B3DQRGL" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-3 py-1.5 bg-[hsl(var(--racing-yellow))] hover:bg-[hsl(var(--racing-yellow)/0.8)] text-black font-medium text-xs rounded-md transition-colors">
              ☕ Support Development
            </a>
            <Link to="/shop" className="inline-flex items-center gap-2 px-3 py-1.5 bg-[hsl(var(--racing-orange))] hover:bg-[hsl(var(--racing-orange)/0.8)] text-black font-medium text-xs rounded-md transition-colors shadow-[0_0_15px_hsl(var(--racing-orange)/0.5),0_0_30px_hsl(var(--racing-orange)/0.3)] animate-pulse" style={{ animationDuration: '2s' }}>
              <ShoppingBag className="w-3 h-3" />
              🔥 Garage Shop
            </Link>
          </div>
        </div>
        
        {/* Mode Toggle */}
        <div className="mb-4 flex items-center justify-center gap-2">
          <Button variant={isSimpleMode ? 'tuneTypeActive' : 'tuneType'} onClick={() => setIsSimpleMode(true)} className="text-xs sm:text-sm">
            <Zap className="w-4 h-4 mr-1" />
            Simple Mode
          </Button>
          <Button variant={!isSimpleMode ? 'tuneTypeActive' : 'tuneType'} onClick={() => setIsSimpleMode(false)} className="text-xs sm:text-sm">
            <Settings className="w-4 h-4 mr-1" />
            Advanced Mode
          </Button>
        </div>
        
        {/* Mobile: Stack vertically, Desktop: Side by side */}
        <div className="flex flex-col lg:grid lg:grid-cols-[minmax(320px,400px)_1fr] gap-4 md:gap-6">
          {/* Left Panel - Setup */}
          <div className="space-y-3 md:space-y-4">
            {/* Tune Type */}
            <div className="bg-[hsl(220,18%,8%)] rounded-lg p-3 md:p-4 border border-[hsl(220,15%,18%)]">
              <TuneTypeSelector selected={tuneType} onChange={setTuneType} />
            </div>
            
            {/* Car Selector - Only in Advanced Mode */}
            {!isSimpleMode && (
              <div className="bg-[hsl(220,18%,8%)] rounded-lg p-3 md:p-4 border border-[hsl(220,15%,18%)]">
                <CarSelector onSelect={handleCarSelect} selectedCar={selectedCar} />
              </div>
            )}
            
            {/* Car Specs */}
            <div className="bg-[hsl(220,18%,8%)] rounded-lg p-3 md:p-4 border border-[hsl(220,15%,18%)]">
              <h3 className="font-display text-sm text-[hsl(var(--racing-yellow))] mb-3 md:mb-4 uppercase tracking-wider flex items-center gap-2">
                {isSimpleMode ? (
                  <>
                    <Zap className="w-4 h-4" />
                    Quick Setup (HokiHoshi Method)
                  </>
                ) : 'Car Specifications'}
              </h3>
              {isSimpleMode ? (
                <SimpleModeForm specs={specs} onChange={setSpecs} unitSystem={unitSystem} onUnitSystemChange={setUnitSystem} />
              ) : (
                <CarSpecsForm specs={specs} onChange={setSpecs} unitSystem={unitSystem} onUnitSystemChange={setUnitSystem} />
              )}
            </div>

            {/* Balance & Stiffness Sliders */}
            {showResults && (
              <div className="bg-[hsl(220,18%,8%)] rounded-lg p-3 md:p-4 border border-[hsl(220,15%,18%)]">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-display text-sm text-[hsl(var(--racing-cyan))] uppercase tracking-wider flex items-center gap-2">
                    <Scale className="w-4 h-4" />
                    Quick Adjust
                  </h3>
                  {(balance !== 0 || stiffness !== 50) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => { setBalance(0); setStiffness(50); }}
                      className="text-xs text-muted-foreground hover:text-foreground h-6 px-2"
                    >
                      Reset
                    </Button>
                  )}
                </div>
                <BalanceStiffnessSliders
                  balance={balance}
                  stiffness={stiffness}
                  onBalanceChange={setBalance}
                  onStiffnessChange={setStiffness}
                />
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 md:gap-3">
              <Button onClick={handleCalculate} className="flex-1 bg-[hsl(var(--racing-yellow))] hover:bg-[hsl(45,100%,45%)] text-black font-display uppercase tracking-wider h-10 md:h-12 text-sm md:text-base">
                <Calculator className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                Calculate Tune
              </Button>
              <Button variant="outline" onClick={handleReset} className="h-10 md:h-12 px-3 md:px-4 border-[hsl(220,15%,25%)] hover:bg-[hsl(220,15%,15%)]">
                <RotateCcw className="w-4 h-4 md:w-5 md:h-5" />
              </Button>
              {showResults && (
                <Button variant="outline" onClick={handleShare} className="h-10 md:h-12 px-3 md:px-4 border-[hsl(220,15%,25%)] hover:bg-[hsl(220,15%,15%)]" title="Share Tune">
                  <Share2 className="w-4 h-4 md:w-5 md:h-5" />
                </Button>
              )}
            </div>

            {/* Template Selector */}
            {showResults && (
              <TemplateSelector
                tuneType={tuneType}
                driveType={specs.driveType}
                onSelectTemplate={handleApplyTemplate}
              />
            )}

            {/* Troubleshooting Toggle */}
            <Button
              variant="outline"
              onClick={() => setShowTroubleshooting(!showTroubleshooting)}
              className="w-full border-[hsl(var(--racing-orange)/0.5)] text-[hsl(var(--racing-orange))] hover:bg-[hsl(var(--racing-orange)/0.1)]"
            >
              <Wrench className="w-4 h-4 mr-2" />
              {showTroubleshooting ? 'Hide' : 'Fix My Car'} - Troubleshoot Issues
            </Button>

            {/* Troubleshooting Wizard */}
            {showTroubleshooting && (
              <TroubleshootingWizard onClose={() => setShowTroubleshooting(false)} />
            )}
            
            {/* Save/Load with Compare */}
            <div className="space-y-2">
              <SavedTunesManager carName={carName} tuneType={tuneType} specs={specs} onLoad={handleLoadTune} />
              
              {savedTunes.length >= 1 && showResults && (
                <TuneCompare
                  savedTunes={savedTunes}
                  currentTune={{ name: carName, tune: tuneSettings }}
                  unitSystem={unitSystem}
                />
              )}
              
              {/* Guest sync notice */}
              {!user && savedTunes.length > 0 && (
                <div className="flex items-center gap-2 p-2 rounded-lg bg-[hsl(var(--racing-yellow)/0.1)] border border-[hsl(var(--racing-yellow)/0.3)] text-xs">
                  <CloudOff className="w-4 h-4 text-[hsl(var(--racing-yellow))]" />
                  <span className="text-muted-foreground">
                    <button
                      onClick={() => setShowAuthModal(true)}
                      className="text-[hsl(var(--racing-yellow))] hover:underline"
                    >
                      Sign in
                    </button>
                    {' '}to sync your {savedTunes.length} tune{savedTunes.length > 1 ? 's' : ''} to the cloud
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Tune Results (Forza Style) */}
          <div className={showResults ? 'animate-fade-in' : 'opacity-30 pointer-events-none'}>
            <ForzaTunePanel tune={tuneSettings} driveType={specs.driveType} tuneType={tuneType} unitSystem={unitSystem} carName={carName} />
          </div>
        </div>

        <footer className="mt-8 md:mt-16 text-center text-muted-foreground text-xs px-4">
          <p>Based on community tuning guides. Not affiliated with Playground Games.</p>
        </footer>
        
        {/* AI Tuning Expert Chat - Now with context! */}
        <TuningExpertChat
          tuneContext={tuneContext}
          onApplySuggestion={handleApplyAISuggestion}
        />
      </div>
    </div>
  );
}
