import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Settings, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdvancedModeToggleProps {
  isAdvancedMode: boolean;
  onToggle: (enabled: boolean) => void;
  className?: string;
}

export function AdvancedModeToggle({ 
  isAdvancedMode, 
  onToggle, 
  className 
}: AdvancedModeToggleProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleToggle = () => {
    setIsAnimating(true);
    onToggle(!isAdvancedMode);
    // Reset animation state after transition completes
    setTimeout(() => setIsAnimating(false), 300);
  };

  return (
    <div className={cn("relative", className)}>
      <Button
        variant="outline"
        onClick={handleToggle}
        className={cn(
          "w-full justify-between gap-2 h-8 px-3 text-xs font-medium transition-all duration-300",
          "border-[hsl(220,15%,25%)] hover:bg-[hsl(220,15%,15%)]",
          isAdvancedMode && [
            "bg-[hsl(var(--racing-yellow))]/10 border-[hsl(var(--racing-yellow))]/30",
            "hover:bg-[hsl(var(--racing-yellow))]/20"
          ]
        )}
      >
        <span className="flex items-center gap-2">
          <Settings className={cn(
            "w-3.5 h-3.5 transition-transform duration-300",
            isAdvancedMode && "rotate-90"
          )} />
          <span className={cn(
            "transition-colors duration-300",
            isAdvancedMode && "text-[hsl(var(--racing-yellow))]"
          )}>
            {isAdvancedMode ? 'Advanced Mode' : 'Basic Mode'}
          </span>
        </span>
        
        <div className="flex items-center gap-1">
          <span className={cn(
            "text-[10px] px-1.5 py-0.5 rounded transition-all duration-300",
            isAdvancedMode 
              ? "bg-[hsl(var(--racing-yellow))]/20 text-[hsl(var(--racing-yellow))]" 
              : "bg-[hsl(220,15%,20%)] text-muted-foreground"
          )}>
            {isAdvancedMode ? 'ON' : 'OFF'}
          </span>
          {isAnimating ? (
            <div className="w-3 h-3" />
          ) : isAdvancedMode ? (
            <ChevronUp className="w-3 h-3 transition-transform duration-300" />
          ) : (
            <ChevronDown className="w-3 h-3 transition-transform duration-300" />
          )}
        </div>
      </Button>
      
      {/* Subtle indicator line */}
      <div className={cn(
        "absolute -bottom-px left-0 right-0 h-0.5 transition-all duration-300",
        isAdvancedMode 
          ? "bg-[hsl(var(--racing-yellow))]" 
          : "bg-transparent"
      )} />
    </div>
  );
}
