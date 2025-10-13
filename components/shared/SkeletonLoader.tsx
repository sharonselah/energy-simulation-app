// Skeleton loader for content loading states

import React from 'react';

interface SkeletonLoaderProps {
  variant?: 'card' | 'text' | 'metric' | 'chart' | 'button';
  className?: string;
  count?: number;
}

export default function SkeletonLoader({ 
  variant = 'text', 
  className = '',
  count = 1 
}: SkeletonLoaderProps) {
  const variants = {
    card: 'h-40 w-full rounded-xl',
    text: 'h-4 w-full rounded',
    metric: 'h-24 w-full rounded-xl',
    chart: 'h-64 w-full rounded-xl',
    button: 'h-12 w-32 rounded-xl',
  };

  const items = Array.from({ length: count }, (_, i) => (
    <div
      key={i}
      className={`skeleton ${variants[variant]} ${className}`}
      role="status"
      aria-label="Loading content"
    >
      <span className="sr-only">Loading...</span>
    </div>
  ));

  if (count === 1) {
    return items[0];
  }

  return <div className="space-y-3">{items}</div>;
}

