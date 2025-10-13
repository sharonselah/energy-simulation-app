'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, PieLabelRenderProps } from 'recharts';
import Card from '@/components/shared/Card';
import { GridMetrics } from '@/lib/types';

interface GridDistributionProps {
  gridMetrics: GridMetrics;
}

const GridDistribution: React.FC<GridDistributionProps> = ({ gridMetrics }) => {
  const data = [
    { name: 'Off-Peak', value: gridMetrics.offPeakUsage, color: '#10b981' },
    { name: 'Mid-Peak', value: gridMetrics.midPeakUsage, color: '#f59e0b' },
    { name: 'Peak', value: gridMetrics.peakUsage, color: '#ef4444' },
  ];

  const total = gridMetrics.peakUsage + gridMetrics.midPeakUsage + gridMetrics.offPeakUsage;

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: { color: string } }> }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const percentage = total > 0 ? ((data.value / total) * 100).toFixed(1) : 0;
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold" style={{ color: data.payload.color }}>
            {data.name}
          </p>
          <p className="text-sm text-gray-600">{data.value.toFixed(2)} kWh</p>
          <p className="text-xs text-gray-500">{percentage}% of total usage</p>
        </div>
      );
    }
    return null;
  };

  const renderCustomLabel = (props: PieLabelRenderProps) => {
    const value = typeof props.value === 'number' ? props.value : 0;
    const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
    if (parseFloat(percentage) < 5) return ''; // Don't show label if too small
    return `${percentage}%`;
  };

  return (
    <Card title="Energy Distribution" subtitle="Usage by time period">
      <div className="space-y-6">
        {/* Pie Chart */}
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomLabel}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Breakdown Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-offpeak/10 p-4 rounded-xl border border-offpeak/30">
            <div className="text-sm text-gray-600 mb-1">Off-Peak</div>
            <div className="text-2xl font-bold text-offpeak">
              {gridMetrics.offPeakUsage.toFixed(2)}
            </div>
            <div className="text-xs text-gray-500">
              {total > 0 ? ((gridMetrics.offPeakUsage / total) * 100).toFixed(1) : 0}% of usage
            </div>
          </div>

          <div className="bg-midpeak/10 p-4 rounded-xl border border-midpeak/30">
            <div className="text-sm text-gray-600 mb-1">Mid-Peak</div>
            <div className="text-2xl font-bold text-midpeak">
              {gridMetrics.midPeakUsage.toFixed(2)}
            </div>
            <div className="text-xs text-gray-500">
              {total > 0 ? ((gridMetrics.midPeakUsage / total) * 100).toFixed(1) : 0}% of usage
            </div>
          </div>

          <div className="bg-peak/10 p-4 rounded-xl border border-peak/30">
            <div className="text-sm text-gray-600 mb-1">Peak</div>
            <div className="text-2xl font-bold text-peak">
              {gridMetrics.peakUsage.toFixed(2)}
            </div>
            <div className="text-xs text-gray-500">
              {total > 0 ? ((gridMetrics.peakUsage / total) * 100).toFixed(1) : 0}% of usage
            </div>
          </div>
        </div>

        {/* Educational Tip */}
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
          <p className="text-sm text-gray-700">
            💡 <span className="font-semibold">Tip:</span> Maximize your off-peak usage (green) to save money and reduce strain on Kenya&apos;s power grid.
          </p>
        </div>
      </div>
    </Card>
  );
};

export default GridDistribution;

