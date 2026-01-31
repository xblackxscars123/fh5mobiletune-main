import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  DriveType, 
  DrivingStyle, 
  TuneType, 
  calculateDifferential,
  getDifferentialRecommendation,
  formatDifferentialSettings,
  validateDifferentialSettings
} from '@/data/differentialTuning';
import { 
  Settings, 
  Car, 
  Gauge, 
  Shield, 
  Zap, 
  Info, 
  CheckCircle, 
  AlertTriangle,
  Copy,
  Download
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface DifferentialCalculatorProps {
  onApplySettings?: (settings: any) => void;
}

export function DifferentialCalculator({ onApplySettings }: DifferentialCalculatorProps) {
  const [driveType, setDriveType] = useState<DriveType>('AWD');
  const [tuneType, setTuneType] = useState<TuneType>('street');
  const [drivingStyle, setDrivingStyle] = useState<DrivingStyle>('Balanced');
  const [showDetails, setShowDetails] = useState(false);

  const recommendation = getDifferentialRecommendation(driveType, tuneType, drivingStyle);
  const settings = recommendation?.settings;
  const validation = settings ? validateDifferentialSettings(settings, driveType) : null;

  const handleCopySettings = () => {
    if (!settings) return;
    
    const formatted = formatDifferentialSettings(settings, driveType);
    const text = formatted.join('\n');
    
    navigator.clipboard.writeText(text).then(() => {
      toast.success('Differential settings copied to clipboard!');
    });
  };

  const handleApplySettings = () => {
    if (!settings || !onApplySettings) return;
    
    // Convert to the format expected by the tune system
    const tuneSettings = driveType === 'AWD' ? {
      centerBalance: settings.centerBalance || 50,
      diffAccelFront: settings.frontAccel || 0,
      diffDecelFront: settings.frontDecel || 0,
      diffAccelRear: settings.rearAccel || 0,
      diffDecelRear: settings.rearDecel || 0
    } : driveType === 'RWD' ? {
      diffAccelRear: settings.rwdAccel || 0,
      diffDecelRear: settings.rwdDecel || 0
    } : {
      diffAccelFront: settings.fwdAccel || 0,
      diffDecelFront: settings.fwdDecel || 0
    };

    onApplySettings(tuneSettings);
    toast.success('Differential settings applied!');
  };

  const getDrivingStyleColor = (style: DrivingStyle) => {
    switch (style) {
      case 'Stable': return 'bg-blue-500/20 text-blue-400 border-blue-500/40';
      case 'Balanced': return 'bg-green-500/20 text-green-400 border-green-500/40';
      case 'Aggressive': return 'bg-red-500/20 text-red-400 border-red-500/40';
    }
  };

  const getDrivingStyleIcon = (style: DrivingStyle) => {
    switch (style) {
      case 'Stable': return <Shield className="w-4 h-4" />;
      case 'Balanced': return <Gauge className="w-4 h-4" />;
      case 'Aggressive': return <Zap className="w-4 h-4" />;
    }
  };

  const getDriveTypeInfo = (type: DriveType) => {
    switch (type) {
      case 'AWD': return {
        icon: '🚗',
        description: 'All-wheel drive with center, front, and rear differentials',
        settings: ['Center Balance', 'Front Accel/Decel', 'Rear Accel/Decel']
      };
      case 'RWD': return {
        icon: '🏎️',
        description: 'Rear-wheel drive with single differential',
        settings: ['Acceleration', 'Deceleration']
      };
      case 'FWD': return {
        icon: '🚙',
        description: 'Front-wheel drive with single differential',
        settings: ['Acceleration', 'Deceleration']
      };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Settings className="w-6 h-6 text-racing-cyan" />
        <h3 className="font-display text-xl text-racing-cyan">Differential Calculator</h3>
      </div>

      {/* Configuration */}
      <Card className="card-racing p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Drive Type */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <Car className="w-4 h-4" />
              Drive Type
            </label>
            <Select value={driveType} onValueChange={(value: DriveType) => setDriveType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="AWD">
                  <div className="flex items-center gap-2">
                    <span>🚗</span>
                    <span>AWD</span>
                  </div>
                </SelectItem>
                <SelectItem value="RWD">
                  <div className="flex items-center gap-2">
                    <span>🏎️</span>
                    <span>RWD</span>
                  </div>
                </SelectItem>
                <SelectItem value="FWD">
                  <div className="flex items-center gap-2">
                    <span>🚙</span>
                    <span>FWD</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {getDriveTypeInfo(driveType).description}
            </p>
          </div>

          {/* Tune Type */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <Gauge className="w-4 h-4" />
              Tune Type
            </label>
            <Select value={tuneType} onValueChange={(value: TuneType) => setTuneType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="street">Street</SelectItem>
                <SelectItem value="race">Race</SelectItem>
                <SelectItem value="drift">Drift</SelectItem>
                <SelectItem value="drag">Drag</SelectItem>
                <SelectItem value="offroad">Offroad</SelectItem>
                <SelectItem value="rally">Rally</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {tuneType === 'street' && 'Balanced setup for daily driving'}
              {tuneType === 'race' && 'Maximum performance for track use'}
              {tuneType === 'drift' && 'Controlled oversteer for drifting'}
              {tuneType === 'drag' && 'Straight-line acceleration focus'}
              {tuneType === 'offroad' && 'Optimized for rough terrain'}
              {tuneType === 'rally' && 'Mixed surface performance'}
            </p>
          </div>

          {/* Driving Style */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Driving Style
            </label>
            <Select value={drivingStyle} onValueChange={(value: DrivingStyle) => setDrivingStyle(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Stable">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    <span>Stable</span>
                  </div>
                </SelectItem>
                <SelectItem value="Balanced">
                  <div className="flex items-center gap-2">
                    <Gauge className="w-4 h-4" />
                    <span>Balanced</span>
                  </div>
                </SelectItem>
                <SelectItem value="Aggressive">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    <span>Aggressive</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {drivingStyle === 'Stable' && 'Prioritizes predictability and control'}
              {drivingStyle === 'Balanced' && 'Equal focus on stability and performance'}
              {drivingStyle === 'Aggressive' && 'Maximum performance and rotation'}
            </p>
          </div>
        </div>

        {/* Results */}
        {recommendation && (
          <div className="space-y-4">
            {/* Driving Style Badge */}
            <div className="flex items-center gap-2">
              <Badge 
                variant="outline" 
                className={cn("text-sm", getDrivingStyleColor(drivingStyle))}
              >
                {getDrivingStyleIcon(drivingStyle)}
                {drivingStyle} Setup
              </Badge>
              <span className="text-sm text-muted-foreground">
                {recommendation.explanation}
              </span>
            </div>

            {/* Settings Display */}
            <Card className="bg-[hsl(220,18%,8%)] border-[hsl(220,15%,18%)] p-4">
              <h4 className="font-display text-racing-yellow text-sm uppercase tracking-wider mb-3">
                Recommended Settings
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {driveType === 'AWD' ? (
                  <>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Center Balance</span>
                        <span className="font-display text-primary">
                          {settings.centerBalance || 50}% Rear
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Front Accel</span>
                        <span className="font-display text-racing-cyan">
                          {settings.frontAccel || 0}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Front Decel</span>
                        <span className="font-display text-racing-cyan">
                          {settings.frontDecel || 0}%
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Rear Accel</span>
                        <span className="font-display text-racing-cyan">
                          {settings.rearAccel || 0}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Rear Decel</span>
                        <span className="font-display text-racing-cyan">
                          {settings.rearDecel || 0}%
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Acceleration</span>
                      <span className="font-display text-racing-cyan">
                        {driveType === 'RWD' ? settings.rwdAccel : settings.fwdAccel || 0}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Deceleration</span>
                      <span className="font-display text-racing-cyan">
                        {driveType === 'RWD' ? settings.rwdDecel : settings.fwdDecel || 0}%
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Validation */}
              {validation && (validation.errors.length > 0 || validation.warnings.length > 0) && (
                <div className="mt-4 space-y-2">
                  {validation.errors.map((error, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs text-destructive">
                      <AlertTriangle className="w-3 h-3" />
                      {error}
                    </div>
                  ))}
                  {validation.warnings.map((warning, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs text-yellow-400">
                      <Info className="w-3 h-3" />
                      {warning}
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Actions */}
            <div className="flex gap-2 flex-wrap">
              <Button onClick={handleCopySettings} variant="outline" className="gap-2">
                <Copy className="w-4 h-4" />
                Copy Settings
              </Button>
              {onApplySettings && (
                <Button onClick={handleApplySettings} className="gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Apply to Tune
                </Button>
              )}
              <Button 
                variant="outline" 
                onClick={() => setShowDetails(!showDetails)}
                className="gap-2"
              >
                <Info className="w-4 h-4" />
                {showDetails ? 'Hide' : 'Show'} Details
              </Button>
            </div>

            {/* Detailed Information */}
            {showDetails && (
              <div className="space-y-4 animate-fade-in">
                {/* Baseline Info */}
                <Card className="bg-[hsl(220,18%,8%)] border-[hsl(220,15%,18%)] p-4">
                  <h4 className="font-display text-racing-purple text-sm uppercase tracking-wider mb-3">
                    Baseline Information
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    {recommendation.baseline.description}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-medium text-racing-green mb-1">Pros:</p>
                      <ul className="space-y-1">
                        {recommendation.baseline.pros.map((pro, index) => (
                          <li key={index} className="text-xs text-muted-foreground flex items-start gap-1">
                            <span className="text-racing-green mt-0.5">•</span>
                            {pro}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-racing-yellow mb-1">Cons:</p>
                      <ul className="space-y-1">
                        {recommendation.baseline.cons.map((con, index) => (
                          <li key={index} className="text-xs text-muted-foreground flex items-start gap-1">
                            <span className="text-racing-yellow mt-0.5">•</span>
                            {con}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Card>

                {/* Tips */}
                <Card className="bg-[hsl(220,18%,8%)] border-[hsl(220,15%,18%)] p-4">
                  <h4 className="font-display text-racing-cyan text-sm uppercase tracking-wider mb-3">
                    Tuning Tips
                  </h4>
                  <ul className="space-y-2">
                    {recommendation.tips.map((tip, index) => (
                      <li key={index} className="text-xs text-muted-foreground flex items-start gap-2">
                        <span className="text-racing-cyan mt-0.5">•</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </Card>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
