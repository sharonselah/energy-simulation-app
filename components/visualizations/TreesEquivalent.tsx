'use client';

import React, { useEffect, useState } from 'react';
import { Trees } from 'lucide-react';
import Card from '@/components/shared/Card';

interface TreesEquivalentProps {
  treesEquivalent: number;
}

export default function TreesEquivalent({ treesEquivalent }: TreesEquivalentProps) {
  const [displayValue, setDisplayValue] = useState(0);

  // Animated counter effect
  useEffect(() => {
    if (treesEquivalent === 0) {
      setDisplayValue(0);
      return;
    }

    const duration = 1500; // 1.5 seconds animation
    const steps = 60;
    const increment = treesEquivalent / steps;
    const stepDuration = duration / steps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      if (currentStep >= steps) {
        setDisplayValue(treesEquivalent);
        clearInterval(timer);
      } else {
        setDisplayValue(increment * currentStep);
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [treesEquivalent]);

  // Generate tree icons based on the number
  const treeCount = Math.min(Math.ceil(treesEquivalent), 20); // Cap at 20 visual trees
  const showMoreIndicator = treesEquivalent > 20;

  return (
    <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-3 bg-green-100 rounded-xl">
            <Trees className="w-6 h-6 text-green-700" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              Trees Equivalent
            </h3>
            <p className="text-sm text-gray-600">
              Annual CO₂ reduction visualized
            </p>
          </div>
        </div>

        {/* Main Message */}
        <div className="text-center py-4">
          <p className="text-gray-700 mb-2">
            Your switch is equivalent to planting
          </p>
          <div className="flex items-baseline justify-center gap-2">
            <span className="text-5xl font-bold text-green-600">
              {displayValue.toFixed(1)}
            </span>
            <span className="text-2xl font-semibold text-green-700">
              {treesEquivalent === 1 ? 'tree' : 'trees'}
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            per year
          </p>
        </div>

        {/* Tree Visualization */}
        <div className="relative py-4">
          <div className="flex flex-wrap justify-center gap-2">
            {Array.from({ length: treeCount }).map((_, index) => (
              <div
                key={index}
                className="animate-fadeIn"
                style={{
                  animationDelay: `${index * 50}ms`,
                  animationFillMode: 'both',
                }}
              >
                <Trees className="w-8 h-8 text-green-600" />
              </div>
            ))}
            {showMoreIndicator && (
              <div className="flex items-center justify-center w-8 h-8">
                <span className="text-2xl font-bold text-green-600">+</span>
              </div>
            )}
          </div>
        </div>

        {/* Context Information */}
        <div className="bg-white rounded-lg p-4 border border-green-200">
          <p className="text-sm text-gray-700 text-center">
            <span className="font-semibold text-green-700">🌍 Climate Impact:</span>
            {' '}Each tree absorbs approximately 21 kg of CO₂ per year. 
            By switching to electric appliances powered by Kenya&apos;s increasingly 
            renewable grid, you&apos;re making a real difference in fighting climate change.
          </p>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="text-center p-3 bg-white rounded-lg border border-green-100">
            <p className="text-xs text-gray-600 mb-1">Annual CO₂ Saved</p>
            <p className="text-lg font-bold text-green-600">
              {(treesEquivalent * 21).toFixed(0)} kg
            </p>
          </div>
          <div className="text-center p-3 bg-white rounded-lg border border-green-100">
            <p className="text-xs text-gray-600 mb-1">10-Year Impact</p>
            <p className="text-lg font-bold text-green-600">
              {(treesEquivalent * 21 * 10 / 1000).toFixed(1)} tons
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.8) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out;
        }
      `}</style>
    </Card>
  );
}

