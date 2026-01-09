import { useState, useRef, useEffect, ReactNode } from 'react';
import { TuningExplanation } from '@/data/tuningGuide';
import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TuningTooltipProps {
  explanation: TuningExplanation;
  children: ReactNode;
  className?: string;
  showIcon?: boolean;
}

export function TuningTooltip({ explanation, children, className, showIcon = false }: TuningTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState<'top' | 'bottom'>('top');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => {
      // Check position before showing
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const spaceAbove = rect.top;
        const spaceBelow = window.innerHeight - rect.bottom;
        setPosition(spaceAbove < 200 && spaceBelow > spaceAbove ? 'bottom' : 'top');
      }
      setIsVisible(true);
    }, 1500); // 1.5 second delay
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsVisible(false);
  };

  // Touch support for mobile
  const handleTouchStart = () => {
    timeoutRef.current = setTimeout(() => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const spaceAbove = rect.top;
        const spaceBelow = window.innerHeight - rect.bottom;
        setPosition(spaceAbove < 200 && spaceBelow > spaceAbove ? 'bottom' : 'top');
      }
      setIsVisible(true);
    }, 1500);
  };

  const handleTouchEnd = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    // Keep visible for a moment on mobile
    setTimeout(() => setIsVisible(false), 3000);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className={cn("relative inline-block", className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="flex items-center gap-1">
        {children}
        {showIcon && (
          <Info className="w-3 h-3 text-muted-foreground opacity-50 hover:opacity-100 transition-opacity" />
        )}
      </div>
      
      {isVisible && (
        <div 
          ref={tooltipRef}
          className={cn(
            "absolute z-50 w-64 sm:w-72 p-3 rounded-lg",
            "bg-[hsl(220,20%,12%)] border border-[hsl(var(--racing-yellow)/0.3)]",
            "shadow-lg shadow-black/50",
            "animate-in fade-in-0 zoom-in-95 duration-200",
            position === 'top' ? "bottom-full mb-2" : "top-full mt-2",
            "left-1/2 -translate-x-1/2"
          )}
        >
          {/* Arrow */}
          <div 
            className={cn(
              "absolute left-1/2 -translate-x-1/2 w-0 h-0",
              "border-l-[6px] border-l-transparent",
              "border-r-[6px] border-r-transparent",
              position === 'top' 
                ? "top-full border-t-[6px] border-t-[hsl(var(--racing-yellow)/0.3)]" 
                : "bottom-full border-b-[6px] border-b-[hsl(var(--racing-yellow)/0.3)]"
            )}
          />
          
          <h4 className="font-display text-sm text-[hsl(var(--racing-yellow))] uppercase tracking-wide mb-2">
            {explanation.title}
          </h4>
          
          <div className="space-y-2 text-xs">
            <p className="text-foreground">
              <span className="text-muted-foreground">What it is: </span>
              {explanation.what}
            </p>
            <p className="text-foreground">
              <span className="text-muted-foreground">Why it matters: </span>
              {explanation.why}
            </p>
            {explanation.tip && (
              <p className="text-[hsl(var(--racing-cyan))] bg-[hsl(var(--racing-cyan)/0.1)] px-2 py-1 rounded">
                💡 {explanation.tip}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
