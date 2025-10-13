'use client';

import React from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { calculateGridMetrics, generateOptimizedTimeBlocks } from '@/lib/calculations';
import GridDistribution from './GridDistribution';
import LoadFactorGauge from './LoadFactorGauge';
import GridStress from './GridStress';
import EfficiencyScore from './EfficiencyScore';
import ComparisonTable from './ComparisonTable';
import Card from '@/components/shared/Card';
import { Activity, Info } from 'lucide-react';

interface GridMetricsDashboardProps {
  showComparison?: boolean;
}

const GridMetricsDashboard: React.FC<GridMetricsDashboardProps> = ({ 
  showComparison = true 
}) => {
  const { 
    currentDevice: selectedDevice, 
    currentTimeBlocks: timeBlocks, 
    currentDuration: duration,
    devices 
  } = useAppContext();

  // Use single device from array if available, otherwise fall back to currentDevice
  const activeDevice = devices.length === 1 ? devices[0] : null;
  const displayDevice = activeDevice?.device || selectedDevice;
  const displayTimeBlocks = activeDevice?.timeBlocks || timeBlocks;
  const displayDuration = activeDevice?.duration || duration;

  // If no device selected or no time blocks selected, show placeholder
  const selectedCount = displayTimeBlocks?.filter((b) => b.isSelected).length ?? 0;
  
  if (!displayDevice || !displayTimeBlocks || selectedCount === 0) {
    return (
      <Card title="Grid Usage Metrics" subtitle="Analyze your impact on the power grid">
        <div className="text-center py-12">
          <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            No Usage Pattern Selected
          </h3>
          <p className="text-gray-500 text-sm max-w-md mx-auto">
            Select a device and configure your usage pattern to see detailed grid metrics and efficiency analysis.
          </p>
        </div>
      </Card>
    );
  }

  // Calculate current metrics
  const currentMetrics = calculateGridMetrics(displayDevice, displayTimeBlocks, displayDuration);

  // Calculate optimized metrics
  const optimizedTimeBlocks = generateOptimizedTimeBlocks(selectedCount);
  const optimizedMetrics = calculateGridMetrics(displayDevice, optimizedTimeBlocks, displayDuration);

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <Card className="bg-gradient-to-r from-primary to-blue-700 text-white shadow-xl">
        <div className="flex items-center gap-4">
          <div className="bg-white/20 p-3 rounded-xl">
            <Activity className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-1">Grid Usage Metrics</h2>
            <p className="text-blue-100 text-sm">
              Understand your impact on Kenya&apos;s power grid and optimize for better efficiency
            </p>
          </div>
        </div>
      </Card>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-900">
            <p className="font-semibold mb-1">Why Grid Metrics Matter</p>
            <p className="text-blue-700">
              Kenya&apos;s power grid experiences stress during peak hours. By shifting your usage to off-peak times, 
              you help prevent blackouts, reduce infrastructure strain, and contribute to a more stable electricity supply for everyone.
            </p>
          </div>
        </div>
      </div>

      {/* Main Metrics Grid - Top Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Efficiency Score - Large highlight */}
        <EfficiencyScore gridMetrics={currentMetrics} />

        {/* Grid Stress Indicator */}
        <GridStress stressScore={currentMetrics.stressScore} />
      </div>

      {/* Second Row - Load Factor and Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Load Factor Gauge */}
        <LoadFactorGauge loadFactor={currentMetrics.loadFactor} />

        {/* Grid Distribution Pie Chart */}
        <GridDistribution gridMetrics={currentMetrics} />
      </div>

      {/* Comparison Table - Full Width */}
      {showComparison && (
        <ComparisonTable
          currentMetrics={currentMetrics}
          optimizedMetrics={optimizedMetrics}
        />
      )}

      {/* Educational Footer */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200">
        <div className="text-sm text-gray-700">
          <h4 className="font-semibold text-gray-900 mb-2">
            🌍 Your Impact on Kenya&apos;s Energy Future
          </h4>
          <div className="space-y-2">
            <p>
              <span className="font-semibold">Grid Stress:</span> High stress during peak hours (6pm-10pm) increases 
              the risk of blackouts and requires expensive infrastructure upgrades.
            </p>
            <p>
              <span className="font-semibold">Load Factor:</span> Better load factors mean more efficient use of 
              existing infrastructure, reducing the need for new power plants.
            </p>
            <p>
              <span className="font-semibold">Off-Peak Usage:</span> Using electricity during off-peak hours (10pm-6am) 
              saves you money and helps balance the grid, making power more reliable for all Kenyans.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default GridMetricsDashboard;

