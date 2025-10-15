'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Trash2, Edit, Zap } from 'lucide-react';
import { CostBreakdown, SelectedDevice } from '@/lib/types';

interface DeviceBreakdownProps {
  devices: SelectedDevice[];
  costsByDevice: { [deviceId: string]: CostBreakdown };
  totalCost: CostBreakdown;
  scenario: 'A' | 'B' | 'C';
  onEditDevice?: (deviceId: string) => void;
  onRemoveDevice?: (deviceId: string) => void;
}

export default function DeviceBreakdown({
  devices,
  costsByDevice,
  totalCost,
  scenario,
  onEditDevice,
  onRemoveDevice,
}: DeviceBreakdownProps) {
  // Auto-expand when multiple devices exist
  const [isExpanded, setIsExpanded] = useState(devices.length > 1);

  if (devices.length === 0) {
    return null;
  }

  // Calculate percentages for each device
  const devicePercentages = devices.map((device) => {
    const deviceCost = costsByDevice[device.id]?.monthly || 0;
    const percentage = totalCost.monthly > 0 
      ? (deviceCost / totalCost.monthly) * 100 
      : 0;
    return {
      device,
      cost: costsByDevice[device.id],
      percentage,
    };
  });

  // Sort by cost (highest first)
  devicePercentages.sort((a, b) => (b.cost?.monthly || 0) - (a.cost?.monthly || 0));

  const scenarioColors = {
    A: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-900' },
    B: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-900' },
    C: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-900' },
  };

  const colors = scenarioColors[scenario];

  return (
    <div className={`${colors.bg} border ${colors.border} rounded-xl shadow-sm overflow-hidden`}>
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full px-4 py-3 flex items-center justify-between hover:bg-opacity-80 transition-all ${colors.text}`}
      >
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4" />
          <span className="font-semibold text-sm">
            Device Breakdown ({devices.length} device{devices.length !== 1 ? 's' : ''})
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5" />
        ) : (
          <ChevronDown className="w-5 h-5" />
        )}
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-3">
          {devicePercentages.map(({ device, cost, percentage }) => (
            <div
              key={device.id}
              className="bg-white rounded-xl shadow-sm p-3 hover:shadow-md transition-shadow"
            >
              {/* Device Header */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 text-sm">
                    {device.device.name}
                  </h4>
                  <p className="text-xs text-gray-600">
                    {device.duration}h/day - {device.device.category}
                  </p>
                </div>
                
                {/* Action Buttons */}
                {(onEditDevice || onRemoveDevice) && (
                  <div className="flex gap-1 ml-2">
                    {onEditDevice && (
                      <button
                        onClick={() => onEditDevice(device.id)}
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Edit device"
                      >
                        <Edit className="w-4 h-4 text-gray-600" />
                      </button>
                    )}
                    {onRemoveDevice && (
                      <button
                        onClick={() => onRemoveDevice(device.id)}
                        className="p-1.5 hover:bg-red-100 rounded-lg transition-colors"
                        title="Remove device"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Alternative Fuel Info (Scenario A only) */}
              {scenario === 'A' && device.alternativeFuel && (
                <div className="mb-2 text-xs text-gray-600 bg-orange-50 px-2 py-1 rounded">
                  Currently using: {device.alternativeFuel.type}
                </div>
              )}

              {/* Cost Information */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-gray-50 rounded-lg p-2">
                  <p className="text-xs text-gray-600 mb-0.5">Daily</p>
                  <p className="text-sm font-bold text-gray-900">
                    KES {cost?.daily.toFixed(2) || '0.00'}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2">
                  <p className="text-xs text-gray-600 mb-0.5">Monthly</p>
                  <p className="text-sm font-bold text-gray-900">
                    KES {cost?.monthly.toFixed(2) || '0.00'}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2">
                  <p className="text-xs text-gray-600 mb-0.5">% of Total</p>
                  <p className="text-sm font-bold text-gray-900">
                    {percentage.toFixed(1)}%
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* TOU Breakdown (Scenarios B & C) */}
              {(scenario === 'B' || scenario === 'C') && cost?.breakdown && (
                <div className="mt-2 pt-2 border-t border-gray-100">
                  <p className="text-xs text-gray-600 mb-1 font-semibold">TOU Breakdown:</p>
                  <div className="flex gap-2 text-xs">
                    {(cost.breakdown.offpeak ?? 0) > 0 && (
                      <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded">
                        Off-Peak KES {(cost.breakdown.offpeak ?? 0).toFixed(2)}
                      </span>
                    )}
                    {(cost.breakdown.midpeak ?? 0) > 0 && (
                      <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                        Mid-Peak KES {(cost.breakdown.midpeak ?? 0).toFixed(2)}
                      </span>
                    )}
                    {(cost.breakdown.peak ?? 0) > 0 && (
                      <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded">
                        Peak KES {(cost.breakdown.peak ?? 0).toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Summary */}
          <div className="bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-xl shadow-lg p-3 mt-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold">Total (All Devices)</span>
              <div className="text-right">
                <p className="text-lg font-bold">
                  KES {totalCost.monthly.toFixed(2)}/mo
                </p>
                <p className="text-xs opacity-75">
                  KES {totalCost.annual.toLocaleString('en-KE', { maximumFractionDigits: 0 })}/yr
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

