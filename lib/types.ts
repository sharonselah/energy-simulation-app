// TypeScript type definitions for the Energy Simulation Game

export type LoadProfileType = 'continuous' | 'pulsing' | 'cycling';

export interface Device {
  id: string;
  name: string;
  type: string;
  category: 'cooking' | 'heating' | 'refrigeration' | 'lighting' | 'other';
  wattage: number;
  typicalUsageHours?: number;
  requiresAlternativeFuel?: boolean;
  loadProfileType: LoadProfileType;
}

export interface TimeBlock {
  hour: number;
  isSelected: boolean;
  rateType: 'peak' | 'midpeak' | 'offpeak';
}

export interface UsagePattern {
  device: Device;
  timeBlocks: TimeBlock[];
  duration: number; // hours per day
}

export interface CostBreakdown {
  daily: number;
  monthly: number;
  annual: number;
  breakdown?: {
    peak?: number;
    midpeak?: number;
    offpeak?: number;
  };
}

export interface AlternativeFuel {
  type: 'charcoal' | 'lpg' | 'kerosene' | 'firewood';
  costPerUnit: number;
  dailyConsumption: number;
  unit: string;
}

export interface EmissionData {
  current: number; // kg CO2 per month
  baseline: number; // baseline emissions (alternative fuel or standard grid)
  saved: number; // positive = saved, negative = increased
  treesEquivalent: number;
}

export interface GridMetrics {
  peakUsage: number; // kWh during peak hours
  midPeakUsage: number; // kWh during mid-peak hours
  offPeakUsage: number; // kWh during off-peak hours
  loadFactor: number; // 0-100%
  stressScore: number; // calculated stress on grid
  efficiencyScore: number; // 0-10 composite score
}

export interface TOUTariff {
  peak: number;
  midpeak: number;
  offpeak: number;
}

export interface TariffTimeRange {
  start: number;
  end: number;
  type: 'peak' | 'midpeak' | 'offpeak';
}

// Multi-Device Support Interfaces

export interface SelectedDevice {
  id: string; // unique identifier for this device instance
  device: Device;
  timeBlocks: TimeBlock[];
  duration: number; // hours per day
  alternativeFuel?: AlternativeFuel; // for cooking devices
  mealsPerDay?: number; // for cooking devices
}

export interface LoadProfilePoint {
  hour: number;
  totalLoad: number; // kW - combined load from all devices
  deviceLoads: { [deviceId: string]: number }; // kW per device
  rateType: 'peak' | 'midpeak' | 'offpeak';
  cost: number; // cost for this hour
}

export interface AggregatedCosts {
  total: CostBreakdown;
  byDevice: { [deviceId: string]: CostBreakdown };
  breakdown: {
    peak: number;
    midpeak: number;
    offpeak: number;
  };
}

export interface AggregatedGridMetrics extends GridMetrics {
  totalDailyKWh: number;
  peakLoadHour: number; // hour with highest combined load
  deviceContributions: { [deviceId: string]: number }; // percentage contribution to total load
}

export interface MultiDeviceState {
  devices: SelectedDevice[];
  aggregatedCosts: {
    scenarioA: AggregatedCosts; // current (alternative fuels/grid)
    scenarioB: AggregatedCosts; // electric with current usage
    scenarioC: AggregatedCosts; // optimized TOU
  };
  aggregatedMetrics: AggregatedGridMetrics;
  loadProfile: LoadProfilePoint[];
  optimizedLoadProfile: LoadProfilePoint[];
}

export interface DeviceSavings {
  deviceId: string;
  deviceName: string;
  currentCost: number;
  electricCost: number;
  optimizedCost: number;
  monthlySavings: number;
  annualSavings: number;
  percentageSavings: number;
}

