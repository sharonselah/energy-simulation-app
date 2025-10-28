// Reusable Card component for dashboard layout

import React from 'react';

interface CardProps {
  children?: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  hoverable?: boolean;
  loading?: boolean;
  ariaLabel?: string;
}

export default function Card({ 
  children, 
  className = '', 
  title, 
  subtitle,
  hoverable = false,
  loading = false,
  ariaLabel
}: CardProps) {
  const hoverStyles = hoverable 
    ? 'card-hover cursor-pointer' 
    : 'transition-shadow duration-200';

  if (loading) {
    return (
      <div 
        className={`bg-white rounded-xl shadow-lg border border-gray-100 p-6 ${className}`}
        role="status"
        aria-label="Loading content"
      >
        <div className="animate-pulse space-y-4">
          {title && (
            <div>
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
              {subtitle && <div className="h-4 bg-gray-100 rounded w-1/2"></div>}
            </div>
          )}
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`
        bg-white rounded-xl shadow-lg border border-gray-100 p-6 
        animate-fadeInUp
        ${hoverStyles}
        ${className}
      `}
      aria-label={ariaLabel}
      role={hoverable ? 'button' : undefined}
      tabIndex={hoverable ? 0 : undefined}
    >
      {title && (
        <div className="mb-4">
          <h3 className="text-xl font-semibold text-primary">{title}</h3>
          {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
}

