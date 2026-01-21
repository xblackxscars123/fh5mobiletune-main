import { cn } from '@/lib/utils';
import { TuningTooltip } from '@/components/TuningTooltip';
import { outputExplanations } from '@/data/tuningGuide';

interface BlueprintSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  unit?: string;
  leftLabel?: string;
  rightLabel?: string;
  isHighlighted?: boolean;
  explanationKey?: string;
  category?: 'suspension' | 'aero' | 'gearing' | 'tires' | 'differential' | 'brakes' | 'alignment' | 'damping';
}

const categoryAccents: Record<string, string> = {
  suspension: 'hsl(145, 65%, 45%)',
  aero: 'hsl(200, 85%, 55%)',
  gearing: 'hsl(45, 90%, 55%)',
  tires: 'hsl(20, 85%, 55%)',
  differential: 'hsl(280, 70%, 55%)',
  brakes: 'hsl(0, 75%, 55%)',
  alignment: 'hsl(170, 70%, 50%)',
  damping: 'hsl(260, 60%, 60%)',
};

export const BlueprintSlider = ({
  label,
  value,
  min,
  max,
  unit = '',
  leftLabel,
  rightLabel,
  isHighlighted = false,
  explanationKey,
  category = 'suspension',
}: BlueprintSliderProps) => {
  const percentage = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
  const explanation = explanationKey ? outputExplanations[explanationKey] : null;
  const accentColor = categoryAccents[category] || 'hsl(330, 100%, 65%)';

  const sliderContent = (
    <div className="py-2 group">
      {/* Label row */}
      <div className="flex items-center justify-between mb-2">
        <span className={cn(
          "text-xs uppercase tracking-wider font-mono",
          isHighlighted ? "text-neon-pink text-glow-pink" : "text-foreground/80"
        )}>
          {label}
        </span>
        <div className="flex items-center gap-1">
          <span 
            className="font-mono text-sm font-semibold"
            style={{ 
              color: accentColor,
              textShadow: `0 0 8px ${accentColor}40`,
            }}
          >
            {typeof value === 'number' ? value.toFixed(value % 1 === 0 ? 0 : 1) : value}
          </span>
          {unit && (
            <span className="text-xs text-muted-foreground font-mono">
              {unit}
            </span>
          )}
        </div>
      </div>

      {/* Slider track */}
      <div className="flex items-center gap-2">
        {leftLabel && (
          <span className="text-[10px] text-muted-foreground/60 w-12 text-right font-sketch hidden sm:block">
            {leftLabel}
          </span>
        )}
        
        <div className="flex-1 relative h-6 hybrid-slider rounded overflow-hidden">
          {/* Background grid marks */}
          <div className="absolute inset-0 flex justify-between px-1">
            {[...Array(11)].map((_, i) => (
              <div 
                key={i} 
                className="w-px h-full"
                style={{
                  background: i === 5 
                    ? 'hsl(var(--neon-cyan) / 0.3)' 
                    : 'hsl(var(--blueprint-grid) / 0.3)',
                }}
              />
            ))}
          </div>

          {/* Filled portion with gradient */}
          <div 
            className="absolute left-0 top-0 h-full transition-all duration-200"
            style={{ 
              width: `${percentage}%`,
              background: `linear-gradient(90deg, 
                ${accentColor}20 0%, 
                ${accentColor}60 50%,
                ${accentColor} 100%
              )`,
            }}
          />

          {/* Neon edge glow */}
          <div 
            className="absolute top-0 h-full w-2 transition-all duration-200"
            style={{ 
              left: `calc(${percentage}% - 4px)`,
              background: `linear-gradient(90deg, transparent, ${accentColor})`,
              boxShadow: `0 0 10px ${accentColor}, 0 0 20px ${accentColor}60`,
            }}
          />

          {/* Thumb with analog-digital hybrid look */}
          <div 
            className="absolute top-1/2 -translate-y-1/2 w-3 h-5 rounded-sm transition-all duration-200 group-hover:scale-110"
            style={{ 
              left: `calc(${percentage}% - 6px)`,
              background: `linear-gradient(180deg, 
                hsl(var(--foreground)) 0%, 
                hsl(var(--foreground) / 0.8) 100%
              )`,
              boxShadow: `
                0 0 8px ${accentColor},
                0 2px 4px hsl(0 0% 0% / 0.3),
                inset 0 1px 0 hsl(var(--foreground) / 0.2)
              `,
              border: `1px solid ${accentColor}80`,
            }}
          >
            {/* Notch lines on thumb */}
            <div className="absolute inset-x-1 top-1/2 -translate-y-1/2 space-y-0.5">
              <div className="h-px bg-current opacity-30" />
              <div className="h-px bg-current opacity-30" />
            </div>
          </div>
        </div>

        {rightLabel && (
          <span className="text-[10px] text-muted-foreground/60 w-12 font-sketch hidden sm:block">
            {rightLabel}
          </span>
        )}
      </div>

      {/* Scale markers */}
      <div className="flex justify-between mt-1 px-14 sm:px-16">
        <span className="text-[9px] text-muted-foreground/40 font-mono">{min}</span>
        <span className="text-[9px] text-muted-foreground/40 font-mono">{max}</span>
      </div>
    </div>
  );

  if (explanation) {
    return (
      <TuningTooltip explanation={explanation}>
        {sliderContent}
      </TuningTooltip>
    );
  }

  return sliderContent;
};
