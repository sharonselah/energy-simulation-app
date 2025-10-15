'use client';

import React from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { TOU_TIME_BANDS } from '@/lib/constants';
import { LoadProfileChartProps } from './types';
import { LoadProfileTooltip } from './LoadProfileTooltip';

export const LoadProfileChart: React.FC<LoadProfileChartProps> = ({
  chartData,
  devices,
  visibleDeviceIds,
  viewMode,
  isMultiDevice,
  hasTimeBlocks,
}) => {
  if (!hasTimeBlocks) {
    return (
      <div className="h-80 mt-6">
        <div className="h-full flex items-center justify-center text-gray-500">
          <p>Configure time blocks for devices to see load profile</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[28rem] mt-6">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 30 }}>
          <defs>
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
            <linearGradient id="currentGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#163466" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#163466" stopOpacity={0.1} />
            </linearGradient>
            <linearGradient id="optimizedGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

          {TOU_TIME_BANDS.map((band) => {
            const startSlot = chartData.find((point) => point.hour === band.start);
            const endSlot = [...chartData].reverse().find((point) => point.hour === band.end);
            if (!startSlot || !endSlot) {
              return null;
            }

            return (
              <ReferenceArea
                key={`${band.type}-${band.start}`}
                x1={startSlot.time}
                x2={endSlot.time}
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
              const dataIndex = chartData.findIndex((point) => point.time === value);
              if (dataIndex === -1) {
                return '';
              }
              if (dataIndex % 4 !== 0) {
                return '';
              }
              const hour = chartData[dataIndex].hour;
              return `${((hour + 1 - 1 + 24) % 24) + 1}`;
            }}
          />
          <YAxis
            label={{ value: 'Power (W)', angle: -90, position: 'insideLeft' }}
            tick={{ fontSize: 12 }}
            width={60}
          />
          <Tooltip
            content={
              <LoadProfileTooltip
                devices={devices}
                visibleDeviceIds={visibleDeviceIds}
                isMultiDevice={isMultiDevice}
                viewMode={viewMode}
              />
            }
            cursor={{ stroke: 'rgba(0, 0, 0, 0.2)', strokeWidth: 1 }}
          />

          {viewMode !== 'optimized' && (
            <Area
              type="monotone"
              dataKey="currentTotal"
              stroke="#163466"
              fill="url(#currentGradient)"
              strokeWidth={3}
              name={isMultiDevice ? 'Current (Combined)' : 'Current Usage'}
            />
          )}

          {viewMode !== 'current' && (
            <Area
              type="monotone"
              dataKey="optimizedTotal"
              stroke="#10b981"
              fill="url(#optimizedGradient)"
              strokeWidth={viewMode === 'optimized' ? 3 : 2}
              strokeDasharray={viewMode === 'comparison' ? '5 5' : '0'}
              name={isMultiDevice ? 'Optimized (Combined)' : 'Optimized Usage'}
              fillOpacity={viewMode === 'optimized' ? 1 : 0.5}
            />
          )}

          {viewMode === 'comparison' && <Legend />}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
