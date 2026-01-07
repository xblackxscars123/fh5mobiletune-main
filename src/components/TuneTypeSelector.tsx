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
    <div className="space-y-3 md:space-y-4">
      <h3 className="font-display text-base md:text-lg text-primary">Select Tune Type</h3>
      <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-6 gap-1.5 sm:gap-2 md:gap-3">
        {tuneTypes.map((type) => {
          const info = tuneTypeDescriptions[type];
          const isActive = selected === type;
          
          return (
            <Button
              key={type}
              variant={isActive ? 'tuneTypeActive' : 'tuneType'}
              onClick={() => onChange(type)}
              className={cn(
                "h-auto py-2 sm:py-3 md:py-4 flex flex-col items-center gap-1 sm:gap-2 transition-all duration-300",
                isActive && "animate-pulse-glow"
              )}
            >
              <span className="text-lg sm:text-xl md:text-2xl">{info.icon}</span>
              <span className="font-display text-[10px] sm:text-xs leading-tight text-center break-words hyphens-auto">{info.title}</span>
            </Button>
          );
        })}
      </div>
      <p className="text-xs sm:text-sm text-muted-foreground text-center line-clamp-2">
        {tuneTypeDescriptions[selected].description}
      </p>
    </div>
  );
}
