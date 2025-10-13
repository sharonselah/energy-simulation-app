'use client';

import React from 'react';
import Card from '@/components/shared/Card';
import { ArrowRight, TrendingUp, TrendingDown, Minus, CheckCircle } from 'lucide-react';
import { GridMetrics } from '@/lib/types';

interface ComparisonTableProps {
  currentMetrics: GridMetrics;
  optimizedMetrics: GridMetrics;
}

interface MetricRowProps {
  label: string;
  currentValue: number | string;
  optimizedValue: number | string;
  unit: string;
  format?: 'number' | 'percentage' | 'score';
  lowerIsBetter?: boolean;
}

const MetricRow: React.FC<MetricRowProps> = ({
  label,
  currentValue,
  optimizedValue,
  unit,
  format = 'number',
  lowerIsBetter = false,
}) => {
  const formatValue = (value: number | string) => {
    if (typeof value === 'string') return value;
    
    switch (format) {
      case 'percentage':
        return value.toFixed(1) + '%';
      case 'score':
        return value.toFixed(1);
      case 'number':
      default:
        return value.toFixed(2);
    }
  };

  const currentNum = typeof currentValue === 'number' ? currentValue : parseFloat(currentValue);
  const optimizedNum = typeof optimizedValue === 'number' ? optimizedValue : parseFloat(optimizedValue);
  
  const difference = optimizedNum - currentNum;
  const isImproved = lowerIsBetter ? difference < 0 : difference > 0;
  const isUnchanged = Math.abs(difference) < 0.01;

  const getIcon = () => {
    if (isUnchanged) return <Minus className="w-4 h-4 text-gray-400" />;
    if (isImproved) return <TrendingUp className="w-4 h-4 text-green-600" />;
    return <TrendingDown className="w-4 h-4 text-red-600" />;
  };

  const getChangeColor = () => {
    if (isUnchanged) return 'text-gray-500';
    if (isImproved) return 'text-green-600';
    return 'text-red-600';
  };

  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
      <td className="py-4 px-4 text-sm font-medium text-gray-900">{label}</td>
      <td className="py-4 px-4 text-sm text-gray-600 text-center">
        <span className="font-mono">{formatValue(currentValue)}</span> {unit}
      </td>
      <td className="py-4 px-4 text-center">
        <div className="flex items-center justify-center">
          {getIcon()}
        </div>
      </td>
      <td className="py-4 px-4 text-sm text-gray-900 text-center">
        <span className="font-mono font-semibold">{formatValue(optimizedValue)}</span> {unit}
      </td>
      <td className="py-4 px-4 text-sm text-center">
        <span className={`${getChangeColor()} font-medium`}>
          {!isUnchanged && (isImproved ? '+' : '')}
          {!isUnchanged && formatValue(difference)} {!isUnchanged && unit}
          {isUnchanged && '—'}
        </span>
      </td>
    </tr>
  );
};

const ComparisonTable: React.FC<ComparisonTableProps> = ({
  currentMetrics,
  optimizedMetrics,
}) => {
  const currentTotal = currentMetrics.peakUsage + currentMetrics.midPeakUsage + currentMetrics.offPeakUsage;
  const optimizedTotal = optimizedMetrics.peakUsage + optimizedMetrics.midPeakUsage + optimizedMetrics.offPeakUsage;

  const currentPeakPercentage = currentTotal > 0 ? (currentMetrics.peakUsage / currentTotal) * 100 : 0;
  const optimizedPeakPercentage = optimizedTotal > 0 ? (optimizedMetrics.peakUsage / optimizedTotal) * 100 : 0;

  const currentOffPeakPercentage = currentTotal > 0 ? (currentMetrics.offPeakUsage / currentTotal) * 100 : 0;
  const optimizedOffPeakPercentage = optimizedTotal > 0 ? (optimizedMetrics.offPeakUsage / optimizedTotal) * 100 : 0;

  // Count improvements
  const improvements = [
    optimizedMetrics.efficiencyScore > currentMetrics.efficiencyScore,
    optimizedMetrics.stressScore < currentMetrics.stressScore,
    optimizedMetrics.loadFactor > currentMetrics.loadFactor,
    optimizedOffPeakPercentage > currentOffPeakPercentage,
  ].filter(Boolean).length;

  return (
    <Card title="Current vs Optimized Comparison" subtitle="See the potential improvements">
      <div className="space-y-6">
        {/* Summary Banner */}
        <div className="bg-gradient-to-r from-primary to-blue-700 text-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold mb-1">
                {improvements} of 4 Metrics Improved
              </h3>
              <p className="text-blue-100 text-sm">
                By switching to the optimized schedule
              </p>
            </div>
            <div className="bg-white/20 p-4 rounded-full">
              <CheckCircle className="w-12 h-12" />
            </div>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-200 bg-gray-50">
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Metric
                </th>
                <th className="py-3 px-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Current Pattern
                </th>
                <th className="py-3 px-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider w-12">
                  
                </th>
                <th className="py-3 px-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Optimized Pattern
                </th>
                <th className="py-3 px-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Change
                </th>
              </tr>
            </thead>
            <tbody>
              {/* Efficiency Score */}
              <MetricRow
                label="Efficiency Score"
                currentValue={currentMetrics.efficiencyScore}
                optimizedValue={optimizedMetrics.efficiencyScore}
                unit="/10"
                format="score"
              />

              {/* Grid Stress */}
              <MetricRow
                label="Grid Stress Score"
                currentValue={currentMetrics.stressScore}
                optimizedValue={optimizedMetrics.stressScore}
                unit=""
                format="number"
                lowerIsBetter={true}
              />

              {/* Load Factor */}
              <MetricRow
                label="Load Factor"
                currentValue={currentMetrics.loadFactor}
                optimizedValue={optimizedMetrics.loadFactor}
                unit="%"
                format="percentage"
              />

              {/* Peak Usage */}
              <MetricRow
                label="Peak Usage"
                currentValue={currentMetrics.peakUsage}
                optimizedValue={optimizedMetrics.peakUsage}
                unit="kWh"
                format="number"
                lowerIsBetter={true}
              />

              {/* Peak Usage Percentage */}
              <MetricRow
                label="Peak Usage %"
                currentValue={currentPeakPercentage}
                optimizedValue={optimizedPeakPercentage}
                unit="%"
                format="percentage"
                lowerIsBetter={true}
              />

              {/* Off-Peak Usage */}
              <MetricRow
                label="Off-Peak Usage"
                currentValue={currentMetrics.offPeakUsage}
                optimizedValue={optimizedMetrics.offPeakUsage}
                unit="kWh"
                format="number"
              />

              {/* Off-Peak Usage Percentage */}
              <MetricRow
                label="Off-Peak Usage %"
                currentValue={currentOffPeakPercentage}
                optimizedValue={optimizedOffPeakPercentage}
                unit="%"
                format="percentage"
              />
            </tbody>
          </table>
        </div>

        {/* Key Improvements Highlight */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {optimizedMetrics.efficiencyScore > currentMetrics.efficiencyScore && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="font-semibold text-green-900 text-sm">Better Efficiency</span>
              </div>
              <p className="text-xs text-green-700">
                Your efficiency score improves by{' '}
                {(optimizedMetrics.efficiencyScore - currentMetrics.efficiencyScore).toFixed(1)} points
              </p>
            </div>
          )}

          {optimizedMetrics.stressScore < currentMetrics.stressScore && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <span className="font-semibold text-blue-900 text-sm">Lower Grid Stress</span>
              </div>
              <p className="text-xs text-blue-700">
                Reduces grid stress by{' '}
                {(currentMetrics.stressScore - optimizedMetrics.stressScore).toFixed(1)} points
              </p>
            </div>
          )}

          {optimizedOffPeakPercentage > currentOffPeakPercentage && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-purple-600" />
                <span className="font-semibold text-purple-900 text-sm">More Off-Peak Usage</span>
              </div>
              <p className="text-xs text-purple-700">
                Increases off-peak usage by{' '}
                {(optimizedOffPeakPercentage - currentOffPeakPercentage).toFixed(1)}%
              </p>
            </div>
          )}

          {optimizedMetrics.loadFactor > currentMetrics.loadFactor && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-yellow-600" />
                <span className="font-semibold text-yellow-900 text-sm">Better Load Factor</span>
              </div>
              <p className="text-xs text-yellow-700">
                Improves load factor by{' '}
                {(optimizedMetrics.loadFactor - currentMetrics.loadFactor).toFixed(1)}%
              </p>
            </div>
          )}
        </div>

        {/* Call to Action */}
        <div className="bg-cta/10 border border-cta/30 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <ArrowRight className="w-6 h-6 text-cta" />
            <div>
              <h4 className="font-semibold text-gray-900 text-sm mb-1">
                Ready to optimize?
              </h4>
              <p className="text-sm text-gray-700">
                Switch to the optimized schedule to improve your efficiency score and help stabilize Kenya&apos;s power grid.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ComparisonTable;

