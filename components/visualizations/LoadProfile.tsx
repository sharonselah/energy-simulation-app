'use client';

import React, { useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
  Legend,
} from 'recharts';
import { useAppContext } from '@/contexts/AppContext';
import { TOU_TARIFFS, TOU_TIME_BANDS } from '@/lib/constants';
import { Zap, TrendingDown, Eye, EyeOff } from 'lucide-react';
import Card from '@/components/shared/Card';

interface LoadProfileProps {
  showComparison?: boolean;
}

type ViewMode = 'current' | 'optimized' | 'comparison';

// Color palette for devices (up to 10 devices)
const DEVICE_COLORS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
  '#14b8a6', // teal
  '#6366f1', // indigo
];

// Time slot interval in minutes (30 minutes = 48 slots per day)
const TIME_INTERVAL = 30;
const RAMP_PERIOD = 15; // minutes for smooth transitions

// Helper: Convert time string "HH:MM" to minutes since midnight
const timeToMinutes = (timeStr: string): number => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

// Helper: Convert minutes to time string "HH:MM"
const minutesToTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60) % 24;
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

// Helper: Generate all time slots for 24 hours
const generateTimeSlots = (): string[] => {
  const slots: string[] = [];
  for (let minutes = 0; minutes < 24 * 60; minutes += TIME_INTERVAL) {
    slots.push(minutesToTime(minutes));
  }
  return slots;
};

// Helper: Calculate power at a specific time with smooth ramping
const calculatePowerAtTime = (
  timeMinutes: number,
  startMinutes: number,
  endMinutes: number,
  devicePower: number
): number => {
  // Handle wrap-around (e.g., 22:00 to 02:00)
  let adjustedTime = timeMinutes;
  let adjustedEnd = endMinutes;
  
  if (endMinutes < startMinutes) {
    // Crosses midnight
    if (timeMinutes < startMinutes && timeMinutes < endMinutes) {
      adjustedTime = timeMinutes + 24 * 60;
    }
    adjustedEnd = endMinutes + 24 * 60;
  }

  // Before device starts
  if (adjustedTime < startMinutes - RAMP_PERIOD) {
    return 0;
  }
  
  // Ramp up period
  if (adjustedTime >= startMinutes - RAMP_PERIOD && adjustedTime < startMinutes) {
    const rampProgress = (adjustedTime - (startMinutes - RAMP_PERIOD)) / RAMP_PERIOD;
    return devicePower * rampProgress;
  }
  
  // Full power period
  if (adjustedTime >= startMinutes && adjustedTime < adjustedEnd) {
    return devicePower;
  }
  
  // Ramp down period
  if (adjustedTime >= adjustedEnd && adjustedTime < adjustedEnd + RAMP_PERIOD) {
    const rampProgress = (adjustedTime - adjustedEnd) / RAMP_PERIOD;
    return devicePower * (1 - rampProgress);
  }
  
  // After device ends
  return 0;
};

export default function LoadProfile({ showComparison = true }: LoadProfileProps) {
  const { devices } = useAppContext();
  const [viewMode, setViewMode] = useState<ViewMode>('comparison');
  const [visibleDevices, setVisibleDevices] = useState<Set<string>>(
    new Set(devices.map(d => d.id))
  );

  // Check if we have multi-device data
  const isMultiDevice = devices.length > 1;
  const hasDevices = devices.length > 0;

  // Toggle device visibility
  const toggleDeviceVisibility = (deviceId: string) => {
    setVisibleDevices(prev => {
      const newSet = new Set(prev);
      if (newSet.has(deviceId)) {
        newSet.delete(deviceId);
      } else {
        newSet.add(deviceId);
      }
      return newSet;
    });
  };

  // Prepare chart data with 30-minute intervals
  const chartData = useMemo(() => {
    if (!hasDevices) return [];

    const timeSlots = generateTimeSlots();
    
    return timeSlots.map(timeStr => {
      const timeMinutes = timeToMinutes(timeStr);
      const hour = Math.floor(timeMinutes / 60);
      
      // Determine TOU rate type for this time
      let rateType: 'peak' | 'midpeak' | 'offpeak' = 'offpeak';
      for (const band of TOU_TIME_BANDS) {
        if (hour >= band.start && hour <= band.end) {
          rateType = band.type as 'peak' | 'midpeak' | 'offpeak';
          break;
        }
      }
      
      // Calculate current (user-configured) power
      let currentTotalPower = 0;
      const currentDevicePowers: { [key: string]: number } = {};
      
      devices.forEach(device => {
        if (!visibleDevices.has(device.id)) return;
        
        let devicePower = 0;
        // Sum power from all selected time blocks for this device
        device.timeBlocks.forEach(block => {
          if (block.isSelected) {
            const startMinutes = block.hour * 60;
            const endMinutes = startMinutes + 60; // Each block is 1 hour
            devicePower += calculatePowerAtTime(
              timeMinutes,
              startMinutes,
              endMinutes,
              device.device.wattage
            );
          }
        });
        
        currentDevicePowers[device.id] = devicePower;
        currentTotalPower += devicePower;
      });
      
      // Calculate optimized power (shift to off-peak)
      let optimizedTotalPower = 0;
      const optimizedDevicePowers: { [key: string]: number } = {};
      
      devices.forEach(device => {
        if (!visibleDevices.has(device.id)) return;
        
        let devicePower = 0;
        // For optimized, use off-peak hours (22:00 - 06:00)
        // Simple optimization: if device has selected blocks, shift to off-peak
        const hasSelectedBlocks = device.timeBlocks.some(b => b.isSelected);
        
        if (hasSelectedBlocks && rateType === 'offpeak') {
          // Redistribute usage to off-peak hours
          const selectedBlocksCount = device.timeBlocks.filter(b => b.isSelected).length;
          if (selectedBlocksCount > 0) {
            // Simple approach: spread usage evenly across off-peak hours
            device.timeBlocks.forEach(block => {
              if (block.isSelected) {
                const blockHour = block.hour;
                // If current time is in off-peak and device was active, keep it on
                if ((hour >= 22 || hour < 6) && (blockHour >= 18 && blockHour < 22)) {
                  // Shift evening peak usage to late night
                  const startMinutes = (block.hour * 60) + (4 * 60); // Shift 4 hours later
                  const endMinutes = startMinutes + 60;
                  devicePower += calculatePowerAtTime(
                    timeMinutes,
                    startMinutes % (24 * 60),
                    endMinutes % (24 * 60),
                    device.device.wattage
                  );
                }
              }
            });
          }
        }
        
        optimizedDevicePowers[device.id] = devicePower;
        optimizedTotalPower += devicePower;
      });
      
      // Calculate costs
      const rate = TOU_TARIFFS[rateType];
      const currentCost = (currentTotalPower / 1000) * rate * (TIME_INTERVAL / 60); // Convert to kWh and pro-rate
      const optimizedCost = (optimizedTotalPower / 1000) * rate * (TIME_INTERVAL / 60);
      
      const dataPoint: Record<string, string | number> = {
        time: timeStr,
        timeMinutes,
        hour,
        rateType,
        rateName: rateType === 'peak' ? 'Peak' : rateType === 'midpeak' ? 'Mid-Peak' : 'Off-Peak',
        rate,
        currentTotal: currentTotalPower,
        optimizedTotal: optimizedTotalPower,
        currentCost,
        optimizedCost,
      };
      
      // Add per-device powers
      if (isMultiDevice) {
        devices.forEach(device => {
          if (visibleDevices.has(device.id)) {
            dataPoint[`current_${device.id}`] = currentDevicePowers[device.id] || 0;
            dataPoint[`optimized_${device.id}`] = optimizedDevicePowers[device.id] || 0;
          }
        });
      }
      
      return dataPoint;
    });
  }, [hasDevices, devices, visibleDevices, isMultiDevice]);

  // Calculate savings
  const savings = useMemo(() => {
    const currentTotal = chartData.reduce((sum, d) => sum + (d.currentCost as number), 0);
    const optimizedTotal = chartData.reduce((sum, d) => sum + (d.optimizedCost as number), 0);
    const saved = currentTotal - optimizedTotal;
    const percentage = currentTotal > 0 ? (saved / currentTotal) * 100 : 0;
    return { saved, percentage, currentTotal, optimizedTotal };
  }, [chartData]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: Record<string, string | number> }> }) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;
    
    return (
      <div className="bg-white border border-gray-200 shadow-lg rounded-lg p-3 text-sm max-w-xs">
        <p className="font-semibold text-primary mb-2">{data.time}</p>
        <div className="space-y-1">
          {/* Current loads */}
          {viewMode !== 'optimized' && (
            <>
              <p className="text-xs font-semibold text-gray-700 mt-2">Current Usage:</p>
              {isMultiDevice ? (
                <>
                  {devices.filter(d => visibleDevices.has(d.id)).map((device) => {
                    const power = data[`current_${device.id}`] || 0;
                    if (power === 0) return null;
                    return (
                      <p key={device.id} className="text-xs text-gray-700 flex items-center gap-2">
                        <span 
                          className="w-3 h-3 rounded"
                          style={{ backgroundColor: DEVICE_COLORS[devices.indexOf(device) % DEVICE_COLORS.length] }}
                        ></span>
                        <span className="font-medium">{device.device.name}:</span> {(power as number).toFixed(0)} W
                      </p>
                    );
                  })}
                  <p className="text-xs font-bold text-gray-900 pt-1 border-t">
                    Total: {(data.currentTotal as number).toFixed(0)} W (KES {(data.currentCost as number).toFixed(3)})
                  </p>
                </>
              ) : (
                <p className="text-gray-700">
                  <span className="font-medium">Power:</span> {(data.currentTotal as number).toFixed(0)} W
                  <br />
                  <span className="font-medium">Cost:</span> KES {(data.currentCost as number).toFixed(3)}
                </p>
              )}
            </>
          )}

          {/* Optimized loads */}
          {viewMode !== 'current' && (
            <>
              <p className="text-xs font-semibold text-green-700 mt-2">Optimized Usage:</p>
              {isMultiDevice ? (
                <>
                  {devices.filter(d => visibleDevices.has(d.id)).map((device) => {
                    const power = data[`optimized_${device.id}`] || 0;
                    if (power === 0) return null;
                    return (
                      <p key={device.id} className="text-xs text-green-700 flex items-center gap-2">
                        <span 
                          className="w-3 h-3 rounded"
                          style={{ backgroundColor: DEVICE_COLORS[devices.indexOf(device) % DEVICE_COLORS.length] }}
                        ></span>
                        <span className="font-medium">{device.device.name}:</span> {(power as number).toFixed(0)} W
                      </p>
                    );
                  })}
                  <p className="text-xs font-bold text-green-900 pt-1 border-t">
                    Total: {(data.optimizedTotal as number).toFixed(0)} W (KES {(data.optimizedCost as number).toFixed(3)})
                  </p>
                </>
              ) : (
                <p className="text-green-700">
                  <span className="font-medium">Power:</span> {(data.optimizedTotal as number).toFixed(0)} W
                  <br />
                  <span className="font-medium">Cost:</span> KES {(data.optimizedCost as number).toFixed(3)}
                </p>
              )}
            </>
          )}

          <div className={`mt-2 pt-2 border-t ${
            data.rateType === 'peak' ? 'border-peak' : 
            data.rateType === 'midpeak' ? 'border-midpeak' : 
            'border-offpeak'
          }`}>
            <p className={`text-xs font-medium ${
              data.rateType === 'peak' ? 'text-peak' : 
              data.rateType === 'midpeak' ? 'text-midpeak' : 
              'text-offpeak'
            }`}>
              {data.rateName} Rate: KES {data.rate}/kWh
            </p>
          </div>
        </div>
      </div>
    );
  };

  if (!hasDevices) {
    return (
      <Card className="p-6 text-center">
        <Zap className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">Add devices to view load profile</p>
      </Card>
    );
  }

  const hasTimeBlocks = devices.some(d => d.timeBlocks.some(b => b.isSelected));

  return (
    <Card className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
          <div>
            <h2 className="text-xl font-semibold text-primary flex items-center gap-2">
              <Zap className="w-5 h-5" />
              24-Hour Load Profile
              {isMultiDevice && <span className="text-sm font-normal text-gray-600">({devices.length} devices)</span>}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {isMultiDevice 
                ? `Combined energy usage from all ${devices.length} devices`
                : `${devices[0]?.device.name} - ${devices[0]?.device.wattage}W`
              }
            </p>
          </div>
          
          {showComparison && (
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('current')}
                className={`px-4 py-2 text-sm rounded-lg font-medium transition-all ${
                  viewMode === 'current'
                    ? 'bg-primary text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Current
              </button>
              <button
                onClick={() => setViewMode('optimized')}
                className={`px-4 py-2 text-sm rounded-lg font-medium transition-all ${
                  viewMode === 'optimized'
                    ? 'bg-green-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Optimized
              </button>
              <button
                onClick={() => setViewMode('comparison')}
                className={`px-4 py-2 text-sm rounded-lg font-medium transition-all ${
                  viewMode === 'comparison'
                    ? 'bg-cta text-primary shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Compare
              </button>
            </div>
          )}
        </div>

        {/* TOU Rate Legend */}
        <div className="flex flex-wrap gap-4 text-sm mb-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-offpeak rounded"></div>
            <span className="text-gray-700">Off-Peak (10pm-6am) - KES {TOU_TARIFFS.offpeak}/kWh</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-midpeak rounded"></div>
            <span className="text-gray-700">Mid-Peak (6am-6pm) - KES {TOU_TARIFFS.midpeak}/kWh</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-peak rounded"></div>
            <span className="text-gray-700">Peak (6pm-10pm) - KES {TOU_TARIFFS.peak}/kWh</span>
          </div>
        </div>

        {/* Device Legend (Multi-device only) */}
        {isMultiDevice && (
          <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200">
            <p className="text-sm font-semibold text-gray-700 mb-3">Device Layers:</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {devices.map((device, idx) => (
                <button
                  key={device.id}
                  onClick={() => toggleDeviceVisibility(device.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                    visibleDevices.has(device.id)
                      ? 'bg-white border-2 border-gray-300 shadow-sm'
                      : 'bg-gray-200 border-2 border-transparent opacity-50'
                  }`}
                >
                  <span 
                    className="w-4 h-4 rounded flex-shrink-0"
                    style={{ backgroundColor: DEVICE_COLORS[idx % DEVICE_COLORS.length] }}
                  ></span>
                  <span className="truncate font-medium">{device.device.name}</span>
                  {visibleDevices.has(device.id) ? (
                    <Eye className="w-4 h-4 flex-shrink-0 text-primary" />
                  ) : (
                    <EyeOff className="w-4 h-4 flex-shrink-0 text-gray-400" />
                  )}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              💡 Click to show/hide device layers in the chart
            </p>
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="h-80 mt-6">
        {!hasTimeBlocks ? (
          <div className="h-full flex items-center justify-center text-gray-500">
            <p>Configure time blocks for devices to see load profile</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart 
              data={chartData} 
              margin={{ top: 10, right: 30, left: 20, bottom: 30 }}
            >
              <defs>
                {/* Gradients for TOU rate backgrounds */}
                <linearGradient id="offpeakGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.1} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="midpeakGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.1} />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="peakGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity={0.1} />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity={0.05} />
                </linearGradient>
                
                {/* Gradients for area fills */}
                <linearGradient id="currentGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#163466" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#163466" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="optimizedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              
              {/* TOU rate background areas */}
              {TOU_TIME_BANDS.map((band) => {
                // Find time slots that correspond to this band
                const startSlot = chartData.find(d => d.hour === band.start);
                const endSlot = chartData.find(d => d.hour === band.end);
                if (!startSlot || !endSlot) return null;
                
                return (
                  <ReferenceArea
                    key={`${band.type}-${band.start}`}
                    x1={startSlot.time as string}
                    x2={endSlot.time as string}
                    fill={`url(#${band.type}Gradient)`}
                    fillOpacity={1}
                  />
                );
              })}

              <XAxis 
                dataKey="time" 
                label={{ value: 'Time of Day', position: 'insideBottom', offset: -10 }}
                tick={{ fontSize: 11 }}
                interval="preserveStartEnd"
                tickFormatter={(value) => {
                  // Show labels every 2 hours (4 time slots)
                  const dataIndex = chartData.findIndex(d => d.time === value);
                  if (dataIndex % 4 === 0) {
                    return value;
                  }
                  return '';
                }}
              />
              <YAxis 
                label={{ value: 'Power (W)', angle: -90, position: 'insideLeft' }}
                tick={{ fontSize: 12 }}
                width={60}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(0, 0, 0, 0.2)', strokeWidth: 1 }} />
              
              {/* Current usage area/line */}
              {viewMode !== 'optimized' && (
                <>
                  {isMultiDevice ? (
                    // Stacked areas for multi-device
                    devices.filter(d => visibleDevices.has(d.id)).map((device) => (
                      <Area
                        key={`current_${device.id}`}
                        type="monotone"
                        dataKey={`current_${device.id}`}
                        stackId="current"
                        stroke={DEVICE_COLORS[devices.indexOf(device) % DEVICE_COLORS.length]}
                        fill={DEVICE_COLORS[devices.indexOf(device) % DEVICE_COLORS.length]}
                        fillOpacity={0.6}
                        strokeWidth={2}
                        name={device.device.name}
                      />
                    ))
                  ) : (
                    // Single area for single device
                    <Area 
                      type="monotone"
                      dataKey="currentTotal" 
                      stroke="#163466"
                      fill="url(#currentGradient)"
                      strokeWidth={3}
                      name="Current Usage"
                    />
                  )}
                </>
              )}
              
              {/* Optimized usage area/line */}
              {viewMode !== 'current' && (
                <>
                  {isMultiDevice ? (
                    // Stacked areas for multi-device
                    devices.filter(d => visibleDevices.has(d.id)).map((device) => (
                      <Area
                        key={`optimized_${device.id}`}
                        type="monotone"
                        dataKey={`optimized_${device.id}`}
                        stackId="optimized"
                        stroke={DEVICE_COLORS[devices.indexOf(device) % DEVICE_COLORS.length]}
                        fill={DEVICE_COLORS[devices.indexOf(device) % DEVICE_COLORS.length]}
                        fillOpacity={viewMode === 'optimized' ? 0.6 : 0.3}
                        strokeWidth={2}
                        strokeDasharray={viewMode === 'comparison' ? '5 5' : '0'}
                        name={`${device.device.name} (Optimized)`}
                      />
                    ))
                  ) : (
                    // Single area for single device
                    <Area 
                      type="monotone"
                      dataKey="optimizedTotal" 
                      stroke="#10b981"
                      fill="url(#optimizedGradient)"
                      strokeWidth={viewMode === 'optimized' ? 3 : 2}
                      strokeDasharray={viewMode === 'comparison' ? '5 5' : '0'}
                      name="Optimized Usage"
                      fillOpacity={viewMode === 'optimized' ? 1 : 0.5}
                    />
                  )}
                </>
              )}

              {viewMode === 'comparison' && !isMultiDevice && <Legend />}
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Savings Info */}
      {showComparison && hasTimeBlocks && savings.saved > 0 && (
        <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <TrendingDown className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-green-900 mb-1">
                Optimization Savings{isMultiDevice ? ' (All Devices)' : ''}
              </h3>
              <p className="text-sm text-green-800">
                By shifting to off-peak hours, you could save{' '}
                <span className="font-bold">KES {savings.saved.toFixed(2)}/day</span>
                {' '}({savings.percentage.toFixed(1)}% reduction)
              </p>
              <div className="mt-2 flex gap-4 text-xs text-green-700">
                <span>Current: KES {savings.currentTotal.toFixed(2)}/day</span>
                <span>Optimized: KES {savings.optimizedTotal.toFixed(2)}/day</span>
              </div>
              {isMultiDevice && (
                <p className="text-xs text-green-700 mt-2">
                  💰 Monthly savings: KES {(savings.saved * 30).toFixed(2)} | 
                  Annual: KES {(savings.saved * 365).toLocaleString('en-KE', { maximumFractionDigits: 0 })}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
