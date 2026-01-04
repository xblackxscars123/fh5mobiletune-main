import { CarSpecs, DriveType, piClasses, tireCompounds, UnitSystem } from '@/lib/tuningCalculator';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Car, Gauge, Scale, Compass, Zap, Settings2 } from 'lucide-react';

interface CarSpecsFormProps {
  specs: CarSpecs;
  onChange: (specs: CarSpecs) => void;
  unitSystem: UnitSystem;
  onUnitSystemChange: (system: UnitSystem) => void;
}

const driveTypes: DriveType[] = ['RWD', 'FWD', 'AWD'];
const gearCounts = [4, 5, 6, 7, 8, 9, 10];

export function CarSpecsForm({ specs, onChange, unitSystem, onUnitSystemChange }: CarSpecsFormProps) {
  const updateSpec = <K extends keyof CarSpecs>(key: K, value: CarSpecs[K]) => {
    onChange({ ...specs, [key]: value });
  };

  const weightLabel = unitSystem === 'imperial' ? 'lbs' : 'kg';
  const displayWeight = unitSystem === 'imperial' ? specs.weight : Math.round(specs.weight * 0.453592);

  return (
    <div className="space-y-8">
      {/* Unit System Toggle */}
      <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30">
        <Label className="flex items-center gap-2 text-base font-display">
          <Settings2 className="w-5 h-5 text-primary" />
          Unit System
        </Label>
        <div className="flex gap-2">
          <Button
            variant={unitSystem === 'imperial' ? 'tuneTypeActive' : 'tuneType'}
            onClick={() => onUnitSystemChange('imperial')}
            size="sm"
          >
            Imperial (lbs, PSI, in)
          </Button>
          <Button
            variant={unitSystem === 'metric' ? 'tuneTypeActive' : 'tuneType'}
            onClick={() => onUnitSystemChange('metric')}
            size="sm"
          >
            Metric (kg, bar, cm)
          </Button>
        </div>
      </div>

      {/* Weight & Horsepower Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Weight Input */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-base font-display">
            <Scale className="w-5 h-5 text-primary" />
            Vehicle Weight ({weightLabel})
          </Label>
          <Input
            type="number"
            value={displayWeight}
            onChange={(e) => {
              const value = Number(e.target.value);
              const lbsValue = unitSystem === 'imperial' ? value : Math.round(value * 2.20462);
              updateSpec('weight', lbsValue);
            }}
            className="bg-muted border-border focus:border-primary text-lg font-body h-12"
            min={unitSystem === 'imperial' ? 1000 : 454}
            max={unitSystem === 'imperial' ? 10000 : 4536}
          />
          <Slider
            value={[displayWeight]}
            onValueChange={([v]) => {
              const lbsValue = unitSystem === 'imperial' ? v : Math.round(v * 2.20462);
              updateSpec('weight', lbsValue);
            }}
            min={unitSystem === 'imperial' ? 1000 : 454}
            max={unitSystem === 'imperial' ? 6000 : 2722}
            step={unitSystem === 'imperial' ? 10 : 5}
          />
        </div>

        {/* Horsepower Input */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-base font-display">
            <Zap className="w-5 h-5 text-racing-yellow" />
            Horsepower (HP)
          </Label>
          <Input
            type="number"
            value={specs.horsepower || 400}
            onChange={(e) => updateSpec('horsepower', Number(e.target.value))}
            className="bg-muted border-border focus:border-primary text-lg font-body h-12"
            min={50}
            max={3000}
          />
          <Slider
            value={[specs.horsepower || 400]}
            onValueChange={([v]) => updateSpec('horsepower', v)}
            min={100}
            max={2000}
            step={10}
          />
          <p className="text-xs text-muted-foreground">
            {(specs.horsepower || 400) >= 400 ? (
              <span className="text-racing-yellow">High power mode: Springs & dampers adjusted</span>
            ) : (
              'Standard power settings'
            )}
          </p>
        </div>
      </div>

      {/* Gear Count */}
      <div className="space-y-3">
        <Label className="flex items-center gap-2 text-base font-display">
          <Settings2 className="w-5 h-5 text-racing-cyan" />
          Number of Gears
        </Label>
        <div className="flex gap-2 flex-wrap">
          {gearCounts.map((count) => (
            <Button
              key={count}
              variant={(specs.gearCount || 6) === count ? 'tuneTypeActive' : 'tuneType'}
              onClick={() => updateSpec('gearCount', count)}
              size="sm"
              className="min-w-[50px]"
            >
              {count}
            </Button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          Select the number of forward gears in your transmission
        </p>
      </div>

      {/* Weight Distribution */}
      <div className="space-y-3">
        <Label className="flex items-center gap-2 text-base font-display">
          <Compass className="w-5 h-5 text-primary" />
          Weight Distribution (Front %)
        </Label>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground w-16">Front</span>
          <Slider
            value={[specs.weightDistribution]}
            onValueChange={([v]) => updateSpec('weightDistribution', v)}
            min={35}
            max={65}
            step={1}
            className="flex-1"
          />
          <span className="text-sm text-muted-foreground w-16 text-right">Rear</span>
        </div>
        <div className="flex justify-between text-lg font-display">
          <span className="text-primary">{specs.weightDistribution}%</span>
          <span className="text-racing-cyan">{100 - specs.weightDistribution}%</span>
        </div>
      </div>

      {/* Drive Type */}
      <div className="space-y-3">
        <Label className="flex items-center gap-2 text-base font-display">
          <Car className="w-5 h-5 text-primary" />
          Drive Type
        </Label>
        <div className="flex gap-2">
          {driveTypes.map((type) => (
            <Button
              key={type}
              variant={specs.driveType === type ? 'tuneTypeActive' : 'tuneType'}
              onClick={() => updateSpec('driveType', type)}
              className="flex-1"
            >
              {type}
            </Button>
          ))}
        </div>
      </div>

      {/* PI Class */}
      <div className="space-y-3">
        <Label className="flex items-center gap-2 text-base font-display">
          <Gauge className="w-5 h-5 text-primary" />
          PI Class
        </Label>
        <div className="flex gap-2 flex-wrap">
          {piClasses.map((piClass) => (
            <Button
              key={piClass}
              variant={specs.piClass === piClass ? 'tuneTypeActive' : 'tuneType'}
              onClick={() => updateSpec('piClass', piClass)}
              size="sm"
              className={cn(
                "min-w-[50px]",
                piClass === 'X' && "text-racing-red",
                (piClass === 'S1' || piClass === 'S2') && "text-racing-yellow"
              )}
            >
              {piClass}
            </Button>
          ))}
        </div>
      </div>

      {/* Tire Compound */}
      <div className="space-y-3">
        <Label className="text-base font-display">Tire Compound</Label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {tireCompounds.map((compound) => (
            <Button
              key={compound.value}
              variant={specs.tireCompound === compound.value ? 'tuneTypeActive' : 'tuneType'}
              onClick={() => updateSpec('tireCompound', compound.value as CarSpecs['tireCompound'])}
              size="sm"
            >
              {compound.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Aero Options */}
      <div className="space-y-4 p-4 rounded-lg border border-border bg-muted/30">
        <div className="flex items-center justify-between">
          <Label className="text-base font-display">Has Aero Parts?</Label>
          <Switch
            checked={specs.hasAero}
            onCheckedChange={(v) => updateSpec('hasAero', v)}
          />
        </div>
        
        {specs.hasAero && (
          <div className="space-y-4 pt-4 border-t border-border animate-fade-in">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm">Front Downforce (lbs)</Label>
                <Input
                  type="number"
                  value={specs.frontDownforce || 0}
                  onChange={(e) => updateSpec('frontDownforce', Number(e.target.value))}
                  className="bg-background"
                  min={0}
                  max={500}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Rear Downforce (lbs)</Label>
                <Input
                  type="number"
                  value={specs.rearDownforce || 0}
                  onChange={(e) => updateSpec('rearDownforce', Number(e.target.value))}
                  className="bg-background"
                  min={0}
                  max={500}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
