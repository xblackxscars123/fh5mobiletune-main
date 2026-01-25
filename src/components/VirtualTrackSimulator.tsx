import { useState, useMemo, useCallback } from 'react';
import { CarSpecs, TuneSettings, TuneType } from '@/lib/tuningCalculator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Play,
  Pause,
  RotateCcw,
  Target,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Car,
  Gauge,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface VirtualTrackSimulatorProps {
  specs: CarSpecs;
  tune: TuneSettings;
  tuneType: TuneType;
  className?: string;
}

interface TrackSegment {
  id: string;
  name: string;
  type: 'straight' | 'corner' | 'hill' | 'brake_zone';
  length: number; // meters
  difficulty: 'easy' | 'medium' | 'hard';
  description: string;
  targetSpeed?: number; // km/h
  cornerRadius?: number; // meters
  downhill?: number; // percentage grade
}

interface SimulationResult {
  segmentId: string;
  maxSpeed: number;
  avgSpeed: number;
  tireTemp: number;
  stability: number;
  fuelEfficiency: number;
  issues: string[];
  recommendations: string[];
}

const trackSegments: TrackSegment[] = [
  {
    id: 'start',
    name: 'Rolling Start',
    type: 'straight',
    length: 200,
    difficulty: 'easy',
    description: 'Gentle acceleration from standstill',
    targetSpeed: 80
  },
  {
    id: 'ess_bend',
    name: 'Esses Bend',
    type: 'corner',
    length: 150,
    difficulty: 'medium',
    description: 'Tight alternating corners',
    cornerRadius: 25,
    targetSpeed: 60
  },
  {
    id: 'main_straight',
    name: 'Main Straight',
    type: 'straight',
    length: 800,
    difficulty: 'easy',
    description: 'Long high-speed section',
    targetSpeed: 220
  },
  {
    id: 'hairpin',
    name: 'Mountain Hairpin',
    type: 'corner',
    length: 80,
    difficulty: 'hard',
    description: 'Tight 180° corner',
    cornerRadius: 15,
    downhill: 8,
    targetSpeed: 35
  },
  {
    id: 'climb',
    name: 'Hill Climb',
    type: 'hill',
    length: 300,
    difficulty: 'medium',
    description: 'Steep uphill section',
    downhill: -12,
    targetSpeed: 120
  },
  {
    id: 'brake_zone',
    name: 'Final Brake Zone',
    type: 'brake_zone',
    length: 100,
    difficulty: 'hard',
    description: 'Heavy braking into final corner',
    targetSpeed: 180
  }
];

export function VirtualTrackSimulator({
  specs,
  tune,
  tuneType,
  className = ''
}: VirtualTrackSimulatorProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [currentSegment, setCurrentSegment] = useState(0);
  const [progress, setProgress] = useState(0);
  const [simulationResults, setSimulationResults] = useState<SimulationResult[]>([]);
  const [overallScore, setOverallScore] = useState(0);

  const simulateSegment = useCallback((segment: TrackSegment): SimulationResult => {
    const basePower = specs.horsepower || 400;
    const weight = specs.weight;

    let maxSpeed = 0;
    let stability = 85; // Base stability
    let tireTemp = 85; // Base tire temperature
    let fuelEfficiency = 90; // Base fuel efficiency
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Calculate segment-specific performance
    switch (segment.type) {
      case 'straight':
        // Straight line performance based on power and aero
        maxSpeed = Math.min(
          segment.targetSpeed || 200,
          Math.sqrt((basePower * 2.2) / (0.3 * 0.0001 * weight)) // Simplified physics
        );

        if (maxSpeed < (segment.targetSpeed || 200) * 0.9) {
          issues.push('Underperforming on straights');
          recommendations.push('Consider reducing drag or increasing power');
        }
        break;

      case 'corner':
        // Cornering performance based on suspension and tires
        const corneringGrip = Math.min(tune.tirePressureFront, tune.tirePressureRear) / 40;
        const suspensionBalance = Math.abs(tune.arbFront - tune.arbRear) / 30;

        stability = Math.max(60, 100 - suspensionBalance * 20);
        maxSpeed = Math.min(
          segment.targetSpeed || 100,
          Math.sqrt(32.2 * (segment.cornerRadius || 50) * corneringGrip)
        );

        tireTemp += (maxSpeed / 50) * 10; // Speed affects tire heating

        if (stability < 75) {
          issues.push('Poor corner stability');
          recommendations.push('Balance ARBs or adjust camber');
        }
        break;

      case 'hill':
        // Hill performance affected by weight distribution and power
        const grade = segment.downhill || 0;
        if (grade < 0) { // Uphill
          maxSpeed = Math.max(30, (segment.targetSpeed || 100) * (1 + grade / 100));
          fuelEfficiency -= Math.abs(grade) * 2;
        } else { // Downhill
          maxSpeed = (segment.targetSpeed || 100) * (1 + grade / 200);
        }

        if (fuelEfficiency < 80) {
          issues.push('Poor hill climbing efficiency');
          recommendations.push('Consider weight reduction or power upgrade');
        }
        break;

      case 'brake_zone':
        // Braking performance based on brake settings
        stability = Math.max(70, 100 - Math.abs(tune.brakeBalance - 50) * 2);

        if (stability < 80) {
          issues.push('Unbalanced braking');
          recommendations.push('Adjust brake bias for better stability');
        }
        break;
    }

    // Apply tune type modifiers
    switch (tuneType) {
      case 'drag':
        if (segment.type === 'straight') maxSpeed *= 1.1;
        if (segment.type === 'corner') stability *= 0.9;
        break;
      case 'drift':
        if (segment.type === 'corner') stability *= 0.8;
        tireTemp += 15;
        break;
      case 'offroad':
        stability *= 0.9;
        fuelEfficiency *= 0.95;
        break;
    }

    const avgSpeed = maxSpeed * 0.85; // Assume 85% of max speed average

    return {
      segmentId: segment.id,
      maxSpeed: Math.round(maxSpeed),
      avgSpeed: Math.round(avgSpeed),
      tireTemp: Math.round(tireTemp),
      stability: Math.round(stability),
      fuelEfficiency: Math.round(fuelEfficiency),
      issues,
      recommendations
    };
  }, [specs, tune, tuneType]);

  const runSimulation = useCallback(async () => {
    setIsRunning(true);
    setSimulationResults([]);
    setProgress(0);
    setOverallScore(0);

    const results: SimulationResult[] = [];
    let totalScore = 0;

    for (let i = 0; i < trackSegments.length; i++) {
      setCurrentSegment(i);
      const segment = trackSegments[i];
      const result = simulateSegment(segment);
      results.push(result);

      // Calculate score for this segment
      const speedScore = Math.min(100, (result.maxSpeed / (segment.targetSpeed || 100)) * 100);
      const stabilityScore = result.stability;
      const efficiencyScore = result.fuelEfficiency;
      const segmentScore = (speedScore * 0.5 + stabilityScore * 0.3 + efficiencyScore * 0.2);

      totalScore += segmentScore;

      setSimulationResults([...results]);
      setProgress(((i + 1) / trackSegments.length) * 100);

      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 800));
    }

    const finalScore = Math.round(totalScore / trackSegments.length);
    setOverallScore(finalScore);
    setIsRunning(false);
  }, [simulateSegment]);

  const resetSimulation = () => {
    setIsRunning(false);
    setCurrentSegment(0);
    setProgress(0);
    setSimulationResults([]);
    setOverallScore(0);
  };

  const getSegmentIcon = (type: TrackSegment['type']) => {
    switch (type) {
      case 'straight': return '━';
      case 'corner': return '⤸';
      case 'hill': return '↗';
      case 'brake_zone': return '⚠';
      default: return '•';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-400';
    if (score >= 70) return 'text-blue-400';
    if (score >= 55) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 85) return { text: 'Excellent', color: 'emerald' };
    if (score >= 70) return { text: 'Good', color: 'blue' };
    if (score >= 55) return { text: 'Fair', color: 'yellow' };
    return { text: 'Needs Work', color: 'red' };
  };

  const scoreBadge = getScoreBadge(overallScore);

  return (
    <Card className={cn('bg-gradient-to-br from-slate-900/50 to-slate-800/50 border-slate-700', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-slate-200">
          <Car className="w-4 h-4 text-orange-400" />
          Virtual Track Simulator
        </CardTitle>
        <div className="flex items-center gap-2 mt-2">
          {overallScore > 0 && (
            <Badge variant="outline" className={cn('text-xs', `text-${scoreBadge.color}-400`)}>
              {scoreBadge.text} ({overallScore}%)
            </Badge>
          )}
          <span className="text-xs text-slate-400">
            {overallScore > 0 ? 'Simulation complete' : 'Test your tune on virtual track'}
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Controls */}
        <div className="flex items-center gap-2">
          <Button
            onClick={runSimulation}
            disabled={isRunning}
            size="sm"
            className="flex-1"
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4 mr-2" />
                Running...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Run Simulation
              </>
            )}
          </Button>

          <Button
            onClick={resetSimulation}
            variant="outline"
            size="sm"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>

        {/* Progress */}
        {isRunning && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Progress</span>
              <span className="text-slate-300">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="text-center text-xs text-slate-500">
              Testing: {trackSegments[currentSegment]?.name}
            </div>
          </div>
        )}

        {/* Track Visualization */}
        <div className="space-y-2">
          <div className="text-xs text-slate-400 uppercase tracking-wide">Track Layout</div>
          <div className="flex items-center gap-1 overflow-x-auto">
            {trackSegments.map((segment, index) => {
              const result = simulationResults.find(r => r.segmentId === segment.id);
              const isActive = isRunning && index === currentSegment;
              const hasResult = !!result;

              return (
                <div
                  key={segment.id}
                  className={cn(
                    'flex-shrink-0 w-8 h-8 rounded border flex items-center justify-center text-xs',
                    isActive && 'bg-orange-500/20 border-orange-500 animate-pulse',
                    hasResult && 'bg-emerald-500/20 border-emerald-500',
                    !hasResult && !isActive && 'bg-slate-700 border-slate-600'
                  )}
                  title={`${segment.name}: ${segment.description}`}
                >
                  {getSegmentIcon(segment.type)}
                </div>
              );
            })}
          </div>
        </div>

        {/* Results */}
        {simulationResults.length > 0 && (
          <Tabs defaultValue="summary" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="summary" className="text-xs">Summary</TabsTrigger>
              <TabsTrigger value="details" className="text-xs">Details</TabsTrigger>
            </TabsList>

            <TabsContent value="summary" className="mt-4 space-y-3">
              {/* Overall Performance */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-600">
                  <div className="flex items-center gap-2 mb-1">
                    <Target className="w-3 h-3 text-emerald-400" />
                    <span className="text-xs text-slate-400 uppercase tracking-wide">Overall Score</span>
                  </div>
                  <div className={cn('text-xl font-bold', getScoreColor(overallScore))}>
                    {overallScore}%
                  </div>
                </div>

                <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-600">
                  <div className="flex items-center gap-2 mb-1">
                    <Gauge className="w-3 h-3 text-blue-400" />
                    <span className="text-xs text-slate-400 uppercase tracking-wide">Avg Speed</span>
                  </div>
                  <div className="text-xl font-bold text-white">
                    {Math.round(simulationResults.reduce((sum, r) => sum + r.avgSpeed, 0) / simulationResults.length)} km/h
                  </div>
                </div>
              </div>

              {/* Key Issues */}
              {simulationResults.some(r => r.issues.length > 0) && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span className="text-sm font-medium text-white">Areas for Improvement</span>
                  </div>
                  <div className="space-y-1">
                    {simulationResults
                      .flatMap(r => r.issues.map(issue => ({ issue, segment: trackSegments.find(s => s.id === r.segmentId)?.name })))
                      .slice(0, 3)
                      .map((item, index) => (
                        <div key={index} className="text-xs text-slate-300 bg-amber-500/10 rounded px-2 py-1 border border-amber-500/20">
                          {item.segment}: {item.issue}
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="details" className="mt-4">
              <div className="space-y-3">
                {simulationResults.map((result, index) => {
                  const segment = trackSegments.find(s => s.id === result.segmentId);
                  if (!segment) return null;

                  return (
                    <div key={result.segmentId} className="bg-slate-800/30 rounded-lg p-3 border border-slate-600">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{getSegmentIcon(segment.type)}</span>
                          <div>
                            <div className="text-sm font-medium text-white">{segment.name}</div>
                            <div className="text-xs text-slate-400">{segment.description}</div>
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className={cn('text-xs', result.stability >= 80 ? 'text-emerald-400' : 'text-amber-400')}
                        >
                          {result.stability}% stable
                        </Badge>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <span className="text-slate-400">Max Speed:</span>
                          <div className="text-white font-medium">{result.maxSpeed} km/h</div>
                        </div>
                        <div>
                          <span className="text-slate-400">Tire Temp:</span>
                          <div className="text-white font-medium">{result.tireTemp}°C</div>
                        </div>
                        <div>
                          <span className="text-slate-400">Efficiency:</span>
                          <div className="text-white font-medium">{result.fuelEfficiency}%</div>
                        </div>
                      </div>

                      {result.recommendations.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-slate-700">
                          <div className="text-xs text-blue-400">
                            💡 {result.recommendations[0]}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
        )}

        <div className="pt-3 border-t border-slate-700">
          <p className="text-xs text-slate-500 text-center">
            🏎️ Test your tune virtually before hitting the track
          </p>
        </div>
      </CardContent>
    </Card>
  );
}