'use client';

import React from 'react';
import { DEVICE_COLORS } from './constants';
import { LoadProfileTooltipComponentProps } from './types';

export const LoadProfileTooltip: React.FC<LoadProfileTooltipComponentProps> = ({
  active,
  payload,
  devices,
  visibleDeviceIds,
  isMultiDevice,
  viewMode,
}) => {
  if (!active || !payload?.length) {
    return null;
  }

  const data = payload[0].payload;
  const visibleSet = new Set(visibleDeviceIds);

  return (
    <div className="bg-white border border-gray-200 shadow-lg rounded-lg p-3 text-sm max-w-xs">
      <p className="font-semibold text-primary mb-2">{data.time as string}</p>
      <div className="space-y-1">
        {viewMode !== 'optimized' && (
          <>
            <p className="text-xs font-semibold text-gray-700 mt-2">Current Usage:</p>
            {isMultiDevice ? (
              <>
                {devices
                  .filter((device) => visibleSet.has(device.id))
                  .map((device) => {
                    const power = (data[`current_${device.id}`] as number) || 0;
                    if (power === 0) {
                      return null;
                    }
                    const color =
                      DEVICE_COLORS[devices.indexOf(device) % DEVICE_COLORS.length];

                    return (
                      <p key={device.id} className="text-xs text-gray-700 flex items-center gap-2">
                        <span className="w-3 h-3 rounded" style={{ backgroundColor: color }} />
                        <span className="font-medium">
                          {device.device.name} ({device.device.loadProfileType})
                        </span>{' '}
                        {power.toFixed(0)} W
                      </p>
                    );
                  })}
                <p className="text-xs font-bold text-gray-900 pt-1 border-t">
                  Total: {Number(data.currentTotal).toFixed(0)} W (KES{' '}
                  {Number(data.currentCost).toFixed(3)})
                </p>
              </>
            ) : (
              <p className="text-gray-700">
                <span className="font-medium">Power:</span> {Number(data.currentTotal).toFixed(0)} W
                <br />
                <span className="font-medium">Load Type:</span>{' '}
                {devices[0]?.device.loadProfileType}
                <br />
                <span className="font-medium">Cost:</span> KES {Number(data.currentCost).toFixed(3)}
              </p>
            )}
          </>
        )}

        {viewMode !== 'current' && (
          <>
            <p className="text-xs font-semibold text-green-700 mt-2">Optimized Usage:</p>
            {isMultiDevice ? (
              <>
                {devices
                  .filter((device) => visibleSet.has(device.id))
                  .map((device) => {
                    const power = (data[`optimized_${device.id}`] as number) || 0;
                    if (power === 0) {
                      return null;
                    }
                    const color =
                      DEVICE_COLORS[devices.indexOf(device) % DEVICE_COLORS.length];

                    return (
                      <p key={device.id} className="text-xs text-green-700 flex items-center gap-2">
                        <span className="w-3 h-3 rounded" style={{ backgroundColor: color }} />
                        <span className="font-medium">
                          {device.device.name} ({device.device.loadProfileType})
                        </span>{' '}
                        {power.toFixed(0)} W
                      </p>
                    );
                  })}
                <p className="text-xs font-bold text-green-900 pt-1 border-t">
                  Total: {Number(data.optimizedTotal).toFixed(0)} W (KES{' '}
                  {Number(data.optimizedCost).toFixed(3)})
                </p>
              </>
            ) : (
              <p className="text-green-700">
                <span className="font-medium">Power:</span> {Number(data.optimizedTotal).toFixed(0)} W
                <br />
                <span className="font-medium">Load Type:</span>{' '}
                {devices[0]?.device.loadProfileType}
                <br />
                <span className="font-medium">Cost:</span> KES {Number(data.optimizedCost).toFixed(3)}
              </p>
            )}
          </>
        )}

        <div
          className={`mt-2 pt-2 border-t ${
            data.rateType === 'peak'
              ? 'border-peak'
              : data.rateType === 'midpeak'
              ? 'border-midpeak'
              : 'border-offpeak'
          }`}
        >
          <p
            className={`text-xs font-medium ${
              data.rateType === 'peak'
                ? 'text-peak'
                : data.rateType === 'midpeak'
                ? 'text-midpeak'
                : 'text-offpeak'
            }`}
          >
            {data.rateName as string} Rate: KES {data.rate as number}/kWh
          </p>
        </div>
      </div>
    </div>
  );
};
