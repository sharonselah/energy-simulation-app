'use client';

import { TimeBlock } from '@/lib/types';
import Card from '@/components/shared/Card';
import Button from '@/components/shared/Button';
import { Clock, Sunrise, Sun, Sunset, Moon, Info } from 'lucide-react';

interface TimeBlockSelectorProps {
  timeBlocks: TimeBlock[];
  onToggleBlock: (hour: number) => void;
  onBulkSelect?: (hours: number[]) => void;
  duration: number;
  deviceName?: string;
}

export default function TimeBlockSelector({
  timeBlocks,
  onToggleBlock,
  onBulkSelect,
  duration,
  deviceName = 'device',
}: TimeBlockSelectorProps) {
  const selectedCount = timeBlocks.filter((b) => b.isSelected).length;

  // Quick select presets
  const quickPresets = [
    {
      name: 'Morning',
      icon: Sunrise,
      hours: [6, 7, 8, 9],
      description: '6am - 10am',
    },
    {
      name: 'Afternoon',
      icon: Sun,
      hours: [12, 13, 14, 15],
      description: '12pm - 4pm',
    },
    {
      name: 'Evening',
      icon: Sunset,
      hours: [18, 19, 20, 21],
      description: '6pm - 10pm',
    },
    {
      name: 'Night',
      icon: Moon,
      hours: [22, 23, 0, 1, 2, 3, 4, 5],
      description: '10pm - 6am',
    },
  ];

  const handleQuickSelect = (hours: number[]) => {
    if (onBulkSelect) {
      onBulkSelect(hours);
    } else {
      // Fallback: toggle each hour individually
      hours.forEach((hour) => onToggleBlock(hour));
    }
  };

  const getRateColor = (rateType: string) => {
    switch (rateType) {
      case 'peak':
        return 'bg-peak text-white hover:bg-red-600';
      case 'midpeak':
        return 'bg-midpeak text-white hover:bg-yellow-600';
      case 'offpeak':
        return 'bg-offpeak text-white hover:bg-green-600';
      default:
        return 'bg-gray-300 text-gray-900';
    }
  };

  const getRateBorderColor = (rateType: string) => {
    switch (rateType) {
      case 'peak':
        return 'border-peak';
      case 'midpeak':
        return 'border-midpeak';
      case 'offpeak':
        return 'border-offpeak';
      default:
        return 'border-gray-300';
    }
  };

  const formatHour = (hour: number): string => {
    if (hour === 0) return '12am';
    if (hour === 12) return '12pm';
    return hour < 12 ? `${hour}am` : `${hour - 12}pm`;
  };

  return (
    <div className="space-y-6 animate-fadeInUp">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Clock className="w-6 h-6 text-primary" aria-hidden="true" />
          <h2 className="text-xl md:text-2xl font-bold text-primary">
            Select Usage Times
          </h2>
        </div>
        <p className="text-gray-600 text-sm md:text-base">
          Choose when you plan to use your {deviceName}
        </p>
        <p 
          className="text-sm text-gray-500 mt-1"
          role="status"
          aria-live="polite"
        >
          Selected: <strong>{selectedCount} hour{selectedCount !== 1 ? 's' : ''}</strong>
          {duration > 0 && selectedCount !== duration && (
            <span className="text-orange-600 ml-2">
              (Recommended: {duration} hours based on your usage)
            </span>
          )}
        </p>
      </div>

      {/* Quick Select Presets */}
      <Card className="bg-gray-50 shadow-md" ariaLabel="Quick time selection presets">
        <h3 className="font-semibold text-gray-900 mb-3 flex flex-col sm:flex-row sm:items-center gap-2">
          <span>Quick Select</span>
          <span className="text-xs font-normal text-gray-500">(Click to auto-select time periods)</span>
        </h3>
        <div 
          className="grid grid-cols-2 md:grid-cols-4 gap-3"
          role="group"
          aria-label="Time period presets"
        >
          {quickPresets.map((preset, index) => {
            const Icon = preset.icon;
            return (
              <Button
                key={preset.name}
                variant="outline"
                onClick={() => handleQuickSelect(preset.hours)}
                ariaLabel={`Select ${preset.name} hours: ${preset.description}`}
                className="flex flex-col items-center gap-2 h-auto py-3 stagger-item"
                style={{ animationDelay: `${index * 0.1}s` } as React.CSSProperties}
              >
                <Icon className="w-5 h-5" aria-hidden="true" />
                <span className="font-semibold text-xs md:text-sm">{preset.name}</span>
                <span className="text-xs text-gray-500">{preset.description}</span>
              </Button>
            );
          })}
        </div>
      </Card>

      {/* Time Block Grid */}
      <Card ariaLabel="24-hour timeline for selecting usage times">
        <h3 className="font-semibold text-gray-900 mb-4">24-Hour Timeline</h3>
        
        {/* Rate Legend */}
        <div 
          className="flex flex-wrap gap-3 md:gap-4 mb-4 text-xs md:text-sm"
          role="list"
          aria-label="Rate types legend"
        >
          <div className="flex items-center gap-2" role="listitem">
            <div className="w-4 h-4 rounded bg-offpeak" aria-hidden="true"></div>
            <span>Off-Peak (KES 8/kWh)</span>
          </div>
          <div className="flex items-center gap-2" role="listitem">
            <div className="w-4 h-4 rounded bg-midpeak" aria-hidden="true"></div>
            <span>Mid-Peak (KES 12/kWh)</span>
          </div>
          <div className="flex items-center gap-2" role="listitem">
            <div className="w-4 h-4 rounded bg-peak" aria-hidden="true"></div>
            <span>Peak (KES 20/kWh)</span>
          </div>
        </div>

        {/* Hour Blocks */}
        <div 
          className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-12 gap-2"
          role="group"
          aria-label="Hour selection grid"
        >
          {timeBlocks.map((block) => {
            const isSelected = block.isSelected;
            const rateColor = getRateColor(block.rateType);
            const borderColor = getRateBorderColor(block.rateType);

            return (
              <button
                key={block.hour}
                onClick={() => onToggleBlock(block.hour)}
                aria-label={`${formatHour(block.hour)}, ${block.rateType} rate`}
                aria-pressed={isSelected}
                className={`
                  relative aspect-square rounded-xl border 
                  transition-all duration-300 ease-in-out
                  flex flex-col items-center justify-center text-xs font-semibold
                  focus:outline-none focus-visible:ring-4 focus-visible:ring-cta/50
                  ${
                    isSelected
                      ? `${rateColor} shadow-xl scale-105 ring-2 ring-offset-2 ring-opacity-30`
                      : `bg-white ${borderColor} text-gray-700 hover:scale-105 hover:shadow-lg shadow-md`
                  }
                `}
                title={`${formatHour(block.hour)} - ${block.rateType}`}
              >
                <span className={isSelected ? 'text-white' : ''}>
                  {formatHour(block.hour)}
                </span>
                {isSelected && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center text-white text-xs animate-scaleIn">
                    ✓
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Tip */}
        <div 
          className="mt-4 bg-blue-50 border border-blue-100 rounded-xl shadow-sm p-3 flex items-start gap-2 animate-fadeIn"
          role="note"
          aria-label="Tip for saving electricity costs"
        >
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
          <div className="text-xs md:text-sm text-blue-900">
            <strong>💡 Pro Tip:</strong> Use off-peak hours (10pm - 6am) to save up to 60% on electricity costs!
          </div>
        </div>
      </Card>

      {/* Time Visualization Bar */}
      <Card 
        className="bg-gradient-to-r from-offpeak via-midpeak to-peak shadow-lg"
        ariaLabel="Visual representation of daily rate timeline"
      >
        <div className="text-white text-center py-2">
          <p className="text-xs md:text-sm font-semibold mb-1">Daily Rate Timeline</p>
          <div className="flex justify-between text-xs">
            <span>12am</span>
            <span>6am</span>
            <span>12pm</span>
            <span>6pm</span>
            <span>12am</span>
          </div>
        </div>
      </Card>
    </div>
  );
}

