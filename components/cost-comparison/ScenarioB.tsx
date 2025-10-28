'use client';

import React from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Zap, AlertTriangle } from 'lucide-react';
import Card from '../shared/Card';
import DeviceBreakdown from './DeviceBreakdown';
import CollapsibleSection from '../shared/CollapsibleSection';

export default function ScenarioB() {
  const { devices, multiDeviceState, removeDevice } = useAppContext();

  if (devices.length === 0) return null;

  const { scenarioB } = multiDeviceState.aggregatedCosts;

  const totalCost = scenarioB.total.daily;
  const peakCost = scenarioB.breakdown.peak;
  const midpeakCost = scenarioB.breakdown.midpeak;
  const offpeakCost = scenarioB.breakdown.offpeak;

  const peakPercentage = totalCost > 0 ? (peakCost / totalCost) * 100 : 0;
  const isPeakHeavy = peakPercentage > 30;

  const devicesWithPeakUsage = devices.filter((device) =>
    device.timeBlocks.some((b) => b.isSelected && b.rateType === 'peak')
  ).length;

  return (
    <Card className="bg-blue-50 border border-blue-200 shadow-xl ring-2 ring-blue-200 ring-opacity-50">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-10 h-10 bg-blue-300 rounded-xl shadow-md flex items-center justify-center">
          <Zap className="w-5 h-5 text-blue-700" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-blue-900">Scenario B</h3>
          <p className="text-sm text-blue-700">Current Pattern (Electric)</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-white rounded-xl shadow-md p-4">
            <p className="text-sm text-gray-600 mb-1">Daily Cost</p>
            <p className="text-xl font-bold text-gray-900">
              KES {scenarioB.total.daily.toFixed(2)}
            </p>
           
          </div>
          <div className="bg-white rounded-xl shadow-md p-4">
            <p className="text-sm text-gray-600 mb-1">Monthly Cost</p>
            <p className="text-xl font-bold text-gray-900">
              KES {scenarioB.total.monthly.toFixed(2)}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4">
            <p className="text-sm text-gray-600 mb-1">Annual Cost</p>
            <p className="text-xl font-bold text-gray-900">
              KES {scenarioB.total.annual.toLocaleString('en-KE', { maximumFractionDigits: 0 })}
            </p>
          </div>
        </div>

        <CollapsibleSection
          title="Detailed insights & breakdown"
          description="Expand to review TOU distribution, peak alerts, and device costs."
          className="border-blue-200 bg-blue-50/80"
        >
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-sm p-4 space-y-2">
              <p className="text-sm font-semibold text-gray-700">Combined TOU Breakdown</p>
              {offpeakCost > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-green-500 rounded" />
                    Off-Peak
                  </span>
                  <span className="font-semibold">
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

            {isPeakHeavy && (
              <div className="bg-yellow-100 border border-yellow-200 rounded-xl shadow-sm p-3">
                <div className="flex gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-700 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-yellow-800">
                    <p className="font-semibold mb-1">Peak-heavy usage detected</p>
                    <p>
                      {peakPercentage.toFixed(0)}% of your total cost is from peak hours.
                      {devicesWithPeakUsage > 1
                        ? ` ${devicesWithPeakUsage} devices are`
                        : ' 1 device is'}{' '}
                      running during peak time. Consider shifting usage to off-peak for significant savings.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {devices.length > 1 && (
              <div className="bg-blue-100 border border-blue-200 rounded-xl shadow-sm p-3 text-xs text-blue-800">
                <p className="font-semibold mb-1">Combined usage pattern</p>
                <p>
                  {devices.length} devices using electricity with current time blocks. Overlapping usage during peak hours increases costs significantly.
                </p>
              </div>
            )}

            <DeviceBreakdown
              devices={devices}
              costsByDevice={scenarioB.byDevice}
              totalCost={scenarioB.total}
              scenario="B"
              onRemoveDevice={removeDevice}
              defaultExpanded={devices.length === 1}
            />
          </div>
        </CollapsibleSection>
      </div>
    </Card>
  );
}
