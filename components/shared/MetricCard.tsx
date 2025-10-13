// Metric display card for dashboard

import React from 'react';
import { LucideIcon } from 'lucide-react';
import AnimatedNumber from './AnimatedNumber';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  className?: string;
  animated?: boolean;
  decimals?: number;
  prefix?: string;
  suffix?: string;
}

export default function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
  className = '',
  animated = true,
  decimals = 0,
  prefix = '',
  suffix = '',
}: MetricCardProps) {
  const trendColors = {
    up: 'text-offpeak',
    down: 'text-peak',
    neutral: 'text-gray-500',
  };

  const trendIcons = {
    up: '↑',
    down: '↓',
    neutral: '→',
  };

  const numericValue = typeof value === 'number' ? value : parseFloat(String(value).replace(/[^0-9.-]/g, ''));
  const isNumeric = !isNaN(numericValue) && typeof value === 'number';

  return (
    <div 
      className={`
        bg-white rounded-xl shadow-lg border border-gray-100 p-6 
        card-hover
        animate-fadeInUp
        ${className}
      `}
      role="article"
      aria-label={`${title}: ${value}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-1 font-medium">{title}</p>
          <p className="text-3xl font-bold text-primary">
            {animated && isNumeric ? (
              <AnimatedNumber 
                value={numericValue} 
                decimals={decimals}
                prefix={prefix}
                suffix={suffix}
              />
            ) : (
              value
            )}
          </p>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
          {trend && trendValue && (
            <div 
              className={`inline-flex items-center gap-1 text-sm font-semibold mt-2 px-2 py-1 rounded-full ${trendColors[trend]} bg-opacity-10`}
              aria-label={`Trend: ${trend}`}
            >
              <span>{trendIcons[trend]}</span>
              <span>{trendValue}</span>
            </div>
          )}
        </div>
        {Icon && (
          <div className="bg-primary/10 p-3 rounded-xl shadow-sm transition-transform hover:scale-110">
            <Icon className="w-6 h-6 text-primary" aria-hidden="true" />
          </div>
        )}
      </div>
    </div>
  );
}

