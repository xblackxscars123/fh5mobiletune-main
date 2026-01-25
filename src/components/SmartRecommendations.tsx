import { useMemo } from 'react';
import { CarSpecs, TuneType, TuneSettings } from '@/lib/tuningCalculator';
import { generateRecommendations, applyRecommendation, Recommendation } from '@/lib/recommendationEngine';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Zap, Lightbulb, TrendingUp, CheckCircle, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SmartRecommendationsProps {
  specs: CarSpecs;
  currentTune: TuneSettings;
  tuneType: TuneType;
  onApplyRecommendation: (changes: Partial<TuneSettings>) => void;
  className?: string;
}

const typeConfig = {
  optimization: {
    icon: Zap,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/20'
  },
  warning: {
    icon: AlertTriangle,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20'
  },
  suggestion: {
    icon: Lightbulb,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20'
  },
  info: {
    icon: TrendingUp,
    color: 'text-slate-400',
    bgColor: 'bg-slate-500/10',
    borderColor: 'border-slate-500/20'
  }
};

const priorityConfig = {
  high: { color: 'text-red-400', bg: 'bg-red-500/20' },
  medium: { color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
  low: { color: 'text-slate-400', bg: 'bg-slate-500/20' }
};

export function SmartRecommendations({
  specs,
  currentTune,
  tuneType,
  onApplyRecommendation,
  className = ''
}: SmartRecommendationsProps) {
  const recommendations = useMemo(() =>
    generateRecommendations(specs, currentTune, tuneType),
    [specs, currentTune, tuneType]
  );

  if (recommendations.length === 0) {
    return (
      <Card className={cn('bg-gradient-to-br from-slate-900/50 to-slate-800/50 border-slate-700', className)}>
        <CardContent className="p-6 text-center">
          <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">Setup Looking Good!</h3>
          <p className="text-slate-400 text-sm">
            Your current configuration is well-optimized. No major recommendations at this time.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('bg-gradient-to-br from-slate-900/50 to-slate-800/50 border-slate-700', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-slate-200">
          <Lightbulb className="w-4 h-4 text-amber-400" />
          Smart Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {recommendations.map((rec, index) => {
          const typeCfg = typeConfig[rec.type];
          const priorityCfg = priorityConfig[rec.priority];
          const Icon = typeCfg.icon;

          return (
            <div
              key={rec.id}
              className={cn(
                'p-4 rounded-lg border transition-all duration-200',
                typeCfg.bgColor,
                typeCfg.borderColor,
                'hover:scale-[1.02] hover:shadow-lg'
              )}
            >
              <div className="flex items-start gap-3">
                <div className={cn('p-2 rounded-lg', typeCfg.bgColor)}>
                  <Icon className={cn('w-4 h-4', typeCfg.color)} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-medium text-white text-sm">{rec.title}</h4>
                    <Badge
                      variant="outline"
                      className={cn('text-xs border-current', priorityCfg.color)}
                    >
                      {rec.priority}
                    </Badge>
                  </div>

                  <p className="text-slate-300 text-sm mb-2">{rec.message}</p>

                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400 text-xs font-medium">{rec.impact}</span>
                  </div>

                  {rec.action && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onApplyRecommendation(rec.action!.apply(currentTune))}
                      className={cn(
                        'h-8 text-xs border-current hover:bg-current hover:text-black transition-colors',
                        typeCfg.color
                      )}
                    >
                      <ArrowRight className="w-3 h-3 mr-1" />
                      {rec.action.label}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        <div className="pt-2 border-t border-slate-700">
          <p className="text-xs text-slate-500 text-center">
            💡 Apply recommendations one at a time to see their individual effects
          </p>
        </div>
      </CardContent>
    </Card>
  );
}