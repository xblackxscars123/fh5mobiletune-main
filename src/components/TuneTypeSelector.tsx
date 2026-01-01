import { TuneType, tuneTypeDescriptions } from '@/lib/tuningCalculator';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TuneTypeSelectorProps {
  selected: TuneType;
  onChange: (type: TuneType) => void;
}

const tuneTypes: TuneType[] = ['grip', 'drift', 'offroad', 'drag', 'rally', 'street'];

export function TuneTypeSelector({ selected, onChange }: TuneTypeSelectorProps) {
  return (
    <div className="space-y-4">
      <h3 className="font-display text-lg text-primary">Select Tune Type</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {tuneTypes.map((type) => {
          const info = tuneTypeDescriptions[type];
          const isActive = selected === type;
          
          return (
            <Button
              key={type}
              variant={isActive ? 'tuneTypeActive' : 'tuneType'}
              onClick={() => onChange(type)}
              className={cn(
                "h-auto py-4 flex flex-col items-center gap-2 transition-all duration-300",
                isActive && "animate-pulse-glow"
              )}
            >
              <span className="text-2xl">{info.icon}</span>
              <span className="font-display text-xs">{info.title}</span>
            </Button>
          );
        })}
      </div>
      <p className="text-sm text-muted-foreground text-center">
        {tuneTypeDescriptions[selected].description}
      </p>
    </div>
  );
}
