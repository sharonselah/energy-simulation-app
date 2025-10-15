'use client';

import React from 'react';
import { Device } from '@/lib/types';
import { DEVICE_CATALOG } from '@/lib/constants';
import {
  ChefHat,
  Microwave,
  Refrigerator,
  Fan,
  Lightbulb,
  Tv,
} from 'lucide-react';

interface DeviceCatalogProps {
  onDeviceSelect: (device: Device) => void;
  selectedDevice?: Device | null;
}

// Map device IDs to icons
const deviceIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  'electric-pressure-cooker': ChefHat,
  'induction-cooker': Microwave,
  'fridge': Refrigerator,
  'fan': Fan,
  'led-bulb': Lightbulb,
  'tv': Tv,
};

// Device category colors
const categoryColors: Record<string, string> = {
  cooking: 'bg-orange-50 border-orange-100 hover:shadow-orange-200',
  heating: 'bg-red-50 border-red-100 hover:shadow-red-200',
  refrigeration: 'bg-blue-50 border-blue-100 hover:shadow-blue-200',
  lighting: 'bg-yellow-50 border-yellow-100 hover:shadow-yellow-200',
  other: 'bg-gray-50 border-gray-100 hover:shadow-gray-200',
};

export default function DeviceCatalog({ onDeviceSelect, selectedDevice }: DeviceCatalogProps) {
  const handleKeyDown = (event: React.KeyboardEvent, device: Device) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onDeviceSelect(device);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center animate-fadeInDown">
        <h2 className="text-2xl md:text-3xl font-bold text-primary mb-2">
          Select an Appliance
        </h2>
        <p className="text-gray-600 text-sm md:text-base">
          Choose a device to see cost savings and environmental impact
        </p>
      </div>

      {/* Device Grid */}
      <div 
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 xl:grid-cols-6 gap-4"
        role="group"
        aria-label="Appliance selection"
      >
        {DEVICE_CATALOG.map((device, index) => {
          const Icon = deviceIcons[device.id] || ChefHat;
          const isSelected = selectedDevice?.id === device.id;
          const baseColor = categoryColors[device.category] || categoryColors.other;

          return (
            <button
              key={device.id}
              onClick={() => onDeviceSelect(device)}
              onKeyDown={(e) => handleKeyDown(e, device)}
              aria-label={`Select ${device.name}, ${device.category}`}
              aria-pressed={isSelected}
              className={`
                ${baseColor}
                ${isSelected ? 'ring-4 ring-primary ring-opacity-30 border-primary shadow-xl scale-105' : 'shadow-md'}
                p-4 rounded-xl border 
                transition-all duration-300 ease-in-out
                hover:shadow-xl hover:scale-105 
                focus:outline-none focus-visible:ring-4 focus-visible:ring-cta/50
                cursor-pointer
                flex flex-col items-center text-center
                stagger-item
                relative
              `}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {/* Icon */}
              <div className={`
                ${isSelected ? 'bg-primary text-white shadow-lg' : 'bg-white text-primary shadow-md'}
                p-3 rounded-xl mb-3 transition-all duration-300
              `}>
                <Icon className="w-8 h-8" aria-hidden="true" />
              </div>

              {/* Device Name */}
              <h3 className="font-semibold text-gray-900 mb-1 text-sm md:text-base">
                {device.name}
              </h3>

              {/* Specs */}
              {device.typicalUsageHours && (
                <div className="text-xs text-gray-600 space-y-1">
                  <p>~{device.typicalUsageHours}h/day</p>
                </div>
              )}

              {/* Category Badge */}
              <div className="mt-2">
                <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-white text-gray-700 capitalize shadow-sm">
                  {device.category}
                </span>
              </div>

              {/* Selected indicator */}
              {isSelected && (
                <div className="absolute top-2 right-2 bg-primary text-white rounded-full p-1 shadow-lg animate-scaleIn">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Category Legend */}
      <div 
        className="flex flex-wrap justify-center gap-3 text-sm animate-fadeIn"
        role="list"
        aria-label="Device categories"
      >
        <div className="flex items-center gap-2" role="listitem">
          <div className="w-4 h-4 rounded bg-orange-200" aria-hidden="true"></div>
          <span className="text-gray-600">Cooking</span>
        </div>
        <div className="flex items-center gap-2" role="listitem">
          <div className="w-4 h-4 rounded bg-red-200" aria-hidden="true"></div>
          <span className="text-gray-600">Heating</span>
        </div>
        <div className="flex items-center gap-2" role="listitem">
          <div className="w-4 h-4 rounded bg-blue-200" aria-hidden="true"></div>
          <span className="text-gray-600">Refrigeration</span>
        </div>
        <div className="flex items-center gap-2" role="listitem">
          <div className="w-4 h-4 rounded bg-yellow-200" aria-hidden="true"></div>
          <span className="text-gray-600">Lighting</span>
        </div>
        <div className="flex items-center gap-2" role="listitem">
          <div className="w-4 h-4 rounded bg-gray-200" aria-hidden="true"></div>
          <span className="text-gray-600">Other</span>
        </div>
      </div>
    </div>
  );
}

