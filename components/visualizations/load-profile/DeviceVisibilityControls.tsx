'use client';

import React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { DEVICE_COLORS } from './constants';
import { DeviceVisibilityControlsProps } from './types';

export const DeviceVisibilityControls: React.FC<DeviceVisibilityControlsProps> = ({
  devices,
  isMultiDevice,
  isDeviceVisible,
  onToggleDevice,
}) => {
  if (!isMultiDevice) {
    return null;
  }

  return (
    <div className="mt-6">
      <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">
        Device Layers
      </p>
      <div className="flex flex-wrap gap-2">
        {devices.map((device, index) => {
          const visible = isDeviceVisible(device.id);
          const color =
            DEVICE_COLORS[index % DEVICE_COLORS.length];

          return (
            <button
              key={device.id}
              onClick={() => onToggleDevice(device.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                visible
                  ? 'border-primary/40 bg-primary/5 text-primary'
                  : 'border-gray-200 bg-white text-gray-500'
              }`}
            >
              <span
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{
                  backgroundColor: visible ? color : '#d1d5db',
                }}
              />
              <span className="truncate font-medium">
                {device.device.name}
              </span>
              {visible ? (
                <Eye className="w-4 h-4 flex-shrink-0 text-primary" />
              ) : (
                <EyeOff className="w-4 h-4 flex-shrink-0 text-gray-400" />
              )}
            </button>
          );
        })}
      </div>
      <p className="text-xs text-gray-500 mt-2">
        Tip: Click to show or hide device layers in the chart.
      </p>
    </div>
  );
};
