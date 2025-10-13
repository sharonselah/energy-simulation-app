'use client';

import React from 'react';
import Card from '@/components/shared/Card';
import { AlertTriangle, CheckCircle, AlertCircle, Zap } from 'lucide-react';
import { GRID_STRESS_THRESHOLDS } from '@/lib/constants';

interface GridStressProps {
  stressScore: number;
}

const GridStress: React.FC<GridStressProps> = ({ stressScore }) => {
  // Determine stress level based on thresholds
  const getStressLevel = (score: number): 'LOW' | 'MEDIUM' | 'HIGH' => {
    if (score < GRID_STRESS_THRESHOLDS.low) return 'LOW';
    if (score < GRID_STRESS_THRESHOLDS.medium) return 'MEDIUM';
    return 'HIGH';
  };

  const stressLevel = getStressLevel(stressScore);

  // Configuration for each stress level
  const stressConfig = {
    LOW: {
      color: 'green',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-700',
      icon: CheckCircle,
      iconColor: 'text-green-600',
      message: 'Your usage pattern has minimal impact on the grid. Great job!',
      emoji: '🟢',
      recommendation: 'Keep it up! Your off-peak usage helps stabilize Kenya\'s power grid.',
    },
    MEDIUM: {
      color: 'yellow',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      textColor: 'text-yellow-700',
      icon: AlertCircle,
      iconColor: 'text-yellow-600',
      message: 'Your usage creates moderate stress on the grid.',
      emoji: '🟡',
      recommendation: 'Try shifting more usage to off-peak hours (10pm-6am) to reduce grid stress.',
    },
    HIGH: {
      color: 'red',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-700',
      icon: AlertTriangle,
      iconColor: 'text-red-600',
      message: 'Your usage creates significant stress on the grid.',
      emoji: '🔴',
      recommendation: 'Consider moving usage away from peak hours (6pm-10pm) to prevent blackouts.',
    },
  };

  const config = stressConfig[stressLevel];
  const Icon = config.icon;

  // Calculate percentage fill for visual bar
  const maxStress = 20; // Arbitrary max for visualization
  const fillPercentage = Math.min((stressScore / maxStress) * 100, 100);

  return (
    <Card title="Grid Stress Indicator" subtitle="Impact on power grid">
      <div className="space-y-6">
        {/* Main Stress Indicator */}
        <div className={`${config.bgColor} border ${config.borderColor} rounded-xl p-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Icon className={`w-8 h-8 ${config.iconColor}`} />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{config.emoji}</span>
                  <span className={`text-2xl font-bold ${config.textColor}`}>
                    {stressLevel}
                  </span>
                </div>
                <p className="text-sm text-gray-600">Stress Level</p>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-3xl font-bold ${config.textColor}`}>
                {stressScore.toFixed(2)}
              </div>
              <p className="text-xs text-gray-500">Stress Score</p>
            </div>
          </div>

          {/* Visual Bar */}
          <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden mb-4">
            <div 
              className={`absolute top-0 left-0 h-full bg-gradient-to-r transition-all duration-500 ${
                stressLevel === 'LOW' 
                  ? 'from-green-400 to-green-600' 
                  : stressLevel === 'MEDIUM'
                  ? 'from-yellow-400 to-yellow-600'
                  : 'from-red-400 to-red-600'
              }`}
              style={{ width: `${fillPercentage}%` }}
            />
          </div>

          {/* Thresholds */}
          <div className="flex justify-between text-xs text-gray-500 mb-4">
            <span>0 (Best)</span>
            <span className="text-green-600">{'<' + GRID_STRESS_THRESHOLDS.low} Low</span>
            <span className="text-yellow-600">{'<' + GRID_STRESS_THRESHOLDS.medium} Med</span>
            <span className="text-red-600">{GRID_STRESS_THRESHOLDS.medium}+ High</span>
          </div>

          {/* Message */}
          <p className={`text-sm ${config.textColor} font-medium`}>
            {config.message}
          </p>
        </div>

        {/* Recommendation */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Zap className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-blue-900 text-sm mb-1">
                Recommendation
              </h4>
              <p className="text-sm text-blue-700">
                {config.recommendation}
              </p>
            </div>
          </div>
        </div>

        {/* How it's calculated */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
          <h4 className="font-semibold text-gray-900 text-sm mb-2">
            How Grid Stress is Calculated
          </h4>
          <p className="text-xs text-gray-600 mb-2">
            Grid stress measures your impact on the power grid based on when you use electricity:
          </p>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-600">Peak hours (6pm-10pm):</span>
              <span className="font-mono text-red-600">× 3 weight</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Mid-peak hours (6am-6pm):</span>
              <span className="font-mono text-yellow-600">× 2 weight</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Off-peak hours (10pm-6am):</span>
              <span className="font-mono text-green-600">× 1 weight</span>
            </div>
          </div>
        </div>

        {/* Educational Context */}
        <div className="text-xs text-gray-600 italic">
          ⚡ High grid stress increases the risk of blackouts and requires expensive infrastructure upgrades. By shifting to off-peak, you help stabilize Kenya&apos;s grid.
        </div>
      </div>
    </Card>
  );
};

export default GridStress;

