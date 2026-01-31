import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TuneSettings, DriveType } from '@/lib/tuningCalculator';
import { 
  TroubleshootingProblem, 
  Adjustment, 
  getAllTroubleshootingProblems, 
  getTroubleshootingProblem 
} from '@/data/troubleshootingData';
import { 
  AlertTriangle, 
  Settings, 
  Wrench, 
  ArrowRight,
  CheckCircle,
  Info,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TroubleshootingPanelProps {
  tune: TuneSettings;
  driveType: DriveType;
  onApplyAdjustment?: (adjustment: Adjustment) => void;
}

export function TroubleshootingPanel({ tune, driveType, onApplyAdjustment }: TroubleshootingPanelProps) {
  const [selectedProblemId, setSelectedProblemId] = useState<string>('');
  const [expandedAdjustments, setExpandedAdjustments] = useState<Set<number>>(new Set());
  
  const problems = getAllTroubleshootingProblems();
  const selectedProblem = selectedProblemId ? getTroubleshootingProblem(selectedProblemId) : null;
  const adjustments = selectedProblem ? selectedProblem.getAdjustments(tune, driveType) : [];

  const toggleAdjustmentExpansion = (index: number) => {
    const newExpanded = new Set(expandedAdjustments);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedAdjustments(newExpanded);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/40';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40';
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/40';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/40';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertTriangle className="w-4 h-4" />;
      case 'medium': return <Info className="w-4 h-4" />;
      case 'low': return <CheckCircle className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-4">
      <Card className="card-racing p-4">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="w-5 h-5 text-racing-yellow" />
          <h3 className="font-display text-lg text-racing-yellow">Troubleshooting Assistant</h3>
        </div>
        
        <p className="text-sm text-muted-foreground mb-4">
          Select a handling issue to get specific tuning recommendations to fix it.
        </p>

        {/* Problem Selection */}
        <div className="space-y-2 mb-6">
          <label className="text-sm font-medium text-foreground">What issue are you experiencing?</label>
          <Select value={selectedProblemId} onValueChange={setSelectedProblemId}>
            <SelectTrigger className="bg-muted border-border">
              <SelectValue placeholder="Select a handling problem..." />
            </SelectTrigger>
            <SelectContent>
              {problems.map((problem) => (
                <SelectItem key={problem.id} value={problem.id}>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-racing-yellow" />
                    <span>{problem.title}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Problem Details */}
        {selectedProblem && (
          <div className="space-y-4 animate-fade-in">
            <Card className="bg-[hsl(220,18%,8%)] border-[hsl(220,15%,18%)] p-4">
              <h4 className="font-display text-primary text-sm uppercase tracking-wider mb-2">
                {selectedProblem.title}
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                {selectedProblem.description}
              </p>
              
              <div className="space-y-2">
                <p className="text-xs font-medium text-foreground">Common symptoms:</p>
                <ul className="space-y-1">
                  {selectedProblem.symptoms.map((symptom, index) => (
                    <li key={index} className="text-xs text-muted-foreground flex items-start gap-2">
                      <span className="text-racing-yellow mt-0.5">•</span>
                      {symptom}
                    </li>
                  ))}
                </ul>
              </div>
            </Card>

            {/* Recommended Adjustments */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-racing-cyan" />
                <h4 className="font-display text-racing-cyan text-sm uppercase tracking-wider">
                  Recommended Adjustments
                </h4>
              </div>

              {adjustments.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No specific adjustments available for this issue.
                </p>
              ) : (
                <div className="space-y-3">
                  {adjustments.map((adjustment, index) => (
                    <Card 
                      key={index}
                      className="bg-[hsl(220,18%,8%)] border-[hsl(220,15%,18%)] p-4 hover:border-primary/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant="outline" 
                              className={cn("text-xs", getPriorityColor(adjustment.priority))}
                            >
                              {getPriorityIcon(adjustment.priority)}
                              {adjustment.priority.toUpperCase()}
                            </Badge>
                            <span className="font-medium text-foreground">
                              {adjustment.component}
                            </span>
                            <ArrowRight className="w-3 h-3 text-muted-foreground" />
                            <span className="text-sm text-primary">
                              {adjustment.setting}
                            </span>
                          </div>
                          
                          <div className="bg-muted/50 rounded p-2">
                            <p className="text-sm font-mono text-racing-green">
                              {adjustment.adjustment}
                            </p>
                          </div>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleAdjustmentExpansion(index)}
                            className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                          >
                            {expandedAdjustments.has(index) ? (
                              <ChevronUp className="w-3 h-3 mr-1" />
                            ) : (
                              <ChevronDown className="w-3 h-3 mr-1" />
                            )}
                            {expandedAdjustments.has(index) ? 'Hide' : 'Show'} Reason
                          </Button>

                          {expandedAdjustments.has(index) && (
                            <div className="bg-primary/10 rounded p-2 border border-primary/20">
                              <p className="text-xs text-foreground">
                                <strong>Why this works:</strong> {adjustment.reason}
                              </p>
                            </div>
                          )}
                        </div>

                        {onApplyAdjustment && (
                          <Button
                            size="sm"
                            onClick={() => onApplyAdjustment(adjustment)}
                            className="shrink-0"
                          >
                            <Settings className="w-3 h-3 mr-1" />
                            Apply
                          </Button>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Additional Tips */}
            <Card className="bg-[hsl(220,18%,8%)] border-[hsl(220,15%,18%)] p-4">
              <h4 className="font-display text-racing-purple text-sm uppercase tracking-wider mb-2">
                Pro Tips
              </h4>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li>• <span className="text-foreground">Make one change at a time</span> — Test each adjustment before making the next one.</li>
                <li>• <span className="text-foreground">Start with high priority changes</span> — These typically have the biggest impact.</li>
                <li>• <span className="text-foreground">Consider track conditions</span> — Adjustments may need to be modified for different surfaces or weather.</li>
                <li>• <span className="text-foreground">Save your setup</span> — Keep a backup of your current tune before making changes.</li>
              </ul>
            </Card>
          </div>
        )}
      </Card>
    </div>
  );
}
