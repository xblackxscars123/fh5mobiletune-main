import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { TuneTypeSelector } from '@/components/TuneTypeSelector';
import { CarSpecsForm } from '@/components/CarSpecsForm';
import { CarSelector } from '@/components/CarSelector';
import { ForzaTunePanel } from '@/components/ForzaTunePanel';
import { SavedTunesManager } from '@/components/SavedTunesManager';
import { ShopPromoPopup } from '@/components/ShopPromoPopup';
import { JDMStickerBombBackground } from '@/components/JDMStickerBombBackground';
import { TuningExpertChat } from '@/components/TuningExpertChat';

import { Button } from '@/components/ui/button';
import { CarSpecs, TuneType, calculateTune, UnitSystem } from '@/lib/tuningCalculator';
import { FH5Car, getCarDisplayName } from '@/data/carDatabase';
import { SavedTune } from '@/hooks/useSavedTunes';
import { quickStartTips } from '@/data/tuningGuide';
import { Calculator, RotateCcw, ShoppingBag, X, Lightbulb } from 'lucide-react';
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
};

export default function Index() {
  const [tuneType, setTuneType] = useState<TuneType>('grip');
  const [specs, setSpecs] = useState<CarSpecs>(defaultSpecs);
  const [showResults, setShowResults] = useState(false);
  const [selectedCar, setSelectedCar] = useState<FH5Car | null>(null);
  const [unitSystem, setUnitSystem] = useState<UnitSystem>('imperial');
  const [showQuickStart, setShowQuickStart] = useState(true);

  const tuneSettings = useMemo(() => calculateTune(specs, tuneType), [specs, tuneType]);
  
  const carName = selectedCar ? getCarDisplayName(selectedCar) : 'Custom Car';

  const handleCarSelect = (car: FH5Car) => {
    setSelectedCar(car);
    setSpecs({
      ...specs,
      weight: car.weight,
      weightDistribution: car.weightDistribution,
      driveType: car.driveType,
    });
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
  };

  const handleLoadTune = (tune: SavedTune) => {
    setSpecs(tune.specs);
    setTuneType(tune.tuneType);
    setShowResults(true);
    // Try to find matching car
    setSelectedCar(null);
  };

  return (
    <div className="min-h-screen pb-8 md:pb-16 relative overflow-x-hidden">
      <JDMStickerBombBackground />
      <ShopPromoPopup />
      <div className="container max-w-7xl mx-auto px-3 sm:px-4 md:px-6 relative z-10">
        <Header />
        
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
            <a 
              href="https://www.paypal.com/invoice/p/#ZGYJ49YV6B3DQRGL" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-[hsl(var(--racing-yellow))] hover:bg-[hsl(var(--racing-yellow)/0.8)] text-black font-medium text-xs md:text-sm rounded-md transition-colors"
            >
              ☕ Support Development
            </a>
            <Link 
              to="/shop"
              className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-[hsl(var(--racing-orange))] hover:bg-[hsl(var(--racing-orange)/0.8)] text-black font-medium text-xs md:text-sm rounded-md transition-colors shadow-[0_0_15px_hsl(var(--racing-orange)/0.5),0_0_30px_hsl(var(--racing-orange)/0.3)] hover:shadow-[0_0_20px_hsl(var(--racing-orange)/0.7),0_0_40px_hsl(var(--racing-orange)/0.4)] animate-pulse"
              style={{ animationDuration: '2s' }}
            >
              <ShoppingBag className="w-4 h-4" />
              🔥 Garage Shop
            </Link>
          </div>
          {/* Mobile: Stack vertically */}
          <div className="flex sm:hidden flex-col items-center gap-2 mt-2">
            <a 
              href="https://www.paypal.com/invoice/p/#ZGYJ49YV6B3DQRGL" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-[hsl(var(--racing-yellow))] hover:bg-[hsl(var(--racing-yellow)/0.8)] text-black font-medium text-xs rounded-md transition-colors"
            >
              ☕ Support Development
            </a>
            <Link 
              to="/shop"
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-[hsl(var(--racing-orange))] hover:bg-[hsl(var(--racing-orange)/0.8)] text-black font-medium text-xs rounded-md transition-colors shadow-[0_0_15px_hsl(var(--racing-orange)/0.5),0_0_30px_hsl(var(--racing-orange)/0.3)] animate-pulse"
              style={{ animationDuration: '2s' }}
            >
              <ShoppingBag className="w-3 h-3" />
              🔥 Garage Shop
            </Link>
          </div>
        </div>
        
        {/* Mobile: Stack vertically, Desktop: Side by side */}
        <div className="flex flex-col lg:grid lg:grid-cols-[minmax(320px,400px)_1fr] gap-4 md:gap-6">
          {/* Left Panel - Setup */}
          <div className="space-y-3 md:space-y-4">
            {/* Tune Type */}
            <div className="bg-[hsl(220,18%,8%)] rounded-lg p-3 md:p-4 border border-[hsl(220,15%,18%)]">
              <TuneTypeSelector selected={tuneType} onChange={setTuneType} />
            </div>
            
            {/* Car Selector */}
            <div className="bg-[hsl(220,18%,8%)] rounded-lg p-3 md:p-4 border border-[hsl(220,15%,18%)]">
              <CarSelector onSelect={handleCarSelect} selectedCar={selectedCar} />
            </div>
            
            {/* Car Specs */}
            <div className="bg-[hsl(220,18%,8%)] rounded-lg p-3 md:p-4 border border-[hsl(220,15%,18%)]">
              <h3 className="font-display text-sm text-[hsl(var(--racing-yellow))] mb-3 md:mb-4 uppercase tracking-wider">
                Car Specifications
              </h3>
              <CarSpecsForm 
                specs={specs} 
                onChange={setSpecs} 
                unitSystem={unitSystem}
                onUnitSystemChange={setUnitSystem}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2 md:gap-3">
              <Button 
                onClick={handleCalculate} 
                className="flex-1 bg-[hsl(var(--racing-yellow))] hover:bg-[hsl(45,100%,45%)] text-black font-display uppercase tracking-wider h-10 md:h-12 text-sm md:text-base"
              >
                <Calculator className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                Calculate Tune
              </Button>
              <Button 
                variant="outline" 
                onClick={handleReset}
                className="h-10 md:h-12 px-3 md:px-4 border-[hsl(220,15%,25%)] hover:bg-[hsl(220,15%,15%)]"
              >
                <RotateCcw className="w-4 h-4 md:w-5 md:h-5" />
              </Button>
            </div>
            
            {/* Save/Load */}
            <SavedTunesManager 
              carName={carName}
              tuneType={tuneType}
              specs={specs}
              onLoad={handleLoadTune}
            />
          </div>

          {/* Right Panel - Tune Results (Forza Style) */}
          <div className={showResults ? 'animate-fade-in' : 'opacity-30 pointer-events-none'}>
            <ForzaTunePanel 
              tune={tuneSettings} 
              driveType={specs.driveType} 
              tuneType={tuneType}
              unitSystem={unitSystem}
            />
          </div>
        </div>

        <footer className="mt-8 md:mt-16 text-center text-muted-foreground text-xs px-4">
          <p>Based on community tuning guides. Not affiliated with Playground Games.</p>
        </footer>
        
        {/* AI Tuning Expert Chat */}
        <TuningExpertChat />
      </div>
    </div>
  );
}
