import { useState } from 'react';
import { SavedTune } from '@/hooks/useSavedTunes';
import { TuneSettings, getUnitLabels, UnitSystem } from '@/lib/tuningCalculator';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogDescription 
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GitCompare, ArrowUp, ArrowDown, Minus } from 'lucide-react';

interface TuneCompareProps {
  savedTunes: SavedTune[];
  currentTune?: { name: string; tune: TuneSettings };
  unitSystem: UnitSystem;
}

type CompareValue = {
  key: string;
  label: string;
  tuneA: number | string;
  tuneB: number | string;
  unit?: string;
  category: string;
};

export function TuneCompare({ savedTunes, currentTune, unitSystem }: TuneCompareProps) {
  const [open, setOpen] = useState(false);
  const [tuneAId, setTuneAId] = useState<string>('');
  const [tuneBId, setTuneBId] = useState<string>('');
  
  const labels = getUnitLabels(unitSystem);
  
  const tuneA = tuneAId === 'current' && currentTune 
    ? { name: currentTune.name, tune: currentTune.tune }
    : savedTunes.find(t => t.id === tuneAId);
  const tuneB = tuneBId === 'current' && currentTune
    ? { name: currentTune.name, tune: currentTune.tune }
    : savedTunes.find(t => t.id === tuneBId);

  const getTuneValues = (tune: TuneSettings): CompareValue[] => {
    return [
      // Tires
      { key: 'tirePressureFront', label: 'Tire Pressure (F)', tuneA: tune.tirePressureFront, tuneB: 0, unit: labels.pressure, category: 'Tires' },
      { key: 'tirePressureRear', label: 'Tire Pressure (R)', tuneA: tune.tirePressureRear, tuneB: 0, unit: labels.pressure, category: 'Tires' },
      // Alignment
      { key: 'camberFront', label: 'Camber (F)', tuneA: tune.camberFront, tuneB: 0, unit: '°', category: 'Alignment' },
      { key: 'camberRear', label: 'Camber (R)', tuneA: tune.camberRear, tuneB: 0, unit: '°', category: 'Alignment' },
      { key: 'toeFront', label: 'Toe (F)', tuneA: tune.toeFront, tuneB: 0, unit: '°', category: 'Alignment' },
      { key: 'toeRear', label: 'Toe (R)', tuneA: tune.toeRear, tuneB: 0, unit: '°', category: 'Alignment' },
      { key: 'caster', label: 'Caster', tuneA: tune.caster, tuneB: 0, unit: '°', category: 'Alignment' },
      // ARB
      { key: 'arbFront', label: 'ARB (F)', tuneA: tune.arbFront, tuneB: 0, category: 'Anti-Roll Bars' },
      { key: 'arbRear', label: 'ARB (R)', tuneA: tune.arbRear, tuneB: 0, category: 'Anti-Roll Bars' },
      // Springs
      { key: 'springsFront', label: 'Springs (F)', tuneA: tune.springsFront, tuneB: 0, unit: labels.springs, category: 'Springs' },
      { key: 'springsRear', label: 'Springs (R)', tuneA: tune.springsRear, tuneB: 0, unit: labels.springs, category: 'Springs' },
      { key: 'rideHeightFront', label: 'Ride Height (F)', tuneA: tune.rideHeightFront, tuneB: 0, unit: labels.rideHeight, category: 'Springs' },
      { key: 'rideHeightRear', label: 'Ride Height (R)', tuneA: tune.rideHeightRear, tuneB: 0, unit: labels.rideHeight, category: 'Springs' },
      // Damping
      { key: 'reboundFront', label: 'Rebound (F)', tuneA: tune.reboundFront, tuneB: 0, category: 'Damping' },
      { key: 'reboundRear', label: 'Rebound (R)', tuneA: tune.reboundRear, tuneB: 0, category: 'Damping' },
      { key: 'bumpFront', label: 'Bump (F)', tuneA: tune.bumpFront, tuneB: 0, category: 'Damping' },
      { key: 'bumpRear', label: 'Bump (R)', tuneA: tune.bumpRear, tuneB: 0, category: 'Damping' },
      // Diff
      { key: 'diffAccelRear', label: 'Diff Accel (R)', tuneA: tune.diffAccelRear, tuneB: 0, unit: '%', category: 'Differential' },
      { key: 'diffDecelRear', label: 'Diff Decel (R)', tuneA: tune.diffDecelRear, tuneB: 0, unit: '%', category: 'Differential' },
      // Brakes
      { key: 'brakePressure', label: 'Brake Pressure', tuneA: tune.brakePressure, tuneB: 0, unit: '%', category: 'Brakes' },
      { key: 'brakeBalance', label: 'Brake Balance', tuneA: tune.brakeBalance, tuneB: 0, unit: '%', category: 'Brakes' },
    ];
  };

  const getValueByKey = (tune: TuneSettings, key: string): number => {
    const values: Record<string, number> = {
      tirePressureFront: tune.tirePressureFront,
      tirePressureRear: tune.tirePressureRear,
      camberFront: tune.camberFront,
      camberRear: tune.camberRear,
      toeFront: tune.toeFront,
      toeRear: tune.toeRear,
      caster: tune.caster,
      arbFront: tune.arbFront,
      arbRear: tune.arbRear,
      springsFront: tune.springsFront,
      springsRear: tune.springsRear,
      rideHeightFront: tune.rideHeightFront,
      rideHeightRear: tune.rideHeightRear,
      reboundFront: tune.reboundFront,
      reboundRear: tune.reboundRear,
      bumpFront: tune.bumpFront,
      bumpRear: tune.bumpRear,
      diffAccelRear: tune.diffAccelRear,
      diffDecelRear: tune.diffDecelRear,
      brakePressure: tune.brakePressure,
      brakeBalance: tune.brakeBalance,
    };
    return values[key] ?? 0;
  };

  const compareValues = tuneA && tuneB ? getTuneValues(tuneA.tune).map(v => ({
    ...v,
    tuneB: getValueByKey(tuneB.tune, v.key),
  })) : [];

  const getDiffIndicator = (a: number | string, b: number | string) => {
    if (typeof a !== 'number' || typeof b !== 'number') return null;
    if (a === b) return <Minus className="w-3 h-3 text-muted-foreground" />;
    if (a > b) return <ArrowUp className="w-3 h-3 text-[hsl(var(--racing-cyan))]" />;
    return <ArrowDown className="w-3 h-3 text-[hsl(var(--racing-orange))]" />;
  };

  const getDiffClass = (a: number | string, b: number | string) => {
    if (typeof a !== 'number' || typeof b !== 'number' || a === b) return '';
    return 'bg-[hsl(var(--racing-yellow)/0.1)]';
  };

  // Group by category
  const categories = [...new Set(compareValues.map(v => v.category))];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="border-[hsl(220,15%,25%)] hover:bg-[hsl(220,15%,15%)]"
          disabled={savedTunes.length < 1}
        >
          <GitCompare className="w-4 h-4 mr-2" />
          Compare
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col bg-[hsl(220,18%,8%)] border-[hsl(220,15%,20%)]">
        <DialogHeader>
          <DialogTitle className="font-display text-[hsl(var(--racing-yellow))] uppercase tracking-wider">
            Compare Tunes
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Select two tunes to compare side-by-side
          </DialogDescription>
        </DialogHeader>
        
        {/* Tune Selectors */}
        <div className="grid grid-cols-2 gap-4 pb-4 border-b border-[hsl(220,15%,20%)]">
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Tune A</label>
            <Select value={tuneAId} onValueChange={setTuneAId}>
              <SelectTrigger className="bg-[hsl(220,15%,12%)] border-[hsl(220,15%,20%)]">
                <SelectValue placeholder="Select tune..." />
              </SelectTrigger>
              <SelectContent>
                {currentTune && (
                  <SelectItem value="current">
                    📍 Current: {currentTune.name}
                  </SelectItem>
                )}
                {savedTunes.map(tune => (
                  <SelectItem key={tune.id} value={tune.id}>
                    {tune.name} ({tune.carName})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Tune B</label>
            <Select value={tuneBId} onValueChange={setTuneBId}>
              <SelectTrigger className="bg-[hsl(220,15%,12%)] border-[hsl(220,15%,20%)]">
                <SelectValue placeholder="Select tune..." />
              </SelectTrigger>
              <SelectContent>
                {currentTune && (
                  <SelectItem value="current">
                    📍 Current: {currentTune.name}
                  </SelectItem>
                )}
                {savedTunes.map(tune => (
                  <SelectItem key={tune.id} value={tune.id}>
                    {tune.name} ({tune.carName})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Comparison Table */}
        {tuneA && tuneB ? (
          <div className="flex-1 overflow-y-auto">
            {categories.map(category => (
              <div key={category} className="mb-4">
                <h4 className="text-xs font-display text-muted-foreground uppercase tracking-wider mb-2 sticky top-0 bg-[hsl(220,18%,8%)] py-1">
                  {category}
                </h4>
                <div className="space-y-1">
                  {compareValues
                    .filter(v => v.category === category)
                    .map(({ key, label, tuneA: valA, tuneB: valB, unit }) => (
                      <div 
                        key={key} 
                        className={`grid grid-cols-[1fr_80px_80px_24px] gap-2 items-center py-1 px-2 rounded text-sm ${getDiffClass(valA, valB)}`}
                      >
                        <span className="text-muted-foreground text-xs">{label}</span>
                        <span className="text-right font-mono text-[hsl(var(--racing-cyan))]">
                          {typeof valA === 'number' ? valA.toFixed(1) : valA}
                          {unit && <span className="text-[10px] text-muted-foreground ml-0.5">{unit}</span>}
                        </span>
                        <span className="text-right font-mono text-[hsl(var(--racing-orange))]">
                          {typeof valB === 'number' ? valB.toFixed(1) : valB}
                          {unit && <span className="text-[10px] text-muted-foreground ml-0.5">{unit}</span>}
                        </span>
                        <span className="flex justify-center">
                          {getDiffIndicator(valA, valB)}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            Select two tunes to compare
          </div>
        )}
        
        {/* Legend */}
        {tuneA && tuneB && (
          <div className="pt-3 border-t border-[hsl(220,15%,20%)] flex items-center justify-center gap-6 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-[hsl(var(--racing-cyan))]"></span>
              Tune A
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-[hsl(var(--racing-orange))]"></span>
              Tune B
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-[hsl(var(--racing-yellow)/0.2)]"></span>
              Different
            </span>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
