import { useCallback, useRef } from 'react';

/**
 * Debounce hook for mobile performance optimization
 * Delays function execution until after specified delay
 */
export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout>();
  
  return useCallback((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay]) as T;
}

/**
 * Throttle hook for mobile performance optimization  
 * Limits function execution to once per specified delay
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastRunRef = useRef<number>(0);
  
  return useCallback((...args: Parameters<T>) => {
    if (Date.now() - lastRunRef.current >= delay) {
      callback(...args);
      lastRunRef.current = Date.now();
    }
  }, [callback, delay]) as T;
}

/**
 * Mobile-optimized debounce with shorter delay for touch interactions
 */
export function useMobileDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay?: number
): T {
  return useDebounce(callback, delay ?? 300);
}

/**
 * Mobile-optimized throttle for high-frequency updates
 */
export function useMobileThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay?: number
): T {
  return useThrottle(callback, delay ?? 100);
}
