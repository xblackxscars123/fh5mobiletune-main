import { useState, useMemo } from 'react';
import { Header } from '@/components/Header';
import { TuneTypeSelector } from '@/components/TuneTypeSelector';
import { CarSpecsForm } from '@/components/CarSpecsForm';
import { TuneResults } from '@/components/TuneResults';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  CarSpecs, 
  TuneType, 
  calculateTune, 
} from '@/lib/tuningCalculator';
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

  const tuneSettings = useMemo(() => {
    return calculateTune(specs, tuneType);
  }, [specs, tuneType]);

  const handleCalculate = () => {
    setShowResults(true);
    toast.success('Tune calculated successfully!', {
      description: `${tuneType.charAt(0).toUpperCase() + tuneType.slice(1)} tune ready for your ${specs.driveType} car`,
    });
  };

  const handleReset = () => {
    setSpecs(defaultSpecs);
    setTuneType('grip');
    setShowResults(false);
    toast.info('Settings reset to defaults');
  };

  const handleShare = () => {
    const shareText = `FH5 Tune: ${specs.weight}lbs, ${specs.weightDistribution}% front, ${specs.driveType}, ${tuneType} setup`;
    navigator.clipboard.writeText(shareText);
    toast.success('Tune summary copied to clipboard!');
  };

  return (
    <div className="min-h-screen pb-16">
      <div className="container max-w-7xl mx-auto px-4">
        <Header />
        
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Input */}
          <div className="space-y-6">
            <Card className="card-racing p-6">
              <TuneTypeSelector selected={tuneType} onChange={setTuneType} />
            </Card>
            
            <Card className="card-racing p-6">
              <h3 className="font-display text-lg text-primary mb-6">Enter Car Specifications</h3>
              <CarSpecsForm specs={specs} onChange={setSpecs} />
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button 
                variant="racing" 
                size="xl" 
                onClick={handleCalculate}
                className="flex-1"
              >
                <Calculator className="w-5 h-5" />
                Calculate Tune
              </Button>
              <Button 
                variant="outline" 
                size="xl"
                onClick={handleReset}
              >
                <RotateCcw className="w-5 h-5" />
              </Button>
              {showResults && (
                <Button 
                  variant="outline" 
                  size="xl"
                  onClick={handleShare}
                >
                  <Share2 className="w-5 h-5" />
                </Button>
              )}
            </div>
          </div>

          {/* Right Column - Results */}
          <div className={showResults ? 'animate-fade-in' : 'opacity-30 pointer-events-none'}>
            <TuneResults tune={tuneSettings} driveType={specs.driveType} />
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center text-muted-foreground text-sm">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="h-px w-8 bg-border" />
            <span className="font-display text-xs uppercase tracking-wider">Forza Horizon 5 Tuning Calculator</span>
            <div className="h-px w-8 bg-border" />
          </div>
          <p>Based on community tuning guides. Not affiliated with Playground Games or Microsoft.</p>
          <p className="mt-1">Use these settings as a starting point and adjust to your driving style.</p>
        </footer>
      </div>
    </div>
  );
}
