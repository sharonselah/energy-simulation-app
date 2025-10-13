'use client';

import React from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Lightbulb, Clock, TrendingDown, Zap, Leaf, Users } from 'lucide-react';
import Card from './Card';

export default function SmartTips() {
  const { devices, multiDeviceState } = useAppContext();

  if (devices.length === 0) return null;

  const { scenarioB, scenarioC } = multiDeviceState.aggregatedCosts;
  
  // Calculate savings
  const savings = scenarioB.total.daily - scenarioC.total.daily;
  const savingsPercentage = scenarioB.total.daily > 0 
    ? (savings / scenarioB.total.daily) * 100 
    : 0;

  // Analyze combined usage pattern
  const totalPeakCost = scenarioB.breakdown.peak;
  const totalOffpeakCost = scenarioB.breakdown.offpeak;
  const totalCost = scenarioB.total.daily;
  
  const peakPercentage = totalCost > 0 ? (totalPeakCost / totalCost) * 100 : 0;
  const offpeakPercentage = totalCost > 0 ? (totalOffpeakCost / totalCost) * 100 : 0;
  
  const isPeakHeavy = peakPercentage > 30;
  const isWellOptimized = offpeakPercentage >= 70;

  // Count devices by category and alternative fuel
  const cookingDevices = devices.filter((d) => d.device.category === 'cooking');
  const heatingDevices = devices.filter((d) => d.device.category === 'heating');
  const refrigerationDevices = devices.filter((d) => d.device.category === 'refrigeration');
  const devicesWithFuel = devices.filter((d) => d.alternativeFuel);
  
  // Count devices with peak usage
  const devicesWithPeakUsage = devices.filter((device) =>
    device.timeBlocks.some((b) => b.isSelected && b.rateType === 'peak')
  );

  // Generate context-aware tips
  const tips = [];

  // Multi-Device Tip 1: Overall optimization opportunity
  if (savings > 0 && devices.length > 1) {
    tips.push({
      icon: <Users className="w-5 h-5" />,
      title: 'Multi-Device Optimization',
      description: `By coordinating ${devices.length} devices to run during off-peak hours, you save KES ${(savings * 30).toFixed(2)}/month. Each device benefits from lower rates when used together efficiently!`,
      color: 'blue',
    });
  }

  // Tip 2: Off-peak usage
  if (offpeakPercentage < 50 && devices.length > 0) {
    tips.push({
      icon: <Clock className="w-5 h-5" />,
      title: 'Shift More Devices to Off-Peak',
      description: `Only ${offpeakPercentage.toFixed(0)}% of your energy use is during off-peak hours. Moving more devices to 10pm-6am could save up to ${savingsPercentage.toFixed(0)}%!`,
      color: 'blue',
    });
  }

  // Tip 3: Peak avoidance (multi-device)
  if (isPeakHeavy && devicesWithPeakUsage.length > 0) {
    tips.push({
      icon: <Zap className="w-5 h-5" />,
      title: 'Avoid Peak Hour Overlap',
      description: `${devicesWithPeakUsage.length} device${devicesWithPeakUsage.length !== 1 ? 's are' : ' is'} running during peak hours (6pm-10pm). Peak rates are 2.5x more expensive. Stagger usage to save significantly!`,
      color: 'red',
    });
  }

  // Tip 4: Cooking devices
  if (cookingDevices.length > 0) {
    const cookingWithFuel = cookingDevices.filter((d) => d.alternativeFuel);
    if (cookingWithFuel.length > 0) {
      const mainFuelType = cookingWithFuel[0].alternativeFuel?.type || 'fuel';
      tips.push({
        icon: <TrendingDown className="w-5 h-5" />,
        title: 'Massive Cooking Savings',
        description: `${cookingWithFuel.length} device${cookingWithFuel.length !== 1 ? 's are' : ' is'} using ${mainFuelType}. Switching to electric cooking during off-peak hours can save up to 90% on cooking costs!`,
        color: 'green',
      });
    } else {
      tips.push({
        icon: <Clock className="w-5 h-5" />,
        title: 'Best Times for Cooking',
        description: `You have ${cookingDevices.length} cooking device${cookingDevices.length !== 1 ? 's' : ''}. Cook during off-peak hours (10pm-6am) or early morning (6am-9am) for lowest rates. Meal prep during off-peak hours!`,
        color: 'blue',
      });
    }
  }

  // Tip 5: Heating devices
  if (heatingDevices.length > 0) {
    tips.push({
      icon: <Clock className="w-5 h-5" />,
      title: 'Heat Water During Off-Peak',
      description: `You have ${heatingDevices.length} water heating device${heatingDevices.length !== 1 ? 's' : ''}. Use timer${heatingDevices.length !== 1 ? 's' : ''} to heat water during off-peak hours (10pm-6am) for maximum savings.`,
      color: 'blue',
    });
  }

  // Tip 6: Refrigeration devices (always-on)
  if (refrigerationDevices.length > 0) {
    tips.push({
      icon: <Lightbulb className="w-5 h-5" />,
      title: 'Always-On Device Efficiency',
      description: `Your ${refrigerationDevices.length} refrigeration device${refrigerationDevices.length !== 1 ? 's run' : ' runs'} 24/7. Ensure ${refrigerationDevices.length !== 1 ? 'they\'re' : 'it\'s'} energy-efficient (A+ rating or better) for optimal costs.`,
      color: 'purple',
    });
  }

  // Tip 7: Environmental impact (multi-device with fuel)
  if (devicesWithFuel.length > 0) {
    const hasBiomass = devicesWithFuel.some(
      (d) => d.alternativeFuel?.type === 'charcoal' || d.alternativeFuel?.type === 'firewood'
    );
    if (hasBiomass) {
      tips.push({
        icon: <Leaf className="w-5 h-5" />,
        title: 'Huge Environmental Impact',
        description: `Switching ${devicesWithFuel.length} device${devicesWithFuel.length !== 1 ? 's' : ''} from biomass fuels to electric reduces carbon emissions by up to 95% and helps fight deforestation in Kenya!`,
        color: 'green',
      });
    }
  }

  // Tip 8: Already well optimized
  if (isWellOptimized) {
    tips.push({
      icon: <Lightbulb className="w-5 h-5" />,
      title: 'Excellent Multi-Device Pattern! 🎉',
      description: `${offpeakPercentage.toFixed(0)}% of your ${devices.length}-device energy use is during off-peak hours. This efficient pattern saves money and helps stabilize Kenya's grid!`,
      color: 'green',
    });
  }

  // Tip 9: Grid impact (multi-device)
  if (isPeakHeavy && devices.length > 1) {
    tips.push({
      icon: <Zap className="w-5 h-5" />,
      title: 'Help Stabilize Kenya\'s Grid',
      description: `By coordinating your ${devices.length} devices to avoid peak hours, you reduce grid strain during high-demand periods and help prevent blackouts in your community.`,
      color: 'orange',
    });
  }

  // Tip 10: Coordination opportunity
  if (devices.length > 2 && !isWellOptimized) {
    tips.push({
      icon: <Users className="w-5 h-5" />,
      title: 'Coordinate Device Scheduling',
      description: `With ${devices.length} devices, you can save more by scheduling them to run during the same off-peak window (e.g., 11pm-5am). This maximizes savings without changing your total usage.`,
      color: 'blue',
    });
  }

  const colorClasses: Record<string, { bg: string; border: string; icon: string; text: string }> = {
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: 'text-blue-600',
      text: 'text-blue-900',
    },
    green: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      icon: 'text-green-600',
      text: 'text-green-900',
    },
    red: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: 'text-red-600',
      text: 'text-red-900',
    },
    orange: {
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      icon: 'text-orange-600',
      text: 'text-orange-900',
    },
    purple: {
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      icon: 'text-purple-600',
      text: 'text-purple-900',
    },
  };

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-6 h-6 text-yellow-500" />
          <h3 className="text-xl font-bold text-gray-900">
            💡 Smart Tips & Recommendations
          </h3>
        </div>
        {devices.length > 1 && (
          <div className="flex items-center gap-1 text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
            <Users className="w-4 h-4" />
            <span>{devices.length} devices</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tips.slice(0, 6).map((tip, index) => {
          const colors = colorClasses[tip.color] || colorClasses.blue;
          return (
            <div
              key={index}
              className={`${colors.bg} border ${colors.border} rounded-xl shadow-md p-4 hover:shadow-xl transition-shadow`}
            >
              <div className="flex items-start gap-3">
                <div className={`${colors.icon} mt-0.5 flex-shrink-0`}>
                  {tip.icon}
                </div>
                <div>
                  <h4 className={`font-semibold ${colors.text} mb-2`}>
                    {tip.title}
                  </h4>
                  <p className={`text-sm ${colors.text} opacity-90`}>
                    {tip.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Reference */}
      <div className="mt-6 bg-gray-50 border border-gray-100 rounded-xl shadow-sm p-4">
        <h4 className="font-semibold text-gray-900 mb-3">⚡ Quick TOU Rate Reference</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <div>
              <p className="font-semibold text-gray-900">Off-Peak</p>
              <p className="text-xs text-gray-600">10pm-6am • KES 8/kWh</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500 rounded"></div>
            <div>
              <p className="font-semibold text-gray-900">Mid-Peak</p>
              <p className="text-xs text-gray-600">6am-6pm • KES 12/kWh</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <div>
              <p className="font-semibold text-gray-900">Peak</p>
              <p className="text-xs text-gray-600">6pm-10pm • KES 20/kWh</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

