'use client';

import React from 'react';
import Card from '@/components/shared/Card';
import { Star, TrendingUp, Zap, Activity } from 'lucide-react';
import { GridMetrics } from '@/lib/types';
import { EFFICIENCY_SCORE_WEIGHTS } from '@/lib/constants';

interface EfficiencyScoreProps {
  gridMetrics: GridMetrics;
}

interface RadialProgressProps {
  percentage: number;
  color: string;
  label: string;
  icon: React.ElementType;
}

const RadialProgress: React.FC<RadialProgressProps> = ({ percentage, color, label, icon: Icon }) => {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-28 h-28">
        <svg className="transform -rotate-90 w-28 h-28">
          {/* Background circle */}
          <circle
            cx="56"
            cy="56"
            r={radius}
            stroke="#e5e7eb"
            strokeWidth="8"
            fill="none"
          />
          {/* Progress circle */}
          <circle
            cx="56"
            cy="56"
            r={radius}
            stroke={color}
            strokeWidth="8"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        {/* Center content */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <Icon className="w-5 h-5 mx-auto mb-1" style={{ color }} />
            <div className="text-lg font-bold text-gray-900">
              {percentage.toFixed(0)}%
            </div>
          </div>
        </div>
      </div>
      <p className="text-sm text-gray-600 mt-2 text-center">{label}</p>
    </div>
  );
};

const EfficiencyScore: React.FC<EfficiencyScoreProps> = ({ gridMetrics }) => {
  const score = gridMetrics.efficiencyScore;
  
  // Calculate component scores
  const totalKWh = gridMetrics.peakUsage + gridMetrics.midPeakUsage + gridMetrics.offPeakUsage;
  const offPeakPercentage = totalKWh > 0 ? (gridMetrics.offPeakUsage / totalKWh) * 100 : 0;
  const loadFactorPercentage = gridMetrics.loadFactor;
  
  // Normalize grid stress (lower is better, so invert it)
  const normalizedStress = Math.max(0, 100 - gridMetrics.stressScore * 5);

  // Star rating (out of 5)
  const starRating = Math.round((score / 10) * 5);

  // Score grade
  const getScoreGrade = (value: number) => {
    if (value >= 8) return 'Excellent';
    if (value >= 6) return 'Good';
    if (value >= 4) return 'Fair';
    return 'Needs Improvement';
  };

  const scoreGrade = getScoreGrade(score);

  // Benchmark percentage (simulated - in production, would come from backend)
  const benchmarkPercentage = Math.min(95, Math.max(5, 50 + (score - 5) * 8));

  return (
    <Card title="Grid Efficiency Score" subtitle="Your overall performance">
      <div className="space-y-6">
        {/* Main Score Display */}
        <div className="bg-gradient-to-br from-primary to-blue-700 text-white rounded-xl p-8 shadow-xl">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-6 h-6 ${
                    i < starRating
                      ? 'fill-cta text-cta'
                      : 'fill-transparent text-white/30'
                  }`}
                />
              ))}
            </div>
            <div className="text-6xl font-bold mb-2">
              {score.toFixed(1)}
              <span className="text-3xl text-blue-200">/10</span>
            </div>
            <div className="text-xl font-semibold text-blue-100 mb-2">
              {scoreGrade}
            </div>
            <p className="text-sm text-blue-200">
              You&apos;re in the top {benchmarkPercentage.toFixed(0)}% of grid-friendly users!
            </p>
          </div>
        </div>

        {/* Score Breakdown with Radial Progress */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-4 text-center">
            Score Breakdown
          </h4>
          <div className="grid grid-cols-3 gap-4">
            <RadialProgress
              percentage={offPeakPercentage}
              color="#10b981"
              label="Off-Peak Usage"
              icon={TrendingUp}
            />
            <RadialProgress
              percentage={loadFactorPercentage}
              color="#3b82f6"
              label="Load Factor"
              icon={Activity}
            />
            <RadialProgress
              percentage={normalizedStress}
              color="#f59e0b"
              label="Grid Friendliness"
              icon={Zap}
            />
          </div>
        </div>

        {/* Weighted Contribution */}
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
          <h4 className="font-semibold text-gray-900 text-sm mb-3">
            How Your Score is Calculated
          </h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-gray-600">Off-Peak Usage</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-gray-900">{offPeakPercentage.toFixed(1)}%</span>
                <span className="text-xs text-gray-500">
                  (×{(EFFICIENCY_SCORE_WEIGHTS.offPeakPercentage * 100).toFixed(0)}% weight)
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-600" />
                <span className="text-gray-600">Load Factor</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-gray-900">{loadFactorPercentage.toFixed(1)}%</span>
                <span className="text-xs text-gray-500">
                  (×{(EFFICIENCY_SCORE_WEIGHTS.loadFactor * 100).toFixed(0)}% weight)
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-600" />
                <span className="text-gray-600">Grid Stress (inverted)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-gray-900">{normalizedStress.toFixed(1)}%</span>
                <span className="text-xs text-gray-500">
                  (×{(EFFICIENCY_SCORE_WEIGHTS.gridStress * 100).toFixed(0)}% weight)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Achievement Badges */}
        {score >= 8 && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="bg-green-500 text-white p-3 rounded-full">
                <Star className="w-6 h-6 fill-current" />
              </div>
              <div>
                <h4 className="font-semibold text-green-900">
                  🏆 Grid Champion Achievement Unlocked!
                </h4>
                <p className="text-sm text-green-700">
                  You&apos;re helping stabilize Kenya&apos;s power grid with your efficient energy usage patterns!
                </p>
              </div>
            </div>
          </div>
        )}

        {score < 6 && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-900 text-sm mb-1">
                  Tips to Improve Your Score
                </h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  {offPeakPercentage < 50 && (
                    <li>• Shift more usage to off-peak hours (10pm-6am)</li>
                  )}
                  {loadFactorPercentage < 40 && (
                    <li>• Distribute your energy usage more evenly throughout the day</li>
                  )}
                  {normalizedStress < 60 && (
                    <li>• Avoid using high-power devices during peak hours (6pm-10pm)</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default EfficiencyScore;

