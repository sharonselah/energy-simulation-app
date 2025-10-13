'use client';

import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { EmissionData, AlternativeFuel } from '@/lib/types';
import Card from '@/components/shared/Card';
import { Calendar } from 'lucide-react';

interface EmissionsChartProps {
  emissionData: EmissionData;
  alternativeFuel: AlternativeFuel | null;
}

type ViewMode = 'monthly' | 'annual';

export default function EmissionsChart({ 
  emissionData, 
  alternativeFuel 
}: EmissionsChartProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('monthly');

  // Calculate data for both views
  const monthlyData = [
    {
      name: alternativeFuel ? 'Alternative Fuel' : 'Baseline',
      emissions: emissionData.baseline,
      fill: '#f59e0b', // orange
    },
    {
      name: 'Electric',
      emissions: emissionData.current,
      fill: emissionData.current < emissionData.baseline ? '#10b981' : '#f59e0b',
    },
  ];

  const annualData = [
    {
      name: alternativeFuel ? 'Alternative Fuel' : 'Baseline',
      emissions: emissionData.baseline * 12,
      fill: '#f59e0b',
    },
    {
      name: 'Electric',
      emissions: emissionData.current * 12,
      fill: emissionData.current < emissionData.baseline ? '#10b981' : '#f59e0b',
    },
  ];

  const data = viewMode === 'monthly' ? monthlyData : annualData;
  const unit = viewMode === 'monthly' ? 'kg CO₂/month' : 'kg CO₂/year';

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: { name: string; emissions: number; fill: string } }> }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-900 mb-1">{data.name}</p>
          <p className="text-sm text-gray-600">
            <span className="font-bold" style={{ color: data.fill }}>
              {data.emissions.toFixed(1)}
            </span>
            {' '}{unit}
          </p>
        </div>
      );
    }
    return null;
  };

  // Calculate percentage difference
  const percentageDiff = ((emissionData.current - emissionData.baseline) / emissionData.baseline * 100);
  const isReduction = percentageDiff < 0;

  return (
    <Card className="p-6">
      <div className="space-y-4">
        {/* Header with View Toggle */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              Emissions Comparison
            </h3>
            <p className="text-sm text-gray-600">
              Compare your carbon footprint
            </p>
          </div>
          
          {/* View Mode Toggle */}
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('monthly')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                viewMode === 'monthly'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Calendar className="w-4 h-4 inline mr-1" />
              Monthly
            </button>
            <button
              onClick={() => setViewMode('annual')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                viewMode === 'annual'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Calendar className="w-4 h-4 inline mr-1" />
              Annual
            </button>
          </div>
        </div>

        {/* Percentage Change Banner */}
        <div className={`p-3 rounded-lg ${
          isReduction 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-orange-50 border border-orange-200'
        }`}>
          <p className="text-sm font-medium text-center">
            {isReduction ? (
              <span className="text-green-700">
                ✓ {Math.abs(percentageDiff).toFixed(1)}% reduction in CO₂ emissions
              </span>
            ) : (
              <span className="text-orange-700">
                ⚠ {Math.abs(percentageDiff).toFixed(1)}% increase in CO₂ emissions
              </span>
            )}
          </p>
        </div>

        {/* Chart */}
        <div className="w-full h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="name"
                tick={{ fill: '#6b7280', fontSize: 12 }}
                angle={-15}
                textAnchor="end"
                height={80}
              />
              <YAxis
                label={{ 
                  value: unit, 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { fill: '#6b7280', fontSize: 12 }
                }}
                tick={{ fill: '#6b7280', fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="emissions" 
                radius={[8, 8, 0, 0]}
                maxBarSize={120}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Legend / Context */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-orange-500"></div>
            <span className="text-sm text-gray-700">
              {alternativeFuel 
                ? `${alternativeFuel.type.charAt(0).toUpperCase() + alternativeFuel.type.slice(1)} emissions`
                : 'Baseline emissions'
              }
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded ${
              emissionData.current < emissionData.baseline ? 'bg-green-500' : 'bg-orange-500'
            }`}></div>
            <span className="text-sm text-gray-700">
              Electric appliance emissions
            </span>
          </div>
        </div>

        {/* Additional Context */}
        {alternativeFuel && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-700">
              <span className="font-semibold">Note:</span>
              {' '}Emissions calculations include the full lifecycle impact. 
              Kenya&apos;s electricity grid is becoming increasingly renewable with 
              hydro, geothermal, and wind power, making electric appliances 
              cleaner over time.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}

