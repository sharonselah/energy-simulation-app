// Lazy loading wrapper component with intersection observer

'use client';

import React, { useRef, ReactNode } from 'react';
import { useIntersectionObserver } from '@/lib/performance';
import SkeletonLoader from './SkeletonLoader';

interface LazyLoadProps {
  children: ReactNode;
  skeleton?: ReactNode;
  threshold?: number;
  rootMargin?: string;
  className?: string;
}

export default function LazyLoad({
  children,
  skeleton,
  threshold = 0.1,
  rootMargin = '50px',
  className = '',
}: LazyLoadProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isVisible = useIntersectionObserver(ref, {
    threshold,
    rootMargin,
  });

  return (
    <div ref={ref} className={className}>
      {isVisible ? children : (skeleton || <SkeletonLoader variant="card" />)}
    </div>
  );
}

