import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Gauge, Move } from 'lucide-react';

interface BalanceStiffnessSlidersProps {
  balance: number; // -100 to +100
  stiffness: number; // 0 to 100
  onBalanceChange: (value: number) => void;
  onStiffnessChange: (value: number) => void;
}

export function BalanceStiffnessSliders({
  balance,
  stiffness,
  onBalanceChange,
  onStiffnessChange,
}: BalanceStiffnessSlidersProps) {
  const getBalanceLabel = (value: number) => {
    if (value <= -60) return 'Heavy Understeer';
    if (value <= -30) return 'Understeer';
    if (value <= -10) return 'Slight Understeer';
    if (value < 10) return 'Neutral';
    if (value < 30) return 'Slight Oversteer';
    if (value < 60) return 'Oversteer';
    return 'Heavy Oversteer';
  };

  const getStiffnessLabel = (value: number) => {
    if (value < 20) return 'Very Soft';
    if (value < 40) return 'Soft';
    if (value < 60) return 'Medium';
    if (value < 80) return 'Stiff';
    return 'Very Stiff';
  };

  const getBalanceColor = (value: number) => {
    if (value < -30) return 'text-[hsl(var(--racing-cyan))]';
    if (value > 30) return 'text-[hsl(var(--racing-orange))]';
    return 'text-[hsl(var(--racing-yellow))]';
  };

  return (
    <div className="space-y-4 p-3 bg-[hsl(220,15%,10%)] rounded-lg border border-[hsl(220,15%,18%)]">
      <h4 className="font-display text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-2">
        <Move className="w-3.5 h-3.5" />
        Quick Adjustments
      </h4>
      
      {/* Balance Slider */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs text-muted-foreground">Balance</Label>
          <span className={`text-xs font-medium ${getBalanceColor(balance)}`}>
            {getBalanceLabel(balance)}
          </span>
        </div>
        <div className="relative">
          <div className="absolute -top-0.5 left-0 right-0 flex justify-between text-[8px] text-muted-foreground/50 pointer-events-none">
            <span>Understeer</span>
            <span>Neutral</span>
            <span>Oversteer</span>
          </div>
          <Slider
            value={[balance]}
            onValueChange={([v]) => onBalanceChange(v)}
            min={-100}
            max={100}
            step={5}
            className="mt-3"
          />
        </div>
        <p className="text-[10px] text-muted-foreground">
          Adjusts front/rear ARB ratio, spring balance, and diff split
        </p>
      </div>

      {/* Stiffness Slider */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs text-muted-foreground flex items-center gap-1">
            <Gauge className="w-3 h-3" />
            Stiffness
          </Label>
          <span className="text-xs font-medium text-[hsl(var(--racing-yellow))]">
            {getStiffnessLabel(stiffness)}
          </span>
        </div>
        <div className="relative">
          <div className="absolute -top-0.5 left-0 right-0 flex justify-between text-[8px] text-muted-foreground/50 pointer-events-none">
            <span>Comfort</span>
            <span>Balanced</span>
            <span>Track</span>
          </div>
          <Slider
            value={[stiffness]}
            onValueChange={([v]) => onStiffnessChange(v)}
            min={0}
            max={100}
            step={5}
            className="mt-3"
          />
        </div>
        <p className="text-[10px] text-muted-foreground">
          Scales springs, ARBs, and damping proportionally
        </p>
      </div>

      {/* Visual Indicator */}
      <div className="flex items-center justify-center gap-4 pt-2">
        <div className="relative w-16 h-8">
          {/* Car silhouette indicator */}
          <div 
            className="absolute inset-0 flex items-center justify-center text-2xl transition-transform duration-200"
            style={{
              transform: `rotate(${balance * 0.15}deg) scale(${0.9 + stiffness * 0.002})`,
            }}
          >
            🏎️
          </div>
        </div>
        <div className="text-[10px] text-muted-foreground">
          {balance > 20 && '← Rear wants to slide'}
          {balance < -20 && 'Front pushes wide →'}
          {balance >= -20 && balance <= 20 && 'Balanced handling'}
        </div>
      </div>
    </div>
  );
}

// Helper function to apply balance/stiffness modifiers to tune settings
export function applyBalanceStiffness(
  baseArbFront: number,
  baseArbRear: number,
  baseSpringsFront: number,
  baseSpringsRear: number,
  balance: number,
  stiffness: number
): {
  arbFront: number;
  arbRear: number;
  springsFront: number;
  springsRear: number;
} {
  const balanceFactor = balance / 100; // -1 to +1
  const stiffnessFactor = stiffness / 100; // 0 to 1
  
  // Balance adjusts the ratio between front and rear
  // Positive balance = more oversteer = softer rear / stiffer front
  const frontMultiplier = 1 + (balanceFactor * 0.25);
  const rearMultiplier = 1 - (balanceFactor * 0.25);
  
  // Stiffness scales everything (0.7 at min, 1.3 at max)
  const stiffnessScale = 0.7 + (stiffnessFactor * 0.6);
  
  return {
    arbFront: Math.round(Math.max(1, Math.min(65, baseArbFront * frontMultiplier * stiffnessScale))),
    arbRear: Math.round(Math.max(1, Math.min(65, baseArbRear * rearMultiplier * stiffnessScale))),
    springsFront: Math.round(baseSpringsFront * frontMultiplier * stiffnessScale),
    springsRear: Math.round(baseSpringsRear * rearMultiplier * stiffnessScale),
  };
}
