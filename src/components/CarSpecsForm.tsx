import { useState } from 'react';
import { CarSpecs, DriveType, piClasses, tireCompounds, UnitSystem, unitConversions } from '@/lib/tuningCalculator';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { TuningTooltip } from '@/components/TuningTooltip';
import { inputExplanations } from '@/data/tuningGuide';
import { cn } from '@/lib/utils';
import { Car, Compass, Scale, ChevronDown, ChevronUp, Zap, Settings2, Gauge } from 'lucide-react';

interface CarSpecsFormProps {
  specs: CarSpecs;
  onChange: (specs: CarSpecs) => void;
  unitSystem: UnitSystem;
  onUnitSystemChange: (system: UnitSystem) => void;
}

const driveTypes: DriveType[] = ['RWD', 'FWD', 'AWD'];
const gearCounts = [4, 5, 6, 7, 8, 9, 10];

export function CarSpecsForm({ specs, onChange, unitSystem, onUnitSystemChange }: CarSpecsFormProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const updateSpec = <K extends keyof CarSpecs>(key: K, value: CarSpecs[K]) => {
    onChange({ ...specs, [key]: value });
  };

  const weightLabel = unitSystem === 'imperial' ? 'lbs' : 'kg';
  const powerLabel = unitSystem === 'imperial' ? 'HP' : 'kW';
  const displayWeight = unitSystem === 'imperial' ? specs.weight : Math.round(specs.weight * 0.453592);
  const displayPower = unitSystem === 'imperial' 
    ? (specs.horsepower || 400) 
    : unitConversions.hpToKw(specs.horsepower || 400);

  return (
    <div className="space-y-5 md:space-y-6">
      {/* Unit System Toggle - TOP */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:justify-between p-2 sm:p-3 rounded-lg border border-[hsl(var(--racing-cyan)/0.3)] bg-[hsl(var(--racing-cyan)/0.05)]">
        <Label className="flex items-center gap-2 text-sm md:text-base font-display">
          <Settings2 className="w-4 h-4 md:w-5 md:h-5 text-[hsl(var(--racing-cyan))]" />
          Units
        </Label>
        <div className="flex gap-1.5 sm:gap-2">
          <Button
            variant={unitSystem === 'imperial' ? 'tuneTypeActive' : 'tuneType'}
            onClick={() => onUnitSystemChange('imperial')}
            size="sm"
            className="flex-1 sm:flex-none text-xs sm:text-sm px-2 sm:px-3"
          >
            lbs / HP / PSI
          </Button>
          <Button
            variant={unitSystem === 'metric' ? 'tuneTypeActive' : 'tuneType'}
            onClick={() => onUnitSystemChange('metric')}
            size="sm"
            className="flex-1 sm:flex-none text-xs sm:text-sm px-2 sm:px-3"
          >
            kg / kW / bar
          </Button>
        </div>
      </div>

      {/* Essential Settings Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-xs text-[hsl(var(--racing-yellow))] uppercase tracking-wide">
          <span>⚡</span>
          <span>Essential Settings</span>
        </div>

        {/* Drive Type - First, it's a quick decision */}
        <div className="space-y-2 md:space-y-3">
          <TuningTooltip explanation={inputExplanations.driveType} showIcon>
            <Label className="flex items-center gap-2 text-sm md:text-base font-display">
              <Car className="w-4 h-4 md:w-5 md:h-5 text-primary" />
              Drive Type
            </Label>
          </TuningTooltip>
          <div className="flex gap-1.5 sm:gap-2">
            {driveTypes.map((type) => (
              <Button
                key={type}
                variant={specs.driveType === type ? 'tuneTypeActive' : 'tuneType'}
                onClick={() => updateSpec('driveType', type)}
                className="flex-1 text-xs sm:text-sm"
              >
                {type}
              </Button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            {specs.driveType === 'RWD' && 'Rear wheels only — best for drifting & control'}
            {specs.driveType === 'FWD' && 'Front wheels only — stable & predictable'}
            {specs.driveType === 'AWD' && 'All wheels — maximum traction & easier handling'}
          </p>
        </div>

        {/* Weight Input */}
        <div className="space-y-2 md:space-y-3">
          <TuningTooltip explanation={inputExplanations.weight} showIcon>
            <Label className="flex items-center gap-2 text-sm md:text-base font-display">
              <Scale className="w-4 h-4 md:w-5 md:h-5 text-primary" />
              Vehicle Weight ({weightLabel})
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
            className="bg-muted border-border focus:border-primary text-base md:text-lg font-body h-10 md:h-12"
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

        {/* Weight Distribution - THE most important! */}
        <div className="space-y-2 md:space-y-3 p-3 rounded-lg border-2 border-[hsl(var(--racing-yellow)/0.3)] bg-[hsl(var(--racing-yellow)/0.05)]">
          <TuningTooltip explanation={inputExplanations.weightDistribution} showIcon>
            <Label className="flex items-center gap-2 text-sm md:text-base font-display text-[hsl(var(--racing-yellow))]">
              <Compass className="w-4 h-4 md:w-5 md:h-5" />
              Weight Distribution (Front %) ⭐ MOST IMPORTANT
            </Label>
          </TuningTooltip>
          
          {/* Direct Input - Primary */}
          <div className="flex items-center gap-3">
            <Input
              type="number"
              value={specs.weightDistribution}
              onChange={(e) => updateSpec('weightDistribution', Math.max(35, Math.min(65, Number(e.target.value))))}
              className="w-20 text-center text-lg font-bold bg-background border-[hsl(var(--racing-yellow)/0.5)]"
              min={35}
              max={65}
            />
            <span className="text-sm text-muted-foreground">% Front</span>
            <span className="text-sm text-muted-foreground mx-1">|</span>
            <span className="text-lg font-bold text-[hsl(var(--racing-cyan))]">{100 - specs.weightDistribution}%</span>
            <span className="text-sm text-muted-foreground">Rear</span>
          </div>
          
          {/* Slider - Secondary */}
          <div className="flex items-center gap-2 sm:gap-4">
            <span className="text-xs sm:text-sm text-muted-foreground w-10 sm:w-16">Front</span>
            <Slider
              value={[specs.weightDistribution]}
              onValueChange={([v]) => updateSpec('weightDistribution', v)}
              min={35}
              max={65}
              step={1}
              className="flex-1"
            />
            <span className="text-xs sm:text-sm text-muted-foreground w-10 sm:w-16 text-right">Rear</span>
          </div>
          <p className="text-xs text-muted-foreground">
            📊 Find this in your car's stats screen. This determines springs, ARBs, and damping!
          </p>
        </div>

        {/* Aero Options */}
        <div className="space-y-3 md:space-y-4 p-3 md:p-4 rounded-lg border border-border bg-muted/30">
          <div className="flex items-center justify-between">
            <TuningTooltip explanation={inputExplanations.hasAero} showIcon>
              <Label className="text-sm md:text-base font-display">Has Aero Parts?</Label>
            </TuningTooltip>
            <Switch
              checked={specs.hasAero}
              onCheckedChange={(v) => updateSpec('hasAero', v)}
            />
          </div>
          
          {specs.hasAero && (
            <div className="space-y-3 md:space-y-4 pt-3 md:pt-4 border-t border-border animate-fade-in">
              <p className="text-xs text-muted-foreground">
                Enter your aero's <strong>maximum</strong> downforce range. The calculator will determine optimal settings.
              </p>
              <div className="grid grid-cols-2 gap-2 sm:gap-4">
                <div className="space-y-1.5 md:space-y-2">
                  <Label className="text-xs sm:text-sm">Max Front Downforce (lbs)</Label>
                  <Input
                    type="number"
                    value={specs.frontDownforce || 400}
                    onChange={(e) => updateSpec('frontDownforce', Number(e.target.value))}
                    className="bg-background h-9 md:h-10 text-sm"
                    min={0}
                    max={500}
                    placeholder="400"
                  />
                </div>
                <div className="space-y-1.5 md:space-y-2">
                  <Label className="text-xs sm:text-sm">Max Rear Downforce (lbs)</Label>
                  <Input
                    type="number"
                    value={specs.rearDownforce || 400}
                    onChange={(e) => updateSpec('rearDownforce', Number(e.target.value))}
                    className="bg-background h-9 md:h-10 text-sm"
                    min={0}
                    max={500}
                    placeholder="400"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Advanced Options Toggle */}
      <Button
        variant="ghost"
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="w-full justify-between text-muted-foreground hover:text-foreground"
      >
        <span className="text-xs uppercase tracking-wide">
          {showAdvanced ? 'Hide' : 'Show'} Advanced Options
        </span>
        {showAdvanced ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </Button>

      {/* Advanced Settings - Collapsed by default */}
      {showAdvanced && (
        <div className="space-y-5 md:space-y-6 pt-2 animate-fade-in">
          <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wide">
            <span>⚙️</span>
            <span>Advanced Settings</span>
          </div>

          {/* Driving Style Slider */}
          <div className="space-y-2 md:space-y-3 p-3 rounded-lg border border-primary/30 bg-primary/5">
            <Label className="flex items-center gap-2 text-sm md:text-base font-display">
              <Gauge className="w-4 h-4 md:w-5 md:h-5 text-primary" />
              Driving Style
            </Label>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Stable</span>
              <span className="font-medium text-primary">
                {(specs.drivingStyle || 0) === 0 ? 'Neutral' : 
                 (specs.drivingStyle || 0) < 0 ? 'Understeer bias' : 'Oversteer bias'}
              </span>
              <span className="text-muted-foreground">Loose</span>
            </div>
            <Slider
              value={[specs.drivingStyle || 0]}
              onValueChange={([v]) => updateSpec('drivingStyle', v)}
              min={-2}
              max={2}
              step={1}
            />
            <p className="text-xs text-muted-foreground">
              Adjusts ARBs & differential for your preferred handling feel
            </p>
          </div>

          {/* Power Input */}
          <div className="space-y-2 md:space-y-3">
            <TuningTooltip explanation={inputExplanations.horsepower} showIcon>
              <Label className="flex items-center gap-2 text-sm md:text-base font-display">
                <Zap className="w-4 h-4 md:w-5 md:h-5 text-[hsl(var(--racing-yellow))]" />
                Power ({powerLabel})
              </Label>
            </TuningTooltip>
            <Input
              type="number"
              value={displayPower}
              onChange={(e) => {
                const value = Number(e.target.value);
                const hpValue = unitSystem === 'imperial' ? value : unitConversions.kwToHp(value);
                updateSpec('horsepower', hpValue);
              }}
              className="bg-muted border-border focus:border-primary text-base md:text-lg font-body h-10 md:h-12"
              min={unitSystem === 'imperial' ? 50 : 37}
              max={unitSystem === 'imperial' ? 3000 : 2237}
              placeholder={unitSystem === 'imperial' ? "e.g. 400" : "e.g. 298"}
            />
            <p className="text-xs text-muted-foreground">
              {(specs.horsepower || 400) >= 600 ? (
                <span className="text-[hsl(var(--racing-yellow))]">⚡ High power: +{Math.round(((specs.horsepower || 400) / 400 - 1) * 30)}% stiffness</span>
              ) : (
                'Power-to-weight scaling active'
              )}
            </p>
          </div>

          {/* Gear Count */}
          <div className="space-y-2 md:space-y-3">
            <TuningTooltip explanation={inputExplanations.gearCount} showIcon>
              <Label className="flex items-center gap-2 text-sm md:text-base font-display">
                <Settings2 className="w-4 h-4 md:w-5 md:h-5 text-[hsl(var(--racing-cyan))]" />
                Number of Gears
              </Label>
            </TuningTooltip>
            <div className="grid grid-cols-7 gap-1 sm:flex sm:gap-2 sm:flex-wrap">
              {gearCounts.map((count) => (
                <Button
                  key={count}
                  variant={(specs.gearCount || 6) === count ? 'tuneTypeActive' : 'tuneType'}
                  onClick={() => updateSpec('gearCount', count)}
                  size="sm"
                  className="min-w-0 sm:min-w-[50px] px-2 sm:px-3 text-xs sm:text-sm"
                >
                  {count}
                </Button>
              ))}
            </div>
          </div>

          {/* PI Class */}
          <div className="space-y-2 md:space-y-3">
            <TuningTooltip explanation={inputExplanations.piClass} showIcon>
              <Label className="flex items-center gap-2 text-sm md:text-base font-display">
                <Gauge className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                PI Class
              </Label>
            </TuningTooltip>
            <div className="grid grid-cols-7 gap-1 sm:flex sm:gap-2 sm:flex-wrap">
              {piClasses.map((piClass) => (
                <Button
                  key={piClass}
                  variant={specs.piClass === piClass ? 'tuneTypeActive' : 'tuneType'}
                  onClick={() => updateSpec('piClass', piClass)}
                  size="sm"
                  className={cn(
                    "min-w-0 sm:min-w-[50px] px-1.5 sm:px-3 text-xs sm:text-sm",
                    piClass === 'X' && "text-[hsl(var(--racing-red))]",
                    (piClass === 'S1' || piClass === 'S2') && "text-[hsl(var(--racing-yellow))]"
                  )}
                >
                  {piClass}
                </Button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Higher classes get stiffer suspension (+10-30%)
            </p>
          </div>

          {/* Tire Compound */}
          <div className="space-y-2 md:space-y-3">
            <TuningTooltip explanation={inputExplanations.tireCompound} showIcon>
              <Label className="text-sm md:text-base font-display">Tire Compound</Label>
            </TuningTooltip>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2">
              {tireCompounds.map((compound) => (
                <Button
                  key={compound.value}
                  variant={specs.tireCompound === compound.value ? 'tuneTypeActive' : 'tuneType'}
                  onClick={() => updateSpec('tireCompound', compound.value as CarSpecs['tireCompound'])}
                  size="sm"
                  className="text-xs sm:text-sm"
                >
                  {compound.label}
                </Button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Affects tire pressure and grip expectations
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
