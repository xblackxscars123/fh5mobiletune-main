import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { commonTuneIssues, TuneIssue } from '@/data/telemetryGuide';
import { cn } from '@/lib/utils';

const severityConfig = {
  high: {
    icon: AlertTriangle,
    color: 'text-red-400',
    bg: 'bg-red-500/20 border-red-500/30',
    label: 'High',
  },
  medium: {
    icon: AlertCircle,
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/20 border-yellow-500/30',
    label: 'Medium',
  },
  low: {
    icon: Info,
    color: 'text-blue-400',
    bg: 'bg-blue-500/20 border-blue-500/30',
    label: 'Low',
  },
};

export function IssueFixTable() {
  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-warning" />
          Common Tune Issues & Fixes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border border-border/50 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-background/50 hover:bg-background/50">
                <TableHead className="w-[100px]">Severity</TableHead>
                <TableHead>Telemetry Sign</TableHead>
                <TableHead className="hidden md:table-cell">Problem</TableHead>
                <TableHead>Suggested Fix</TableHead>
                <TableHead className="hidden lg:table-cell w-[120px]">Setting</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {commonTuneIssues.map((issue) => {
                const severity = severityConfig[issue.severity];
                const Icon = severity.icon;
                
                return (
                  <TableRow key={issue.id} className="hover:bg-primary/5">
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={cn('flex items-center gap-1 w-fit', severity.bg)}
                      >
                        <Icon className={cn('w-3 h-3', severity.color)} />
                        <span className={severity.color}>{severity.label}</span>
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-racing-cyan">
                      {issue.telemetrySign}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                      {issue.problem}
                    </TableCell>
                    <TableCell className="text-sm text-foreground">
                      {issue.suggestedFix}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <Badge variant="secondary" className="text-xs">
                        {issue.affectedSetting}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Mobile-friendly cards for smaller screens */}
        <div className="md:hidden mt-4 space-y-3">
          {commonTuneIssues.map((issue) => {
            const severity = severityConfig[issue.severity];
            const Icon = severity.icon;
            
            return (
              <div
                key={issue.id}
                className="p-3 rounded-lg border border-border/50 bg-background/30 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <Badge 
                    variant="outline" 
                    className={cn('flex items-center gap-1', severity.bg)}
                  >
                    <Icon className={cn('w-3 h-3', severity.color)} />
                    <span className={severity.color}>{severity.label}</span>
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {issue.affectedSetting}
                  </Badge>
                </div>
                <p className="font-mono text-xs text-racing-cyan">{issue.telemetrySign}</p>
                <p className="text-sm text-muted-foreground">{issue.problem}</p>
                <p className="text-sm text-foreground font-medium">→ {issue.suggestedFix}</p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
