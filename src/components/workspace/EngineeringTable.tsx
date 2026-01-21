import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface TableRow {
  label: string;
  value: string | number;
  unit?: string;
  highlight?: boolean;
}

interface EngineeringTableProps {
  title?: string;
  rows: TableRow[];
  category?: 'suspension' | 'aero' | 'gearing' | 'tires' | 'differential' | 'brakes' | 'alignment' | 'damping';
  columns?: 2 | 3;
  className?: string;
}

const categoryColors: Record<string, string> = {
  suspension: 'hsl(145, 65%, 45%)',
  aero: 'hsl(200, 85%, 55%)',
  gearing: 'hsl(45, 90%, 55%)',
  tires: 'hsl(20, 85%, 55%)',
  differential: 'hsl(280, 70%, 55%)',
  brakes: 'hsl(0, 75%, 55%)',
  alignment: 'hsl(170, 70%, 50%)',
  damping: 'hsl(260, 60%, 60%)',
};

export const EngineeringTable = ({
  title,
  rows,
  category = 'suspension',
  columns = 2,
  className,
}: EngineeringTableProps) => {
  const accentColor = categoryColors[category] || 'hsl(var(--neon-cyan))';

  return (
    <div className={cn('overflow-hidden rounded', className)}>
      {title && (
        <div 
          className="px-3 py-1.5 text-xs uppercase tracking-wider font-mono"
          style={{
            background: `${accentColor}15`,
            borderBottom: `1px solid ${accentColor}30`,
            color: accentColor,
          }}
        >
          {title}
        </div>
      )}
      
      <table className="engineering-table w-full">
        <tbody>
          {rows.map((row, index) => (
            <tr 
              key={index}
              className={cn(
                'transition-colors',
                row.highlight && 'bg-neon-pink/5'
              )}
            >
              <td className="text-muted-foreground">{row.label}</td>
              <td 
                className="text-right font-semibold"
                style={{ 
                  color: row.highlight ? accentColor : 'inherit',
                  textShadow: row.highlight ? `0 0 8px ${accentColor}40` : 'none',
                }}
              >
                {typeof row.value === 'number' ? row.value.toFixed(row.value % 1 === 0 ? 0 : 2) : row.value}
                {row.unit && (
                  <span className="text-muted-foreground/60 ml-1 text-[10px]">{row.unit}</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

interface CompactValueProps {
  label: string;
  value: string | number;
  unit?: string;
  category?: string;
  size?: 'sm' | 'md';
}

export const CompactValue = ({ 
  label, 
  value, 
  unit, 
  category = 'suspension',
  size = 'md',
}: CompactValueProps) => {
  const accentColor = categoryColors[category] || 'hsl(var(--neon-cyan))';
  
  return (
    <div 
      className={cn(
        'flex items-center justify-between rounded px-2 border',
        size === 'sm' ? 'py-1' : 'py-1.5'
      )}
      style={{
        background: 'hsl(var(--card) / 0.5)',
        borderColor: `${accentColor}20`,
      }}
    >
      <span className={cn(
        "text-muted-foreground font-mono uppercase",
        size === 'sm' ? 'text-[10px]' : 'text-xs'
      )}>
        {label}
      </span>
      <span 
        className={cn(
          "font-mono font-semibold",
          size === 'sm' ? 'text-xs' : 'text-sm'
        )}
        style={{ 
          color: accentColor,
          textShadow: `0 0 6px ${accentColor}30`,
        }}
      >
        {typeof value === 'number' ? value.toFixed(value % 1 === 0 ? 0 : 1) : value}
        {unit && <span className="text-muted-foreground/60 ml-0.5 text-[9px]">{unit}</span>}
      </span>
    </div>
  );
};

interface FrontRearValueProps {
  label: string;
  front: number;
  rear: number;
  unit?: string;
  category?: string;
}

export const FrontRearValue = ({
  label,
  front,
  rear,
  unit,
  category = 'suspension',
}: FrontRearValueProps) => {
  const accentColor = categoryColors[category] || 'hsl(var(--neon-cyan))';

  return (
    <div className="space-y-1">
      <div 
        className="text-[10px] uppercase tracking-wider font-mono"
        style={{ color: `${accentColor}90` }}
      >
        {label}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div 
          className="flex flex-col items-center py-1.5 px-2 rounded border"
          style={{
            background: 'hsl(var(--card) / 0.3)',
            borderColor: `${accentColor}15`,
          }}
        >
          <span className="text-[9px] text-muted-foreground/60 uppercase font-mono">Front</span>
          <span 
            className="font-mono text-sm font-semibold"
            style={{ 
              color: accentColor,
              textShadow: `0 0 6px ${accentColor}30`,
            }}
          >
            {front.toFixed(front % 1 === 0 ? 0 : 1)}
            {unit && <span className="text-[9px] text-muted-foreground/50 ml-0.5">{unit}</span>}
          </span>
        </div>
        <div 
          className="flex flex-col items-center py-1.5 px-2 rounded border"
          style={{
            background: 'hsl(var(--card) / 0.3)',
            borderColor: `${accentColor}15`,
          }}
        >
          <span className="text-[9px] text-muted-foreground/60 uppercase font-mono">Rear</span>
          <span 
            className="font-mono text-sm font-semibold"
            style={{ 
              color: accentColor,
              textShadow: `0 0 6px ${accentColor}30`,
            }}
          >
            {rear.toFixed(rear % 1 === 0 ? 0 : 1)}
            {unit && <span className="text-[9px] text-muted-foreground/50 ml-0.5">{unit}</span>}
          </span>
        </div>
      </div>
    </div>
  );
};
