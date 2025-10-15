'use client';

import React from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Zap, CheckCircle } from 'lucide-react';
import ScenarioA from './ScenarioA';
import ScenarioB from './ScenarioB';
import ScenarioC from './ScenarioC';
import ComparisonChart from './ComparisonChart';
import SmartTips from '../shared/SmartTips';
import Card from '../shared/Card';

export default function CostComparison() {
  const { devices, multiDeviceState } = useAppContext();

  // Check if any devices are added
  if (devices.length === 0) {
    return (
      <div className=" mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-yellow-50 border border-yellow-100 rounded-xl shadow-md p-6 text-center">
          <p className="text-lg text-yellow-800 mb-2">
            No devices added yet
          </p>
          <p className="text-sm text-yellow-700">
            Please add at least one device to see cost comparison
          </p>
        </div>
      </div>
    );
  }

  // Check if devices have time blocks selected
  const hasTimeBlocks = devices.some((device) => 
    device.timeBlocks.filter((b) => b.isSelected).length > 0
  );

  if (!hasTimeBlocks) {
    return (
      <div className=" mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-yellow-50 border border-yellow-100 rounded-xl shadow-md p-6 text-center">
          <p className="text-lg text-yellow-800 mb-2">
            Please configure your devices
          </p>
          <p className="text-sm text-yellow-700">
            Select time blocks for at least one device to see cost comparison
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className=" mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-primary mb-2">
          Cost Comparison Analysis
        </h2>
        <p className="text-gray-600">
          Compare your costs across three scenarios for {devices.length} device{devices.length !== 1 ? 's' : ''}
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Total daily energy: {multiDeviceState.aggregatedMetrics.totalDailyKWh.toFixed(2)} kWh
        </p>
      </div>

      {/* Devices in This Analysis */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-10 h-10 bg-primary rounded-xl shadow-md flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-primary">
              Devices in This Analysis
            </h3>
            <p className="text-sm text-gray-600">
              {devices.length} device{devices.length !== 1 ? 's' : ''} configured
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {devices.map((device, index) => {
            const selectedHours = device.timeBlocks.filter(b => b.isSelected).length;
            return (
              <div
                key={device.id}
                className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-3">
                  <div className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 text-sm mb-1 truncate">
                      {device.device.name}
                    </h4>
                    <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                      <span>{device.duration}h/day</span>
                      <span>-</span>
                      <span className="capitalize">{device.device.category}</span>
                    </div>
                    {selectedHours > 0 && (
                      <div className="mt-2 flex items-center gap-1 text-xs text-green-700">
                        <CheckCircle className="w-3 h-3" />
                        <span>{selectedHours} time slots configured</span>
                      </div>
                    )}
                    {device.alternativeFuel && (
                      <div className="mt-1">
                        <span className="inline-block px-2 py-0.5 bg-orange-100 text-orange-800 text-xs rounded-full">
                          Using {device.alternativeFuel.type}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {devices.length > 1 && (
          <div className="mt-4 pt-4 border-t border-blue-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <p className="text-xs text-gray-600 mb-1">Total Load</p>
                <p className="text-lg font-bold text-primary">
                  {multiDeviceState.aggregatedMetrics.totalDailyKWh.toFixed(1)} kWh
                </p>
              </div>
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <p className="text-xs text-gray-600 mb-1">Peak Usage</p>
                <p className="text-lg font-bold text-red-600">
                  {multiDeviceState.aggregatedMetrics.peakUsage.toFixed(1)} kWh
                </p>
              </div>
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <p className="text-xs text-gray-600 mb-1">Off-Peak Usage</p>
                <p className="text-lg font-bold text-green-600">
                  {multiDeviceState.aggregatedMetrics.offPeakUsage.toFixed(1)} kWh
                </p>
              </div>
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <p className="text-xs text-gray-600 mb-1">Efficiency Score</p>
                <p className="text-lg font-bold text-purple-600">
                  {multiDeviceState.aggregatedMetrics.efficiencyScore.toFixed(1)}/10
                </p>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Three Scenarios */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ScenarioA />
        <ScenarioB />
        <ScenarioC />
      </div>

      {/* Comparison Chart */}
      <ComparisonChart />

      {/* Smart Tips */}
      <SmartTips />
    </div>
  );
}
