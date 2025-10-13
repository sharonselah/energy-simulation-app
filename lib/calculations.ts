// Calculation functions for cost, emissions, and grid metrics

import {
  Device,
  TimeBlock,
  CostBreakdown,
  GridMetrics,
  EmissionData,
  AlternativeFuel,
  SelectedDevice,
  AggregatedCosts,
  LoadProfilePoint,
  AggregatedGridMetrics,
  DeviceSavings,
} from './types';
import {
  TOU_TARIFFS,
  EMISSION_FACTORS,
  TREE_CO2_ABSORPTION_PER_YEAR,
  GRID_STRESS_WEIGHTS,
  EFFICIENCY_SCORE_WEIGHTS,
  TOU_TIME_BANDS,
} from './constants';

/**
 * Calculate basic electricity cost
 */
export function calculateElectricityCost(
  wattage: number,
  hours: number,
  tariffRate: number
): number {
  const kWh = (wattage * hours) / 1000;
  return kWh * tariffRate;
}

/**
 * Get rate type for a given hour
 */
export function getRateTypeForHour(hour: number): 'peak' | 'midpeak' | 'offpeak' {
  const band = TOU_TIME_BANDS.find(
    (band) => hour >= band.start && hour <= band.end
  );
  return band?.type || 'midpeak';
}

/**
 * Calculate TOU cost based on usage pattern
 */
export function calculateTOUCost(
  device: Device,
  timeBlocks: TimeBlock[],
  hoursPerDay: number
): CostBreakdown {
  const selectedBlocks = timeBlocks.filter((block) => block.isSelected);
  const hoursPerBlock = hoursPerDay / selectedBlocks.length || 0;

  let peakCost = 0;
  let midpeakCost = 0;
  let offpeakCost = 0;

  selectedBlocks.forEach((block) => {
    const cost = calculateElectricityCost(
      device.wattage,
      hoursPerBlock,
      TOU_TARIFFS[block.rateType]
    );

    if (block.rateType === 'peak') peakCost += cost;
    else if (block.rateType === 'midpeak') midpeakCost += cost;
    else offpeakCost += cost;
  });

  const daily = peakCost + midpeakCost + offpeakCost;

  return {
    daily,
    monthly: daily * 30,
    annual: daily * 365,
    breakdown: {
      peak: peakCost,
      midpeak: midpeakCost,
      offpeak: offpeakCost,
    },
  };
}

/**
 * Calculate alternative fuel cost
 */
export function calculateFuelCost(
  fuel: AlternativeFuel,
  days: number = 1
): number {
  return fuel.costPerUnit * fuel.dailyConsumption * days;
}

/**
 * Calculate fuel cost breakdown
 */
export function calculateFuelCostBreakdown(
  fuel: AlternativeFuel
): CostBreakdown {
  const daily = calculateFuelCost(fuel, 1);
  return {
    daily,
    monthly: daily * 30,
    annual: daily * 365,
  };
}

/**
 * Calculate CO2 emissions for electricity
 */
export function calculateElectricityCO2(kWh: number): number {
  return kWh * EMISSION_FACTORS.electricity;
}

/**
 * Calculate CO2 emissions for alternative fuel
 */
export function calculateFuelCO2(fuel: AlternativeFuel, days: number = 30): number {
  const consumption = fuel.dailyConsumption * days;
  return consumption * EMISSION_FACTORS[fuel.type];
}

/**
 * Calculate total kWh from usage pattern
 */
export function calculateTotalKWh(
  device: Device,
  hoursPerDay: number
): number {
  return (device.wattage * hoursPerDay) / 1000;
}

/**
 * Calculate emission data comparing current to baseline
 */
export function calculateEmissionData(
  currentKWh: number,
  baselineFuel?: AlternativeFuel
): EmissionData {
  const current = calculateElectricityCO2(currentKWh * 30); // Monthly

  let baseline = current;
  if (baselineFuel) {
    baseline = calculateFuelCO2(baselineFuel, 30);
  }

  const saved = baseline - current;
  const treesEquivalent = (saved * 12) / TREE_CO2_ABSORPTION_PER_YEAR;

  return {
    current,
    baseline,
    saved,
    treesEquivalent: Math.max(0, treesEquivalent),
  };
}

/**
 * Calculate grid usage distribution
 */
export function calculateGridDistribution(
  device: Device,
  timeBlocks: TimeBlock[],
  hoursPerDay: number
): { peak: number; midpeak: number; offpeak: number } {
  const selectedBlocks = timeBlocks.filter((block) => block.isSelected);
  const hoursPerBlock = hoursPerDay / selectedBlocks.length || 0;
  const kWhPerBlock = (device.wattage * hoursPerBlock) / 1000;

  let peak = 0;
  let midpeak = 0;
  let offpeak = 0;

  selectedBlocks.forEach((block) => {
    if (block.rateType === 'peak') peak += kWhPerBlock;
    else if (block.rateType === 'midpeak') midpeak += kWhPerBlock;
    else offpeak += kWhPerBlock;
  });

  return { peak, midpeak, offpeak };
}

/**
 * Calculate load factor
 */
export function calculateLoadFactor(
  averageLoad: number,
  peakLoad: number
): number {
  if (peakLoad === 0) return 0;
  return (averageLoad / peakLoad) * 100;
}

/**
 * Calculate grid stress score
 */
export function calculateGridStress(
  peakKWh: number,
  midPeakKWh: number,
  offPeakKWh: number
): number {
  return (
    peakKWh * GRID_STRESS_WEIGHTS.peak +
    midPeakKWh * GRID_STRESS_WEIGHTS.midpeak +
    offPeakKWh * GRID_STRESS_WEIGHTS.offpeak
  );
}

/**
 * Calculate efficiency score (0-10)
 */
export function calculateEfficiencyScore(
  offPeakPercentage: number,
  loadFactor: number,
  gridStress: number
): number {
  // Normalize grid stress (lower is better)
  const normalizedStress = Math.max(0, 100 - gridStress * 5);

  const score =
    offPeakPercentage * EFFICIENCY_SCORE_WEIGHTS.offPeakPercentage +
    loadFactor * EFFICIENCY_SCORE_WEIGHTS.loadFactor +
    normalizedStress * EFFICIENCY_SCORE_WEIGHTS.gridStress;

  return Math.min(10, Math.max(0, score / 10));
}

/**
 * Calculate comprehensive grid metrics
 */
export function calculateGridMetrics(
  device: Device,
  timeBlocks: TimeBlock[],
  hoursPerDay: number
): GridMetrics {
  const distribution = calculateGridDistribution(device, timeBlocks, hoursPerDay);
  const totalKWh = distribution.peak + distribution.midpeak + distribution.offpeak;

  const offPeakPercentage = totalKWh > 0 ? (distribution.offpeak / totalKWh) * 100 : 0;

  // For load factor, estimate peak load vs average
  const peakLoad = device.wattage / 1000; // kW
  const averageLoad = totalKWh / 24; // Average over 24 hours

  const loadFactor = calculateLoadFactor(averageLoad, peakLoad);
  const stressScore = calculateGridStress(
    distribution.peak,
    distribution.midpeak,
    distribution.offpeak
  );
  const efficiencyScore = calculateEfficiencyScore(
    offPeakPercentage,
    loadFactor,
    stressScore
  );

  return {
    peakUsage: distribution.peak,
    midPeakUsage: distribution.midpeak,
    offPeakUsage: distribution.offpeak,
    loadFactor,
    stressScore,
    efficiencyScore,
  };
}

/**
 * Generate optimized time blocks (maximize off-peak usage)
 */
export function generateOptimizedTimeBlocks(hoursNeeded: number): TimeBlock[] {
  const timeBlocks: TimeBlock[] = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    isSelected: false,
    rateType: getRateTypeForHour(i),
  }));

  // Priority: off-peak > mid-peak > peak
  const offPeakBlocks = timeBlocks.filter((b) => b.rateType === 'offpeak');
  const midPeakBlocks = timeBlocks.filter((b) => b.rateType === 'midpeak');
  const peakBlocks = timeBlocks.filter((b) => b.rateType === 'peak');

  let remaining = hoursNeeded;

  // Select off-peak first
  const offPeakToSelect = Math.min(remaining, offPeakBlocks.length);
  for (let i = 0; i < offPeakToSelect; i++) {
    offPeakBlocks[i].isSelected = true;
    remaining--;
  }

  // Then mid-peak if needed
  const midPeakToSelect = Math.min(remaining, midPeakBlocks.length);
  for (let i = 0; i < midPeakToSelect; i++) {
    midPeakBlocks[i].isSelected = true;
    remaining--;
  }

  // Finally peak if absolutely necessary
  const peakToSelect = Math.min(remaining, peakBlocks.length);
  for (let i = 0; i < peakToSelect; i++) {
    peakBlocks[i].isSelected = true;
    remaining--;
  }

  return timeBlocks;
}

// =============================================================================
// MULTI-DEVICE AGGREGATION FUNCTIONS
// =============================================================================

/**
 * Aggregate costs across multiple devices
 */
export function aggregateMultiDeviceCosts(
  devices: SelectedDevice[],
  scenario: 'current' | 'electric' | 'optimized'
): AggregatedCosts {
  if (devices.length === 0) {
    return {
      total: { daily: 0, monthly: 0, annual: 0 },
      byDevice: {},
      breakdown: { peak: 0, midpeak: 0, offpeak: 0 },
    };
  }

  let totalDaily = 0;
  let totalPeak = 0;
  let totalMidpeak = 0;
  let totalOffpeak = 0;
  const byDevice: { [deviceId: string]: CostBreakdown } = {};

  devices.forEach((selectedDevice) => {
    let deviceCost: CostBreakdown;

    if (scenario === 'current') {
      // Scenario A: Current costs (alternative fuel or current grid usage)
      if (selectedDevice.alternativeFuel) {
        deviceCost = calculateFuelCostBreakdown(selectedDevice.alternativeFuel);
      } else {
        deviceCost = calculateTOUCost(
          selectedDevice.device,
          selectedDevice.timeBlocks,
          selectedDevice.duration
        );
      }
    } else if (scenario === 'electric') {
      // Scenario B: Electric with current usage pattern
      deviceCost = calculateTOUCost(
        selectedDevice.device,
        selectedDevice.timeBlocks,
        selectedDevice.duration
      );
    } else {
      // Scenario C: Optimized TOU
      const optimizedBlocks = generateOptimizedTimeBlocks(selectedDevice.duration);
      deviceCost = calculateTOUCost(
        selectedDevice.device,
        optimizedBlocks,
        selectedDevice.duration
      );
    }

    totalDaily += deviceCost.daily;
    if (deviceCost.breakdown) {
      totalPeak += deviceCost.breakdown.peak || 0;
      totalMidpeak += deviceCost.breakdown.midpeak || 0;
      totalOffpeak += deviceCost.breakdown.offpeak || 0;
    }

    byDevice[selectedDevice.id] = deviceCost;
  });

  return {
    total: {
      daily: totalDaily,
      monthly: totalDaily * 30,
      annual: totalDaily * 365,
    },
    byDevice,
    breakdown: {
      peak: totalPeak,
      midpeak: totalMidpeak,
      offpeak: totalOffpeak,
    },
  };
}

/**
 * Combine load profiles from multiple devices
 */
export function combineLoadProfiles(
  devices: SelectedDevice[],
  optimized: boolean = false
): LoadProfilePoint[] {
  const loadProfile: LoadProfilePoint[] = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    totalLoad: 0,
    deviceLoads: {},
    rateType: getRateTypeForHour(hour),
    cost: 0,
  }));

  devices.forEach((selectedDevice) => {
    const timeBlocks = optimized
      ? generateOptimizedTimeBlocks(selectedDevice.duration)
      : selectedDevice.timeBlocks;

    const selectedBlocks = timeBlocks.filter((b) => b.isSelected);
    const hoursPerBlock = selectedDevice.duration / selectedBlocks.length || 0;

    selectedBlocks.forEach((block) => {
      const loadInKW = selectedDevice.device.wattage / 1000;
      const hourLoad = (loadInKW * hoursPerBlock) / 1; // Load for this hour
      
      loadProfile[block.hour].totalLoad += hourLoad;
      loadProfile[block.hour].deviceLoads[selectedDevice.id] = 
        (loadProfile[block.hour].deviceLoads[selectedDevice.id] || 0) + hourLoad;
      
      // Calculate cost for this hour
      const hourCost = calculateElectricityCost(
        selectedDevice.device.wattage,
        hoursPerBlock,
        TOU_TARIFFS[block.rateType]
      );
      loadProfile[block.hour].cost += hourCost;
    });
  });

  return loadProfile;
}

/**
 * Aggregate grid metrics across multiple devices
 */
export function aggregateGridMetrics(devices: SelectedDevice[]): AggregatedGridMetrics {
  if (devices.length === 0) {
    return {
      peakUsage: 0,
      midPeakUsage: 0,
      offPeakUsage: 0,
      loadFactor: 0,
      stressScore: 0,
      efficiencyScore: 0,
      totalDailyKWh: 0,
      peakLoadHour: 0,
      deviceContributions: {},
    };
  }

  let totalPeakKWh = 0;
  let totalMidPeakKWh = 0;
  let totalOffPeakKWh = 0;
  const deviceKWh: { [deviceId: string]: number } = {};

  // Calculate distribution for each device
  devices.forEach((selectedDevice) => {
    const distribution = calculateGridDistribution(
      selectedDevice.device,
      selectedDevice.timeBlocks,
      selectedDevice.duration
    );

    totalPeakKWh += distribution.peak;
    totalMidPeakKWh += distribution.midpeak;
    totalOffPeakKWh += distribution.offpeak;

    const deviceTotal = distribution.peak + distribution.midpeak + distribution.offpeak;
    deviceKWh[selectedDevice.id] = deviceTotal;
  });

  const totalDailyKWh = totalPeakKWh + totalMidPeakKWh + totalOffPeakKWh;
  const offPeakPercentage = totalDailyKWh > 0 ? (totalOffPeakKWh / totalDailyKWh) * 100 : 0;

  // Calculate combined load profile to find peak hour
  const loadProfile = combineLoadProfiles(devices);
  const peakLoadHour = loadProfile.reduce((maxHour, point, hour) =>
    point.totalLoad > loadProfile[maxHour].totalLoad ? hour : maxHour
  , 0);

  // Calculate peak load and average load
  const maxLoad = Math.max(...loadProfile.map(p => p.totalLoad));
  const averageLoad = totalDailyKWh / 24;

  const loadFactor = calculateLoadFactor(averageLoad, maxLoad);
  const stressScore = calculateGridStress(totalPeakKWh, totalMidPeakKWh, totalOffPeakKWh);
  const efficiencyScore = calculateEfficiencyScore(offPeakPercentage, loadFactor, stressScore);

  // Calculate device contributions
  const deviceContributions: { [deviceId: string]: number } = {};
  Object.keys(deviceKWh).forEach((deviceId) => {
    deviceContributions[deviceId] = totalDailyKWh > 0 
      ? (deviceKWh[deviceId] / totalDailyKWh) * 100 
      : 0;
  });

  return {
    peakUsage: totalPeakKWh,
    midPeakUsage: totalMidPeakKWh,
    offPeakUsage: totalOffPeakKWh,
    loadFactor,
    stressScore,
    efficiencyScore,
    totalDailyKWh,
    peakLoadHour,
    deviceContributions,
  };
}

/**
 * Generate optimized schedule for multiple devices
 */
export function optimizeMultiDeviceSchedule(
  devices: SelectedDevice[]
): SelectedDevice[] {
  return devices.map((device) => ({
    ...device,
    timeBlocks: generateOptimizedTimeBlocks(device.duration),
  }));
}

/**
 * Calculate individual device savings
 */
export function calculateDeviceSavings(
  device: SelectedDevice,
  scenarioACost: CostBreakdown,
  scenarioBCost: CostBreakdown,
  scenarioCCost: CostBreakdown
): DeviceSavings {
  const monthlySavings = scenarioACost.monthly - scenarioCCost.monthly;
  const annualSavings = scenarioACost.annual - scenarioCCost.annual;
  const percentageSavings = scenarioACost.monthly > 0
    ? ((monthlySavings / scenarioACost.monthly) * 100)
    : 0;

  return {
    deviceId: device.id,
    deviceName: device.device.name,
    currentCost: scenarioACost.monthly,
    electricCost: scenarioBCost.monthly,
    optimizedCost: scenarioCCost.monthly,
    monthlySavings,
    annualSavings,
    percentageSavings,
  };
}

/**
 * Calculate aggregate emissions for multiple devices
 */
export function aggregateMultiDeviceEmissions(
  devices: SelectedDevice[]
): EmissionData {
  if (devices.length === 0) {
    return {
      current: 0,
      baseline: 0,
      saved: 0,
      treesEquivalent: 0,
    };
  }

  let totalCurrent = 0;
  let totalBaseline = 0;

  devices.forEach((selectedDevice) => {
    const totalKWh = calculateTotalKWh(selectedDevice.device, selectedDevice.duration);
    const emissions = calculateEmissionData(totalKWh, selectedDevice.alternativeFuel);
    
    totalCurrent += emissions.current;
    totalBaseline += emissions.baseline;
  });

  const saved = totalBaseline - totalCurrent;
  const treesEquivalent = (saved * 12) / TREE_CO2_ABSORPTION_PER_YEAR;

  return {
    current: totalCurrent,
    baseline: totalBaseline,
    saved,
    treesEquivalent: Math.max(0, treesEquivalent),
  };
}

/**
 * Format currency value to Kenyan Shillings (KES)
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

