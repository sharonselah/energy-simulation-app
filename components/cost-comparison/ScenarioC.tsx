'use client';

import React from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { generateOptimizedTimeBlocks } from '@/lib/calculations';
import { Sparkles, TrendingDown } from 'lucide-react';
import Card from '../shared/Card';
import DeviceBreakdown from './DeviceBreakdown';
import CollapsibleSection from '../shared/CollapsibleSection';

export default function ScenarioC() {
  const { devices, multiDeviceState, removeDevice } = useAppContext();

  if (devices.length === 0) return null;

  const { scenarioB, scenarioC } = multiDeviceState.aggregatedCosts;

  const savings = scenarioB.total.daily - scenarioC.total.daily;
  const savingsPercentage = scenarioB.total.daily > 0 ? (savings / scenarioB.total.daily) * 100 : 0;

  const offpeakCost = scenarioC.breakdown.offpeak;
  const midpeakCost = scenarioC.breakdown.midpeak;
  const peakCost = scenarioC.breakdown.peak;

  const deviceRecommendations = devices.map((device) => {
    const optimizedBlocks = generateOptimizedTimeBlocks(device.duration);
    const recommendedHours = optimizedBlocks
      .filter((b) => b.isSelected)
      .map((b) => b.hour);

    const formatTimeRange = (hours: number[]) => {
      if (hours.length === 0) return '';

      const ranges: string[] = [];
      let start = hours[0];
      let end = hours[0];

      for (let i = 1; i <= hours.length; i += 1) {
        if (i < hours.length && hours[i] === end + 1) {
          end = hours[i];
        } else {
          const startTime = start === 0 ? '12am' : start < 12 ? `${start}am` : start === 12 ? '12pm' : `${start - 12}pm`;
          const endTime =
            end + 1 === 0 ? '12am' : end + 1 < 12 ? `${end + 1}am` : end + 1 === 12 ? '12pm' : `${end + 1 - 12}pm`;
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

  const totalOffpeakPercentage = scenarioC.total.daily > 0 ? (offpeakCost / scenarioC.total.daily) * 100 : 0;

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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-white rounded-xl shadow-md p-4">
            <p className="text-sm text-gray-600 mb-1">Daily Cost</p>
            <p className="text-xl font-bold text-green-600">
              KES {scenarioC.total.daily.toFixed(2)}
            </p>
            
          </div>
          <div className="bg-white rounded-xl shadow-md p-4">
            <p className="text-sm text-gray-600 mb-1">Monthly Cost</p>
            <p className="text-xl font-bold text-green-600">
              KES {scenarioC.total.monthly.toFixed(2)}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4">
            <p className="text-sm text-gray-600 mb-1">Annual Cost</p>
            <p className="text-xl font-bold text-green-600">
              KES {scenarioC.total.annual.toLocaleString('en-KE', { maximumFractionDigits: 0 })}
            </p>
          </div>
        </div>

        <CollapsibleSection
          title="Detailed insights & breakdown"
          description="Expand to explore savings, optimized distribution, and device recommendations."
          className="border-green-200 bg-green-50/80"
        >
          <div className="space-y-4">
            {savings > 0 && (
              <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl shadow-lg p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingDown className="w-5 h-5" />
                      <p className="text-sm font-semibold">Total Potential Savings</p>
                    </div>
                    <p className="text-2xl sm:text-3xl font-bold">
                      KES {savings.toFixed(2)}/day
                    </p>
                    <p className="text-sm opacity-90 mt-1">
                      Save {savingsPercentage.toFixed(0)}% vs current pattern
                    </p>
                  </div>
                  <div className="text-xs sm:text-right sm:text-sm opacity-90 space-y-1">
                    <p>Monthly: KES {(savings * 30).toFixed(2)}</p>
                    <p>Annual: KES {(savings * 365).toLocaleString('en-KE', { maximumFractionDigits: 0 })}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl shadow-sm p-4 space-y-2">
              <p className="text-sm font-semibold text-gray-700">Optimized TOU Distribution</p>
              {offpeakCost > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-green-500 rounded" />
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
                    <span className="w-3 h-3 bg-yellow-500 rounded" />
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
                    <span className="w-3 h-3 bg-red-500 rounded" />
                    Peak
                  </span>
                  <span className="font-semibold text-red-600">
                    KES {peakCost.toFixed(2)}
                  </span>
                </div>
              )}
            </div>

            {devices.length > 1 && (
              <div className="space-y-2 text-xs text-green-800 bg-white border border-green-200 rounded-xl shadow-sm p-4">
                <p className="text-sm font-semibold text-green-700">Device-specific recommendations</p>
                {deviceRecommendations.slice(0, 3).map((rec, idx) => (
                  <div key={idx}>
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
            )}

            <div className="bg-white border border-green-200 rounded-xl shadow-sm p-3 text-xs text-green-800">
              <p className="font-semibold mb-1">Optimization tip</p>
              <p>
                {devices.length > 1
                  ? `By coordinating usage times for all ${devices.length} devices during off-peak hours, you maximize savings and reduce grid stress.`
                  : 'Prioritize off-peak hours (10pm-6am) for maximum savings.'}
              </p>
            </div>

            <DeviceBreakdown
              devices={devices}
              costsByDevice={scenarioC.byDevice}
              totalCost={scenarioC.total}
              scenario="C"
              onRemoveDevice={removeDevice}
              defaultExpanded={devices.length === 1}
            />
          </div>
        </CollapsibleSection>
      </div>
    </Card>
  );
}
