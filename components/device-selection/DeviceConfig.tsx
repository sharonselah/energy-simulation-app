'use client';

import { useState, useEffect } from 'react';
import { Device, AlternativeFuel } from '@/lib/types';
import { ALTERNATIVE_FUELS, FUEL_DAILY_CONSUMPTION } from '@/lib/constants';
import Button from '@/components/shared/Button';
import { X, Info, Clock, Flame, UtensilsCrossed } from 'lucide-react';

interface DeviceConfigProps {
  device: Device;
  onClose: () => void;
  onConfirm: (config: {
    duration: number;
    mealsPerDay?: number;
    alternativeFuel?: AlternativeFuel;
  }) => void;
}

export default function DeviceConfig({ device, onClose, onConfirm }: DeviceConfigProps) {
  const [duration, setDuration] = useState<number>(device.typicalUsageHours || 1);
  const [mealsPerDay, setMealsPerDay] = useState<number>(2);
  const [selectedFuelType, setSelectedFuelType] = useState<string>('charcoal');

  const isCookingDevice = device.requiresAlternativeFuel;
  const isAlwaysOn = device.id === 'fridge';

  useEffect(() => {
    if (isAlwaysOn) {
      setDuration(24);
    }
  }, [isAlwaysOn]);

  const handleConfirm = () => {
    const config: {
      duration: number;
      mealsPerDay?: number;
      alternativeFuel?: AlternativeFuel;
    } = { duration };

    if (isCookingDevice) {
      config.mealsPerDay = mealsPerDay;
      
      const fuelData = ALTERNATIVE_FUELS[selectedFuelType];
      config.alternativeFuel = {
        ...fuelData,
        dailyConsumption: FUEL_DAILY_CONSUMPTION[selectedFuelType],
      } as AlternativeFuel;
    }

    onConfirm(config);
  };

  const durationOptions = [0.5, 1, 1.5, 2, 2.5, 3, 4, 5, 6, 8];
  const mealsOptions = [1, 2, 3, 4];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-100">
        {/* Header */}
        <div className="bg-primary text-white p-6 rounded-t-2xl flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold mb-2">Configure {device.name}</h2>
            <p className="text-blue-100 text-sm">
              {device.wattage}W • {device.category}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-blue-200 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Always-On Device Notice */}
          {isAlwaysOn && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl shadow-sm p-4 flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-blue-900 mb-1">24/7 Operation</h4>
                <p className="text-sm text-blue-700">
                  This device runs continuously and cannot be scheduled. It will consume power 24 hours a day.
                </p>
              </div>
            </div>
          )}

          {/* Usage Duration */}
          {!isAlwaysOn && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                <label className="font-semibold text-gray-900">
                  Usage Duration per Day
                </label>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {durationOptions.map((hours) => (
                  <button
                    key={hours}
                    onClick={() => setDuration(hours)}
                    className={`
                      py-3 px-2 rounded-xl border font-semibold transition-all text-sm
                      ${
                        duration === hours
                          ? 'bg-primary text-white border-primary shadow-md'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-primary hover:shadow-md'
                      }
                    `}
                  >
                    {hours}h
                  </button>
                ))}
              </div>
              <p className="text-sm text-gray-600">
                Selected: <strong>{duration} hours per day</strong>
              </p>
            </div>
          )}

          {/* Cooking Device: Meals Per Day */}
          {isCookingDevice && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <UtensilsCrossed className="w-5 h-5 text-primary" />
                <label className="font-semibold text-gray-900">
                  Meals Prepared Per Day
                </label>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {mealsOptions.map((meals) => (
                  <button
                    key={meals}
                    onClick={() => setMealsPerDay(meals)}
                    className={`
                      py-3 px-4 rounded-xl border font-semibold transition-all
                      ${
                        mealsPerDay === meals
                          ? 'bg-primary text-white border-primary shadow-md'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-primary hover:shadow-md'
                      }
                    `}
                  >
                    {meals} meal{meals > 1 ? 's' : ''}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Alternative Fuel Selection */}
          {isCookingDevice && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-primary" />
                <label className="font-semibold text-gray-900">
                  Current Cooking Fuel
                </label>
              </div>
              <p className="text-sm text-gray-600">
                Select what you currently use for cooking (for cost comparison)
              </p>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(ALTERNATIVE_FUELS).map(([key, fuel]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedFuelType(key)}
                    className={`
                      p-4 rounded-xl border transition-all text-left
                      ${
                        selectedFuelType === key
                          ? 'bg-primary text-white border-primary shadow-lg'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-primary hover:shadow-md'
                      }
                    `}
                  >
                    <div className="font-semibold capitalize mb-1">{key}</div>
                    <div className={`text-sm ${selectedFuelType === key ? 'text-blue-100' : 'text-gray-600'}`}>
                      KES {fuel.costPerUnit}/{fuel.unit}
                    </div>
                    <div className={`text-xs mt-1 ${selectedFuelType === key ? 'text-blue-100' : 'text-gray-500'}`}>
                      ~{FUEL_DAILY_CONSUMPTION[key]} {fuel.unit}/day
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Summary */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 shadow-sm">
            <h4 className="font-semibold text-gray-900 mb-3">Configuration Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Device:</span>
                <span className="font-medium text-gray-900">{device.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Power:</span>
                <span className="font-medium text-gray-900">{device.wattage}W</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Usage per day:</span>
                <span className="font-medium text-gray-900">{duration} hours</span>
              </div>
              {isCookingDevice && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Meals per day:</span>
                    <span className="font-medium text-gray-900">{mealsPerDay}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Current fuel:</span>
                    <span className="font-medium text-gray-900 capitalize">{selectedFuelType}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="cta"
              onClick={handleConfirm}
              className="flex-1"
            >
              Continue to Time Selection →
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

