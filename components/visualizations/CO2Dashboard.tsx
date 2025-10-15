'use client';

import React from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { calculateEmissionData, calculateTotalKWh } from '@/lib/calculations';
import { Leaf, TrendingDown, TrendingUp, AlertCircle } from 'lucide-react';
import Card from '@/components/shared/Card';
import TreesEquivalent from './TreesEquivalent';
import EmissionsChart from './EmissionsChart';

export default function CO2Dashboard() {
  const { 
    currentDevice: selectedDevice, 
    currentDuration: duration, 
    currentAlternativeFuel: alternativeFuel,
    devices 
  } = useAppContext();

  // Use single device from array if available, otherwise fall back to currentDevice
  const activeDevice = devices.length === 1 ? devices[0] : null;
  const displayDevice = activeDevice?.device || selectedDevice;
  const displayDuration = activeDevice?.duration || duration;
  const displayAlternativeFuel = activeDevice?.alternativeFuel || alternativeFuel;

  // Don't render if no device is selected
  if (!displayDevice) {
    return null;
  }

  // Calculate emissions
  const dailyKWh = calculateTotalKWh(displayDevice, displayDuration);
  const emissionData = calculateEmissionData(dailyKWh, displayAlternativeFuel || undefined);

  const isSavingEmissions = emissionData.saved > 0;
  const isNeutral = Math.abs(emissionData.saved) < 0.1;

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-green-50 rounded-xl">
          <Leaf className="w-6 h-6 text-green-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Environmental Impact</h2>
          <p className="text-gray-600">
            Understand how your energy choices affect the environment
          </p>
        </div>
      </div>

      {/* Main Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Current Monthly Emissions */}
        <Card className="p-6">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600">
              Monthly Emissions (Electric)
            </p>
            <p className="text-3xl font-bold text-primary">
              {emissionData.current.toFixed(1)}
              <span className="text-lg font-normal text-gray-600 ml-2">kg CO₂</span>
            </p>
            <p className="text-xs text-gray-500">
              Using {displayDevice.name}
            </p>
          </div>
        </Card>

        {/* Baseline Emissions */}
        <Card className="p-6">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600">
              {displayAlternativeFuel ? 'Baseline (Alternative Fuel)' : 'Baseline (Grid Electricity)'}
            </p>
            <p className="text-3xl font-bold text-gray-900">
              {emissionData.baseline.toFixed(1)}
              <span className="text-lg font-normal text-gray-600 ml-2">kg CO₂</span>
            </p>
            <p className="text-xs text-gray-500">
              {displayAlternativeFuel ? `Using ${displayAlternativeFuel.type}` : 'Current usage'}
            </p>
          </div>
        </Card>

        {/* Net Emissions Change */}
        <Card className={`p-6 ${
          isSavingEmissions 
            ? 'bg-green-50 border-green-200' 
            : isNeutral 
            ? 'bg-gray-50 border-gray-200'
            : 'bg-orange-50 border-orange-200'
        }`}>
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600 flex items-center gap-2">
              Net Change
              {isSavingEmissions ? (
                <TrendingDown className="w-4 h-4 text-green-600" />
              ) : isNeutral ? (
                <AlertCircle className="w-4 h-4 text-gray-600" />
              ) : (
                <TrendingUp className="w-4 h-4 text-orange-600" />
              )}
            </p>
            <p className={`text-3xl font-bold ${
              isSavingEmissions 
                ? 'text-green-600' 
                : isNeutral 
                ? 'text-gray-600'
                : 'text-orange-600'
            }`}>
              {isSavingEmissions ? '-' : isNeutral ? '±' : '+'}
              {Math.abs(emissionData.saved).toFixed(1)}
              <span className="text-lg font-normal ml-2">kg CO₂/mo</span>
            </p>
            <p className="text-xs font-medium">
              {isSavingEmissions && (
                <span className="text-green-700">
                  ✓ Reducing emissions
                </span>
              )}
              {isNeutral && (
                <span className="text-gray-700">
                  Similar emissions
                </span>
              )}
              {!isSavingEmissions && !isNeutral && (
                <span className="text-orange-700">
                  ⚠ Higher emissions
                </span>
              )}
            </p>
          </div>
        </Card>
      </div>

      {/* Educational Context Banner */}
      {alternativeFuel && (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <AlertCircle className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 mb-1">
                Understanding Your Impact
              </h3>
              <p className="text-sm text-blue-800">
                {isSavingEmissions ? (
                  <>
                    Switching to electric cooking powered by Kenya&apos;s grid (which includes 
                    hydro and geothermal energy) significantly reduces CO₂ emissions 
                    compared to {alternativeFuel.type}. This helps combat climate change 
                    and improves air quality in your home.
                  </>
                ) : (
                  <>
                    While electric cooking may show higher CO₂ emissions in this comparison, 
                    Kenya&apos;s grid is becoming cleaner with more renewable energy. Electric 
                    cooking also eliminates indoor air pollution and provides better 
                    temperature control.
                  </>
                )}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Trees Equivalent Section */}
      {isSavingEmissions && (
        <TreesEquivalent treesEquivalent={emissionData.treesEquivalent} />
      )}

      {/* Emissions Comparison Chart */}
      <EmissionsChart emissionData={emissionData} alternativeFuel={alternativeFuel} />
    </div>
  );
}

