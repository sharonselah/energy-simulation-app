'use client';

import React from 'react';
import { Zap } from 'lucide-react';
import { LoadProfileHeaderProps, ViewMode } from './types';

const VIEW_MODES: Array<{ label: string; mode: ViewMode }> = [
  { label: 'Current', mode: 'current' },
  { label: 'Optimized', mode: 'optimized' },
  { label: 'Comparison', mode: 'comparison' },
];

export const LoadProfileHeader: React.FC<LoadProfileHeaderProps> = ({
  devices,
  isMultiDevice,
  showComparison,
  viewMode,
  onViewModeChange,
}) => {
  const primaryDevice = devices[0];

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-semibold text-primary flex items-center gap-2">
            <Zap className="w-5 h-5" />
            24-Hour Load Profile
            {isMultiDevice && (
              <span className="text-sm font-normal text-gray-600">
                ({devices.length} devices)
              </span>
            )}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {isMultiDevice
              ? `Combined energy usage from all ${devices.length} devices`
              : `${primaryDevice?.device.name ?? 'Device'}`}
          </p>
        </div>

        {showComparison && (
          <div className="flex gap-2">
            {VIEW_MODES.map(({ label, mode }) => (
              <button
                key={mode}
                onClick={() => onViewModeChange(mode)}
                className={`px-4 py-2 text-sm rounded-lg font-medium transition-all ${
                  viewMode === mode
                    ? 'bg-primary text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
