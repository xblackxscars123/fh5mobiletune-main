import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlayCircle, Target, Settings2, Map, CheckCircle } from 'lucide-react';
import { workflowTips } from '@/data/telemetryGuide';
import { cn } from '@/lib/utils';

const iconMap: Record<string, React.ReactNode> = {
  PlayCircle: <PlayCircle className="w-5 h-5" />,
  Target: <Target className="w-5 h-5" />,
  Settings2: <Settings2 className="w-5 h-5" />,
  Map: <Map className="w-5 h-5" />,
};

export function WorkflowTips() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {workflowTips.map((workflow, idx) => (
        <Card key={idx} className="bg-card/50 border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-3 text-lg">
              <div className="p-2 rounded-lg bg-racing-cyan/20 text-racing-cyan">
                {iconMap[workflow.icon]}
              </div>
              {workflow.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {workflow.tips.map((tip, tipIdx) => (
                <li key={tipIdx} className="flex items-start gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">{tip}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
