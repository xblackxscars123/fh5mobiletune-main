import { useCallback } from 'react';
import { useModuleLayout } from '@/contexts/ModuleLayoutContext';
import { cn } from '@/lib/utils';

interface ModuleDropZoneProps {
  targetModuleId: string;
  position: 'before' | 'after';
}

export const ModuleDropZone = ({ targetModuleId, position }: ModuleDropZoneProps) => {
  const { draggedId, reorderModules, setDropTargetId } = useModuleLayout();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const droppedModuleId = e.dataTransfer.getData('moduleId');
    
    if (droppedModuleId && droppedModuleId !== targetModuleId) {
      reorderModules(droppedModuleId, targetModuleId, position);
    }
    
    setDropTargetId(null);
  }, [targetModuleId, position, reorderModules, setDropTargetId]);

  // Only show when actively dragging
  if (!draggedId || draggedId === targetModuleId) {
    return null;
  }

  return (
    <div
      className={cn(
        'h-3 -my-1.5 rounded-full transition-all duration-200 relative z-10',
        'hover:h-6 hover:-my-3 hover:bg-neon-cyan/10 hover:border-2 hover:border-dashed hover:border-neon-cyan/50',
        'group'
      )}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Magnetic indicator */}
      <div 
        className={cn(
          'absolute inset-x-4 top-1/2 h-[2px] -translate-y-1/2 rounded-full',
          'opacity-0 group-hover:opacity-100 transition-opacity',
          'bg-gradient-to-r from-transparent via-neon-cyan to-transparent',
          'shadow-[0_0_10px_hsl(var(--neon-cyan)/0.5)]'
        )}
      />
    </div>
  );
};
