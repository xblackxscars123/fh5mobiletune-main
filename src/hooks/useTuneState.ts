import { useState, useMemo, useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { CarSpecs, TuneType, TuneVariant, calculateTune, UnitSystem, TuneSettings, defaultTuneVariantByType } from '@/lib/tuningCalculator';
import { parseTuneFromCurrentURL } from '@/lib/tuneShare';
import { FH5Car } from '@/types/car';
import { getCarDisplayName } from '@/data/carDatabase';
import { getVerifiedSpecs } from '@/data/verifiedCarSpecs';
import { applyBalanceStiffness } from '@/components/BalanceStiffnessSliders';

const defaultSpecs: CarSpecs = {
  weight: 3000,
  weightDistribution: 52,
  driveType: 'RWD',
  piClass: 'A',
  hasAero: false,
  tireCompound: 'sport',
  horsepower: 400,
  gearCount: 6,
  rimSize: 19
};

interface UseTuneStateOptions {
  user?: unknown;
  syncLocalTunesToCloud?: () => void;
}

export const useTuneState = ({ user, syncLocalTunesToCloud }: UseTuneStateOptions = {}) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Core state
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
  
  // Advanced tuning state
  const [balance, setBalance] = useState(0);
  const [stiffness, setStiffness] = useState(50);
  const [manualOverrides, setManualOverrides] = useState<Partial<TuneSettings>>({});

  // Memoized tune settings calculation
  const tuneSettings = useMemo(() => {
    const baseTune = calculateTune(specs, tuneType, { variant });
    const { arbFront, arbRear, springsFront, springsRear } = applyBalanceStiffness(
      baseTune.arbFront, baseTune.arbRear, baseTune.springsFront, baseTune.springsRear, balance, stiffness
    );
    return { ...baseTune, arbFront, arbRear, springsFront, springsRear, ...manualOverrides };
  }, [specs, tuneType, variant, balance, stiffness, manualOverrides]);

  // Memoized car name
  const carName = useMemo(() => {
    return selectedCar ? getCarDisplayName(selectedCar) : 'Custom Car';
  }, [selectedCar]);

  // Handle location state changes (navigation from other pages)
  useEffect(() => {
    const processSelectedCar = (car: FH5Car, tuningMode?: 'simple' | 'advanced') => {
      console.log('Loading car from location state:', car);

      if (tuningMode) {
        setIsSimpleMode(tuningMode === 'simple');
      }

      setSelectedCar(car);
      
      // Store in sessionStorage as backup
      sessionStorage.setItem('selectedCar', JSON.stringify(car));
      
      // Check for verified specs first
      const verifiedSpecs = getVerifiedSpecs(car.year, car.make, car.model);
      
      if (verifiedSpecs) {
        // Use verified specs if available
        setSpecs(prev => ({ 
          ...prev, 
          weight: verifiedSpecs.weight, 
          weightDistribution: verifiedSpecs.weightDistribution, 
          driveType: verifiedSpecs.driveType,
          piClass: car.piClass // Keep original PI class for tune calculations
        }));
        toast.success(`Loaded ${car.year} ${car.make} ${car.model} (Verified Specs)`);
      } else {
        // Use default car specs
        setSpecs(prev => ({
          ...prev,
          weight: car.weight,
          weightDistribution: car.weightDistribution,
          driveType: car.driveType
        }));
        toast.success(`Loaded ${car.year} ${car.make} ${car.model}`);
      }
    };

    if (location.state?.selectedCar) {
      const car = location.state.selectedCar as FH5Car;
      const tuningMode = location.state.tuningMode as 'simple' | 'advanced' | undefined;
      
      processSelectedCar(car, tuningMode);
      
      // Clear location state after processing
      window.history.replaceState({}, document.title);
    } else if (!selectedCar) {
      // Check sessionStorage as backup
      const storedCar = sessionStorage.getItem('selectedCar');
      if (storedCar) {
        try {
          const car = JSON.parse(storedCar) as FH5Car;
          processSelectedCar(car);
        } catch (error) {
          console.error('Failed to parse stored car:', error);
          sessionStorage.removeItem('selectedCar');
        }
      }
    }
  }, [location.state, selectedCar]);

  // Handle loading tune from community page
  useEffect(() => {
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

  // Handle URL-based tune sharing
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

  // Update variant when tune type changes
  useEffect(() => {
    setVariant(defaultTuneVariantByType[tuneType]);
  }, [tuneType]);

  // Sync tunes to cloud when user logs in
  useEffect(() => {
    if (user && syncLocalTunesToCloud) {
      syncLocalTunesToCloud();
    }
  }, [user, syncLocalTunesToCloud]);

  // Callback handlers
  const handleCarSelect = useCallback((car: FH5Car) => {
    setSelectedCar(car);
    
    // Clear sessionStorage since user is manually selecting
    sessionStorage.removeItem('selectedCar');
    
    // Check for verified specs first
    const verifiedSpecs = getVerifiedSpecs(car.year, car.make, car.model);
    
    if (verifiedSpecs) {
      // Use verified specs if available
      setSpecs(prev => ({ 
        ...prev, 
        weight: verifiedSpecs.weight, 
        weightDistribution: verifiedSpecs.weightDistribution, 
        driveType: verifiedSpecs.driveType,
        piClass: car.piClass // Keep original PI class for tune calculations
      }));
      toast.success(`Loaded ${car.year} ${car.make} ${car.model} (Verified Specs)`);
    } else {
      // Use default car specs
      setSpecs(prev => ({ 
        ...prev, 
        weight: car.weight, 
        weightDistribution: car.weightDistribution, 
        driveType: car.driveType 
      }));
      toast.success(`Loaded ${car.year} ${car.make} ${car.model}`);
    }
    
    setVariant(defaultTuneVariantByType[tuneType]);
    setBalance(0);
    setStiffness(50);
    setManualOverrides({});
  }, [tuneType]);

  const handleCalculate = useCallback(() => {
    setShowResults(true);
    toast.success('Tune calculated!');
  }, []);

  const handleReset = useCallback(() => {
    setSpecs(defaultSpecs);
    setTuneType('grip');
    setVariant(defaultTuneVariantByType.grip);
    setShowResults(false);
    setSelectedCar(null);
    setBalance(0);
    setStiffness(50);
    setManualOverrides({});
    
    // Clear sessionStorage on reset
    sessionStorage.removeItem('selectedCar');
  }, []);

  const handleLoadTune = useCallback((tune: { specs: CarSpecs; tuneType: TuneType }) => {
    setSpecs(tune.specs);
    setTuneType(tune.tuneType);
    setVariant(defaultTuneVariantByType[tune.tuneType]);
    setShowResults(true);
    setSelectedCar(null);
    setBalance(0);
    setStiffness(50);
    setManualOverrides({});
  }, []);

  const handleApplyAISuggestion = useCallback((setting: string, value: number) => {
    const settingMap: Record<string, keyof TuneSettings> = {
      'arb front': 'arbFront', 'arb rear': 'arbRear', 'front arb': 'arbFront', 'rear arb': 'arbRear',
      'springs front': 'springsFront', 'springs rear': 'springsRear',
    };
    const key = settingMap[setting.toLowerCase()];
    if (key) {
      setManualOverrides(prev => ({ ...prev, [key]: value }));
      toast.success(`Applied: ${setting} → ${value}`);
    }
  }, []);

  const handleApplyTemplate = useCallback((template: { modifiers: { balance: number; stiffness: number } }) => {
    setBalance(template.modifiers.balance);
    setStiffness(template.modifiers.stiffness);
    setManualOverrides({});
    toast.success(`Applied template`);
  }, []);

  const handleModeChange = useCallback((mode: 'simple' | 'advanced') => {
    setIsSimpleMode(mode === 'simple');
    navigate('/cars', { state: { tuningMode: mode } });
  }, [navigate]);

  return {
    // State
    tuneType,
    variant,
    specs,
    showResults,
    selectedCar,
    unitSystem,
    isSimpleMode,
    forceShowAdvancedOptions,
    showTroubleshooting,
    showAuthModal,
    balance,
    stiffness,
    manualOverrides,
    tuneSettings,
    carName,
    
    // Setters
    setTuneType,
    setVariant,
    setSpecs,
    setShowResults,
    setSelectedCar,
    setUnitSystem,
    setIsSimpleMode,
    setForceShowAdvancedOptions,
    setShowTroubleshooting,
    setShowAuthModal,
    setBalance,
    setStiffness,
    setManualOverrides,
    
    // Handlers
    handleCarSelect,
    handleCalculate,
    handleReset,
    handleLoadTune,
    handleApplyAISuggestion,
    handleApplyTemplate,
    handleModeChange,
  };
};
