import { useState, useRef, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { GripVertical, ChevronDown, ChevronUp } from 'lucide-react';

export type ModuleCategory = 
  | 'suspension' 
  | 'aero' 
  | 'gearing' 
  | 'tires' 
  | 'differential' 
  | 'brakes' 
  | 'alignment' 
  | 'damping';

interface TuningModuleProps {
  id: string;
  title: string;
  category: ModuleCategory;
  icon?: ReactNode;
  children: ReactNode;
  isCollapsible?: boolean;
  defaultExpanded?: boolean;
  className?: string;
  onDragStart?: (id: string) => void;
  onDragEnd?: () => void;
  isDragging?: boolean;
}

const categoryColors: Record<ModuleCategory, string> = {
  suspension: 'module-suspension',
  aero: 'module-aero',
  gearing: 'module-gearing',
  tires: 'module-tires',
  differential: 'module-differential',
  brakes: 'module-brakes',
  alignment: 'module-alignment',
  damping: 'module-damping',
};

const categoryLabels: Record<ModuleCategory, string> = {
  suspension: 'SPRINGS & RIDE HEIGHT',
  aero: 'AERODYNAMICS',
  gearing: 'TRANSMISSION',
  tires: 'TIRE PRESSURE',
  differential: 'DIFFERENTIAL',
  brakes: 'BRAKING SYSTEM',
  alignment: 'ALIGNMENT',
  damping: 'DAMPING',
};

const categoryGlowColors: Record<ModuleCategory, string> = {
  suspension: 'hsl(145, 65%, 35%)',
  aero: 'hsl(200, 85%, 50%)',
  gearing: 'hsl(45, 90%, 50%)',
  tires: 'hsl(20, 85%, 50%)',
  differential: 'hsl(280, 70%, 50%)',
  brakes: 'hsl(0, 75%, 50%)',
  alignment: 'hsl(170, 70%, 45%)',
  damping: 'hsl(260, 60%, 55%)',
};

export const TuningModule = ({
  id,
  title,
  category,
  icon,
  children,
  isCollapsible = true,
  defaultExpanded = true,
  className,
  onDragStart,
  onDragEnd,
  isDragging = false,
}: TuningModuleProps) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [showRipple, setShowRipple] = useState(false);
  const [ripplePosition, setRipplePosition] = useState({ x: 0, y: 0 });
  const moduleRef = useRef<HTMLDivElement>(null);

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('moduleId', id);
    onDragStart?.(id);
  };

  const handleDragEnd = () => {
    onDragEnd?.();
    triggerSnapAnimation();
  };

  const triggerSnapAnimation = () => {
    if (moduleRef.current) {
      moduleRef.current.classList.add('module-snap');
      setTimeout(() => {
        moduleRef.current?.classList.remove('module-snap');
      }, 300);
    }
  };

  const triggerRipple = (e: React.MouseEvent) => {
    const rect = moduleRef.current?.getBoundingClientRect();
    if (rect) {
      setRipplePosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      setShowRipple(true);
      setTimeout(() => setShowRipple(false), 600);
    }
  };

  return (
    <div
      ref={moduleRef}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={triggerRipple}
      className={cn(
        'module-block paper-edge relative overflow-hidden transition-all duration-300',
        categoryColors[category],
        isDragging && 'module-dragging',
        className
      )}
      style={{
        '--category-glow': categoryGlowColors[category],
      } as React.CSSProperties}
    >
      {/* Ink ripple effect */}
      {showRipple && (
        <div
          className="ink-ripple"
          style={{
            left: ripplePosition.x - 50,
            top: ripplePosition.y - 50,
            width: 100,
            height: 100,
          }}
        />
      )}

      {/* Header */}
      <div 
        className="flex items-center justify-between p-3 cursor-grab active:cursor-grabbing"
        onClick={(e) => {
          if (isCollapsible) {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }
        }}
      >
        <div className="flex items-center gap-2">
          <GripVertical className="w-4 h-4 text-muted-foreground/50" />
          {icon && (
            <div 
              className="w-6 h-6 flex items-center justify-center rounded"
              style={{ 
                color: categoryGlowColors[category],
                filter: `drop-shadow(0 0 4px ${categoryGlowColors[category]})`,
              }}
            >
              {icon}
            </div>
          )}
          <div>
            <h3 className="font-display text-sm uppercase tracking-wider text-foreground">
              {title}
            </h3>
            <span 
              className="text-[10px] font-sketch tracking-wide"
              style={{ color: categoryGlowColors[category] }}
            >
              {categoryLabels[category]}
            </span>
          </div>
        </div>

        {isCollapsible && (
          <button
            className="p-1 hover:bg-border/20 rounded transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            )}
          </button>
        )}
      </div>

      {/* Content */}
      <div
        className={cn(
          'overflow-hidden transition-all duration-300',
          isExpanded ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <div className="px-3 pb-3 pt-1">
          {children}
        </div>
      </div>

      {/* Category indicator line at bottom */}
      <div 
        className="absolute bottom-0 left-3 right-3 h-[1px]"
        style={{
          background: `linear-gradient(90deg, transparent, ${categoryGlowColors[category]}40, transparent)`,
        }}
      />
    </div>
  );
};
