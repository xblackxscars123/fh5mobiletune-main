import { CarSpecs, DriveType, UnitSystem, unitConversions } from '@/lib/tuningCalculator';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { TuningTooltip } from '@/components/TuningTooltip';
import { inputExplanations } from '@/data/tuningGuide';
import { Car, Compass, Scale, Settings2 } from 'lucide-react';

interface SimpleModeFormProps {
  specs: CarSpecs;
  onChange: (specs: CarSpecs) => void;
  unitSystem: UnitSystem;
  onUnitSystemChange: (system: UnitSystem) => void;
}

const driveTypes: DriveType[] = ['RWD', 'FWD', 'AWD'];

export function SimpleModeForm({ specs, onChange, unitSystem, onUnitSystemChange }: SimpleModeFormProps) {
  const updateSpec = <K extends keyof CarSpecs>(key: K, value: CarSpecs[K]) => {
    onChange({ ...specs, [key]: value });
  };

  const weightLabel = unitSystem === 'imperial' ? 'lbs' : 'kg';
  const displayWeight = unitSystem === 'imperial' ? specs.weight : Math.round(specs.weight * 0.453592);

  return (
    <div className="space-y-4">
      {/* Unit Toggle - TOP priority */}
      <div className="flex items-center justify-between p-2 rounded-lg border border-border bg-muted/30">
        <Label className="flex items-center gap-2 text-sm font-display">
          <Settings2 className="w-4 h-4 text-primary" />
          Units
        </Label>
        <div className="flex gap-1">
          <Button
            variant={unitSystem === 'imperial' ? 'tuneTypeActive' : 'tuneType'}
            onClick={() => onUnitSystemChange('imperial')}
            size="sm"
            className="text-xs px-2"
          >
            lbs/HP
          </Button>
          <Button
            variant={unitSystem === 'metric' ? 'tuneTypeActive' : 'tuneType'}
            onClick={() => onUnitSystemChange('metric')}
            size="sm"
            className="text-xs px-2"
          >
            kg/kW
          </Button>
        </div>
      </div>

      {/* Weight Distribution - THE KEY INPUT */}
      <div className="space-y-3 p-4 rounded-lg border-2 border-[hsl(var(--racing-yellow))] bg-[hsl(var(--racing-yellow)/0.1)]">
        <TuningTooltip explanation={inputExplanations.weightDistribution} showIcon>
          <Label className="flex items-center gap-2 text-base font-display text-[hsl(var(--racing-yellow))]">
            <Compass className="w-5 h-5" />
            Weight Distribution ⭐
          </Label>
        </TuningTooltip>
        <p className="text-xs text-muted-foreground">
          This is the ONLY number that really matters. Find it in your car's stats.
        </p>
        
        {/* Direct Input - Primary */}
        <div className="flex items-center gap-3">
          <Input
            id="specs-first-input"
            type="number"
            value={specs.weightDistribution}
            onChange={(e) => updateSpec('weightDistribution', Math.max(35, Math.min(65, Number(e.target.value))))}
            className="w-20 text-center text-lg font-bold bg-background border-[hsl(var(--racing-yellow))]"
            min={35}
            max={65}
          />
          <span className="text-sm text-muted-foreground">% Front</span>
          <span className="text-sm text-muted-foreground mx-2">|</span>
          <span className="text-lg font-bold text-[hsl(var(--racing-cyan))]">{100 - specs.weightDistribution}%</span>
          <span className="text-sm text-muted-foreground">Rear</span>
        </div>
        
        {/* Slider - Secondary */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground w-8">35%</span>
          <Slider
            value={[specs.weightDistribution]}
            onValueChange={([v]) => updateSpec('weightDistribution', v)}
            min={35}
            max={65}
            step={1}
            className="flex-1"
          />
          <span className="text-xs text-muted-foreground w-8 text-right">65%</span>
        </div>
      </div>

      {/* Drive Type */}
      <div className="space-y-2">
        <TuningTooltip explanation={inputExplanations.driveType} showIcon>
          <Label className="flex items-center gap-2 text-sm font-display">
            <Car className="w-4 h-4 text-primary" />
            Drive Type
          </Label>
        </TuningTooltip>
        <div className="flex gap-2">
          {driveTypes.map((type) => (
            <Button
              key={type}
              variant={specs.driveType === type ? 'tuneTypeActive' : 'tuneType'}
              onClick={() => updateSpec('driveType', type)}
              className="flex-1 text-sm"
            >
              {type}
            </Button>
          ))}
        </div>
      </div>

      {/* Weight - Direct Input Only */}
      <div className="space-y-2">
        <TuningTooltip explanation={inputExplanations.weight} showIcon>
          <Label className="flex items-center gap-2 text-sm font-display">
            <Scale className="w-4 h-4 text-primary" />
            Weight ({weightLabel})
          </Label>
        </TuningTooltip>
        <Input
          type="number"
          value={displayWeight}
          onChange={(e) => {
            const value = Number(e.target.value);
            const lbsValue = unitSystem === 'imperial' ? value : Math.round(value * 2.20462);
            updateSpec('weight', lbsValue);
          }}
          className="bg-muted border-border text-base h-10"
          min={unitSystem === 'imperial' ? 1000 : 454}
          max={unitSystem === 'imperial' ? 10000 : 4536}
          placeholder={unitSystem === 'imperial' ? "e.g. 3000" : "e.g. 1360"}
        />
      </div>

      {/* Quick Info */}
      <div className="text-xs text-muted-foreground p-3 rounded bg-muted/50 border border-border">
        <p className="font-medium text-foreground mb-1">💡 HokiHoshi Method</p>
        <p>This uses pure weight-based slider math — the same simple formula from the 10-minute guide. 
           Just enter your weight distribution and you'll get a solid baseline to work from.</p>
      </div>
    </div>
  );
}