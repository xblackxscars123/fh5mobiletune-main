import { useState } from 'react';
import { TuneSettings, DriveType, TuneType, tuneTypeDescriptions, UnitSystem, convertTuneToUnits, getUnitLabels } from '@/lib/tuningCalculator';
import { cn } from '@/lib/utils';

interface ForzaTunePanelProps {
  tune: TuneSettings;
  driveType: DriveType;
  tuneType: TuneType;
  unitSystem: UnitSystem;
}

type TuneTab = 'tyres' | 'gearing' | 'alignment' | 'antiroll' | 'springs' | 'damping' | 'aero' | 'brake' | 'differential';

const tabs: { id: TuneTab; label: string }[] = [
  { id: 'tyres', label: 'TYRES' },
  { id: 'gearing', label: 'GEARING' },
  { id: 'alignment', label: 'ALIGNMENT' },
  { id: 'antiroll', label: 'ANTIROLL BARS' },
  { id: 'springs', label: 'SPRINGS' },
  { id: 'damping', label: 'DAMPING' },
  { id: 'aero', label: 'AERO' },
  { id: 'brake', label: 'BRAKE' },
  { id: 'differential', label: 'DIFFERENTIAL' },
];

function ForzaSlider({ 
  label, 
  value, 
  min, 
  max, 
  unit = '',
  leftLabel,
  rightLabel,
  isHighlighted = false 
}: { 
  label: string; 
  value: number; 
  min: number; 
  max: number; 
  unit?: string;
  leftLabel?: string;
  rightLabel?: string;
  isHighlighted?: boolean;
}) {
  const percentage = ((value - min) / (max - min)) * 100;
  
  return (
    <div className="py-2">
      <div className="flex items-center justify-between mb-1">
        <span className={cn(
          "text-sm uppercase tracking-wide",
          isHighlighted ? "text-[hsl(var(--racing-yellow))]" : "text-foreground"
        )}>
          {label}
        </span>
        <span className="text-sm text-foreground font-display">
          {typeof value === 'number' ? value.toFixed(value % 1 === 0 ? 0 : 1) : value}{unit}
        </span>
      </div>
      
      <div className="flex items-center gap-3">
        {leftLabel && (
          <span className="text-xs text-muted-foreground w-16 text-right">{leftLabel}</span>
        )}
        <div className="flex-1 relative h-2 bg-[hsl(220,15%,15%)] rounded-sm">
          {/* Track background gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-[hsl(220,15%,20%)] to-[hsl(220,15%,25%)] rounded-sm" />
          
          {/* Filled portion - magenta/pink like Forza */}
          <div 
            className="absolute left-0 top-0 h-full bg-gradient-to-r from-[hsl(320,80%,50%)] to-[hsl(340,85%,55%)] rounded-sm"
            style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
          />
          
          {/* Thumb indicator */}
          <div 
            className="absolute top-1/2 -translate-y-1/2 w-3 h-4 bg-white rounded-sm shadow-lg"
            style={{ left: `calc(${Math.min(100, Math.max(0, percentage))}% - 6px)` }}
          />
        </div>
        {rightLabel && (
          <span className="text-xs text-muted-foreground w-16">{rightLabel}</span>
        )}
      </div>
    </div>
  );
}

function ForzaValueRow({ label, value, unit = '' }: { label: string; value: string | number; unit?: string }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-[hsl(220,15%,18%)] last:border-0">
      <span className="text-sm text-foreground uppercase">{label}</span>
      <span className="font-display text-[hsl(var(--racing-yellow))]">
        {value}{unit}
      </span>
    </div>
  );
}

export function ForzaTunePanel({ tune, driveType, tuneType, unitSystem }: ForzaTunePanelProps) {
  const [activeTab, setActiveTab] = useState<TuneTab>('tyres');
  const tuneInfo = tuneTypeDescriptions[tuneType];
  
  // Convert tune to selected unit system
  const displayTune = convertTuneToUnits(tune, unitSystem);
  const units = getUnitLabels(unitSystem);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'tyres':
        return (
          <div className="space-y-1">
            <h3 className="text-sm text-muted-foreground uppercase mb-4">Tire Pressure</h3>
            <ForzaSlider label="FRONT" value={displayTune.tirePressureFront} min={unitSystem === 'imperial' ? 14 : 0.96} max={unitSystem === 'imperial' ? 35 : 2.41} unit={` ${units.pressure}`} leftLabel="LOW" rightLabel="HIGH" />
            <ForzaSlider label="REAR" value={displayTune.tirePressureRear} min={unitSystem === 'imperial' ? 14 : 0.96} max={unitSystem === 'imperial' ? 35 : 2.41} unit={` ${units.pressure}`} leftLabel="LOW" rightLabel="HIGH" />
            
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
            <h3 className="text-sm text-muted-foreground uppercase mb-4">Final Drive</h3>
            <ForzaSlider label="FINAL DRIVE" value={tune.finalDrive} min={2.0} max={6.0} unit="" isHighlighted />
            
            <h3 className="text-sm text-muted-foreground uppercase mt-6 mb-4">Individual Gear Ratios</h3>
            <div className="grid grid-cols-2 gap-2">
              {tune.gearRatios.map((ratio, index) => (
                <div key={index} className="flex justify-between items-center py-2 px-3 bg-[hsl(220,15%,10%)] rounded border border-[hsl(220,15%,20%)]">
                  <span className="text-sm text-foreground uppercase font-display">
                    {index === 0 ? '1st' : index === 1 ? '2nd' : index === 2 ? '3rd' : `${index + 1}th`}
                  </span>
                  <span className="font-display text-[hsl(var(--racing-cyan))]">
                    {ratio.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            
            <div className="mt-6 p-3 bg-[hsl(220,15%,10%)] rounded border border-[hsl(220,15%,20%)]">
              <p className="text-sm text-muted-foreground">{tune.gearingNote}</p>
            </div>
          </div>
        );

      case 'alignment':
        return (
          <div className="space-y-1">
            <h3 className="text-sm text-muted-foreground uppercase mb-4">Camber</h3>
            <ForzaSlider label="FRONT" value={tune.camberFront} min={-5} max={0} unit="°" leftLabel="NEGATIVE" rightLabel="POSITIVE" />
            <ForzaSlider label="REAR" value={tune.camberRear} min={-3} max={0} unit="°" leftLabel="NEGATIVE" rightLabel="POSITIVE" />
            
            <h3 className="text-sm text-muted-foreground uppercase mt-6 mb-4">Toe</h3>
            <ForzaSlider label="FRONT" value={tune.toeFront} min={-1} max={1} unit="°" leftLabel="IN" rightLabel="OUT" />
            <ForzaSlider label="REAR" value={tune.toeRear} min={-1} max={1} unit="°" leftLabel="IN" rightLabel="OUT" />
            
            <h3 className="text-sm text-muted-foreground uppercase mt-6 mb-4">Front Caster</h3>
            <ForzaSlider label="ANGLE" value={tune.caster} min={3} max={7} unit="°" leftLabel="LOW" rightLabel="HIGH" isHighlighted />
          </div>
        );

      case 'antiroll':
        return (
          <div className="space-y-1">
            <h3 className="text-sm text-muted-foreground uppercase mb-4">Antiroll Bars</h3>
            <ForzaSlider label="FRONT" value={tune.arbFront} min={1} max={65} unit="" leftLabel="SOFT" rightLabel="STIFF" />
            <ForzaSlider label="REAR" value={tune.arbRear} min={1} max={65} unit="" leftLabel="SOFT" rightLabel="STIFF" />
            
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
            <ForzaSlider label="FRONT" value={displayTune.springsFront} min={unitSystem === 'imperial' ? 100 : 1.79} max={unitSystem === 'imperial' ? 1000 : 17.86} unit={` ${units.springs}`} leftLabel="SOFT" rightLabel="STIFF" />
            <ForzaSlider label="REAR" value={displayTune.springsRear} min={unitSystem === 'imperial' ? 100 : 1.79} max={unitSystem === 'imperial' ? 1000 : 17.86} unit={` ${units.springs}`} leftLabel="SOFT" rightLabel="STIFF" />
            
            <h3 className="text-sm text-muted-foreground uppercase mt-6 mb-4">Ride Height</h3>
            <ForzaSlider label="FRONT" value={displayTune.rideHeightFront} min={unitSystem === 'imperial' ? 3 : 7.6} max={unitSystem === 'imperial' ? 10 : 25.4} unit={` ${units.rideHeight}`} leftLabel="LOW" rightLabel="HIGH" />
            <ForzaSlider label="REAR" value={displayTune.rideHeightRear} min={unitSystem === 'imperial' ? 3 : 7.6} max={unitSystem === 'imperial' ? 10 : 25.4} unit={` ${units.rideHeight}`} leftLabel="LOW" rightLabel="HIGH" />
            
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
            <ForzaSlider label="FRONT" value={tune.reboundFront} min={1} max={20} unit="" leftLabel="SOFT" rightLabel="STIFF" />
            <ForzaSlider label="REAR" value={tune.reboundRear} min={1} max={20} unit="" leftLabel="SOFT" rightLabel="STIFF" />
            
            <h3 className="text-sm text-muted-foreground uppercase mt-6 mb-4">Bump Stiffness</h3>
            <ForzaSlider label="FRONT" value={tune.bumpFront} min={1} max={20} unit="" leftLabel="SOFT" rightLabel="STIFF" />
            <ForzaSlider label="REAR" value={tune.bumpRear} min={1} max={20} unit="" leftLabel="SOFT" rightLabel="STIFF" />
            
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
            <ForzaSlider label="FRONT" value={displayTune.aeroFront} min={0} max={unitSystem === 'imperial' ? 400 : 1779} unit={` ${units.aero}`} leftLabel="LOW" rightLabel="HIGH" />
            <ForzaSlider label="REAR" value={displayTune.aeroRear} min={0} max={unitSystem === 'imperial' ? 400 : 1779} unit={` ${units.aero}`} leftLabel="LOW" rightLabel="HIGH" />
          </div>
        );

      case 'brake':
        return (
          <div className="space-y-1">
            <h3 className="text-sm text-muted-foreground uppercase mb-4">Braking Force</h3>
            <ForzaSlider label="BALANCE" value={tune.brakeBalance} min={30} max={70} unit="%" leftLabel="FRONT" rightLabel="REAR" isHighlighted />
            <ForzaSlider label="PRESSURE" value={tune.brakePressure} min={50} max={200} unit="%" leftLabel="LOW" rightLabel="HIGH" />
            
            <div className="mt-6 p-3 bg-[hsl(220,15%,10%)] rounded border border-[hsl(220,15%,20%)]">
              <p className="text-xs text-[hsl(var(--racing-red))]">
                Lower % = MORE braking on Front | Higher % = MORE on Rear
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Twitchy under braking? Reduce pressure. Lock-ups? Lower brake balance.
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
                <ForzaSlider label="BALANCE" value={tune.centerBalance || 50} min={0} max={100} unit="%" leftLabel="FRONT" rightLabel="REAR" isHighlighted />
              </>
            )}
            
            {(driveType === 'AWD' || driveType === 'FWD') && tune.diffAccelFront !== undefined && (
              <>
                <h3 className="text-sm text-muted-foreground uppercase mt-4 mb-4">Front</h3>
                <ForzaSlider label="ACCELERATION" value={tune.diffAccelFront} min={0} max={100} unit="%" leftLabel="LOW" rightLabel="HIGH" />
                <ForzaSlider label="DECELERATION" value={tune.diffDecelFront || 0} min={0} max={100} unit="%" leftLabel="LOW" rightLabel="HIGH" />
              </>
            )}
            
            {(driveType === 'AWD' || driveType === 'RWD') && (
              <>
                <h3 className="text-sm text-muted-foreground uppercase mt-4 mb-4">Rear</h3>
                <ForzaSlider label="ACCELERATION" value={tune.diffAccelRear} min={0} max={100} unit="%" leftLabel="LOW" rightLabel="HIGH" />
                <ForzaSlider label="DECELERATION" value={tune.diffDecelRear} min={0} max={100} unit="%" leftLabel="LOW" rightLabel="HIGH" />
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
      <div className="bg-[hsl(220,18%,6%)] px-4 py-2 flex items-center gap-2 border-b border-[hsl(220,15%,18%)]">
        <span className="text-xl">{tuneInfo.icon}</span>
        <span className="font-display text-sm text-foreground uppercase tracking-wider">TUNE</span>
        <span className="text-sm text-muted-foreground">— {tuneInfo.title}</span>
      </div>
      
      {/* Tab Navigation */}
      <div className="flex overflow-x-auto bg-[hsl(220,18%,7%)] border-b border-[hsl(220,15%,18%)]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "px-3 py-2 text-xs font-display uppercase tracking-wide whitespace-nowrap transition-colors",
              activeTab === tab.id 
                ? "bg-[hsl(var(--racing-yellow))] text-black" 
                : "text-muted-foreground hover:text-foreground hover:bg-[hsl(220,15%,12%)]"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area with Performance Stats */}
      <div className="flex">
        {/* Left: Performance Stats (simplified) */}
        <div className="w-48 bg-[hsl(220,18%,6%)] p-4 border-r border-[hsl(220,15%,18%)] hidden lg:block">
          <h4 className="text-xs text-muted-foreground uppercase mb-4">Performance</h4>
          <div className="space-y-4 text-sm">
            <div>
              <p className="text-muted-foreground text-xs">BRAKING DISTANCE</p>
              <p className="text-foreground">97 km/h - 0</p>
              <p className="font-display text-[hsl(var(--racing-cyan))]">~26.7 m</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">LATERAL Gs</p>
              <p className="text-foreground">97 km/h</p>
              <p className="font-display text-[hsl(var(--racing-cyan))]">~1.36</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">ACCELERATION</p>
              <p className="text-foreground">0 - 97 km/h</p>
              <p className="font-display text-[hsl(var(--racing-cyan))]">~4.5s</p>
            </div>
          </div>
        </div>
        
        {/* Right: Tune Controls */}
        <div className="flex-1 p-4 min-h-[400px]">
          {renderTabContent()}
        </div>
      </div>
      
      {/* Tips Footer */}
      <div className="bg-[hsl(220,18%,6%)] px-4 py-3 border-t border-[hsl(220,15%,18%)]">
        <div className="flex items-start gap-2">
          <span className="text-[hsl(var(--racing-cyan))]">💡</span>
          <div className="text-xs text-muted-foreground">
            <span className="text-[hsl(var(--racing-yellow))]">{tuneInfo.title}:</span>{' '}
            {tuneInfo.tips[0]}
          </div>
        </div>
      </div>
    </div>
  );
}
