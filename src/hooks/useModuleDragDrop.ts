import { useCallback, useRef } from 'react';
import { useModuleLayout } from '@/contexts/ModuleLayoutContext';

export function useModuleDragDrop(moduleId: string) {
  const { 
    draggedId, 
    dropTargetId, 
    setDraggedId, 
    setDropTargetId, 
    reorderModules 
  } = useModuleLayout();

  const moduleRef = useRef<HTMLDivElement>(null);

  const handleDragStart = useCallback((e: React.DragEvent) => {
    e.dataTransfer.setData('moduleId', moduleId);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedId(moduleId);
    
    // Add slight delay for visual feedback
    setTimeout(() => {
      if (moduleRef.current) {
        moduleRef.current.classList.add('module-dragging');
      }
    }, 0);
  }, [moduleId, setDraggedId]);

  const handleDragEnd = useCallback(() => {
    setDraggedId(null);
    setDropTargetId(null);
    
    if (moduleRef.current) {
      moduleRef.current.classList.remove('module-dragging');
      // Trigger snap animation
      moduleRef.current.classList.add('module-snap');
      setTimeout(() => {
        moduleRef.current?.classList.remove('module-snap');
      }, 300);
    }
  }, [setDraggedId, setDropTargetId]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    if (draggedId && draggedId !== moduleId) {
      setDropTargetId(moduleId);
    }
  }, [draggedId, moduleId, setDropTargetId]);

  const handleDragLeave = useCallback(() => {
    if (dropTargetId === moduleId) {
      setDropTargetId(null);
    }
  }, [dropTargetId, moduleId, setDropTargetId]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const droppedModuleId = e.dataTransfer.getData('moduleId');
    
    if (droppedModuleId && droppedModuleId !== moduleId) {
      // Determine drop position based on mouse position
      const rect = moduleRef.current?.getBoundingClientRect();
      if (rect) {
        const midpoint = rect.top + rect.height / 2;
        const position = e.clientY < midpoint ? 'before' : 'after';
        reorderModules(droppedModuleId, moduleId, position);
      }
    }
    
    setDropTargetId(null);
  }, [moduleId, reorderModules, setDropTargetId]);

  const isDragging = draggedId === moduleId;
  const isDropTarget = dropTargetId === moduleId && draggedId !== moduleId;

  return {
    moduleRef,
    dragHandlers: {
      draggable: true,
      onDragStart: handleDragStart,
      onDragEnd: handleDragEnd,
      onDragOver: handleDragOver,
      onDragLeave: handleDragLeave,
      onDrop: handleDrop,
    },
    isDragging,
    isDropTarget,
  };
}
