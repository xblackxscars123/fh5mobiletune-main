import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowUpDown, Thermometer, CircleDot, Move, Lightbulb } from 'lucide-react';
import { TelemetryMetric } from '@/data/telemetryGuide';
import { cn } from '@/lib/utils';

const iconMap: Record<string, React.ReactNode> = {
  ArrowUpDown: <ArrowUpDown className="w-5 h-5" />,
  Thermometer: <Thermometer className="w-5 h-5" />,
  CircleDot: <CircleDot className="w-5 h-5" />,
  Move: <Move className="w-5 h-5" />,
};

const colorMap: Record<string, string> = {
  success: 'bg-green-500',
  warning: 'bg-yellow-500',
  destructive: 'bg-red-500',
  info: 'bg-blue-500',
  muted: 'bg-muted-foreground',
};

const badgeColorMap: Record<string, string> = {
  success: 'bg-green-500/20 text-green-400 border-green-500/30',
  warning: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  destructive: 'bg-red-500/20 text-red-400 border-red-500/30',
  info: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  muted: 'bg-muted text-muted-foreground border-muted',
};

interface TelemetryDataCardProps {
  metric: TelemetryMetric;
}

export function TelemetryDataCard({ metric }: TelemetryDataCardProps) {
  return (
    <Card className="bg-card/50 border-border/50 overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/20 text-primary">
            {iconMap[metric.icon]}
          </div>
          <div>
            <span>{metric.name}</span>
            <Badge variant="outline" className="ml-2 text-xs">
              {metric.unit}
            </Badge>
          </div>
        </CardTitle>
        <CardDescription>{metric.description}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Visual Range Bar */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Value Ranges</p>
          <div className="relative h-4 rounded-full overflow-hidden bg-background/50 border border-border/50">
            {metric.ranges.map((range, idx) => {
              const width = ((range.max - range.min) / metric.ranges[metric.ranges.length - 1].max) * 100;
              const left = (range.min / metric.ranges[metric.ranges.length - 1].max) * 100;
              return (
                <div
                  key={idx}
                  className={cn('absolute h-full', colorMap[range.color])}
                  style={{ left: `${left}%`, width: `${width}%` }}
                />
              );
            })}
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {metric.ranges.map((range, idx) => (
              <Badge
                key={idx}
                variant="outline"
                className={cn('text-xs', badgeColorMap[range.color])}
              >
                {range.label}: {range.min}-{range.max}{metric.unit}
              </Badge>
            ))}
          </div>
        </div>

        {/* Range Details */}
        <div className="space-y-2">
          {metric.ranges.map((range, idx) => (
            <div
              key={idx}
              className="flex items-start gap-2 p-2 rounded-lg bg-background/30"
            >
              <div className={cn('w-3 h-3 rounded-full mt-1 flex-shrink-0', colorMap[range.color])} />
              <div>
                <span className="text-sm font-medium text-foreground">{range.label}</span>
                <p className="text-xs text-muted-foreground">{range.meaning}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Adjustment Suggestions */}
        <div className="pt-3 border-t border-border/50">
          <p className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-primary" />
            How to Adjust
          </p>
          <div className="space-y-2">
            {metric.adjustments.map((adj, idx) => (
              <div key={idx} className="text-sm">
                <span className="text-muted-foreground">If </span>
                <span className="text-racing-cyan">{adj.condition}</span>
                <span className="text-muted-foreground">:</span>
                <p className="text-foreground pl-4 mt-1">→ {adj.suggestion}</p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
