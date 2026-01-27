import { useMemo } from 'react';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { TuneSettings, TuneType, type CarSpecs, UnitSystem } from '@/lib/tuningCalculator';
import { cn } from '@/lib/utils';
import { Gauge, ArrowUp, Activity, TrendingUp } from 'lucide-react';
import { calculateTopSpeed, calculateZeroToSixty } from '@/lib/fh5-physics';

interface GearingVisualizerProps {
  gearRatios: number[];
  finalDrive: number;
  tuneType: TuneType;
  horsepower?: number;
  redlineRpm?: number;
  specs?: CarSpecs;
  tune?: TuneSettings;
  unitSystem?: UnitSystem;
}

type RechartsTooltipPayload<T> = Array<{ payload?: T }> | undefined;

type RechartsTooltipProps<T> = {
  active?: boolean;
  payload?: RechartsTooltipPayload<T>;
  label?: string | number;
};

// Calculate gear data and speed estimates
const calculateGearData = (
  gearRatios: number[],
  finalDrive: number,
  horsepower: number,
  redlineRpm: number,
  tireCircumference: number,
  unitSystem: UnitSystem = 'imperial'
) => {
  const transmissionEfficiency = 0.85;
  
  return gearRatios.map((ratio, index) => {
    const overallRatio = ratio * finalDrive;
    const peakPowerRpm = redlineRpm * 0.82; // Peak power at ~82% of redline
    
    // Speed at redline for this gear (km/h)
    let speedAtRedline = (redlineRpm * tireCircumference * 60) / (overallRatio * 1000);

    // Convert to mph if imperial
    if (unitSystem === 'imperial') {
      speedAtRedline = speedAtRedline * 0.621371;
    }
    
    // Relative acceleration force (higher ratio = more torque multiplication)
    const accelerationForce = (ratio / gearRatios[0]) * 100;
    
    // Torque at wheels (simplified)
    const wheelTorque = (horsepower * 5252 * overallRatio * transmissionEfficiency) / peakPowerRpm;
    
    // Drop ratio to next gear
    const dropRatio = index < gearRatios.length - 1
      ? ((ratio - gearRatios[index + 1]) / ratio) * 100
      : 0;
    
    return {
      gear: index + 1,
      gearLabel: index === 0 ? '1st' : index === 1 ? '2nd' : index === 2 ? '3rd' : `${index + 1}th`,
      ratio,
      overallRatio: Math.round(overallRatio * 100) / 100,
      speedAtRedline: Math.round(speedAtRedline),
      accelerationForce: Math.round(accelerationForce),
      wheelTorque: Math.round(wheelTorque),
      dropRatio: Math.round(dropRatio),
    };
  });
};

// Custom tooltip component
const GearTooltip = ({ active, payload, label, unitSystem = 'imperial' }: RechartsTooltipProps<Record<string, unknown>> & { unitSystem?: UnitSystem }) => {
  if (!active || !payload || payload.length === 0) return null;

  const data = payload[0]?.payload;
  if (!data) return null;
  
  const speedUnit = unitSystem === 'imperial' ? 'MPH' : 'km/h';

  return (
    <div className="bg-background/95 backdrop-blur-sm border border-neon-cyan/30 rounded-lg p-3 shadow-lg">
      <div className="font-display text-neon-cyan text-sm mb-2">
        {(data.gearLabel as string | undefined) || label} Gear
      </div>
      <div className="space-y-1 text-xs">
        {typeof data.ratio === 'number' && (
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Ratio:</span>
            <span className="text-foreground font-mono">{data.ratio.toFixed(2)}</span>
          </div>
        )}
        {typeof data.speedAtRedline === 'number' && (
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Max Speed:</span>
            <span className="text-neon-pink font-mono">{data.speedAtRedline} {speedUnit}</span>
          </div>
        )}
        {typeof data.shiftRpm === 'number' && (
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Shift Point:</span>
            <span className="text-neon-yellow font-mono">{Math.round(data.shiftRpm)} RPM</span>
          </div>
        )}
        {typeof data.dropRatio === 'number' && data.dropRatio > 0 && (
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Drop to next:</span>
            <span className="text-module-suspension font-mono">{data.dropRatio}%</span>
          </div>
        )}
      </div>
    </div>
  );
};

export const GearingVisualizer = ({
  gearRatios,
  finalDrive,
  tuneType,
  horsepower = 400,
  redlineRpm = 7500,
  specs,
  tune,
  unitSystem = 'imperial',
}: GearingVisualizerProps) => {
  const tireCircumferenceM = specs?.tireCircumference && Number.isFinite(specs.tireCircumference)
    ? specs.tireCircumference
    : 2.1;

  const gearData = useMemo(
    () => calculateGearData(gearRatios, finalDrive, horsepower, redlineRpm, tireCircumferenceM, unitSystem),
    [gearRatios, finalDrive, horsepower, redlineRpm, tireCircumferenceM, unitSystem]
  );

  // Get color based on tune type - coherent neon palette
  const tuneColors = {
    grip: 'hsl(var(--neon-cyan))',
    street: 'hsl(var(--neon-pink))',
    drift: 'hsl(var(--neon-yellow))',
    offroad: 'hsl(var(--module-suspension))',
    rally: 'hsl(var(--module-tires))',
    drag: 'hsl(var(--neon-purple))',
  };

  const primaryColor = tuneColors[tuneType] || tuneColors.grip;
  const speedUnit = unitSystem === 'imperial' ? 'MPH' : 'km/h';

  return (
    <div className="space-y-6">
      {/* Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="module-block p-3 text-center">
          <Gauge className="w-5 h-5 mx-auto mb-1 text-neon-cyan" />
          <div className="text-lg font-display text-foreground">{finalDrive.toFixed(2)}</div>
          <div className="text-[10px] text-muted-foreground uppercase">Final Drive</div>
        </div>
        <div className="module-block p-3 text-center">
          <Gauge className="w-5 h-5 mx-auto mb-1 text-neon-pink" />
          <div className="text-lg font-display text-foreground">{gearRatios.length}</div>
          <div className="text-[10px] text-muted-foreground uppercase">Gears</div>
        </div>
        <div className="module-block p-3 text-center">
          <ArrowUp className="w-5 h-5 mx-auto mb-1 text-neon-yellow" />
          <div className="text-lg font-display text-foreground">{gearData[gearData.length - 1]?.speedAtRedline || 0}</div>
          <div className="text-[10px] text-muted-foreground uppercase">Top {speedUnit}</div>
        </div>
        <div className="module-block p-3 text-center">
          <Activity className="w-5 h-5 mx-auto mb-1 text-neon-purple" />
          <div className="text-lg font-display text-foreground">{Math.round(redlineRpm * 0.92)}</div>
          <div className="text-[10px] text-muted-foreground uppercase">Shift RPM</div>
        </div>
      </div>

      {/* Gear Ratio Ladder Diagram */}
      <div className="module-block p-4">
        <h4 className="font-sketch text-sm text-neon-cyan mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          Gear Ratio Ladder
        </h4>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={gearData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="ratioGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--neon-cyan))" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="hsl(var(--neon-cyan))" stopOpacity={0.2} />
                </linearGradient>
                <linearGradient id="speedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--neon-pink))" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="hsl(var(--neon-pink))" stopOpacity={0.2} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis 
                dataKey="gearLabel" 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
              />
              <YAxis 
                yAxisId="ratio"
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                domain={[0, 'auto']}
                tickFormatter={(v) => v.toFixed(1)}
              />
              <YAxis 
                yAxisId="speed"
                orientation="right"
                tick={{ fill: 'hsl(var(--neon-pink))', fontSize: 10 }}
                axisLine={{ stroke: 'hsl(var(--neon-pink) / 0.3)' }}
                domain={[0, 'auto']}
                tickFormatter={(v) => `${v}`}
              />
              <Tooltip content={(props) => <GearTooltip {...props} unitSystem={unitSystem} />} />
              <Bar 
                yAxisId="ratio"
                dataKey="ratio" 
                fill="url(#ratioGradient)"
                radius={[4, 4, 0, 0]}
              >
                {gearData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`}
                    fill={`hsl(var(--neon-cyan) / ${0.4 + (index * 0.1)})`}
                    stroke="hsl(var(--neon-cyan))"
                    strokeWidth={1}
                  />
                ))}
              </Bar>
              <Line
                yAxisId="speed"
                type="monotone"
                dataKey="speedAtRedline"
                stroke="hsl(var(--neon-pink))"
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--neon-pink))', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, strokeWidth: 2 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-6 mt-3 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-neon-cyan/60" />
            <span className="text-muted-foreground">Gear Ratio</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-neon-pink" />
            <span className="text-muted-foreground">Max Speed ({speedUnit})</span>
          </div>
        </div>
      </div>
    </div>
  );
};
