import { useState, useMemo } from 'react';
import { TuneSettings, UnitSystem, unitConversions } from '@/lib/tuningCalculator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Minus,
  Zap,
  Gauge,
  Target,
  Award,
  AlertTriangle,
  CheckCircle,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TuneComparisonProps {
  tune1: TuneSettings;
  tune2: TuneSettings;
  label1?: string;
  label2?: string;
  unitSystem: UnitSystem;
  className?: string;
}

interface ComparisonMetric {
  key: string;
  label: string;
  value1: number | string;
  value2: number | string;
  unit?: string;
  higherIsBetter?: boolean;
  format?: 'number' | 'percentage' | 'time';
  category: 'performance' | 'handling' | 'durability';
}

const formatValue = (value: number | string, format?: string, unit?: string): string => {
  if (typeof value === 'string') return value;

  switch (format) {
    case 'percentage':
      return `${value}%`;
    case 'time':
      return `${value}s`;
    case 'number':
    default:
      return unit ? `${value} ${unit}` : value.toString();
  }
};

const getComparisonIcon = (diff: number, higherIsBetter = true) => {
  if (diff === 0) return <Minus className="w-4 h-4 text-slate-400" />;

  const isPositive = higherIsBetter ? diff > 0 : diff < 0;

  if (isPositive) {
    return <ArrowUp className="w-4 h-4 text-emerald-400" />;
  } else {
    return <ArrowDown className="w-4 h-4 text-red-400" />;
  }
};

const getDifferenceColor = (diff: number) => {
  if (diff === 0) return 'text-slate-400';
  return diff > 0 ? 'text-emerald-400' : 'text-red-400';
};

export function TuneComparison({
  tune1,
  tune2,
  label1 = 'Tune 1',
  label2 = 'Tune 2',
  unitSystem,
  className = ''
}: TuneComparisonProps) {
  const [activeTab, setActiveTab] = useState('overview');

  const metrics = useMemo((): ComparisonMetric[] => {
    const pressureUnit = unitSystem === 'imperial' ? 'PSI' : 'BAR';
    const springUnit = unitSystem === 'imperial' ? 'LB/IN' : 'KG/MM';
    const aeroUnit = unitSystem === 'imperial' ? 'LB' : 'N';
    const rideHeightUnit = unitSystem === 'imperial' ? '"' : 'CM';

    return [
      // Performance
      { key: 'tirePressureFront', label: 'Front Tire Pressure', value1: tune1.tirePressureFront, value2: tune2.tirePressureFront, unit: pressureUnit, category: 'performance' },
      { key: 'tirePressureRear', label: 'Rear Tire Pressure', value1: tune1.tirePressureRear, value2: tune2.tirePressureRear, unit: pressureUnit, category: 'performance' },
      { key: 'finalDrive', label: 'Final Drive', value1: tune1.finalDrive, value2: tune2.finalDrive, category: 'performance' },

      // Handling
      { key: 'springsFront', label: 'Front Springs', value1: tune1.springsFront, value2: tune2.springsFront, unit: springUnit, category: 'handling' },
      { key: 'springsRear', label: 'Rear Springs', value1: tune1.springsRear, value2: tune2.springsRear, unit: springUnit, category: 'handling' },
      { key: 'arbFront', label: 'Front ARB', value1: tune1.arbFront, value2: tune2.arbFront, category: 'handling' },
      { key: 'arbRear', label: 'Rear ARB', value1: tune1.arbRear, value2: tune2.arbRear, category: 'handling' },
      { key: 'camberFront', label: 'Front Camber', value1: tune1.camberFront, value2: tune2.camberFront, unit: '°', category: 'handling' },
      { key: 'camberRear', label: 'Rear Camber', value1: tune1.camberRear, value2: tune2.camberRear, unit: '°', category: 'handling' },

      // Aerodynamics
      { key: 'aeroFront', label: 'Front Aero', value1: tune1.aeroFront, value2: tune2.aeroFront, unit: aeroUnit, category: 'performance' },
      { key: 'aeroRear', label: 'Rear Aero', value1: tune1.aeroRear, value2: tune2.aeroRear, unit: aeroUnit, category: 'performance' },

      // Ride Height
      { key: 'rideHeightFront', label: 'Front Ride Height', value1: tune1.rideHeightFront, value2: tune2.rideHeightFront, unit: rideHeightUnit, category: 'handling' },
      { key: 'rideHeightRear', label: 'Rear Ride Height', value1: tune1.rideHeightRear, value2: tune2.rideHeightRear, unit: rideHeightUnit, category: 'handling' },

      // Differential
      { key: 'diffAccelRear', label: 'Rear Accel Lock', value1: tune1.diffAccelRear, value2: tune2.diffAccelRear, unit: '%', category: 'handling' },
      { key: 'diffDecelRear', label: 'Rear Decel Lock', value1: tune1.diffDecelRear, value2: tune2.diffDecelRear, unit: '%', category: 'handling' },

      // Brakes
      { key: 'brakePressure', label: 'Brake Pressure', value1: tune1.brakePressure, value2: tune2.brakePressure, unit: '%', category: 'performance' },
      { key: 'brakeBalance', label: 'Brake Balance', value1: tune1.brakeBalance, value2: tune2.brakeBalance, unit: '%', category: 'handling' },
    ];
  }, [tune1, tune2, unitSystem]);

  const performanceMetrics = metrics.filter(m => m.category === 'performance');
  const handlingMetrics = metrics.filter(m => m.category === 'handling');
  const durabilityMetrics = metrics.filter(m => m.category === 'durability');

  const calculateDifferences = (metrics: ComparisonMetric[]) => {
    return metrics.map(metric => {
      const val1 = typeof metric.value1 === 'number' ? metric.value1 : 0;
      const val2 = typeof metric.value2 === 'number' ? metric.value2 : 0;
      const diff = val2 - val1;

      return {
        ...metric,
        difference: diff,
        formattedDiff: diff > 0 ? `+${diff.toFixed(1)}` : diff.toFixed(1),
        isSignificant: Math.abs(diff) > (metric.unit === '%' ? 5 : metric.unit === '°' ? 0.5 : 10)
      };
    });
  };

  const performanceDiffs = calculateDifferences(performanceMetrics);
  const handlingDiffs = calculateDifferences(handlingMetrics);

  const getOverallAssessment = () => {
    const significantChanges = [...performanceDiffs, ...handlingDiffs]
      .filter(d => d.isSignificant).length;

    const avgPerformanceDiff = performanceDiffs.reduce((sum, d) => sum + d.difference, 0) / performanceDiffs.length;
    const avgHandlingDiff = handlingDiffs.reduce((sum, d) => sum + d.difference, 0) / handlingDiffs.length;

    if (significantChanges < 3) return { status: 'Similar', color: 'slate', message: 'Tunes are very similar' };
    if (avgPerformanceDiff > 5) return { status: 'Performance Boost', color: 'emerald', message: 'Tune 2 focuses on performance' };
    if (avgHandlingDiff > 2) return { status: 'Better Handling', color: 'blue', message: 'Tune 2 improves handling' };
    if (avgPerformanceDiff < -5) return { status: 'Conservative', color: 'amber', message: 'Tune 2 is more conservative' };

    return { status: 'Balanced', color: 'purple', message: 'Tunes have different priorities' };
  };

  const assessment = getOverallAssessment();

  const renderMetricComparison = (metric: ComparisonMetric) => {
    const val1 = typeof metric.value1 === 'number' ? metric.value1 : 0;
    const val2 = typeof metric.value2 === 'number' ? metric.value2 : 0;
    const diff = val2 - val1;

    return (
      <div key={metric.key} className="flex items-center justify-between py-2 px-3 border-b border-slate-700/50 last:border-b-0">
        <div className="flex-1">
          <div className="text-sm font-medium text-white">{metric.label}</div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-300 min-w-[80px] text-right">
            {formatValue(metric.value1, metric.format, metric.unit)}
          </span>
          <div className="flex items-center gap-1 min-w-[60px]">
            {getComparisonIcon(diff, metric.higherIsBetter)}
            <span className={cn('text-xs font-medium', getDifferenceColor(diff))}>
              {diff === 0 ? '=' : diff > 0 ? `+${diff.toFixed(1)}` : diff.toFixed(1)}
            </span>
          </div>
          <span className="text-sm text-slate-300 min-w-[80px] text-right">
            {formatValue(metric.value2, metric.format, metric.unit)}
          </span>
        </div>
      </div>
    );
  };

  return (
    <Card className={cn('bg-gradient-to-br from-slate-900/50 to-slate-800/50 border-slate-700', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-slate-200">
          <BarChart3 className="w-4 h-4 text-blue-400" />
          Tune Comparison
        </CardTitle>
        <div className="flex items-center gap-2 mt-2">
          <Badge variant="outline" className={cn('text-xs', `text-${assessment.color}-400`)}>
            {assessment.status}
          </Badge>
          <span className="text-xs text-slate-400">{assessment.message}</span>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
            <TabsTrigger value="performance" className="text-xs">Performance</TabsTrigger>
            <TabsTrigger value="handling" className="text-xs">Handling</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4 space-y-4">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-600">
                <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">{label1}</div>
                <div className="text-lg font-bold text-white">{label1}</div>
                <div className="text-xs text-slate-500 mt-1">
                  {performanceMetrics.length} settings
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-600">
                <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">{label2}</div>
                <div className="text-lg font-bold text-white">{label2}</div>
                <div className="text-xs text-slate-500 mt-1">
                  {performanceMetrics.length} settings
                </div>
              </div>
            </div>

            {/* Key Differences */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-white">Key Differences</h4>
              <div className="space-y-1">
                {[...performanceDiffs, ...handlingDiffs]
                  .filter(d => d.isSignificant)
                  .slice(0, 5)
                  .map(diff => (
                    <div key={diff.key} className="flex items-center justify-between text-xs">
                      <span className="text-slate-300">{diff.label}</span>
                      <div className="flex items-center gap-1">
                        {getComparisonIcon(diff.difference, diff.higherIsBetter)}
                        <span className={cn('font-medium', getDifferenceColor(diff.difference))}>
                          {diff.formattedDiff}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="mt-4">
            <div className="space-y-1">
              {performanceMetrics.map(renderMetricComparison)}
            </div>
          </TabsContent>

          <TabsContent value="handling" className="mt-4">
            <div className="space-y-1">
              {handlingMetrics.map(renderMetricComparison)}
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-4 pt-3 border-t border-slate-700">
          <p className="text-xs text-slate-500 text-center">
            💡 Compare different tune approaches to optimize your setup
          </p>
        </div>
      </CardContent>
    </Card>
  );
}