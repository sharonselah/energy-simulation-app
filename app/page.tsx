'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/shared/Card';
import Button from '@/components/shared/Button';
import DeviceCatalog from '@/components/device-selection/DeviceCatalog';
import DeviceConfig from '@/components/device-selection/DeviceConfig';
import TimeBlockSelector from '@/components/tou-optimizer/TimeBlockSelector';
import SkeletonLoader from '@/components/shared/SkeletonLoader';
import { AppProvider, useAppContext } from '@/contexts/AppContext';
import { Device, AlternativeFuel } from '@/lib/types';
import { RotateCcw, CheckCircle, ArrowLeft } from 'lucide-react';

// Lazy load heavy visualization components
const CostComparison = dynamic(() => import('@/components/cost-comparison/CostComparison'), {
  loading: () => <SkeletonLoader variant="card" className="h-96" />,
  ssr: false,
});

const LoadProfile = dynamic(() => import('@/components/visualizations/LoadProfile'), {
  loading: () => <SkeletonLoader variant="chart" />,
  ssr: false,
});

const CO2Dashboard = dynamic(() => import('@/components/visualizations/CO2Dashboard'), {
  loading: () => <SkeletonLoader variant="card" className="h-64" />,
  ssr: false,
});

// Uncomment when Grid Metrics Dashboard is enabled
// const GridMetricsDashboard = dynamic(() => import('@/components/visualizations/GridMetricsDashboard'), {
//   loading: () => <SkeletonLoader variant="card" className="h-96" />,
//   ssr: false,
// });

function HomeContent() {
  const {
    currentDevice: selectedDevice,
    setCurrentDevice: setSelectedDevice,
    currentTimeBlocks: timeBlocks,
    toggleCurrentTimeBlock: toggleTimeBlock,
    setCurrentTimeBlocks: setTimeBlocks,
    currentDuration: duration,
    setCurrentDuration: setDuration,
    setCurrentAlternativeFuel: setAlternativeFuel,
    setCurrentMealsPerDay: setMealsPerDay,
    completeDeviceConfiguration,
    resetAll,
    devices,
  } = useAppContext();

  const [showConfig, setShowConfig] = useState(false);
  const [configCompleted, setConfigCompleted] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);

  // For display in configuration, use selectedDevice
  const displayDevice = selectedDevice;

  // Step management
  const currentStep = !displayDevice ? 1 : !configCompleted ? 2 : 3;

  const handleDeviceSelect = (device: Device) => {
    setSelectedDevice(device);
    setShowConfig(true);
    setConfigCompleted(false);
  };

  const handleConfigConfirm = (config: {
    duration: number;
    mealsPerDay?: number;
    alternativeFuel?: AlternativeFuel;
  }) => {
    setDuration(config.duration);
    if (config.mealsPerDay) setMealsPerDay(config.mealsPerDay);
    if (config.alternativeFuel) setAlternativeFuel(config.alternativeFuel);
    setShowConfig(false);
    setConfigCompleted(true);
  };

  const handleBulkSelect = (hours: number[]) => {
    const newBlocks = timeBlocks.map((block) => ({
      ...block,
      isSelected: hours.includes(block.hour),
    }));
    setTimeBlocks(newBlocks);
  };

  const handleReset = () => {
    resetAll();
    setConfigCompleted(false);
    setShowAnalysis(false);
  };

  const handleChangeDevice = () => {
    setSelectedDevice(null);
    setConfigCompleted(false);
    setShowAnalysis(false);
  };

  const handleViewAnalysis = () => {
    // Add the current device to the devices array before showing analysis
    if (selectedDevice && configCompleted) {
      // Complete the configuration and add to devices array
      // This adds the device to the multi-device array for aggregated analysis
      completeDeviceConfiguration();
    }
    // Show analysis view which displays aggregated data for ALL devices
    setShowAnalysis(true);
  };

  const handleBackToConfig = () => {
    setShowAnalysis(false);
  };

  const handleAddAnotherDevice = () => {
    // Keep existing devices, reset to add a new one
    setSelectedDevice(null);
    setConfigCompleted(false);
    setShowAnalysis(false);
    // Don't call resetAll() - we want to keep the devices array intact
  };

  const selectedCount = timeBlocks.filter((b) => b.isSelected).length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Progress Steps */}
        <Card className="bg-gradient-to-r from-primary to-blue-700 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">Energy Simulation Game</h1>
              <p className="text-blue-100">
                Discover savings and environmental impact of electric appliances
              </p>
            </div>
            {(displayDevice || devices.length > 0) && (
              <Button
                variant="outline"
                onClick={handleReset}
                className="text-white border-white hover:bg-white hover:text-primary"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Start Over
              </Button>
            )}
          </div>

          {/* Step Indicators */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className={`flex items-center gap-3 ${currentStep >= 1 ? 'opacity-100' : 'opacity-50'}`}>
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-lg
                ${currentStep > 1 ? 'bg-green-500' : currentStep === 1 ? 'bg-cta text-primary' : 'bg-white bg-opacity-30'}
              `}>
                {currentStep > 1 ? '✓' : '1'}
              </div>
              <div>
                <div className="font-semibold">Select Device</div>
                <div className="text-xs text-blue-100">Choose an appliance</div>
              </div>
            </div>

            <div className={`flex items-center gap-3 ${currentStep >= 2 ? 'opacity-100' : 'opacity-50'}`}>
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-lg
                ${currentStep > 2 ? 'bg-green-500' : currentStep === 2 ? 'bg-cta text-primary' : 'bg-white bg-opacity-30'}
              `}>
                {currentStep > 2 ? '✓' : '2'}
              </div>
              <div>
                <div className="font-semibold">Configure</div>
                <div className="text-xs text-blue-100">Set usage details</div>
              </div>
            </div>

            <div className={`flex items-center gap-3 ${currentStep >= 3 ? 'opacity-100' : 'opacity-50'}`}>
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-lg
                ${currentStep === 3 ? 'bg-cta text-primary' : 'bg-white bg-opacity-30'}
              `}>
                3
              </div>
              <div>
                <div className="font-semibold">Select Times</div>
                <div className="text-xs text-blue-100">Choose usage hours</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Step 1: Device Selection */}
        {!displayDevice && !showAnalysis && (
          <>
            {/* Show existing devices when adding another */}
            {devices.length > 0 && (
              <Card className="bg-blue-50 border border-blue-200 shadow-lg">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      Your Current Selection ({devices.length} device{devices.length !== 1 ? 's' : ''})
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {devices.map((d) => (
                        <div
                          key={d.id}
                          className="bg-white px-3 py-2 rounded-lg border border-blue-300 text-sm"
                        >
                          <span className="font-semibold">{d.device.name}</span>
                          <span className="text-gray-600 ml-2">
                            ({d.device.wattage}W)
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setShowAnalysis(true)}
                    className="text-blue-700 border-blue-700 hover:bg-blue-700 hover:text-white"
                  >
                    Back to Analysis
                  </Button>
                </div>
              </Card>
            )}
            
            <DeviceCatalog
              onDeviceSelect={handleDeviceSelect}
              selectedDevice={selectedDevice}
            />
          </>
        )}

        {/* Device Config Modal */}
        {showConfig && selectedDevice && (
          <DeviceConfig
            device={selectedDevice}
            onClose={() => setShowConfig(false)}
            onConfirm={handleConfigConfirm}
          />
        )}

        {/* Step 2 & 3: Selected Device Info + Time Selection */}
        {displayDevice && configCompleted && !showAnalysis && (
          <>
            {/* Selected Device Summary */}
            <Card className="shadow-xl">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="bg-primary text-white p-4 rounded-xl shadow-lg">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{displayDevice.name}</h3>
                    <p className="text-gray-600">
                      {displayDevice.wattage}W • {duration}h per day • {displayDevice.category}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowConfig(true)}
                  >
                    Edit Config
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleChangeDevice}
                  >
                    Change Device
                  </Button>
                </div>
              </div>
            </Card>

            {/* Time Block Selector */}
            <TimeBlockSelector
              timeBlocks={timeBlocks}
              onToggleBlock={toggleTimeBlock}
              onBulkSelect={handleBulkSelect}
              duration={duration}
              deviceName={displayDevice.name}
            />

            {/* Next Steps */}
            {selectedCount > 0 && (
              <Card className="bg-green-50 border border-green-100 shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <div>
                      <h4 className="font-semibold text-green-900">Ready for Analysis!</h4>
                      <p className="text-sm text-green-700">
                        You&apos;ve selected {selectedCount} hour{selectedCount !== 1 ? 's' : ''} for your {displayDevice.name}
                      </p>
                    </div>
                  </div>
                  <Button variant="cta" onClick={handleViewAnalysis}>
                    View Cost Analysis →
                  </Button>
                </div>
              </Card>
            )}
          </>
        )}

        {/* Cost Comparison Analysis - Shows ALL devices aggregated */}
        {showAnalysis && devices.length > 0 && (
          <>
            {/* Device Summary Header */}
            <Card className="shadow-xl">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="bg-primary text-white p-4 rounded-xl shadow-lg">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {devices.length === 1 ? devices[0].device.name : `${devices.length} Devices`}
                    </h3>
                    <p className="text-gray-600">
                      {devices.length === 1 
                        ? `${devices[0].device.wattage}W • ${devices[0].duration}h per day • ${devices[0].timeBlocks.filter(b => b.isSelected).length} hour${devices[0].timeBlocks.filter(b => b.isSelected).length !== 1 ? 's' : ''} selected`
                        : `Analyzing ${devices.length} devices`
                      }
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Button
                    variant="cta"
                    onClick={handleAddAnotherDevice}
                  >
                    + Add Another Device
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleBackToConfig}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Configuration
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleChangeDevice}
                  >
                    Change Device
                  </Button>
                </div>
              </div>
            </Card>

            {/* Cost Comparison Component */}
            <CostComparison />

            {/* Load Profile Visualization */}
            <LoadProfile showComparison={true} />

            {/* CO2 Impact Dashboard */}
            <CO2Dashboard />

            {/* Grid Metrics Dashboard - Phase 6 */}
          {/*  <GridMetricsDashboard showComparison={true} />*/} 
          </>
        )}

        {/* Information Section (only show on initial landing page) */}
        {!displayDevice && devices.length === 0 && !showAnalysis && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card title="Compare Costs" subtitle="See the difference">
                <p className="text-gray-600">
                  Compare your current fuel costs with electric appliances across three scenarios: current fuel, electric with current usage, and optimized TOU usage.
                </p>
              </Card>

              <Card title="Environmental Impact" subtitle="Track your carbon footprint">
                <p className="text-gray-600">
                  Understand the environmental impact of your energy choices and see how many trees your savings equivalent to planting.
                </p>
              </Card>

              <Card title="Grid Optimization" subtitle="Help stabilize the grid">
                <p className="text-gray-600">
                  Learn how shifting your usage to off-peak hours can reduce grid stress and improve overall energy efficiency in Kenya.
                </p>
              </Card>
            </div>

            {/* About TOU Tariffs */}
            <Card title="Understanding Time of Use (TOU) Tariffs">
              <div className="space-y-4">
                <p className="text-gray-600">
                  Kenya Power uses Time of Use tariffs to encourage energy consumption during off-peak hours. Here&apos;s how it works:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-offpeak/10 p-4 rounded-xl border border-offpeak/30 shadow-md">
                    <h4 className="font-semibold text-offpeak mb-2">Off-Peak (KES 8/kWh)</h4>
                    <p className="text-sm text-gray-600">10:00 PM - 6:00 AM</p>
                    <p className="text-xs text-gray-500 mt-2">Lowest rates, best savings</p>
                  </div>
                  <div className="bg-midpeak/10 p-4 rounded-xl border border-midpeak/30 shadow-md">
                    <h4 className="font-semibold text-midpeak mb-2">Mid-Peak (KES 12/kWh)</h4>
                    <p className="text-sm text-gray-600">6:00 AM - 6:00 PM</p>
                    <p className="text-xs text-gray-500 mt-2">Moderate rates</p>
                  </div>
                  <div className="bg-peak/10 p-4 rounded-xl border border-peak/30 shadow-md">
                    <h4 className="font-semibold text-peak mb-2">Peak (KES 20/kWh)</h4>
                    <p className="text-sm text-gray-600">6:00 PM - 10:00 PM</p>
                    <p className="text-xs text-gray-500 mt-2">Highest rates, avoid if possible</p>
                  </div>
                </div>
              </div>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

export default function Home() {
  return (
    <AppProvider>
      <HomeContent />
    </AppProvider>
  );
}
