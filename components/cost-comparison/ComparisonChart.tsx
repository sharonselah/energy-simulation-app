'use client';

import React from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell 
} from 'recharts';
import Card from '../shared/Card';
import { TrendingDown, Users } from 'lucide-react';

export default function ComparisonChart() {
  const { devices, multiDeviceState } = useAppContext();

  if (devices.length === 0) return null;

  const { scenarioA, scenarioB, scenarioC } = multiDeviceState.aggregatedCosts;

  // Check if any devices have alternative fuel
  const hasAlternativeFuel = devices.some((device) => device.alternativeFuel);

  // Prepare chart data
  const chartData = [];

  // Scenario A
  chartData.push({
    name: hasAlternativeFuel ? 'Current\n(Mixed)' : 'Current\n(Grid)',
    scenario: 'A',
    monthly: scenarioA.total.monthly,
    label: 'Scenario A (Current)',
    color: '#fb923c', // orange-400
  });

  // Scenario B
  chartData.push({
    name: 'Current\nPattern',
    scenario: 'B',
    monthly: scenarioB.total.monthly,
    label: 'Scenario B (Electric)',
    color: '#60a5fa', // blue-400
  });

  // Scenario C
  chartData.push({
    name: 'Optimized\nTOU',
    scenario: 'C',
    monthly: scenarioC.total.monthly,
    label: 'Scenario C (Optimized)',
    color: '#34d399', // green-400
  });

  // Calculate total savings (from baseline to optimized)
  const baselineCost = scenarioA.total.monthly;
  const totalSavings = baselineCost - scenarioC.total.monthly;
  const totalSavingsPercentage = baselineCost > 0 
    ? (totalSavings / baselineCost) * 100 
    : 0;

  // Calculate savings B vs C
  const patternSavings = scenarioB.total.monthly - scenarioC.total.monthly;

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: { label: string; monthly: number } }> }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-xl">
          <p className="font-semibold text-gray-900 mb-1">{data.label}</p>
          <p className="text-sm text-gray-600">
            Monthly: <span className="font-bold text-gray-900">
              KES {data.monthly.toFixed(2)}
            </span>
          </p>
          <p className="text-sm text-gray-600">
            Annual: <span className="font-bold text-gray-900">
              KES {(data.monthly * 12).toLocaleString('en-KE', { maximumFractionDigits: 0 })}
            </span>
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {devices.length} device{devices.length !== 1 ? 's' : ''}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-900">
          📊 Monthly Cost Comparison
        </h3>
        {devices.length > 1 && (
          <div className="flex items-center gap-1 text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
            <Users className="w-4 h-4" />
            <span>{devices.length} devices</span>
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="w-full h-80 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12, fill: '#6b7280' }}
              angle={0}
              textAnchor="middle"
            />
            <YAxis 
              tick={{ fontSize: 12, fill: '#6b7280' }}
              label={{ 
                value: 'Monthly Cost (KES)', 
                angle: -90, 
                position: 'insideLeft',
                style: { fontSize: 12, fill: '#6b7280' }
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="monthly" radius={[8, 8, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Savings Summary */}
      {totalSavings > 0 && (
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl shadow-lg p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="w-6 h-6" />
                <h4 className="text-lg font-bold">Total Potential Savings</h4>
              </div>
              <p className="text-3xl font-bold mb-2">
                KES {totalSavings.toFixed(2)}/month
              </p>
              <p className="text-sm opacity-90 mb-3">
                That&apos;s {totalSavingsPercentage.toFixed(0)}% savings{devices.length > 1 ? ` across ${devices.length} devices` : ''}!
              </p>
              <div className="flex gap-4 text-sm">
                <div>
                  <p className="opacity-75">Daily Savings</p>
                  <p className="font-semibold">
                    KES {(totalSavings / 30).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="opacity-75">Annual Savings</p>
                  <p className="font-semibold">
                    KES {(totalSavings * 12).toLocaleString('en-KE', { maximumFractionDigits: 0 })}
                  </p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="bg-white/20 rounded-xl shadow-sm px-4 py-2">
                <p className="text-xs opacity-75">Savings</p>
                <p className="text-2xl font-bold">
                  {totalSavingsPercentage.toFixed(0)}%
                </p>
              </div>
            </div>
          </div>

          {/* Additional Info for Multi-Device */}
          {devices.length > 1 && patternSavings > 0 && (
            <div className="mt-4 pt-4 border-t border-white/20">
              <p className="text-sm opacity-90">
                💡 By optimizing usage patterns across all devices, you save an additional{' '}
                <span className="font-bold">KES {patternSavings.toFixed(2)}/month</span> compared to current electric usage.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Comparison Legend */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
        {chartData.map((item, index) => (
          <div 
            key={index}
            className="flex items-center gap-2 p-3 bg-gray-50 border border-gray-100 rounded-xl shadow-sm"
          >
            <div 
              className="w-4 h-4 rounded"
              style={{ backgroundColor: item.color }}
            ></div>
            <div>
              <p className="font-semibold text-gray-900">{item.label}</p>
              <p className="text-xs text-gray-600">
                KES {item.monthly.toFixed(2)}/mo
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

