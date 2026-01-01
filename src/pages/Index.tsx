import { useState, useMemo } from 'react';
import { Header } from '@/components/Header';
import { TuneTypeSelector } from '@/components/TuneTypeSelector';
import { CarSpecsForm } from '@/components/CarSpecsForm';
import { CarSelector } from '@/components/CarSelector';
import { TuneResults } from '@/components/TuneResults';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CarSpecs, TuneType, calculateTune } from '@/lib/tuningCalculator';
import { FH5Car } from '@/data/carDatabase';
import { Calculator, RotateCcw, Share2 } from 'lucide-react';
import { toast } from 'sonner';

const defaultSpecs: CarSpecs = {
  weight: 3000,
  weightDistribution: 52,
  driveType: 'RWD',
  piClass: 'A',
  hasAero: false,
  tireCompound: 'sport',
};

export default function Index() {
  const [tuneType, setTuneType] = useState<TuneType>('grip');
  const [specs, setSpecs] = useState<CarSpecs>(defaultSpecs);
  const [showResults, setShowResults] = useState(false);
  const [selectedCar, setSelectedCar] = useState<FH5Car | null>(null);

  const tuneSettings = useMemo(() => calculateTune(specs, tuneType), [specs, tuneType]);

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

  return (
    <div className="min-h-screen pb-16">
      <div className="container max-w-7xl mx-auto px-4">
        <Header />
        
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <Card className="card-racing p-6">
              <TuneTypeSelector selected={tuneType} onChange={setTuneType} />
            </Card>
            
            <Card className="card-racing p-6">
              <CarSelector onSelect={handleCarSelect} selectedCar={selectedCar} />
            </Card>
            
            <Card className="card-racing p-6">
              <h3 className="font-display text-lg text-primary mb-6">Car Specifications</h3>
              <CarSpecsForm specs={specs} onChange={setSpecs} />
            </Card>

            <div className="flex gap-3">
              <Button variant="racing" size="xl" onClick={handleCalculate} className="flex-1">
                <Calculator className="w-5 h-5" />
                Calculate Tune
              </Button>
              <Button variant="outline" size="xl" onClick={handleReset}>
                <RotateCcw className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <div className={showResults ? 'animate-fade-in' : 'opacity-30 pointer-events-none'}>
            <TuneResults tune={tuneSettings} driveType={specs.driveType} />
          </div>
        </div>

        <footer className="mt-16 text-center text-muted-foreground text-sm">
          <p>Based on community tuning guides. Not affiliated with Playground Games.</p>
        </footer>
      </div>
    </div>
  );
}
