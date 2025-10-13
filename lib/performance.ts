// Performance optimization utilities

import { useEffect, useState } from 'react';

/**
 * Hook for lazy loading components when they enter the viewport
 */
export function useIntersectionObserver(
  ref: React.RefObject<Element | null>,
  options: IntersectionObserverInit = {}
): boolean {
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [ref, options]);

  return isIntersecting;
}

/**
 * Hook for debouncing values
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook for throttling function calls
 */
export function useThrottle<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number
): T {
  const [lastRun, setLastRun] = useState(Date.now());

  return ((...args) => {
    const now = Date.now();
    if (now - lastRun >= delay) {
      setLastRun(now);
      return callback(...args);
    }
  }) as T;
}

/**
 * Performance monitoring utility
 */
export class PerformanceMonitor {
  private static marks: Map<string, number> = new Map();

  static start(label: string): void {
    this.marks.set(label, performance.now());
  }

  static end(label: string): number {
    const startTime = this.marks.get(label);
    if (!startTime) {
      console.warn(`No start mark found for "${label}"`);
      return 0;
    }

    const duration = performance.now() - startTime;
    this.marks.delete(label);

    if (process.env.NODE_ENV === 'development') {
      console.log(`⏱️ ${label}: ${duration.toFixed(2)}ms`);
    }

    return duration;
  }
}

