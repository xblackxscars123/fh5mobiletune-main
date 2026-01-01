import { CarSpecs, DriveType, piClasses, tireCompounds } from '@/lib/tuningCalculator';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Car, Gauge, Scale, Compass } from 'lucide-react';

interface CarSpecsFormProps {
  specs: CarSpecs;
  onChange: (specs: CarSpecs) => void;
}

const driveTypes: DriveType[] = ['RWD', 'FWD', 'AWD'];

export function CarSpecsForm({ specs, onChange }: CarSpecsFormProps) {
  const updateSpec = <K extends keyof CarSpecs>(key: K, value: CarSpecs[K]) => {
    onChange({ ...specs, [key]: value });
  };

  return (
    <div className="space-y-8">
      {/* Weight Input */}
      <div className="space-y-3">
        <Label className="flex items-center gap-2 text-base font-display">
          <Scale className="w-5 h-5 text-primary" />
          Vehicle Weight (lbs)
        </Label>
        <Input
          type="number"
          value={specs.weight}
          onChange={(e) => updateSpec('weight', Number(e.target.value))}
          className="bg-muted border-border focus:border-primary text-lg font-body h-12"
          min={1000}
          max={10000}
        />
        <Slider
          value={[specs.weight]}
          onValueChange={([v]) => updateSpec('weight', v)}
          min={1000}
          max={6000}
          step={10}
        />
        <p className="text-xs text-muted-foreground">
          Find this in the tuning menu under "Car Stats"
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
