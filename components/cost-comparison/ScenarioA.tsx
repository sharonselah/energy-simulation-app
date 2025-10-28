'use client';

import React from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Flame, Zap } from 'lucide-react';
import Card from '../shared/Card';
import DeviceBreakdown from './DeviceBreakdown';
import CollapsibleSection from '../shared/CollapsibleSection';

export default function ScenarioA() {
  const { devices, multiDeviceState, removeDevice } = useAppContext();

  if (devices.length === 0) return null;

  const { scenarioA } = multiDeviceState.aggregatedCosts;

  const hasAlternativeFuel = devices.some((device) => device.alternativeFuel);
  const fuelDevices = devices.filter((device) => device.alternativeFuel);
  const electricDevices = devices.filter((device) => !device.alternativeFuel);

  return (
    <Card className="bg-orange-50 border border-orange-100 shadow-lg">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-10 h-10 bg-orange-200 rounded-xl shadow-sm flex items-center justify-center">
          <Flame className="w-5 h-5 text-orange-700" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-orange-900">Scenario A</h3>
          <p className="text-sm text-orange-700">
            Current {hasAlternativeFuel ? '(Mixed)' : '(Grid Only)'}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-white rounded-xl shadow-md p-4">
            <p className="text-sm text-gray-600 mb-1">Daily Cost</p>
            <p className="text-xl font-bold text-gray-900">
              KES {scenarioA.total.daily.toFixed(2)}
            </p>
           
          </div>
          <div className="bg-white rounded-xl shadow-md p-4">
            <p className="text-sm text-gray-600 mb-1">Monthly Cost</p>
            <p className="text-xl font-bold text-gray-900">
              KES {scenarioA.total.monthly.toFixed(2)}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4">
            <p className="text-sm text-gray-600 mb-1">Annual Cost</p>
            <p className="text-xl font-bold text-gray-900">
              KES {scenarioA.total.annual.toLocaleString('en-KE', { maximumFractionDigits: 0 })}
            </p>
          </div>
        </div>

        <CollapsibleSection
          title="Detailed insights & breakdown"
          description="Expand to review fuel mix context and device-level costs."
          className="border-orange-200 bg-orange-50/80"
        >
          <div className="space-y-4">
            <div
              className={`rounded-xl border shadow-sm p-4 text-xs ${
                hasAlternativeFuel
                  ? 'border-orange-200 bg-white text-orange-800'
                  : 'border-gray-200 bg-white text-gray-700'
              }`}
            >
              {hasAlternativeFuel ? (
                <>
                  <p className="font-semibold mb-2">dY&apos;s Mixed Energy Sources</p>
                  {fuelDevices.length > 0 && (
                    <p className="flex items-center gap-1">
                      <Flame className="w-3 h-3" />
                      <span>
                        {fuelDevices.length} device{fuelDevices.length !== 1 ? 's' : ''} on alternative fuel
                      </span>
                    </p>
                  )}
                  {electricDevices.length > 0 && (
                    <p className="flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      <span>
                        {electricDevices.length} device{electricDevices.length !== 1 ? 's' : ''} on grid electricity
                      </span>
                    </p>
                  )}
                </>
              ) : (
                <>
                  <p className="font-semibold mb-1">Baseline Grid Usage</p>
                  <p>All devices are currently using grid electricity. This is your baseline for comparison.</p>
                </>
              )}
            </div>

            <DeviceBreakdown
              devices={devices}
              costsByDevice={scenarioA.byDevice}
              totalCost={scenarioA.total}
              scenario="A"
              onRemoveDevice={removeDevice}
              defaultExpanded={devices.length === 1}
            />
          </div>
        </CollapsibleSection>
      </div>
    </Card>
  );
}
