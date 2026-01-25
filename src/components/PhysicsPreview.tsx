import { useMemo } from 'react';
import { CarSpecs, TuneType } from '@/lib/tuningCalculator';
import { estimateZeroToSixty, estimateTopSpeed } from '@/lib/performancePrediction';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, Gauge, Target, TrendingUp } from 'lucide-react';

interface PhysicsPreviewProps {
  specs: CarSpecs;
  tuneType: TuneType;
  className?: string;
}

export function PhysicsPreview({ specs, tuneType, className = '' }: PhysicsPreviewProps) {
  const predictions = useMemo(() => {
    const zeroToSixty = estimateZeroToSixty(
      specs.horsepower || 400,
      specs.weight,
      1.0 // Base tire grip
    );

    const topSpeed = estimateTopSpeed(
      specs.horsepower || 400,
      specs.weight,
      0.3, // Drag coefficient
      specs.weight * 0.15 // Effective frontal area proxy
    );

    const powerToWeight = (specs.horsepower || 400) / (specs.weight / 1000);

    return {
      zeroToSixty: Math.round(zeroToSixty * 10) / 10,
      topSpeed: Math.round(topSpeed),
      powerToWeight: Math.round(powerToWeight * 10) / 10,
      gripLevel: getGripLevel(specs.tireCompound),
    };
  }, [specs]);

  const getPerformanceBadge = (pwr: number) => {
    if (pwr >= 0.25) return { text: 'High Performance', variant: 'destructive' as const };
    if (pwr >= 0.18) return { text: 'Sports Car', variant: 'default' as const };
    if (pwr >= 0.12) return { text: 'Balanced', variant: 'secondary' as const };
    return { text: 'Efficient', variant: 'outline' as const };
  };

  const performanceBadge = getPerformanceBadge(predictions.powerToWeight);

  return (
    <Card className={`bg-gradient-to-br from-slate-900/50 to-slate-800/50 border-slate-700 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-slate-200">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          Live Performance Preview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Performance Metrics Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-600">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-3 h-3 text-yellow-400" />
              <span className="text-xs text-slate-400 uppercase tracking-wide">0-60 mph</span>
            </div>
            <div className="text-lg font-bold text-white">{predictions.zeroToSixty}s</div>
            <div className="text-xs text-slate-500">Acceleration</div>
          </div>

          <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-600">
            <div className="flex items-center gap-2 mb-1">
              <Gauge className="w-3 h-3 text-blue-400" />
              <span className="text-xs text-slate-400 uppercase tracking-wide">Top Speed</span>
            </div>
            <div className="text-lg font-bold text-white">{predictions.topSpeed} mph</div>
            <div className="text-xs text-slate-500">Theoretical max</div>
          </div>
        </div>

        {/* Power-to-Weight & Grip */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-300">Power-to-Weight:</span>
            <Badge variant={performanceBadge.variant} className="text-xs">
              {predictions.powerToWeight} hp/ton
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-300">Tire Grip Level:</span>
            <Badge variant="outline" className="text-xs">
              {predictions.gripLevel}/10
            </Badge>
          </div>
        </div>

        {/* Performance Category */}
        <div className="pt-2 border-t border-slate-700">
          <Badge variant={performanceBadge.variant} className="w-full justify-center py-1">
            {performanceBadge.text} Vehicle
          </Badge>
        </div>

        {/* Quick Insights */}
        <div className="text-xs text-slate-500 space-y-1">
          {predictions.zeroToSixty < 4 && (
            <div className="flex items-center gap-1 text-emerald-400">
              <Target className="w-3 h-3" />
              Supercar acceleration
            </div>
          )}
          {predictions.topSpeed > 180 && (
            <div className="flex items-center gap-1 text-blue-400">
              <Gauge className="w-3 h-3" />
              High-speed capable
            </div>
          )}
          {predictions.powerToWeight > 0.2 && (
            <div className="flex items-center gap-1 text-orange-400">
              <Zap className="w-3 h-3" />
              Track-ready performance
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Helper function to estimate grip level
function getGripLevel(tireCompound: string): number {
  const gripLevels: Record<string, number> = {
    'street': 6,
    'sport': 8,
    'semi-slick': 9,
    'slick': 10,
    'rally': 7,
    'offroad': 5,
    'drag': 9,
  };

  return gripLevels[tireCompound] || 7;
}