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
  ReferenceLine,
  Cell,
  AreaChart,
  Area,
  Legend,
} from 'recharts';
import { TuneType } from '@/lib/tuningCalculator';
import { cn } from '@/lib/utils';
import { Gauge, Zap, ArrowUp, TrendingUp, Activity } from 'lucide-react';

interface GearingVisualizerProps {
  gearRatios: number[];
  finalDrive: number;
  tuneType: TuneType;
  horsepower?: number;
  redlineRpm?: number;
}

// Calculate simulated shift points and speed estimates
const calculateGearData = (
  gearRatios: number[],
  finalDrive: number,
  horsepower: number,
  redlineRpm: number
) => {
  const tireCircumference = 2.1; // meters (typical for performance tires)
  const transmissionEfficiency = 0.85;
  
  return gearRatios.map((ratio, index) => {
    const overallRatio = ratio * finalDrive;
    const optimalShiftRpm = redlineRpm * 0.92; // Shift at ~92% of redline
    const peakPowerRpm = redlineRpm * 0.82; // Peak power at ~82% of redline
    
    // Speed at redline for this gear (km/h)
    const speedAtRedline = (redlineRpm * tireCircumference * 60) / (overallRatio * 1000);
    
    // Speed at optimal shift point
    const speedAtShift = (optimalShiftRpm * tireCircumference * 60) / (overallRatio * 1000);
    
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
      speedAtShift: Math.round(speedAtShift),
      shiftRpm: optimalShiftRpm,
      accelerationForce: Math.round(accelerationForce),
      wheelTorque: Math.round(wheelTorque),
      dropRatio: Math.round(dropRatio),
    };
  });
};

// Calculate acceleration vs top speed tradeoff data
const calculateTradeoffData = (finalDrive: number, baselineRatios: number[]) => {
  const variations = [];
  
  for (let i = -4; i <= 4; i++) {
    const fdMultiplier = 1 + (i * 0.05); // -20% to +20%
    const modifiedFD = finalDrive * fdMultiplier;
    
    // Simplified acceleration score (higher FD = better accel)
    const accelScore = Math.min(100, (modifiedFD / 3.0) * 70 + 30);
    
    // Simplified top speed score (lower FD = higher top speed)
    const topSpeedScore = Math.min(100, ((6 - modifiedFD) / 3.0) * 70 + 30);
    
    variations.push({
      label: i === 0 ? 'Current' : `${i > 0 ? '+' : ''}${(i * 5)}%`,
      finalDrive: Math.round(modifiedFD * 100) / 100,
      acceleration: Math.round(accelScore),
      topSpeed: Math.round(topSpeedScore),
      isCurrent: i === 0,
      offset: i,
    });
  }
  
  return variations;
};

// Custom tooltip component
const GearTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null;
  
  const data = payload[0]?.payload;
  if (!data) return null;
  
  return (
    <div className="bg-background/95 backdrop-blur-sm border border-neon-cyan/30 rounded-lg p-3 shadow-lg">
      <div className="font-display text-neon-cyan text-sm mb-2">
        {data.gearLabel || label} Gear
      </div>
      <div className="space-y-1 text-xs">
        {data.ratio && (
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Ratio:</span>
            <span className="text-foreground font-mono">{data.ratio.toFixed(2)}</span>
          </div>
        )}
        {data.speedAtRedline && (
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Max Speed:</span>
            <span className="text-neon-pink font-mono">{data.speedAtRedline} km/h</span>
          </div>
        )}
        {data.shiftRpm && (
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Shift Point:</span>
            <span className="text-neon-yellow font-mono">{Math.round(data.shiftRpm)} RPM</span>
          </div>
        )}
        {data.dropRatio > 0 && (
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Drop to next:</span>
            <span className="text-module-suspension font-mono">{data.dropRatio}%</span>
          </div>
        )}
      </div>
    </div>
  );
};

const TradeoffTooltip = ({ active, payload }: any) => {
  if (!active || !payload || !payload.length) return null;
  
  const data = payload[0]?.payload;
  if (!data) return null;
  
  return (
    <div className="bg-background/95 backdrop-blur-sm border border-neon-pink/30 rounded-lg p-3 shadow-lg">
      <div className="font-display text-sm mb-2" style={{ color: data.isCurrent ? 'hsl(var(--neon-cyan))' : 'hsl(var(--foreground))' }}>
        Final Drive: {data.finalDrive}
        {data.isCurrent && <span className="ml-2 text-xs">(Current)</span>}
      </div>
      <div className="space-y-1 text-xs">
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">Acceleration:</span>
          <span className="text-neon-cyan font-mono">{data.acceleration}%</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">Top Speed:</span>
          <span className="text-neon-pink font-mono">{data.topSpeed}%</span>
        </div>
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
}: GearingVisualizerProps) => {
  const gearData = useMemo(
    () => calculateGearData(gearRatios, finalDrive, horsepower, redlineRpm),
    [gearRatios, finalDrive, horsepower, redlineRpm]
  );

  const tradeoffData = useMemo(
    () => calculateTradeoffData(finalDrive, gearRatios),
    [finalDrive, gearRatios]
  );

  // Get color based on tune type
  const tuneColors = {
    grip: 'hsl(var(--neon-cyan))',
    street: 'hsl(var(--neon-pink))',
    drift: 'hsl(var(--neon-yellow))',
    offroad: 'hsl(142, 70%, 50%)',
    rally: 'hsl(25, 90%, 55%)',
    drag: 'hsl(280, 80%, 60%)',
  };

  const primaryColor = tuneColors[tuneType] || tuneColors.grip;

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
          <Zap className="w-5 h-5 mx-auto mb-1 text-neon-pink" />
          <div className="text-lg font-display text-foreground">{gearRatios.length}</div>
          <div className="text-[10px] text-muted-foreground uppercase">Gears</div>
        </div>
        <div className="module-block p-3 text-center">
          <ArrowUp className="w-5 h-5 mx-auto mb-1 text-neon-yellow" />
          <div className="text-lg font-display text-foreground">{gearData[gearData.length - 1]?.speedAtRedline || 0}</div>
          <div className="text-[10px] text-muted-foreground uppercase">Top km/h</div>
        </div>
        <div className="module-block p-3 text-center">
          <Activity className="w-5 h-5 mx-auto mb-1 text-module-suspension" />
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
              <Tooltip content={<GearTooltip />} />
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
            <span className="text-muted-foreground">Max Speed (km/h)</span>
          </div>
        </div>
      </div>

      {/* Shift Point Markers */}
      <div className="module-block p-4">
        <h4 className="font-sketch text-sm text-neon-yellow mb-4 flex items-center gap-2">
          <Zap className="w-4 h-4" />
          Shift Point Markers
        </h4>
        <div className="space-y-2">
          {gearData.slice(0, -1).map((gear, index) => {
            const nextGear = gearData[index + 1];
            const rpmDrop = gear.shiftRpm - (nextGear ? (gear.shiftRpm * nextGear.ratio / gear.ratio) : gear.shiftRpm);
            
            return (
              <div key={gear.gear} className="flex items-center gap-3">
                <div className="w-12 text-xs font-mono text-muted-foreground">
                  {gear.gearLabel}→{nextGear?.gearLabel}
                </div>
                <div className="flex-1 relative h-6 bg-background/50 rounded-full overflow-hidden border border-border/50">
                  {/* RPM range bar */}
                  <div 
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-module-gearing/30 via-neon-yellow/40 to-neon-pink/30 rounded-full"
                    style={{ width: `${(gear.shiftRpm / redlineRpm) * 100}%` }}
                  />
                  {/* Shift point marker */}
                  <div 
                    className="absolute top-0 bottom-0 w-0.5 bg-neon-yellow"
                    style={{ left: `${(gear.shiftRpm / redlineRpm) * 100}%` }}
                  >
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-neon-yellow animate-pulse" />
                  </div>
                  {/* Redline marker */}
                  <div className="absolute right-0 top-0 bottom-0 w-1 bg-destructive/80 rounded-r-full" />
                </div>
                <div className="w-20 text-right">
                  <span className="text-xs font-mono text-neon-yellow">{Math.round(gear.shiftRpm)}</span>
                  <span className="text-[10px] text-muted-foreground ml-1">RPM</span>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-3 text-[10px] text-muted-foreground text-center">
          Optimal shift at ~92% of redline • Yellow marker = shift point • Red = redline
        </div>
      </div>

      {/* Acceleration vs Top Speed Tradeoff */}
      <div className="module-block p-4">
        <h4 className="font-sketch text-sm text-neon-pink mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          Acceleration vs Top Speed Tradeoff
        </h4>
        <div className="h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={tradeoffData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="accelGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--neon-cyan))" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="hsl(var(--neon-cyan))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="topSpeedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--neon-pink))" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="hsl(var(--neon-pink))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis 
                dataKey="label" 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
              />
              <YAxis 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                domain={[0, 100]}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip content={<TradeoffTooltip />} />
              <ReferenceLine 
                x="Current" 
                stroke="hsl(var(--neon-yellow))" 
                strokeDasharray="5 5"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="acceleration"
                stroke="hsl(var(--neon-cyan))"
                fill="url(#accelGradient)"
                strokeWidth={2}
                dot={({ cx, cy, payload }) => (
                  <circle
                    key={payload.label}
                    cx={cx}
                    cy={cy}
                    r={payload.isCurrent ? 6 : 3}
                    fill={payload.isCurrent ? 'hsl(var(--neon-yellow))' : 'hsl(var(--neon-cyan))'}
                    stroke={payload.isCurrent ? 'hsl(var(--neon-yellow))' : 'none'}
                    strokeWidth={2}
                  />
                )}
              />
              <Area
                type="monotone"
                dataKey="topSpeed"
                stroke="hsl(var(--neon-pink))"
                fill="url(#topSpeedGradient)"
                strokeWidth={2}
                dot={({ cx, cy, payload }) => (
                  <circle
                    key={`ts-${payload.label}`}
                    cx={cx}
                    cy={cy}
                    r={payload.isCurrent ? 6 : 3}
                    fill={payload.isCurrent ? 'hsl(var(--neon-yellow))' : 'hsl(var(--neon-pink))'}
                    stroke={payload.isCurrent ? 'hsl(var(--neon-yellow))' : 'none'}
                    strokeWidth={2}
                  />
                )}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-6 mt-3 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-neon-cyan" />
            <span className="text-muted-foreground">Acceleration</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-neon-pink" />
            <span className="text-muted-foreground">Top Speed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-neon-yellow" />
            <span className="text-muted-foreground">Current</span>
          </div>
        </div>
        <div className="mt-3 text-[10px] text-muted-foreground text-center">
          Shorter final drive (higher number) = better acceleration • Longer = higher top speed
        </div>
      </div>
    </div>
  );
};
