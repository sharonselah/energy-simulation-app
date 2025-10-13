'use client';

import React, { useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import Card from '@/components/shared/Card';
import Button from '@/components/shared/Button';
import DeviceCatalog from './DeviceCatalog';
import DeviceConfig from './DeviceConfig';
import { Device, SelectedDevice } from '@/lib/types';
import { Plus, Edit2, Trash2, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import { formatCurrency } from '@/lib/calculations';

interface DeviceManagerProps {
  showAddDevice?: boolean;
  onAddComplete?: () => void;
}

export default function DeviceManager({ showAddDevice = false, onAddComplete }: DeviceManagerProps) {
  const {
    devices,
    removeDevice,
    clearAllDevices,
    currentDevice,
    setCurrentDevice,
    completeDeviceConfiguration,
    resetCurrentConfiguration,
    multiDeviceState,
  } = useAppContext();

  const [showCatalog, setShowCatalog] = useState(showAddDevice);
  const [showConfig, setShowConfig] = useState(false);
  const [editingDeviceId, setEditingDeviceId] = useState<string | null>(null);
  const [expandedDeviceId, setExpandedDeviceId] = useState<string | null>(null);

  const handleDeviceSelect = (device: Device) => {
    setCurrentDevice(device);
    setShowCatalog(false);
    setShowConfig(true);
  };

  const handleConfigConfirm = () => {
    if (editingDeviceId) {
      // Update existing device
      // Note: This would need to be implemented in AppContext
      // For now, we'll just complete the configuration for a new device
      setEditingDeviceId(null);
    }
    
    completeDeviceConfiguration();
    setShowConfig(false);
    resetCurrentConfiguration();
    
    if (onAddComplete) {
      onAddComplete();
    }
  };

  const handleEditDevice = (device: SelectedDevice) => {
    setEditingDeviceId(device.id);
    setCurrentDevice(device.device);
    setShowConfig(true);
  };

  const handleRemoveDevice = (deviceId: string) => {
    if (confirm('Are you sure you want to remove this device from your comparison?')) {
      removeDevice(deviceId);
    }
  };

  const handleClearAll = () => {
    if (confirm(`Are you sure you want to remove all ${devices.length} devices from your comparison?`)) {
      clearAllDevices();
    }
  };

  const handleAddAnother = () => {
    setShowCatalog(true);
    setEditingDeviceId(null);
  };

  const handleCancelAdd = () => {
    setShowCatalog(false);
    resetCurrentConfiguration();
  };

  const toggleDeviceExpand = (deviceId: string) => {
    setExpandedDeviceId(expandedDeviceId === deviceId ? null : deviceId);
  };

  const { aggregatedCosts } = multiDeviceState;

  if (showCatalog) {
    return (
      <div className="space-y-6">
        <Card className="shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {devices.length > 0 ? 'Add Another Device' : 'Select Your First Device'}
              </h2>
              {devices.length > 0 && (
                <p className="text-gray-600 mt-1">
                  You currently have {devices.length} device{devices.length !== 1 ? 's' : ''} in your comparison
                </p>
              )}
            </div>
            {devices.length > 0 && (
              <Button variant="outline" onClick={handleCancelAdd}>
                Cancel
              </Button>
            )}
          </div>
        </Card>

        <DeviceCatalog
          onDeviceSelect={handleDeviceSelect}
          selectedDevice={currentDevice}
        />
      </div>
    );
  }

  if (showConfig && currentDevice) {
    return (
      <DeviceConfig
        device={currentDevice}
        onClose={() => {
          setShowConfig(false);
          resetCurrentConfiguration();
          setEditingDeviceId(null);
        }}
        onConfirm={handleConfigConfirm}
      />
    );
  }

  if (devices.length === 0) {
    return (
      <Card className="shadow-xl text-center py-12">
        <div className="max-w-md mx-auto">
          <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Devices Added Yet</h3>
          <p className="text-gray-600 mb-6">
            Start by adding a device to compare costs and see your potential savings.
          </p>
          <Button variant="cta" onClick={handleAddAnother} className="mx-auto">
            <Plus className="w-5 h-5 mr-2" />
            Add Your First Device
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="shadow-xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Your Devices ({devices.length})
            </h2>
            <p className="text-gray-600 mt-1">
              Manage your device comparison and view individual savings
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleClearAll}
              disabled={devices.length === 0}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Clear All
            </Button>
            <Button
              variant="cta"
              onClick={handleAddAnother}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Another Device
            </Button>
          </div>
        </div>

        {/* Device List */}
        <div className="space-y-3">
          {devices.map((selectedDevice, index) => {
            const deviceCostA = aggregatedCosts.scenarioA.byDevice[selectedDevice.id];
            const deviceCostB = aggregatedCosts.scenarioB.byDevice[selectedDevice.id];
            const deviceCostC = aggregatedCosts.scenarioC.byDevice[selectedDevice.id];
            
            const savingsAtoC = deviceCostA && deviceCostC 
              ? deviceCostA.monthly - deviceCostC.monthly 
              : 0;
            
            const savingsBtoC = deviceCostB && deviceCostC 
              ? deviceCostB.monthly - deviceCostC.monthly 
              : 0;

            const isExpanded = expandedDeviceId === selectedDevice.id;

            return (
              <div
                key={selectedDevice.id}
                className="bg-white border border-gray-200 rounded-xl shadow-md hover:shadow-lg transition-shadow"
              >
                {/* Device Summary */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 text-lg">
                            {selectedDevice.device.name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {selectedDevice.device.wattage}W • {selectedDevice.duration}h/day • {selectedDevice.device.category}
                          </p>
                        </div>
                      </div>

                      {/* Alternative Fuel Info */}
                      {selectedDevice.alternativeFuel && (
                        <div className="ml-11 mb-2">
                          <span className="inline-block px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full">
                            Currently using: {selectedDevice.alternativeFuel.type.toUpperCase()}
                          </span>
                        </div>
                      )}

                      {/* Savings Badge */}
                      <div className="ml-11">
                        <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1 rounded-full">
                          <span className="text-sm font-semibold">
                            Saves {formatCurrency(savingsAtoC)}/month
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleDeviceExpand(selectedDevice.id)}
                        aria-label={isExpanded ? 'Collapse details' : 'Expand details'}
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditDevice(selectedDevice)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveDevice(selectedDevice.id)}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-2 border-t border-gray-100">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="bg-red-50 p-3 rounded-lg border border-red-100">
                        <p className="text-xs text-red-700 font-medium mb-1">Scenario A: Current</p>
                        <p className="text-lg font-bold text-red-900">
                          {deviceCostA ? formatCurrency(deviceCostA.monthly) : 'N/A'}
                        </p>
                        <p className="text-xs text-red-600">per month</p>
                      </div>
                      
                      <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100">
                        <p className="text-xs text-yellow-700 font-medium mb-1">Scenario B: Electric</p>
                        <p className="text-lg font-bold text-yellow-900">
                          {deviceCostB ? formatCurrency(deviceCostB.monthly) : 'N/A'}
                        </p>
                        <p className="text-xs text-yellow-600">per month</p>
                      </div>
                      
                      <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                        <p className="text-xs text-green-700 font-medium mb-1">Scenario C: Optimized</p>
                        <p className="text-lg font-bold text-green-900">
                          {deviceCostC ? formatCurrency(deviceCostC.monthly) : 'N/A'}
                        </p>
                        <p className="text-xs text-green-600">per month</p>
                      </div>
                    </div>

                    {savingsBtoC > 0 && (
                      <div className="mt-3 bg-blue-50 p-3 rounded-lg border border-blue-100">
                        <p className="text-sm text-blue-900">
                          💡 <strong>Optimization Tip:</strong> By shifting usage to off-peak hours, 
                          you can save an additional <strong>{formatCurrency(savingsBtoC)}/month</strong> on this device.
                        </p>
                      </div>
                    )}

                    {/* Time blocks summary */}
                    <div className="mt-3">
                      <p className="text-xs text-gray-600 mb-2">Usage Hours:</p>
                      <div className="flex flex-wrap gap-1">
                        {selectedDevice.timeBlocks
                          .filter(block => block.isSelected)
                          .map(block => (
                            <span
                              key={block.hour}
                              className={`
                                inline-block px-2 py-1 text-xs font-medium rounded
                                ${block.rateType === 'peak' ? 'bg-red-100 text-red-800' : 
                                  block.rateType === 'midpeak' ? 'bg-yellow-100 text-yellow-800' : 
                                  'bg-green-100 text-green-800'}
                              `}
                            >
                              {block.hour}:00
                            </span>
                          ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Summary Footer */}
        {devices.length > 0 && (
          <div className="pt-4 border-t border-gray-200">
            <div className="bg-gradient-to-r from-primary/5 to-blue-50 p-4 rounded-xl">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Combined Savings</p>
                  <p className="text-2xl font-bold text-primary">
                    {formatCurrency(
                      aggregatedCosts.scenarioA.total.monthly - aggregatedCosts.scenarioC.total.monthly
                    )}
                    <span className="text-sm font-normal text-gray-600"> per month</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 mb-1">Annual Projection</p>
                  <p className="text-2xl font-bold text-green-700">
                    {formatCurrency(
                      aggregatedCosts.scenarioA.total.annual - aggregatedCosts.scenarioC.total.annual
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

