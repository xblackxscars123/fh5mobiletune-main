import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Virtual list hook for mobile performance optimization
 * Renders only visible items for large lists
 */
export function useVirtualList<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number,
  overscan: number = 5
) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const visibleStart = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const visibleEnd = Math.min(
    items.length,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );

  const visibleItems = items.slice(visibleStart, visibleEnd);
  const totalHeight = items.length * itemHeight;
  const offsetY = visibleStart * itemHeight;

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return {
    visibleItems,
    totalHeight,
    offsetY,
    visibleStart,
    visibleEnd,
    containerRef,
    handleScroll,
  };
}

/**
 * Mobile-optimized virtual list with touch support
 */
export function useMobileVirtualList<T>(
  items: T[],
  getItemHeight: (index: number) => number,
  containerHeight: number
) {
  const [scrollTop, setScrollTop] = useState(0);
  const [dimensions, setDimensions] = useState<{ top: number; bottom: number }>({ top: 0, bottom: containerHeight });
  const containerRef = useRef<HTMLDivElement>(null);

  let accumulatedHeight = 0;
  let startIndex = 0;
  let endIndex = 0;
  let offsetY = 0;

  // Find visible range
  for (let i = 0; i < items.length; i++) {
    const itemHeight = getItemHeight(i);
    const itemTop = accumulatedHeight;
    const itemBottom = accumulatedHeight + itemHeight;

    if (itemBottom <= dimensions.top) {
      startIndex = i + 1;
      offsetY = itemBottom;
    } else if (itemTop < dimensions.bottom) {
      endIndex = i + 1;
    }

    accumulatedHeight = itemBottom;
  }

  const visibleItems = items.slice(startIndex, Math.min(endIndex + 10, items.length)); // +10 for overscan
  const totalHeight = accumulatedHeight;

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const newScrollTop = e.currentTarget.scrollTop;
    setScrollTop(newScrollTop);
    setDimensions({
      top: newScrollTop,
      bottom: newScrollTop + containerHeight,
    });
  }, [containerHeight]);

  return {
    visibleItems,
    totalHeight,
    offsetY,
    startIndex,
    endIndex,
    containerRef,
    handleScroll,
    scrollTop,
  };
}

/**
 * Intersection observer hook for lazy loading
 */
export function useIntersectionObserver(
  options: IntersectionObserverInit = {}
) {
  const [entries, setEntries] = useState<IntersectionObserverEntry[]>([]);
  const observerRef = useRef<IntersectionObserver>();

  const observe = useCallback((element: Element) => {
    if (observerRef.current) {
      observerRef.current.observe(element);
    }
  }, []);

  const unobserve = useCallback((element: Element) => {
    if (observerRef.current) {
      observerRef.current.unobserve(element);
    }
  }, []);

  useEffect(() => {
    if (typeof IntersectionObserver !== 'undefined') {
      observerRef.current = new IntersectionObserver((entries) => {
        setEntries(entries);
      }, options);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [options]);

  return { entries, observe, unobserve };
}
