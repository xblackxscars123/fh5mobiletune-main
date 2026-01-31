import { useState, useCallback } from 'react';
import { TuneSettings, DriveType, TuneType, tuneTypeDescriptions, UnitSystem, convertTuneToUnits, getUnitLabels } from '@/lib/tuningCalculator';
import { TuningTooltip } from '@/components/TuningTooltip';
import { Button } from '@/components/ui/button';
import { AdvancedModeToggle } from '@/components/AdvancedModeToggle';
import { outputExplanations } from '@/data/tuningGuide';
import { cn } from '@/lib/utils';
import { useSwipeGesture } from '@/hooks/useSwipeGesture';
import { Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

interface ForzaTunePanelProps {
  tune: TuneSettings;
  driveType: DriveType;
  tuneType: TuneType;
  unitSystem: UnitSystem;
  carName?: string;
}

type TuneTab = 'tyres' | 'gearing' | 'alignment' | 'antiroll' | 'springs' | 'damping' | 'aero' | 'brake' | 'differential';

// Basic tabs (always visible)
const basicTabs: { id: TuneTab; label: string }[] = [
  { id: 'tyres', label: 'TYRES' },
  { id: 'gearing', label: 'GEARING' },
  { id: 'antiroll', label: 'ANTIROLL BARS' },
  { id: 'springs', label: 'SPRINGS' },
  { id: 'brake', label: 'BRAKE' },
];

// Advanced tabs (only visible in advanced mode)
const advancedTabs: { id: TuneTab; label: string }[] = [
  { id: 'alignment', label: 'ALIGNMENT' },
  { id: 'damping', label: 'DAMPING' },
  { id: 'aero', label: 'AERO' },
  { id: 'differential', label: 'DIFFERENTIAL' },
];

// All tabs (for reference)
const allTabs: { id: TuneTab; label: string }[] = [...basicTabs, ...advancedTabs];

function ForzaSlider({ 
  label, 
  value, 
  min, 
  max, 
  unit = '',
  leftLabel,
  rightLabel,
  isHighlighted = false,
  explanationKey,
}: { 
  label: string; 
  value: number; 
  min: number; 
  max: number; 
  unit?: string;
  leftLabel?: string;
  rightLabel?: string;
  isHighlighted?: boolean;
  explanationKey?: string;
}) {
  const percentage = ((value - min) / (max - min)) * 100;
  const explanation = explanationKey ? outputExplanations[explanationKey] : null;
  
  const sliderContent = (
    <div className="py-1.5 sm:py-2">
      <div className="flex items-center justify-between mb-1">
        <span className={cn(
          "text-xs sm:text-sm uppercase tracking-wide",
          isHighlighted ? "text-[hsl(var(--racing-yellow))]" : "text-foreground"
        )}>
          {label}
        </span>
        <span className="text-xs sm:text-sm text-foreground font-display">
          {typeof value === 'number' ? value.toFixed(value % 1 === 0 ? 0 : 1) : value}{unit}
        </span>
      </div>
      
      <div className="flex items-center gap-1.5 sm:gap-3">
        {leftLabel && (
          <span className="text-[10px] sm:text-xs text-muted-foreground w-10 sm:w-16 text-right hidden xs:block">{leftLabel}</span>
        )}
        <div className="flex-1 relative h-1.5 sm:h-2 bg-[hsl(220,15%,15%)] rounded-sm">
          {/* Track background gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-[hsl(220,15%,20%)] to-[hsl(220,15%,25%)] rounded-sm" />
          
          {/* Filled portion - magenta/pink like Forza */}
          <div 
            className="absolute left-0 top-0 h-full bg-gradient-to-r from-[hsl(320,80%,50%)] to-[hsl(340,85%,55%)] rounded-sm"
            style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
          />
          
          {/* Thumb indicator */}
          <div 
            className="absolute top-1/2 -translate-y-1/2 w-2 h-3 sm:w-3 sm:h-4 bg-white rounded-sm shadow-lg"
            style={{ left: `calc(${Math.min(100, Math.max(0, percentage))}% - 4px)` }}
          />
        </div>
        {rightLabel && (
          <span className="text-[10px] sm:text-xs text-muted-foreground w-10 sm:w-16 hidden xs:block">{rightLabel}</span>
        )}
      </div>
    </div>
  );

  if (explanation) {
    return (
      <TuningTooltip explanation={explanation}>
        {sliderContent}
      </TuningTooltip>
    );
  }

  return sliderContent;
}

function ForzaValueRow({ label, value, unit = '' }: { label: string; value: string | number; unit?: string }) {
  return (
    <div className="flex justify-between items-center py-1.5 sm:py-2 border-b border-[hsl(220,15%,18%)] last:border-0">
      <span className="text-xs sm:text-sm text-foreground uppercase">{label}</span>
      <span className="font-display text-sm sm:text-base text-[hsl(var(--racing-yellow))]">
        {value}{unit}
      </span>
    </div>
  );
}

export function ForzaTunePanel({ tune, driveType, tuneType, unitSystem, carName }: ForzaTunePanelProps) {
  const [activeTab, setActiveTab] = useState<TuneTab>('tyres');
  const [isAdvancedMode, setIsAdvancedMode] = useState(false);
  const [copied, setCopied] = useState(false);
  const tuneInfo = tuneTypeDescriptions[tuneType];
  
  // Get visible tabs based on advanced mode
  const visibleTabs = isAdvancedMode ? allTabs : basicTabs;
  
  // Ensure active tab is still visible when switching modes
  const safeActiveTab = visibleTabs.find(tab => tab.id === activeTab)?.id || visibleTabs[0]?.id || 'tyres';
  
  // Convert tune to selected unit system
  const displayTune = convertTuneToUnits(tune, unitSystem);
  const units = getUnitLabels(unitSystem);

  const formatTuneForClipboard = () => {
    const lines = [
      `═══════════════════════════════════`,
      `🏎️ ${carName || 'Custom Car'} - ${tuneInfo.title} Tune`,
      `═══════════════════════════════════`,
      ``,
      `▸ TIRE PRESSURE`,
      `  Front: ${displayTune.tirePressureFront} ${units.pressure}`,
      `  Rear: ${displayTune.tirePressureRear} ${units.pressure}`,
      ``,
      `▸ GEARING`,
      `  Final Drive: ${tune.finalDrive.toFixed(2)}`,
    ];

    if (tune.gearRatios && tune.gearRatios.length > 0) {
      tune.gearRatios.forEach((ratio, i) => {
        const gearName = i === 0 ? '1st' : i === 1 ? '2nd' : i === 2 ? '3rd' : `${i + 1}th`;
        lines.push(`  ${gearName} Gear: ${ratio.toFixed(2)}`);
      });
    }

    lines.push(``);
    lines.push(`▸ ALIGNMENT`);
    lines.push(`  Camber Front: ${tune.camberFront}°`);
    lines.push(`  Camber Rear: ${tune.camberRear}°`);
    lines.push(`  Toe Front: ${tune.toeFront}°`);
    lines.push(`  Toe Rear: ${tune.toeRear}°`);
    lines.push(`  Caster: ${tune.caster}°`);
    lines.push(``);
    lines.push(`▸ ANTI-ROLL BARS`);
    lines.push(`  Front: ${tune.arbFront}`);
    lines.push(`  Rear: ${tune.arbRear}`);
    lines.push(``);
    lines.push(`▸ SPRINGS`);
    lines.push(`  Front: ${displayTune.springsFront} ${units.springs}`);
    lines.push(`  Rear: ${displayTune.springsRear} ${units.springs}`);
    lines.push(`  Ride Height Front: ${displayTune.rideHeightFront} ${units.rideHeight}`);
    lines.push(`  Ride Height Rear: ${displayTune.rideHeightRear} ${units.rideHeight}`);
    lines.push(``);
    lines.push(`▸ DAMPING - REBOUND`);
    lines.push(`  Front: ${tune.reboundFront}`);
    lines.push(`  Rear: ${tune.reboundRear}`);
    lines.push(``);
    lines.push(`▸ DAMPING - BUMP`);
    lines.push(`  Front: ${tune.bumpFront}`);
    lines.push(`  Rear: ${tune.bumpRear}`);
    lines.push(``);
    lines.push(`▸ AERO`);
    lines.push(`  Front: ${displayTune.aeroFront} ${units.aero}`);
    lines.push(`  Rear: ${displayTune.aeroRear} ${units.aero}`);
    lines.push(``);
    lines.push(`▸ DIFFERENTIAL`);

    if (driveType === 'AWD') {
      lines.push(`  Center Balance: ${tune.centerBalance || 50}% Rear`);
      if (tune.diffAccelFront !== undefined) {
        lines.push(`  Front Accel: ${tune.diffAccelFront}%`);
        lines.push(`  Front Decel: ${tune.diffDecelFront || 0}%`);
      }
      lines.push(`  Rear Accel: ${tune.diffAccelRear}%`);
      lines.push(`  Rear Decel: ${tune.diffDecelRear}%`);
    } else if (driveType === 'FWD') {
      lines.push(`  Front Accel: ${tune.diffAccelFront}%`);
      lines.push(`  Front Decel: ${tune.diffDecelFront || 0}%`);
    } else {
      lines.push(`  Rear Accel: ${tune.diffAccelRear}%`);
      lines.push(`  Rear Decel: ${tune.diffDecelRear}%`);
    }

    lines.push(``);
    lines.push(`▸ BRAKES`);
    lines.push(`  Pressure: ${tune.brakePressure}%`);
    lines.push(`  Balance: ${tune.brakeBalance}% (slider position)`);
    lines.push(``);
    lines.push(`═══════════════════════════════════`);
    lines.push(`Generated by Forza Tuning Calculator`);
    lines.push(`═══════════════════════════════════`);

    return lines.join('\n');
  };

  const handleCopyAll = async () => {
    try {
      await navigator.clipboard.writeText(formatTuneForClipboard());
      setCopied(true);
      toast.success('Tune copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy tune');
    }
  };

  // Swipe gesture handlers for mobile tab navigation
  const goToNextTab = useCallback(() => {
    const currentIndex = visibleTabs.findIndex(t => t.id === safeActiveTab);
    if (currentIndex < visibleTabs.length - 1) {
      setActiveTab(visibleTabs[currentIndex + 1].id);
    }
  }, [safeActiveTab, visibleTabs]);

  const goToPrevTab = useCallback(() => {
    const currentIndex = visibleTabs.findIndex(t => t.id === safeActiveTab);
    if (currentIndex > 0) {
      setActiveTab(visibleTabs[currentIndex - 1].id);
    }
  }, [safeActiveTab, visibleTabs]);

  const swipeHandlers = useSwipeGesture({
    onSwipeLeft: goToNextTab,
    onSwipeRight: goToPrevTab,
    threshold: 50,
  });

  const renderTabContent = () => {
    switch (activeTab) {
      case 'tyres':
        return (
          <div className="space-y-1">
            <h3 className="text-sm text-muted-foreground uppercase mb-4">Tire Pressure</h3>
            <ForzaSlider label="FRONT" value={displayTune.tirePressureFront} min={unitSystem === 'imperial' ? 14 : 0.96} max={unitSystem === 'imperial' ? 35 : 2.41} unit={` ${units.pressure}`} leftLabel="LOW" rightLabel="HIGH" explanationKey="tirePressureFront" />
            <ForzaSlider label="REAR" value={displayTune.tirePressureRear} min={unitSystem === 'imperial' ? 14 : 0.96} max={unitSystem === 'imperial' ? 35 : 2.41} unit={` ${units.pressure}`} leftLabel="LOW" rightLabel="HIGH" explanationKey="tirePressureRear" />
            
            <div className="mt-6 p-3 bg-[hsl(220,15%,10%)] rounded border border-[hsl(220,15%,20%)]">
              <p className="text-xs text-[hsl(var(--racing-yellow))]">
                {tuneType === 'drift' && '⚠️ Low front pressure maximizes friction for wider steering angles'}
                {tuneType === 'offroad' && '🏔️ 20-25 PSI range for Rally/Offroad (1.37-1.7 bar)'}
                {tuneType === 'rally' && '🏔️ 20-25 PSI range for Rally (1.37-1.7 bar)'}
                {tuneType === 'grip' && '🏁 Higher front = better cornering feel'}
                {tuneType === 'drag' && '🏎️ Lower rear pressure for maximum traction'}
                {tuneType === 'street' && '🛣️ Balanced pressures for mixed conditions'}
              </p>
            </div>
          </div>
        );

      case 'gearing':
        return (
          <div className="space-y-1">
            <h3 className="text-xs sm:text-sm text-muted-foreground uppercase mb-3 sm:mb-4">Final Drive</h3>
            <ForzaSlider label="FINAL DRIVE" value={tune.finalDrive} min={2.0} max={6.0} unit="" isHighlighted explanationKey="finalDrive" />
            
            <h3 className="text-xs sm:text-sm text-muted-foreground uppercase mt-4 sm:mt-6 mb-3 sm:mb-4">Individual Gear Ratios</h3>
            <TuningTooltip explanation={outputExplanations.gearRatios}>
              <div className="grid grid-cols-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 gap-1.5 sm:gap-2">
                {tune.gearRatios.map((ratio, index) => (
                  <div key={index} className="flex justify-between items-center py-1.5 sm:py-2 px-2 sm:px-3 bg-[hsl(220,15%,10%)] rounded border border-[hsl(220,15%,20%)]">
                    <span className="text-xs sm:text-sm text-foreground uppercase font-display">
                      {index === 0 ? '1st' : index === 1 ? '2nd' : index === 2 ? '3rd' : `${index + 1}th`}
                    </span>
                    <span className="font-display text-xs sm:text-sm text-[hsl(var(--racing-cyan))]">
                      {ratio.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </TuningTooltip>
            
            <div className="mt-4 sm:mt-6 p-2 sm:p-3 bg-[hsl(220,15%,10%)] rounded border border-[hsl(220,15%,20%)]">
              <p className="text-xs sm:text-sm text-muted-foreground">{tune.gearingNote}</p>
            </div>
          </div>
        );

      case 'alignment':
        return (
          <div className="space-y-1">
            <h3 className="text-sm text-muted-foreground uppercase mb-4">Camber</h3>
            <ForzaSlider label="FRONT" value={tune.camberFront} min={-5} max={0} unit="°" leftLabel="NEGATIVE" rightLabel="POSITIVE" explanationKey="camberFront" />
            <ForzaSlider label="REAR" value={tune.camberRear} min={-3} max={0} unit="°" leftLabel="NEGATIVE" rightLabel="POSITIVE" explanationKey="camberRear" />
            
            <h3 className="text-sm text-muted-foreground uppercase mt-6 mb-4">Toe</h3>
            <ForzaSlider label="FRONT" value={tune.toeFront} min={-1} max={1} unit="°" leftLabel="IN" rightLabel="OUT" explanationKey="toeFront" />
            <ForzaSlider label="REAR" value={tune.toeRear} min={-1} max={1} unit="°" leftLabel="IN" rightLabel="OUT" explanationKey="toeRear" />
            
            <h3 className="text-sm text-muted-foreground uppercase mt-6 mb-4">Front Caster</h3>
            <ForzaSlider label="ANGLE" value={tune.caster} min={3} max={7} unit="°" leftLabel="LOW" rightLabel="HIGH" isHighlighted explanationKey="caster" />
          </div>
        );

      case 'antiroll':
        return (
          <div className="space-y-1">
            <h3 className="text-sm text-muted-foreground uppercase mb-4">Antiroll Bars</h3>
            <ForzaSlider label="FRONT" value={tune.arbFront} min={1} max={65} unit="" leftLabel="SOFT" rightLabel="STIFF" explanationKey="arbFront" />
            <ForzaSlider label="REAR" value={tune.arbRear} min={1} max={65} unit="" leftLabel="SOFT" rightLabel="STIFF" explanationKey="arbRear" />
            
            <div className="mt-6 p-3 bg-[hsl(220,15%,10%)] rounded border border-[hsl(220,15%,20%)]">
              <p className="text-xs text-[hsl(var(--racing-green))]">
                Affects Body Roll — Control Entry & Midcorner Balance
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Stiffer Front = More Oversteer | Stiffer Rear = More Understeer
              </p>
            </div>
          </div>
        );

      case 'springs':
        return (
          <div className="space-y-1">
            <h3 className="text-sm text-muted-foreground uppercase mb-4">Springs</h3>
            <ForzaSlider label="FRONT" value={displayTune.springsFront} min={unitSystem === 'imperial' ? 100 : 1.79} max={unitSystem === 'imperial' ? 1000 : 17.86} unit={` ${units.springs}`} leftLabel="SOFT" rightLabel="STIFF" explanationKey="springsFront" />
            <ForzaSlider label="REAR" value={displayTune.springsRear} min={unitSystem === 'imperial' ? 100 : 1.79} max={unitSystem === 'imperial' ? 1000 : 17.86} unit={` ${units.springs}`} leftLabel="SOFT" rightLabel="STIFF" explanationKey="springsRear" />
            
            <h3 className="text-sm text-muted-foreground uppercase mt-6 mb-4">Ride Height</h3>
            <ForzaSlider label="FRONT" value={displayTune.rideHeightFront} min={unitSystem === 'imperial' ? 3 : 7.6} max={unitSystem === 'imperial' ? 10 : 25.4} unit={` ${units.rideHeight}`} leftLabel="LOW" rightLabel="HIGH" explanationKey="rideHeightFront" />
            <ForzaSlider label="REAR" value={displayTune.rideHeightRear} min={unitSystem === 'imperial' ? 3 : 7.6} max={unitSystem === 'imperial' ? 10 : 25.4} unit={` ${units.rideHeight}`} leftLabel="LOW" rightLabel="HIGH" explanationKey="rideHeightRear" />
            
            <div className="mt-6 p-3 bg-[hsl(220,15%,10%)] rounded border border-[hsl(220,15%,20%)]">
              <p className="text-xs text-[hsl(var(--racing-purple))]">
                Higher Springs = MORE responsive but LESS grip
              </p>
            </div>
          </div>
        );

      case 'damping':
        return (
          <div className="space-y-1">
            <h3 className="text-sm text-muted-foreground uppercase mb-4">Rebound Stiffness</h3>
            <ForzaSlider label="FRONT" value={tune.reboundFront} min={1} max={20} unit="" leftLabel="SOFT" rightLabel="STIFF" explanationKey="reboundFront" />
            <ForzaSlider label="REAR" value={tune.reboundRear} min={1} max={20} unit="" leftLabel="SOFT" rightLabel="STIFF" explanationKey="reboundRear" />
            
            <h3 className="text-sm text-muted-foreground uppercase mt-6 mb-4">Bump Stiffness</h3>
            <ForzaSlider label="FRONT" value={tune.bumpFront} min={1} max={20} unit="" leftLabel="SOFT" rightLabel="STIFF" explanationKey="bumpFront" />
            <ForzaSlider label="REAR" value={tune.bumpRear} min={1} max={20} unit="" leftLabel="SOFT" rightLabel="STIFF" explanationKey="bumpRear" />
            
            <div className="mt-6 p-3 bg-[hsl(220,15%,10%)] rounded border border-[hsl(220,15%,20%)]">
              <p className="text-xs text-muted-foreground">
                Keep Bump less than 50% of Rebound value for stability
              </p>
            </div>
          </div>
        );

      case 'aero':
        return (
          <div className="space-y-1">
            <h3 className="text-sm text-muted-foreground uppercase mb-4">Downforce</h3>
            <ForzaSlider label="FRONT" value={displayTune.aeroFront} min={0} max={unitSystem === 'imperial' ? 400 : 1779} unit={` ${units.aero}`} leftLabel="LOW" rightLabel="HIGH" explanationKey="aeroFront" />
            <ForzaSlider label="REAR" value={displayTune.aeroRear} min={0} max={unitSystem === 'imperial' ? 400 : 1779} unit={` ${units.aero}`} leftLabel="LOW" rightLabel="HIGH" explanationKey="aeroRear" />
          </div>
        );

      case 'brake':
        return (
          <div className="space-y-1">
            <h3 className="text-sm text-muted-foreground uppercase mb-4">Braking Force</h3>
            <ForzaSlider label="BALANCE (SLIDER)" value={tune.brakeBalance} min={30} max={70} unit="%" leftLabel="FRONT" rightLabel="REAR" isHighlighted explanationKey="brakeBalance" />
            <ForzaSlider label="PRESSURE" value={tune.brakePressure} min={50} max={200} unit="%" leftLabel="LOW" rightLabel="HIGH" explanationKey="brakePressure" />
            
            <div className="mt-6 p-3 bg-[hsl(220,15%,10%)] rounded border border-[hsl(220,15%,20%)]">
              <p className="text-xs text-[hsl(var(--racing-yellow))] font-bold mb-2">
                ⚠️ FH5 SLIDER ANOMALY
              </p>
              <p className="text-xs text-[hsl(var(--racing-cyan))]">
                {tune.brakeBalanceNote}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                The in-game slider is inverted! Lower values = more front braking.
              </p>
            </div>
          </div>
        );

      case 'differential':
        return (
          <div className="space-y-1">
            {driveType === 'AWD' && (
              <>
                <h3 className="text-sm text-muted-foreground uppercase mb-4">Centre</h3>
                <ForzaSlider label="BALANCE" value={tune.centerBalance || 50} min={0} max={100} unit="%" leftLabel="FRONT" rightLabel="REAR" isHighlighted explanationKey="centerBalance" />
              </>
            )}
            
            {(driveType === 'AWD' || driveType === 'FWD') && tune.diffAccelFront !== undefined && (
              <>
                <h3 className="text-sm text-muted-foreground uppercase mt-4 mb-4">Front</h3>
                <ForzaSlider label="ACCELERATION" value={tune.diffAccelFront} min={0} max={100} unit="%" leftLabel="LOW" rightLabel="HIGH" explanationKey="diffAccelFront" />
                <ForzaSlider label="DECELERATION" value={tune.diffDecelFront || 0} min={0} max={100} unit="%" leftLabel="LOW" rightLabel="HIGH" explanationKey="diffDecelFront" />
              </>
            )}
            
            {(driveType === 'AWD' || driveType === 'RWD') && (
              <>
                <h3 className="text-sm text-muted-foreground uppercase mt-4 mb-4">Rear</h3>
                <ForzaSlider label="ACCELERATION" value={tune.diffAccelRear} min={0} max={100} unit="%" leftLabel="LOW" rightLabel="HIGH" explanationKey="diffAccelRear" />
                <ForzaSlider label="DECELERATION" value={tune.diffDecelRear} min={0} max={100} unit="%" leftLabel="LOW" rightLabel="HIGH" explanationKey="diffDecelRear" />
              </>
            )}
            
            <div className="mt-6 p-3 bg-[hsl(220,15%,10%)] rounded border border-[hsl(220,15%,20%)]">
              <p className="text-xs text-[hsl(var(--racing-yellow))]">
                50-80% Accel = Midcorner + Exit grip | 5-10% Decel = Corner entry stability
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-[hsl(220,18%,8%)] rounded-lg overflow-hidden border border-[hsl(220,15%,18%)]">
      {/* Header */}
      <div className="bg-[hsl(220,18%,6%)] px-3 sm:px-4 py-2 flex items-center justify-between border-b border-[hsl(220,15%,18%)]">
        <div className="flex items-center gap-2">
          <span className="text-lg sm:text-xl">{tuneInfo.icon}</span>
          <span className="font-display text-xs sm:text-sm text-foreground uppercase tracking-wider">TUNE</span>
          <span className="text-xs sm:text-sm text-muted-foreground hidden sm:inline">— {tuneInfo.title}</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="text-[10px] text-muted-foreground hidden lg:block">
            💡 Hover 1.5s on any value for explanation
          </div>
          <Button 
            onClick={handleCopyAll}
            variant="outline"
            size="sm"
            className="gap-1.5 h-7 text-xs border-[hsl(220,15%,25%)] hover:bg-[hsl(var(--racing-yellow))] hover:text-black hover:border-[hsl(var(--racing-yellow))]"
          >
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            <span className="hidden sm:inline">{copied ? 'Copied!' : 'Copy All'}</span>
          </Button>
        </div>
      </div>
      
      {/* Advanced Mode Toggle */}
      <div className="bg-[hsl(220,18%,7%)] px-3 sm:px-4 py-2 border-b border-[hsl(220,15%,18%)]">
        <AdvancedModeToggle 
          isAdvancedMode={isAdvancedMode}
          onToggle={setIsAdvancedMode}
        />
        {!isAdvancedMode && (
          <div className="mt-2 text-xs text-muted-foreground">
            Basic mode shows essential tuning parameters. Advanced mode reveals additional controls like alignment, damping, aero, and differential settings.
          </div>
        )}
      </div>
      
      {/* Tab Navigation - Scrollable on mobile with smooth height transition */}
      <div className="bg-[hsl(220,18%,7%)] border-b border-[hsl(220,15%,18%)] transition-all duration-300 ease-in-out">
        <div 
          className="flex overflow-x-auto scrollbar-hide transition-all duration-300 ease-in-out"
          style={{
            height: isAdvancedMode ? 'auto' : '48px', // Fixed height for basic mode, auto for advanced
          }}
        >
          {visibleTabs.map((tab, index) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs font-display uppercase tracking-wide transition-all duration-300 flex-shrink-0 min-w-fit",
                "transform transition-all duration-300",
                safeActiveTab === tab.id 
                  ? "bg-[hsl(var(--racing-yellow))] text-black scale-105" 
                  : "text-muted-foreground hover:text-foreground hover:bg-[hsl(220,15%,12%)] hover:scale-102",
                // Animation for new tabs appearing
                isAdvancedMode && basicTabs.length <= index && [
                  "animate-in slide-in-from-right-2 fade-in-0 duration-300",
                  "delay-[var(--animation-delay)]"
                ]
              )}
              style={{
                '--animation-delay': `${(index - basicTabs.length + 1) * 50}ms`,
              } as React.CSSProperties}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area with Performance Stats */}
      <div className="flex flex-col lg:flex-row">
        {/* Left: Performance Stats (hidden on mobile) */}
        <div className="w-full lg:w-48 bg-[hsl(220,18%,6%)] p-3 sm:p-4 border-b lg:border-b-0 lg:border-r border-[hsl(220,15%,18%)] hidden md:block">
          <h4 className="text-xs text-muted-foreground uppercase mb-3 sm:mb-4">Performance</h4>
          <div className="flex lg:flex-col gap-4 lg:gap-4 text-sm overflow-x-auto">
            <div className="flex-shrink-0">
              <p className="text-muted-foreground text-xs">BRAKING DISTANCE</p>
              <p className="text-foreground text-xs sm:text-sm">97 km/h - 0</p>
              <p className="font-display text-[hsl(var(--racing-cyan))] text-sm">~26.7 m</p>
            </div>
            <div className="flex-shrink-0">
              <p className="text-muted-foreground text-xs">LATERAL Gs</p>
              <p className="text-foreground text-xs sm:text-sm">97 km/h</p>
              <p className="font-display text-[hsl(var(--racing-cyan))] text-sm">~1.36</p>
            </div>
            <div className="flex-shrink-0">
              <p className="text-muted-foreground text-xs">ACCELERATION</p>
              <p className="text-foreground text-xs sm:text-sm">0 - 97 km/h</p>
              <p className="font-display text-[hsl(var(--racing-cyan))] text-sm">~4.5s</p>
            </div>
          </div>
        </div>
        
        {/* Right: Tune Controls - Swipeable on mobile */}
        <div 
          className="flex-1 p-3 sm:p-4 min-h-[300px] sm:min-h-[400px] touch-pan-y"
          onTouchStart={swipeHandlers.onTouchStart}
          onTouchMove={swipeHandlers.onTouchMove}
          onTouchEnd={swipeHandlers.onTouchEnd}
        >
          {renderTabContent()}
        </div>
      </div>
      
      {/* Tips Footer */}
      <div className="bg-[hsl(220,18%,6%)] px-3 sm:px-4 py-2 sm:py-3 border-t border-[hsl(220,15%,18%)]">
        <div className="flex items-start gap-2">
          <span className="text-[hsl(var(--racing-cyan))] text-sm">💡</span>
          <div className="text-[10px] sm:text-xs text-muted-foreground">
            <span className="text-[hsl(var(--racing-yellow))]">{tuneInfo.title}:</span>{' '}
            <span className="line-clamp-2">{tuneInfo.tips[0]}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
