import { TuneSettings, DriveType, TuneType, tuneTypeDescriptions } from '@/lib/tuningCalculator';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { 
  CircleDot, 
  Settings, 
  Move, 
  SlidersHorizontal, 
  Layers, 
  Wind, 
  Cog, 
  SquareSlash,
  Lightbulb
} from 'lucide-react';

interface TuneResultsProps {
  tune: TuneSettings;
  driveType: DriveType;
  tuneType: TuneType;
}

interface TuneCardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  accentColor?: string;
}

function TuneCard({ title, icon, children, accentColor = 'primary' }: TuneCardProps) {
  return (
    <Card className="card-racing p-4 space-y-4 animate-slide-in-right">
      <div className={cn("flex items-center gap-2", `text-${accentColor}`)}>
        {icon}
        <h4 className="font-display text-sm uppercase tracking-wider">{title}</h4>
      </div>
      {children}
    </Card>
  );
}

interface ValueRowProps {
  label: string;
  value: string | number;
  unit?: string;
  highlight?: boolean;
}

function ValueRow({ label, value, unit, highlight }: ValueRowProps) {
  return (
    <div className="flex justify-between items-center py-1.5 border-b border-border/50 last:border-0">
      <span className="text-muted-foreground text-sm">{label}</span>
      <span className={cn(
        "font-display text-lg",
        highlight ? "text-primary" : "text-foreground"
      )}>
        {value}{unit && <span className="text-xs text-muted-foreground ml-1">{unit}</span>}
      </span>
    </div>
  );
}

function ValuePair({ frontLabel, rearLabel, front, rear, unit }: { 
  frontLabel: string; 
  rearLabel: string; 
  front: number | string; 
  rear: number | string; 
  unit?: string;
}) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="text-center p-3 rounded-lg bg-muted/50 border border-border/50">
        <p className="text-xs text-muted-foreground uppercase mb-1">{frontLabel}</p>
        <p className="font-display text-xl text-primary">{front}<span className="text-xs text-muted-foreground ml-1">{unit}</span></p>
      </div>
      <div className="text-center p-3 rounded-lg bg-muted/50 border border-border/50">
        <p className="text-xs text-muted-foreground uppercase mb-1">{rearLabel}</p>
        <p className="font-display text-xl text-racing-cyan">{rear}<span className="text-xs text-muted-foreground ml-1">{unit}</span></p>
      </div>
    </div>
  );
}

export function TuneResults({ tune, driveType, tuneType }: TuneResultsProps) {
  const tuneInfo = tuneTypeDescriptions[tuneType];
  
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-3xl">{tuneInfo.icon}</span>
        <div>
          <h3 className="font-display text-xl text-gradient-racing">{tuneInfo.title} Tune Settings</h3>
          <p className="text-sm text-muted-foreground">{tuneInfo.description}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {/* Tires */}
        <TuneCard title="Tire Pressure" icon={<CircleDot className="w-5 h-5" />}>
          <ValuePair 
            frontLabel="Front" 
            rearLabel="Rear" 
            front={tune.tirePressureFront} 
            rear={tune.tirePressureRear}
            unit="PSI"
          />
          {tuneType === 'drift' && (
            <p className="text-xs text-racing-yellow mt-2">
              ⚠️ Low front pressure (14.5 PSI) maximizes friction for wide angles
            </p>
          )}
        </TuneCard>

        {/* Gearing */}
        <TuneCard title="Gearing" icon={<Settings className="w-5 h-5" />} accentColor="racing-yellow">
          <ValueRow label="Final Drive" value={tune.finalDrive.toFixed(2)} highlight />
          <p className="text-xs text-muted-foreground mt-2">
            {tune.gearingNote}
          </p>
        </TuneCard>

        {/* Alignment */}
        <TuneCard title="Alignment" icon={<Move className="w-5 h-5" />} accentColor="racing-cyan">
          <ValuePair 
            frontLabel="Camber F" 
            rearLabel="Camber R" 
            front={tune.camberFront} 
            rear={tune.camberRear}
            unit="°"
          />
          <div className="grid grid-cols-3 gap-2 mt-3">
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Toe F</p>
              <p className="font-display text-primary">{tune.toeFront}°</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Toe R</p>
              <p className="font-display text-racing-cyan">{tune.toeRear}°</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Caster</p>
              <p className="font-display text-racing-purple">{tune.caster}°</p>
            </div>
          </div>
        </TuneCard>

        {/* Anti-Roll Bars */}
        <TuneCard title="Anti-Roll Bars" icon={<SlidersHorizontal className="w-5 h-5" />} accentColor="racing-green">
          <ValuePair 
            frontLabel="Front" 
            rearLabel="Rear" 
            front={tune.arbFront} 
            rear={tune.arbRear}
          />
        </TuneCard>

        {/* Springs */}
        <TuneCard title="Springs" icon={<Layers className="w-5 h-5" />} accentColor="racing-purple">
          <ValuePair 
            frontLabel="Front" 
            rearLabel="Rear" 
            front={tune.springsFront} 
            rear={tune.springsRear}
            unit="lb"
          />
          <div className="mt-3 pt-3 border-t border-border/50">
            <p className="text-xs text-muted-foreground mb-2">Ride Height</p>
            <div className="grid grid-cols-2 gap-2">
              <div className="text-center">
                <span className="font-display text-primary">{tune.rideHeightFront}</span>
                <span className="text-xs text-muted-foreground ml-1">in</span>
              </div>
              <div className="text-center">
                <span className="font-display text-racing-cyan">{tune.rideHeightRear}</span>
                <span className="text-xs text-muted-foreground ml-1">in</span>
              </div>
            </div>
          </div>
        </TuneCard>

        {/* Damping */}
        <TuneCard title="Damping" icon={<SlidersHorizontal className="w-5 h-5" />} accentColor="racing-red">
          <div className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground mb-2">Rebound</p>
              <ValuePair 
                frontLabel="Front" 
                rearLabel="Rear" 
                front={tune.reboundFront} 
                rear={tune.reboundRear}
              />
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-2">Bump</p>
              <ValuePair 
                frontLabel="Front" 
                rearLabel="Rear" 
                front={tune.bumpFront} 
                rear={tune.bumpRear}
              />
            </div>
          </div>
        </TuneCard>

        {/* Aero */}
        <TuneCard title="Aero" icon={<Wind className="w-5 h-5" />}>
          <ValuePair 
            frontLabel="Front" 
            rearLabel="Rear" 
            front={tune.aeroFront} 
            rear={tune.aeroRear}
            unit="lb"
          />
        </TuneCard>

        {/* Differential */}
        <TuneCard title="Differential" icon={<Cog className="w-5 h-5" />} accentColor="racing-yellow">
          <div className="space-y-3">
            {driveType === 'AWD' && (
              <ValueRow label="Center Balance" value={tune.centerBalance || 50} unit="% Rear" highlight />
            )}
            {(driveType === 'AWD' || driveType === 'FWD') && tune.diffAccelFront !== undefined && (
              <div>
                <p className="text-xs text-muted-foreground mb-2">Front</p>
                <div className="grid grid-cols-2 gap-2">
                  <ValueRow label="Accel" value={tune.diffAccelFront} unit="%" />
                  <ValueRow label="Decel" value={tune.diffDecelFront || 0} unit="%" />
                </div>
              </div>
            )}
            {(driveType === 'AWD' || driveType === 'RWD') && (
              <div>
                <p className="text-xs text-muted-foreground mb-2">Rear</p>
                <div className="grid grid-cols-2 gap-2">
                  <ValueRow label="Accel" value={tune.diffAccelRear} unit="%" />
                  <ValueRow label="Decel" value={tune.diffDecelRear} unit="%" />
                </div>
              </div>
            )}
          </div>
        </TuneCard>

        {/* Brakes */}
        <TuneCard title="Brakes" icon={<SquareSlash className="w-5 h-5" />} accentColor="racing-red">
          <ValueRow label="Brake Pressure" value={tune.brakePressure} unit="%" highlight />
          <ValueRow label="Brake Balance" value={tune.brakeBalance} unit="% Front" />
        </TuneCard>
      </div>

      {/* Tune-Specific Tips */}
      <Card className="card-racing p-4 mt-6">
        <h4 className="font-display text-primary text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
          <Lightbulb className="w-4 h-4" />
          {tuneInfo.title} Tuning Tips
        </h4>
        <ul className="space-y-2 text-sm text-muted-foreground">
          {tuneInfo.tips.map((tip, i) => (
            <li key={i}>• <span className="text-foreground">{tip}</span></li>
          ))}
        </ul>
      </Card>

      {/* General Tips */}
      <Card className="card-racing p-4">
        <h4 className="font-display text-racing-cyan text-sm uppercase tracking-wider mb-3">Fine-Tuning Guide</h4>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>• <span className="text-foreground">Test and adjust</span> — These are starting points. Fine-tune based on feel.</li>
          <li>• <span className="text-foreground">Tire temps</span> — Check telemetry for even heat distribution (inside/outside).</li>
          <li>• <span className="text-foreground">Understeer fix</span> — Soften front ARB, add front downforce, or reduce front spring rate.</li>
          <li>• <span className="text-foreground">Oversteer fix</span> — Soften rear ARB, add rear downforce, or reduce rear spring rate.</li>
          <li>• <span className="text-foreground">Corner entry loose</span> — Increase rear rebound damping or lower rear decel diff.</li>
          <li>• <span className="text-foreground">Corner exit loose</span> — Lower rear accel diff or stiffen rear bump damping.</li>
        </ul>
      </Card>
    </div>
  );
}
