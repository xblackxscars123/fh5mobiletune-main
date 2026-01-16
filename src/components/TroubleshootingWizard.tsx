import { useState } from 'react';
import { Wrench, ArrowRight, ArrowLeft, RotateCcw, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

type Symptom = 
  | 'understeer' 
  | 'oversteer' 
  | 'power-understeer' 
  | 'snap-oversteer' 
  | 'bouncy' 
  | 'poor-traction'
  | 'slow-acceleration'
  | 'unstable-braking';

type Timing = 
  | 'corner-entry' 
  | 'mid-corner' 
  | 'corner-exit' 
  | 'straight-line' 
  | 'bumpy-sections'
  | 'all-the-time';

type Severity = 'slight' | 'moderate' | 'severe';

interface Recommendation {
  component: string;
  adjustment: string;
  direction: 'increase' | 'decrease' | 'check';
  explanation: string;
  priority: 'high' | 'medium' | 'low';
}

const symptomLabels: Record<Symptom, { label: string; description: string }> = {
  understeer: { label: 'Understeer', description: 'Front end pushes wide, car goes straight when turning' },
  oversteer: { label: 'Oversteer', description: 'Rear end slides out, car rotates too much' },
  'power-understeer': { label: 'Power Understeer (AWD)', description: 'Front pushes when accelerating out of corners' },
  'snap-oversteer': { label: 'Snap Oversteer', description: 'Sudden, violent rotation mid-corner or on lift-off' },
  bouncy: { label: 'Bouncy/Unstable', description: 'Car bounces or feels unsettled over bumps' },
  'poor-traction': { label: 'Poor Traction', description: 'Wheels spin excessively or slip easily' },
  'slow-acceleration': { label: 'Slow Out of Corners', description: 'Poor acceleration exiting corners' },
  'unstable-braking': { label: 'Unstable Under Braking', description: 'Car dives, locks up, or pulls to one side' },
};

const timingLabels: Record<Timing, string> = {
  'corner-entry': 'Corner Entry (Turn In)',
  'mid-corner': 'Mid-Corner (Apex)',
  'corner-exit': 'Corner Exit (Power On)',
  'straight-line': 'Straight Line',
  'bumpy-sections': 'Bumpy Sections',
  'all-the-time': 'All the Time',
};

function getRecommendations(symptom: Symptom, timing: Timing, severity: Severity): Recommendation[] {
  const recommendations: Recommendation[] = [];
  const severityMultiplier = severity === 'severe' ? 3 : severity === 'moderate' ? 2 : 1;

  // Understeer recommendations
  if (symptom === 'understeer') {
    if (timing === 'corner-entry' || timing === 'all-the-time') {
      recommendations.push({
        component: 'Front ARB',
        adjustment: `Soften by ${5 * severityMultiplier}-${10 * severityMultiplier}%`,
        direction: 'decrease',
        explanation: 'Softer front ARB allows more front grip during turn-in',
        priority: 'high',
      });
      recommendations.push({
        component: 'Rear ARB',
        adjustment: `Stiffen by ${5 * severityMultiplier}-${10 * severityMultiplier}%`,
        direction: 'increase',
        explanation: 'Stiffer rear transfers weight forward, improving front grip',
        priority: 'high',
      });
    }
    if (timing === 'mid-corner' || timing === 'all-the-time') {
      recommendations.push({
        component: 'Front Camber',
        adjustment: `Add ${0.3 * severityMultiplier}° negative`,
        direction: 'increase',
        explanation: 'More negative camber improves mid-corner grip',
        priority: 'medium',
      });
    }
    if (timing === 'corner-exit') {
      recommendations.push({
        component: 'Center Diff (AWD)',
        adjustment: 'Shift more power to rear',
        direction: 'decrease',
        explanation: 'More rear bias reduces front wheel loading during acceleration',
        priority: 'high',
      });
    }
    recommendations.push({
      component: 'Front Tire Pressure',
      adjustment: `Lower by ${0.5 * severityMultiplier}-${1 * severityMultiplier} PSI`,
      direction: 'decrease',
      explanation: 'Lower pressure increases contact patch for more grip',
      priority: 'medium',
    });
  }

  // Oversteer recommendations
  if (symptom === 'oversteer') {
    if (timing === 'corner-entry' || timing === 'all-the-time') {
      recommendations.push({
        component: 'Rear ARB',
        adjustment: `Soften by ${5 * severityMultiplier}-${10 * severityMultiplier}%`,
        direction: 'decrease',
        explanation: 'Softer rear ARB increases rear grip during turn-in',
        priority: 'high',
      });
    }
    if (timing === 'corner-exit') {
      recommendations.push({
        component: 'Rear Diff Acceleration',
        adjustment: `Reduce by ${5 * severityMultiplier}-${15 * severityMultiplier}%`,
        direction: 'decrease',
        explanation: 'Lower accel lock allows wheels to spin independently for better traction',
        priority: 'high',
      });
    }
    if (timing === 'mid-corner') {
      recommendations.push({
        component: 'Rear Springs',
        adjustment: `Soften by ${20 * severityMultiplier}-${40 * severityMultiplier} lb/in`,
        direction: 'decrease',
        explanation: 'Softer rear springs increase mechanical grip',
        priority: 'medium',
      });
    }
    recommendations.push({
      component: 'Rear Tire Pressure',
      adjustment: `Lower by ${0.5 * severityMultiplier}-${1 * severityMultiplier} PSI`,
      direction: 'decrease',
      explanation: 'Lower pressure increases rear contact patch',
      priority: 'medium',
    });
  }

  // Snap oversteer
  if (symptom === 'snap-oversteer') {
    recommendations.push({
      component: 'Rear Diff Deceleration',
      adjustment: `Reduce by ${10 * severityMultiplier}-${20 * severityMultiplier}%`,
      direction: 'decrease',
      explanation: 'Lower decel lock prevents sudden weight transfer causing snap',
      priority: 'high',
    });
    recommendations.push({
      component: 'Rear Rebound Damping',
      adjustment: `Reduce by ${1 * severityMultiplier}-${2 * severityMultiplier}`,
      direction: 'decrease',
      explanation: 'Allows rear to settle faster after weight shifts',
      priority: 'high',
    });
    recommendations.push({
      component: 'Rear ARB',
      adjustment: `Soften significantly`,
      direction: 'decrease',
      explanation: 'Prevents sudden loss of rear traction',
      priority: 'medium',
    });
  }

  // Power understeer (AWD)
  if (symptom === 'power-understeer') {
    recommendations.push({
      component: 'Center Diff',
      adjustment: 'Shift more power to rear (60-70% rear)',
      direction: 'increase',
      explanation: 'Reduces torque to front wheels causing push',
      priority: 'high',
    });
    recommendations.push({
      component: 'Front Diff Acceleration',
      adjustment: `Reduce by ${10 * severityMultiplier}-${20 * severityMultiplier}%`,
      direction: 'decrease',
      explanation: 'Lower front accel allows better front steering',
      priority: 'high',
    });
    recommendations.push({
      component: 'Throttle Management',
      adjustment: 'Apply power more progressively',
      direction: 'check',
      explanation: 'Technique tip: Gradual throttle prevents overwhelming front tires',
      priority: 'medium',
    });
  }

  // Bouncy/unstable
  if (symptom === 'bouncy') {
    recommendations.push({
      component: 'Bump Damping',
      adjustment: `Increase by ${1 * severityMultiplier}-${2 * severityMultiplier}`,
      direction: 'increase',
      explanation: 'Higher bump damping controls suspension compression',
      priority: 'high',
    });
    recommendations.push({
      component: 'Rebound Damping',
      adjustment: `Increase by ${1 * severityMultiplier}-${2 * severityMultiplier}`,
      direction: 'increase',
      explanation: 'Controls how fast suspension extends after compression',
      priority: 'high',
    });
    recommendations.push({
      component: 'Springs',
      adjustment: `Stiffen by ${30 * severityMultiplier}-${60 * severityMultiplier} lb/in`,
      direction: 'increase',
      explanation: 'Stiffer springs reduce travel and bouncing',
      priority: 'medium',
    });
    if (timing === 'bumpy-sections') {
      recommendations.push({
        component: 'Ride Height',
        adjustment: `Raise by ${0.5 * severityMultiplier}-${1 * severityMultiplier} inch`,
        direction: 'increase',
        explanation: 'More travel prevents bottoming out on bumps',
        priority: 'medium',
      });
    }
  }

  // Poor traction
  if (symptom === 'poor-traction') {
    recommendations.push({
      component: 'Tire Pressure',
      adjustment: `Lower all by ${1 * severityMultiplier}-${2 * severityMultiplier} PSI`,
      direction: 'decrease',
      explanation: 'Larger contact patch improves grip',
      priority: 'high',
    });
    recommendations.push({
      component: 'Diff Acceleration',
      adjustment: `Reduce by ${10 * severityMultiplier}-${20 * severityMultiplier}%`,
      direction: 'decrease',
      explanation: 'Lower lock allows wheels to find grip independently',
      priority: 'high',
    });
    recommendations.push({
      component: 'Springs',
      adjustment: 'Soften overall',
      direction: 'decrease',
      explanation: 'Softer springs improve mechanical grip',
      priority: 'medium',
    });
  }

  // Slow acceleration out of corners
  if (symptom === 'slow-acceleration') {
    recommendations.push({
      component: 'Diff Acceleration',
      adjustment: `Increase by ${5 * severityMultiplier}-${10 * severityMultiplier}%`,
      direction: 'increase',
      explanation: 'Higher accel lock puts power down more effectively',
      priority: 'high',
    });
    recommendations.push({
      component: 'Final Drive',
      adjustment: 'Consider shorter ratio',
      direction: 'increase',
      explanation: 'Shorter final drive improves acceleration',
      priority: 'medium',
    });
    recommendations.push({
      component: 'Rear Tire Pressure',
      adjustment: 'Optimize for traction',
      direction: 'check',
      explanation: 'Balance between grip and tire squirm',
      priority: 'medium',
    });
  }

  // Unstable braking
  if (symptom === 'unstable-braking') {
    recommendations.push({
      component: 'Brake Bias',
      adjustment: `Move ${5 * severityMultiplier}% toward rear`,
      direction: 'decrease',
      explanation: 'Reduces front lockup and nose dive',
      priority: 'high',
    });
    recommendations.push({
      component: 'Brake Pressure',
      adjustment: `Reduce by ${5 * severityMultiplier}-${10 * severityMultiplier}%`,
      direction: 'decrease',
      explanation: 'Lower pressure prevents lockup',
      priority: 'high',
    });
    recommendations.push({
      component: 'Front Rebound',
      adjustment: `Increase by ${1 * severityMultiplier}`,
      direction: 'increase',
      explanation: 'Controls nose dive under braking',
      priority: 'medium',
    });
  }

  return recommendations;
}

interface TroubleshootingWizardProps {
  onClose?: () => void;
}

export function TroubleshootingWizard({ onClose }: TroubleshootingWizardProps) {
  const [step, setStep] = useState<'symptom' | 'timing' | 'severity' | 'results'>('symptom');
  const [symptom, setSymptom] = useState<Symptom | null>(null);
  const [timing, setTiming] = useState<Timing | null>(null);
  const [severity, setSeverity] = useState<Severity | null>(null);

  const reset = () => {
    setStep('symptom');
    setSymptom(null);
    setTiming(null);
    setSeverity(null);
  };

  const recommendations = symptom && timing && severity 
    ? getRecommendations(symptom, timing, severity)
    : [];

  return (
    <Card className="bg-[hsl(220,18%,8%)] border-[hsl(220,15%,18%)]">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-[hsl(var(--racing-orange)/0.2)] border border-[hsl(var(--racing-orange)/0.4)]">
              <Wrench className="w-5 h-5 text-[hsl(var(--racing-orange))]" />
            </div>
            <div>
              <CardTitle className="font-display text-lg text-[hsl(var(--racing-orange))] uppercase tracking-wider">
                Fix My Car
              </CardTitle>
              <CardDescription className="text-xs">
                Diagnose handling issues and get tuning fixes
              </CardDescription>
            </div>
          </div>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose} className="text-muted-foreground hover:text-foreground">
              ✕
            </Button>
          )}
        </div>
        
        {/* Progress indicator */}
        <div className="flex items-center gap-2 mt-4">
          {['symptom', 'timing', 'severity', 'results'].map((s, i) => (
            <div key={s} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                (step === s) 
                  ? 'bg-[hsl(var(--racing-orange))] text-black' 
                  : ((['symptom', 'timing', 'severity', 'results'].indexOf(step) > i) 
                    ? 'bg-green-500/20 text-green-400 border border-green-500/40'
                    : 'bg-muted text-muted-foreground')
              }`}>
                {['symptom', 'timing', 'severity', 'results'].indexOf(step) > i ? <CheckCircle className="w-4 h-4" /> : i + 1}
              </div>
              {i < 3 && <div className={`w-8 h-0.5 ${['symptom', 'timing', 'severity', 'results'].indexOf(step) > i ? 'bg-green-500/40' : 'bg-muted'}`} />}
            </div>
          ))}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Step 1: Symptom */}
        {step === 'symptom' && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-foreground">What's happening?</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {(Object.entries(symptomLabels) as [Symptom, { label: string; description: string }][]).map(([key, { label, description }]) => (
                <button
                  key={key}
                  onClick={() => { setSymptom(key); setStep('timing'); }}
                  className={`p-3 rounded-lg text-left transition-all border ${
                    symptom === key 
                      ? 'bg-primary/20 border-primary/50 text-foreground' 
                      : 'bg-muted/30 border-transparent hover:bg-muted/50 hover:border-muted-foreground/20'
                  }`}
                >
                  <div className="font-medium text-sm">{label}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{description}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Timing */}
        {step === 'timing' && symptom && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-foreground">When does it happen?</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {(Object.entries(timingLabels) as [Timing, string][]).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => { setTiming(key); setStep('severity'); }}
                  className={`p-3 rounded-lg text-left transition-all border ${
                    timing === key 
                      ? 'bg-primary/20 border-primary/50 text-foreground' 
                      : 'bg-muted/30 border-transparent hover:bg-muted/50 hover:border-muted-foreground/20'
                  }`}
                >
                  <div className="font-medium text-sm">{label}</div>
                </button>
              ))}
            </div>
            <Button variant="ghost" onClick={() => setStep('symptom')} className="mt-2">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
          </div>
        )}

        {/* Step 3: Severity */}
        {step === 'severity' && symptom && timing && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-foreground">How severe is it?</h4>
            <div className="grid grid-cols-3 gap-2">
              {(['slight', 'moderate', 'severe'] as Severity[]).map((sev) => (
                <button
                  key={sev}
                  onClick={() => { setSeverity(sev); setStep('results'); }}
                  className={`p-3 rounded-lg text-center transition-all border ${
                    severity === sev 
                      ? 'bg-primary/20 border-primary/50 text-foreground' 
                      : 'bg-muted/30 border-transparent hover:bg-muted/50 hover:border-muted-foreground/20'
                  }`}
                >
                  <div className="font-medium text-sm capitalize">{sev}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {sev === 'slight' ? 'Minor annoyance' : sev === 'moderate' ? 'Noticeable issue' : 'Makes car hard to drive'}
                  </div>
                </button>
              ))}
            </div>
            <Button variant="ghost" onClick={() => setStep('timing')} className="mt-2">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
          </div>
        )}

        {/* Step 4: Results */}
        {step === 'results' && symptom && timing && severity && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-3 rounded-lg bg-[hsl(var(--racing-orange)/0.1)] border border-[hsl(var(--racing-orange)/0.3)]">
              <AlertTriangle className="w-5 h-5 text-[hsl(var(--racing-orange))]" />
              <div className="text-sm">
                <span className="font-medium">{symptomLabels[symptom].label}</span>
                <span className="text-muted-foreground"> at </span>
                <span className="font-medium">{timingLabels[timing].toLowerCase()}</span>
                <span className="text-muted-foreground"> ({severity})</span>
              </div>
            </div>

            <h4 className="text-sm font-medium text-foreground">Recommended Fixes:</h4>
            <div className="space-y-2">
              {recommendations.map((rec, i) => (
                <div 
                  key={i} 
                  className={`p-3 rounded-lg border ${
                    rec.priority === 'high' 
                      ? 'bg-red-500/10 border-red-500/30' 
                      : rec.priority === 'medium'
                      ? 'bg-yellow-500/10 border-yellow-500/30'
                      : 'bg-muted/30 border-muted'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-sm">{rec.component}</div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      rec.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                      rec.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {rec.priority}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs px-1.5 py-0.5 rounded ${
                      rec.direction === 'increase' ? 'bg-green-500/20 text-green-400' :
                      rec.direction === 'decrease' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {rec.direction === 'increase' ? '↑' : rec.direction === 'decrease' ? '↓' : '?'}
                    </span>
                    <span className="text-sm text-[hsl(var(--racing-yellow))]">{rec.adjustment}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{rec.explanation}</p>
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-2">
              <Button variant="ghost" onClick={() => setStep('severity')} className="flex-1">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>
              <Button onClick={reset} className="flex-1 bg-[hsl(var(--racing-orange))] hover:bg-[hsl(var(--racing-orange)/0.8)] text-black">
                <RotateCcw className="w-4 h-4 mr-2" /> Start Over
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
