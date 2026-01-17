import { useState } from 'react';
import { TuneTemplate, getCompatibleTemplates } from '@/data/tuneTemplates';
import { TuneType, DriveType } from '@/lib/tuningCalculator';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogDescription 
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Check, Info } from 'lucide-react';

interface TemplateSelectorProps {
  tuneType: TuneType;
  driveType: DriveType;
  onSelectTemplate: (template: TuneTemplate) => void;
}

export function TemplateSelector({ tuneType, driveType, onSelectTemplate }: TemplateSelectorProps) {
  const [open, setOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<TuneTemplate | null>(null);
  
  const templates = getCompatibleTemplates(tuneType, driveType);
  
  const categoryLabels = {
    starter: { label: 'Starter', color: 'bg-[hsl(var(--racing-cyan))]' },
    meta: { label: 'Competitive', color: 'bg-[hsl(var(--racing-yellow))]' },
    specialty: { label: 'Specialty', color: 'bg-[hsl(var(--racing-orange))]' },
  };

  const handleApply = () => {
    if (selectedTemplate) {
      onSelectTemplate(selectedTemplate);
      setOpen(false);
      setSelectedTemplate(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="w-full border-[hsl(var(--racing-cyan)/0.5)] text-[hsl(var(--racing-cyan))] hover:bg-[hsl(var(--racing-cyan)/0.1)]"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Use Template
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col bg-[hsl(220,18%,8%)] border-[hsl(220,15%,20%)]">
        <DialogHeader>
          <DialogTitle className="font-display text-[hsl(var(--racing-yellow))] uppercase tracking-wider">
            Tune Templates
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Start with a pre-built template and fine-tune from there
          </DialogDescription>
        </DialogHeader>
        
        {templates.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            <Info className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No templates available for {tuneType} + {driveType}</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-2 pr-2">
            {templates.map((template) => (
              <button
                key={template.id}
                onClick={() => setSelectedTemplate(template)}
                className={`w-full text-left p-3 rounded-lg border transition-all ${
                  selectedTemplate?.id === template.id
                    ? 'border-primary bg-primary/10'
                    : 'border-[hsl(220,15%,20%)] hover:border-[hsl(220,15%,30%)] bg-[hsl(220,15%,10%)]'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{template.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-display text-sm text-foreground uppercase tracking-wide">
                        {template.name}
                      </span>
                      <Badge className={`${categoryLabels[template.category].color} text-black text-[10px] px-1.5 py-0`}>
                        {categoryLabels[template.category].label}
                      </Badge>
                      {selectedTemplate?.id === template.id && (
                        <Check className="w-4 h-4 text-primary ml-auto" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {template.description}
                    </p>
                    
                    {/* Modifier Preview */}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-[hsl(220,15%,15%)] text-muted-foreground">
                        Balance: {template.modifiers.balance > 0 ? '+' : ''}{template.modifiers.balance}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-[hsl(220,15%,15%)] text-muted-foreground">
                        Stiffness: {template.modifiers.stiffness}%
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-[hsl(220,15%,15%)] text-muted-foreground">
                        Ride: {template.modifiers.rideHeight}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Tips (shown when selected) */}
                {selectedTemplate?.id === template.id && (
                  <div className="mt-3 pt-3 border-t border-[hsl(220,15%,20%)]">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Tips:</p>
                    <ul className="space-y-1">
                      {template.tips.map((tip, i) => (
                        <li key={i} className="text-xs text-[hsl(var(--racing-cyan))] flex items-start gap-1.5">
                          <span className="text-[hsl(var(--racing-yellow))]">•</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
        
        {selectedTemplate && (
          <div className="pt-3 border-t border-[hsl(220,15%,20%)]">
            <Button 
              onClick={handleApply}
              className="w-full bg-primary hover:bg-primary/80 text-black font-display uppercase tracking-wider"
            >
              Apply "{selectedTemplate.name}" Template
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
