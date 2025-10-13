'use client';

import React from 'react';
import Card from '@/components/shared/Card';
import { Gauge } from 'lucide-react';

interface LoadFactorGaugeProps {
  loadFactor: number; // 0-100
}

const LoadFactorGauge: React.FC<LoadFactorGaugeProps> = ({ loadFactor }) => {
  // Clamp value between 0 and 100
  const clampedValue = Math.max(0, Math.min(100, loadFactor));
  
  // Calculate rotation for the needle (from -90deg to 90deg)
  const rotation = -90 + (clampedValue / 100) * 180;
  
  // Determine color based on value
  const getColor = (value: number) => {
    if (value >= 70) return 'text-green-600';
    if (value >= 40) return 'text-midpeak';
    return 'text-peak';
  };

  const getGradeText = (value: number) => {
    if (value >= 70) return 'Excellent';
    if (value >= 50) return 'Good';
    if (value >= 30) return 'Fair';
    return 'Poor';
  };

  const color = getColor(clampedValue);
  const grade = getGradeText(clampedValue);

  return (
    <Card title="Load Factor" subtitle="Energy efficiency metric">
      <div className="space-y-6">
        {/* Gauge Visualization */}
        <div className="relative flex items-center justify-center py-8">
          {/* Semi-circle gauge background */}
          <svg width="240" height="140" viewBox="0 0 240 140" className="overflow-visible">
            {/* Background arc segments */}
            <defs>
              <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ef4444" />
                <stop offset="50%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
            </defs>
            
            {/* Outer arc */}
            <path
              d="M 30 120 A 90 90 0 0 1 210 120"
              fill="none"
              stroke="url(#gaugeGradient)"
              strokeWidth="20"
              strokeLinecap="round"
            />
            
            {/* Inner white arc for depth */}
            <path
              d="M 40 120 A 80 80 0 0 1 200 120"
              fill="none"
              stroke="#f3f4f6"
              strokeWidth="8"
            />
            
            {/* Center circle */}
            <circle cx="120" cy="120" r="10" fill="#163466" />
            
            {/* Needle */}
            <g transform={`rotate(${rotation} 120 120)`}>
              <line
                x1="120"
                y1="120"
                x2="120"
                y2="50"
                stroke="#163466"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <circle cx="120" cy="120" r="6" fill="#163466" />
            </g>
            
            {/* Benchmark line at 70% */}
            <g transform="rotate(36 120 120)">
              <line
                x1="120"
                y1="50"
                x2="120"
                y2="42"
                stroke="#10b981"
                strokeWidth="2"
                strokeDasharray="2,2"
              />
            </g>
          </svg>
          
          {/* Value display */}
          <div className="absolute bottom-0 text-center">
            <div className={`text-4xl font-bold ${color}`}>
              {clampedValue.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-500 mt-1">{grade}</div>
          </div>
        </div>

        {/* Labels */}
        <div className="flex justify-between text-xs text-gray-500 -mt-4">
          <span>0%</span>
          <span className="text-green-600 font-semibold">70% (Good)</span>
          <span>100%</span>
        </div>

        {/* Explanation */}
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-2">
          <h4 className="font-semibold text-gray-900 text-sm">What is Load Factor?</h4>
          <p className="text-sm text-gray-600">
            Load factor measures how efficiently you use energy over time. It&apos;s calculated as: <span className="font-mono text-xs bg-white px-1 py-0.5 rounded">(Average Load / Peak Load) × 100%</span>
          </p>
          <p className="text-xs text-gray-500">
            {clampedValue >= 70 
              ? '✅ Your load factor is excellent! You\'re using energy efficiently.' 
              : clampedValue >= 40 
              ? '⚠️ Your load factor could be improved. Try spreading usage more evenly throughout the day.'
              : '❌ Your load factor is low. Consider distributing your energy usage more evenly to improve efficiency.'}
          </p>
        </div>

        {/* Benchmark */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Gauge className="w-4 h-4 text-green-600" />
          <span>Benchmark: A load factor above <span className="font-semibold text-green-600">70%</span> is considered good</span>
        </div>
      </div>
    </Card>
  );
};

export default LoadFactorGauge;

