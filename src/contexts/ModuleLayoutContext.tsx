import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';

const DEFAULT_MODULE_ORDER = [
  'tires',
  'gearing',
  'gearingVisualizer',
  'alignment',
  'antiroll',
  'springs',
  'damping',
  'aero',
  'brakes',
  'differential',
];

const STORAGE_KEY = 'fh5-module-layout';

interface ModuleLayoutContextType {
  moduleOrder: string[];
  draggedId: string | null;
  dropTargetId: string | null;
  setDraggedId: (id: string | null) => void;
  setDropTargetId: (id: string | null) => void;
  reorderModules: (draggedId: string, targetId: string, position: 'before' | 'after') => void;
  resetLayout: () => void;
}

const ModuleLayoutContext = createContext<ModuleLayoutContextType | null>(null);

export function ModuleLayoutProvider({ children }: { children: ReactNode }) {
  const [moduleOrder, setModuleOrder] = useState<string[]>(() => {
    if (typeof window === 'undefined') return DEFAULT_MODULE_ORDER;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_MODULE_ORDER;
    } catch {
      return DEFAULT_MODULE_ORDER;
    }
  });

  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(moduleOrder));
    } catch {
      // Ignore storage errors
    }
  }, [moduleOrder]);

  const reorderModules = useCallback((draggedId: string, targetId: string, position: 'before' | 'after') => {
    setModuleOrder(prev => {
      const newOrder = prev.filter(id => id !== draggedId);
      const targetIndex = newOrder.indexOf(targetId);
      
      if (targetIndex === -1) return prev;
      
      const insertIndex = position === 'before' ? targetIndex : targetIndex + 1;
      newOrder.splice(insertIndex, 0, draggedId);
      
      return newOrder;
    });
  }, []);

  const resetLayout = useCallback(() => {
    setModuleOrder(DEFAULT_MODULE_ORDER);
  }, []);

  return (
    <ModuleLayoutContext.Provider
      value={{
        moduleOrder,
        draggedId,
        dropTargetId,
        setDraggedId,
        setDropTargetId,
        reorderModules,
        resetLayout,
      }}
    >
      {children}
    </ModuleLayoutContext.Provider>
  );
}

export function useModuleLayout() {
  const context = useContext(ModuleLayoutContext);
  if (!context) {
    // Fail-safe: don't crash the app if provider isn't mounted.
    // Drag/drop will be disabled, but the tuning UI will still render.
    return {
      moduleOrder: DEFAULT_MODULE_ORDER,
      draggedId: null,
      dropTargetId: null,
      setDraggedId: () => {},
      setDropTargetId: () => {},
      reorderModules: () => {},
      resetLayout: () => {},
    };
  }
  return context;
}
