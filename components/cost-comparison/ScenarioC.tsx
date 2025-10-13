'use client';

import React from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { generateOptimizedTimeBlocks } from '@/lib/calculations';
import { Sparkles, TrendingDown, Clock } from 'lucide-react';
import Card from '../shared/Card';
import DeviceBreakdown from './DeviceBreakdown';

export default function ScenarioC() {
  const { devices, multiDeviceState, removeDevice } = useAppContext();

  if (devices.length === 0) return null;

  const { scenarioB, scenarioC } = multiDeviceState.aggregatedCosts;

  // Calculate savings
  const savings = scenarioB.total.daily - scenarioC.total.daily;
  const savingsPercentage = scenarioB.total.daily > 0 
    ? (savings / scenarioB.total.daily) * 100 
    : 0;

  // Calculate optimized cost breakdown
  const offpeakCost = scenarioC.breakdown.offpeak;
  const midpeakCost = scenarioC.breakdown.midpeak;
  const peakCost = scenarioC.breakdown.peak;

  // Generate device-specific recommendations
  const deviceRecommendations = devices.map((device) => {
    const optimizedBlocks = generateOptimizedTimeBlocks(device.duration);
    const recommendedHours = optimizedBlocks
      .filter((b) => b.isSelected)
      .map((b) => b.hour);
    
    // Format time range
    const formatTimeRange = (hours: number[]) => {
      if (hours.length === 0) return '';
      
      const ranges: string[] = [];
      let start = hours[0];
      let end = hours[0];
      
      for (let i = 1; i <= hours.length; i++) {
        if (i < hours.length && hours[i] === end + 1) {
          end = hours[i];
        } else {
          const startTime = start === 0 ? '12am' : start < 12 ? `${start}am` : start === 12 ? '12pm' : `${start - 12}pm`;
          const endTime = (end + 1) === 0 ? '12am' : (end + 1) < 12 ? `${end + 1}am` : (end + 1) === 12 ? '12pm' : `${(end + 1) - 12}pm`;
          ranges.push(start === end ? startTime : `${startTime}-${endTime}`);
          if (i < hours.length) {
            start = hours[i];
            end = hours[i];
          }
        }
      }
      
      return ranges.join(', ');
    };

    return {
      deviceName: device.device.name,
      deviceCategory: device.device.category,
      recommendedTime: formatTimeRange(recommendedHours),
      offpeakHours: optimizedBlocks.filter((b) => b.isSelected && b.rateType === 'offpeak').length,
    };
  });

  // Count total optimized distribution
  const totalOffpeakPercentage = scenarioC.total.daily > 0 
    ? (offpeakCost / scenarioC.total.daily) * 100 
    : 0;

  return (
    <Card className="bg-green-50 border border-green-200 shadow-xl ring-2 ring-green-200 ring-opacity-50">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-10 h-10 bg-green-300 rounded-xl shadow-md flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-green-700" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-green-900">Scenario C</h3>
          <p className="text-sm text-green-700">Optimized TOU</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Daily Cost */}
        <div className="bg-white rounded-xl shadow-md p-4">
          <p className="text-sm text-gray-600 mb-1">Daily Cost</p>
          <p className="text-2xl font-bold text-green-600">
            KES {scenarioC.total.daily.toFixed(2)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {devices.length} device{devices.length !== 1 ? 's' : ''} optimized
          </p>
        </div>

        {/* Monthly Cost */}
        <div className="bg-white rounded-xl shadow-md p-4">
          <p className="text-sm text-gray-600 mb-1">Monthly Cost</p>
          <p className="text-xl font-bold text-green-600">
            KES {scenarioC.total.monthly.toFixed(2)}
          </p>
        </div>

        {/* Annual Cost */}
        <div className="bg-white rounded-xl shadow-md p-4">
          <p className="text-sm text-gray-600 mb-1">Annual Cost</p>
          <p className="text-xl font-bold text-green-600">
            KES {scenarioC.total.annual.toLocaleString('en-KE', { maximumFractionDigits: 0 })}
          </p>
        </div>

        {/* Savings Badge */}
        {savings > 0 && (
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl shadow-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="w-5 h-5" />
              <p className="text-sm font-semibold">Total Potential Savings</p>
            </div>
            <p className="text-2xl font-bold">
              KES {savings.toFixed(2)}/day
            </p>
            <p className="text-sm opacity-90 mt-1">
              Save {savingsPercentage.toFixed(0)}% vs current pattern
            </p>
            <p className="text-xs opacity-75 mt-2">
              Monthly: KES {(savings * 30).toFixed(2)} | 
              Annual: KES {(savings * 365).toLocaleString('en-KE', { maximumFractionDigits: 0 })}
            </p>
          </div>
        )}

        {/* Optimized TOU Breakdown */}
        <div className="bg-white rounded-xl shadow-md p-4 space-y-2">
          <p className="text-sm font-semibold text-gray-700 mb-2">Optimized TOU Distribution</p>
          
          {offpeakCost > 0 && (
            <div className="flex justify-between items-center text-sm">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 bg-green-500 rounded"></span>
                Off-Peak ({totalOffpeakPercentage.toFixed(0)}%)
              </span>
              <span className="font-semibold text-green-600">
                KES {offpeakCost.toFixed(2)}
              </span>
            </div>
          )}
          
          {midpeakCost > 0 && (
            <div className="flex justify-between items-center text-sm">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 bg-yellow-500 rounded"></span>
                Mid-Peak
              </span>
              <span className="font-semibold">
                KES {midpeakCost.toFixed(2)}
              </span>
            </div>
          )}
          
          {peakCost > 0 && (
            <div className="flex justify-between items-center text-sm">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 bg-red-500 rounded"></span>
                Peak
              </span>
              <span className="font-semibold text-red-600">
                KES {peakCost.toFixed(2)}
              </span>
            </div>
          )}
        </div>

        {/* Device-Specific Recommendations */}
        {devices.length > 1 && (
          <div className="bg-green-100 border border-green-200 rounded-xl shadow-sm p-3">
            <p className="text-xs font-semibold text-green-900 mb-2 flex items-center gap-1">
              <Clock className="w-4 h-4" />
              Device-Specific Recommendations
            </p>
            <div className="space-y-2">
              {deviceRecommendations.slice(0, 3).map((rec, idx) => (
                <div key={idx} className="text-xs text-green-800">
                  <span className="font-semibold">{rec.deviceName}:</span>{' '}
                  <span>{rec.recommendedTime}</span>
                  {rec.offpeakHours > 0 && (
                    <span className="ml-1 text-green-600">
                      ({rec.offpeakHours}h off-peak)
                    </span>
                  )}
                </div>
              ))}
              {deviceRecommendations.length > 3 && (
                <p className="text-xs text-green-700 italic">
                  + {deviceRecommendations.length - 3} more device{deviceRecommendations.length - 3 !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Multi-Device Optimization Tip */}
        <div className="bg-white border border-green-200 rounded-xl shadow-sm p-3 text-xs text-green-800">
          <p className="font-semibold mb-1">💡 Multi-Device Optimization</p>
          <p>
            {devices.length > 1 
              ? `By coordinating usage times for all ${devices.length} devices during off-peak hours, you maximize savings and reduce grid stress.`
              : 'Prioritize off-peak hours (10pm-6am) for maximum savings.'
            }
          </p>
        </div>

        {/* Device Breakdown */}
        <DeviceBreakdown
          devices={devices}
          costsByDevice={scenarioC.byDevice}
          totalCost={scenarioC.total}
          scenario="C"
          onRemoveDevice={removeDevice}
        />
      </div>
    </Card>
  );
}

