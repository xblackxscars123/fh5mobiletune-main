import { useState, useMemo } from 'react';
import { Header } from '@/components/Header';
import { TuneTypeSelector } from '@/components/TuneTypeSelector';
import { CarSpecsForm } from '@/components/CarSpecsForm';
import { CarSelector } from '@/components/CarSelector';
import { ForzaTunePanel } from '@/components/ForzaTunePanel';
import { SavedTunesManager } from '@/components/SavedTunesManager';
import { Button } from '@/components/ui/button';
import { CarSpecs, TuneType, calculateTune, UnitSystem } from '@/lib/tuningCalculator';
import { FH5Car, getCarDisplayName } from '@/data/carDatabase';
import { SavedTune } from '@/hooks/useSavedTunes';
import { Calculator, RotateCcw } from 'lucide-react';
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
    <div className="min-h-screen pb-16">
      <div className="container max-w-7xl mx-auto px-4">
        <Header />
        
        {/* Development Help Banner */}
        <div className="mb-6 bg-gradient-to-r from-[hsl(var(--racing-yellow)/0.15)] via-[hsl(var(--racing-yellow)/0.1)] to-[hsl(var(--racing-yellow)/0.15)] border border-[hsl(var(--racing-yellow)/0.3)] rounded-lg p-4 text-center">
          <p className="text-sm text-[hsl(var(--racing-yellow))] font-medium">
            🛠️ <span className="font-display uppercase tracking-wide">We'd love your help developing this app!</span> 🛠️
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Got ideas, found bugs, or want to contribute? Drop a comment on the Reddit post!
          </p>
        </div>
        
        <div className="grid lg:grid-cols-[400px_1fr] gap-6">
          {/* Left Panel - Setup */}
          <div className="space-y-4">
            {/* Tune Type */}
            <div className="bg-[hsl(220,18%,8%)] rounded-lg p-4 border border-[hsl(220,15%,18%)]">
              <TuneTypeSelector selected={tuneType} onChange={setTuneType} />
            </div>
            
            {/* Car Selector */}
            <div className="bg-[hsl(220,18%,8%)] rounded-lg p-4 border border-[hsl(220,15%,18%)]">
              <CarSelector onSelect={handleCarSelect} selectedCar={selectedCar} />
            </div>
            
            {/* Car Specs */}
            <div className="bg-[hsl(220,18%,8%)] rounded-lg p-4 border border-[hsl(220,15%,18%)]">
              <h3 className="font-display text-sm text-[hsl(var(--racing-yellow))] mb-4 uppercase tracking-wider">
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
            <div className="flex gap-3">
              <Button 
                onClick={handleCalculate} 
                className="flex-1 bg-[hsl(var(--racing-yellow))] hover:bg-[hsl(45,100%,45%)] text-black font-display uppercase tracking-wider h-12"
              >
                <Calculator className="w-5 h-5 mr-2" />
                Calculate Tune
              </Button>
              <Button 
                variant="outline" 
                onClick={handleReset}
                className="h-12 px-4 border-[hsl(220,15%,25%)] hover:bg-[hsl(220,15%,15%)]"
              >
                <RotateCcw className="w-5 h-5" />
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

        <footer className="mt-16 text-center text-muted-foreground text-xs">
          <p>Based on community tuning guides. Not affiliated with Playground Games.</p>
        </footer>
      </div>
    </div>
  );
}
