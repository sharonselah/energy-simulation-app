'use client';

import React from 'react';
import { TrendingDown } from 'lucide-react';
import { SavingsBannerProps } from './types';

export const SavingsBanner: React.FC<SavingsBannerProps> = ({
  showComparison,
  hasTimeBlocks,
  savings,
  isMultiDevice,
}) => {
  if (!showComparison || !hasTimeBlocks || savings.saved <= 0) {
    return null;
  }

  return (
    <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <TrendingDown className="w-5 h-5 text-green-600 mt-0.5" />
        <div>
          <h3 className="font-semibold text-green-900 mb-1">
            Optimization Savings{isMultiDevice ? ' (All Devices)' : ''}
          </h3>
          <p className="text-sm text-green-800">
            By shifting to off-peak hours, you could save{' '}
            <span className="font-bold">KES {savings.saved.toFixed(2)}/day</span>{' '}
            ({savings.percentage.toFixed(1)}% reduction)
          </p>
          <div className="mt-2 flex gap-4 text-xs text-green-700">
            <span>Current: KES {savings.currentTotal.toFixed(2)}/day</span>
            <span>Optimized: KES {savings.optimizedTotal.toFixed(2)}/day</span>
          </div>
          {isMultiDevice && (
            <p className="text-xs text-green-700 mt-2">
              Monthly savings: KES {(savings.saved * 30).toFixed(2)} | Annual:{' '}
              {Math.round(savings.saved * 365).toLocaleString('en-KE')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
