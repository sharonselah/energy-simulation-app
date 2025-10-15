// Constants and reference data for Kenya Energy Simulation

import { Device, TOUTariff, TariffTimeRange, AlternativeFuel } from './types';

// Kenya Time of Use (TOU) Tariff Rates (KES per kWh)
// Based on typical Kenya Power TOU structure
export const TOU_TARIFFS: TOUTariff = {
  peak: 20.0,      // Peak hours: 6pm-10pm
  midpeak: 12.0,   // Mid-peak hours: 6am-6pm (excluding peak)
  offpeak: 8.0,    // Off-peak: 10pm-6am
};

// Time bands for TOU rates (24-hour format)
export const TOU_TIME_BANDS: TariffTimeRange[] = [
  // Off-peak: 10pm-6am (22:00-06:00)
  { start: 22, end: 23, type: 'offpeak' },
  { start: 0, end: 5, type: 'offpeak' },
  
  // Mid-peak: 6am-6pm (06:00-18:00)
  { start: 6, end: 17, type: 'midpeak' },
  
  // Peak: 6pm-10pm (18:00-22:00)
  { start: 18, end: 21, type: 'peak' },
];

// Device catalog with typical Kenyan market specifications
// Core devices for the simulation game
export const DEVICE_CATALOG: Device[] = [
  {
    id: 'electric-pressure-cooker',
    name: 'Electric Pressure Cooker (EPC)',
    type: 'Electric Pressure Cooker',
    category: 'cooking',
    wattage: 1000, // Reference value, user can override
    typicalUsageHours: 1.5,
    requiresAlternativeFuel: true,
    loadProfileType: 'pulsing',
  },
  {
    id: 'induction-cooker',
    name: 'Induction Cooker',
    type: 'Induction Cooker',
    category: 'cooking',
    wattage: 2000, // Reference value, user can override
    typicalUsageHours: 2,
    requiresAlternativeFuel: true,
    loadProfileType: 'pulsing',
  },
  {
    id: 'led-bulb',
    name: 'LED Bulb',
    type: 'LED Bulb',
    category: 'lighting',
    wattage: 10, // Reference value, user can override
    typicalUsageHours: 6,
    requiresAlternativeFuel: false,
    loadProfileType: 'continuous',
  },
  {
    id: 'fridge',
    name: 'Refrigerator',
    type: 'Refrigerator',
    category: 'refrigeration',
    wattage: 150, // Reference value, user can override
    typicalUsageHours: 24,
    requiresAlternativeFuel: false,
    loadProfileType: 'cycling',
  },
  {
    id: 'tv',
    name: 'Smart TV',
    type: 'Television',
    category: 'other',
    wattage: 90, // Reference value, user can override
    typicalUsageHours: 5,
    requiresAlternativeFuel: false,
    loadProfileType: 'continuous',
  },
  {
    id: 'fan',
    name: 'Electric Fan',
    type: 'Fan',
    category: 'other',
    wattage: 75, // Reference value, user can override
    typicalUsageHours: 8,
    requiresAlternativeFuel: false,
    loadProfileType: 'cycling',
  },
];

// Alternative Fuel Costs (Kenya market prices)
export const ALTERNATIVE_FUELS: Record<string, Omit<AlternativeFuel, 'dailyConsumption'>> = {
  charcoal: {
    type: 'charcoal',
    costPerUnit: 150, // KES per kg
    unit: 'kg',
  },
  lpg: {
    type: 'lpg',
    costPerUnit: 150, // KES per kg (13kg cylinder ~1950 KES)
    unit: 'kg',
  },
  kerosene: {
    type: 'kerosene',
    costPerUnit: 130, // KES per liter
    unit: 'liter',
  },
  firewood: {
    type: 'firewood',
    costPerUnit: 50, // KES per kg
    unit: 'kg',
  },
};

// Typical daily consumption for alternative fuels (for standard cooking)
export const FUEL_DAILY_CONSUMPTION: Record<string, number> = {
  charcoal: 1.5, // kg per day for typical family
  lpg: 0.4, // kg per day
  kerosene: 0.5, // liters per day
  firewood: 3, // kg per day
};

// CO2 Emission Factors (kg CO2 per kWh or per unit)
// Based on Kenya-specific emission research and fuel characteristics
export const EMISSION_FACTORS = {
  electricity: 0.45, // kg CO2 per kWh (Kenya grid mix - mainly hydro, geothermal, and thermal)
  charcoal: 9.5, // kg CO2 per kg (high emissions due to production process and combustion)
  lpg: 3.0, // kg CO2 per kg (relatively clean burning fossil fuel)
  kerosene: 2.5, // kg CO2 per liter (petroleum-based fuel)
  firewood: 1.8, // kg CO2 per kg (renewable but releases CO2 when burned)
};

// Tree CO2 absorption rate
export const TREE_CO2_ABSORPTION_PER_YEAR = 21; // kg CO2 per tree per year

// Grid stress thresholds
export const GRID_STRESS_WEIGHTS = {
  peak: 3,
  midpeak: 2,
  offpeak: 1,
};

export const GRID_STRESS_THRESHOLDS = {
  low: 5,
  medium: 10,
  high: 15,
};

// Efficiency score weights
export const EFFICIENCY_SCORE_WEIGHTS = {
  offPeakPercentage: 0.4,
  loadFactor: 0.3,
  gridStress: 0.3,
};

