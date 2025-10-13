'use client';

import React from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Flame, Zap } from 'lucide-react';
import Card from '../shared/Card';
import DeviceBreakdown from './DeviceBreakdown';

export default function ScenarioA() {
  const { devices, multiDeviceState, removeDevice } = useAppContext();

  if (devices.length === 0) return null;

  const { scenarioA } = multiDeviceState.aggregatedCosts;
  
  // Check if any devices have alternative fuel
  const hasAlternativeFuel = devices.some((device) => device.alternativeFuel);
  
  // Count devices by type
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
        {/* Daily Cost */}
        <div className="bg-white rounded-xl shadow-md p-4">
          <p className="text-sm text-gray-600 mb-1">Daily Cost</p>
          <p className="text-2xl font-bold text-gray-900">
            KES {scenarioA.total.daily.toFixed(2)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {devices.length} device{devices.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Monthly Cost */}
        <div className="bg-white rounded-xl shadow-md p-4">
          <p className="text-sm text-gray-600 mb-1">Monthly Cost</p>
          <p className="text-xl font-bold text-gray-900">
            KES {scenarioA.total.monthly.toFixed(2)}
          </p>
        </div>

        {/* Annual Cost */}
        <div className="bg-white rounded-xl shadow-md p-4">
          <p className="text-sm text-gray-600 mb-1">Annual Cost</p>
          <p className="text-xl font-bold text-gray-900">
            KES {scenarioA.total.annual.toLocaleString('en-KE', { maximumFractionDigits: 0 })}
          </p>
        </div>

        {/* Mixed Scenario Info */}
        {hasAlternativeFuel && (
          <div className="bg-orange-100 border border-orange-200 rounded-xl shadow-sm p-3 text-xs text-orange-800">
            <p className="font-semibold mb-1">📊 Mixed Energy Sources</p>
            <div className="space-y-1">
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
            </div>
          </div>
        )}

        {/* No Alternative Fuel Info */}
        {!hasAlternativeFuel && (
          <div className="bg-gray-100 border border-gray-200 rounded-xl shadow-sm p-3 text-xs text-gray-800">
            <p className="font-semibold mb-1">⚡ Current Grid Usage</p>
            <p>All devices are currently using grid electricity. This is your baseline for comparison.</p>
          </div>
        )}

        {/* Device Breakdown */}
        <DeviceBreakdown
          devices={devices}
          costsByDevice={scenarioA.byDevice}
          totalCost={scenarioA.total}
          scenario="A"
          onRemoveDevice={removeDevice}
        />
      </div>
    </Card>
  );
}

