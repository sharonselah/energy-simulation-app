'use client';

import React, { createContext, useContext, useState, ReactNode, useMemo } from 'react';
import { Device, TimeBlock, AlternativeFuel, SelectedDevice, MultiDeviceState, DeviceBrandSelection } from '@/lib/types';
import { 
  getRateTypeForHour, 
  aggregateMultiDeviceCosts,
  aggregateGridMetrics,
  combineLoadProfiles,
} from '@/lib/calculations';
import { DEVICE_CATALOG, ALTERNATIVE_FUELS, FUEL_DAILY_CONSUMPTION } from '@/lib/constants';

interface AppContextType {
  // Multi-device state
  devices: SelectedDevice[];
  
  // Device management
  addDevice: (device: Device) => string; // Returns device ID
  updateDevice: (deviceId: string, updates: Partial<SelectedDevice>) => void;
  removeDevice: (deviceId: string) => void;
  getDevice: (deviceId: string) => SelectedDevice | undefined;
  clearAllDevices: () => void;
  
  // Current device being configured (before adding to list)
  currentDevice: Device | null;
  setCurrentDevice: React.Dispatch<React.SetStateAction<Device | null>>;
  currentTimeBlocks: TimeBlock[];
  setCurrentTimeBlocks: React.Dispatch<React.SetStateAction<TimeBlock[]>>;
  toggleCurrentTimeBlock: (hour: number) => void;
  currentDuration: number;
  setCurrentDuration: React.Dispatch<React.SetStateAction<number>>;
  currentAlternativeFuel: AlternativeFuel | null;
  setCurrentAlternativeFuel: React.Dispatch<React.SetStateAction<AlternativeFuel | null>>;
  currentMealsPerDay: number;
  setCurrentMealsPerDay: React.Dispatch<React.SetStateAction<number>>;
  
  // Complete device configuration and add to devices list
  completeDeviceConfiguration: () => void;
  
  // Aggregated calculations (computed)
  multiDeviceState: MultiDeviceState;
  
  // Time block helpers for editing devices
  updateDeviceTimeBlocks: (deviceId: string, blocks: TimeBlock[]) => void;
  toggleDeviceTimeBlock: (deviceId: string, hour: number) => void;
  
  // Reset functions
  resetCurrentConfiguration: () => void;
  resetAll: () => void;
  
  // Bulk operations
  loadDevices: (devices: SelectedDevice[]) => void;
  loadDefaultScenario: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Initialize 24-hour time blocks
const initializeTimeBlocks = (): TimeBlock[] => {
  return Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    isSelected: false,
    rateType: getRateTypeForHour(i),
  }));
};

// Generate unique ID for devices
const generateDeviceId = () => {
  return `device-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

const findDeviceById = (deviceId: string): Device => {
  const device = DEVICE_CATALOG.find((entry) => entry.id === deviceId);
  if (!device) {
    throw new Error(`Device with id "${deviceId}" not found in catalog`);
  }
  return { ...device };
};

const createScenarioTimeBlocks = (selectedHours: number[]): TimeBlock[] => {
  const hoursSet = new Set(selectedHours);
  return initializeTimeBlocks().map((block) => ({
    ...block,
    isSelected: hoursSet.has(block.hour),
  }));
};

type ScenarioDeviceOptions = {
  selectedHours: number[];
  duration: number;
  wattageOverride?: number;
  brandSelection?: DeviceBrandSelection;
  mealsPerDay?: number;
  alternativeFuelKey?: keyof typeof ALTERNATIVE_FUELS;
};

const buildScenarioDevice = (deviceId: string, options: ScenarioDeviceOptions): SelectedDevice => {
  const baseDevice = findDeviceById(deviceId);
  const wattage = options.wattageOverride ?? baseDevice.wattage;

  const brandSelection = options.brandSelection;
  const alternativeFuel = options.alternativeFuelKey
    ? {
        ...ALTERNATIVE_FUELS[options.alternativeFuelKey],
        dailyConsumption: FUEL_DAILY_CONSUMPTION[options.alternativeFuelKey],
      }
    : undefined;

  return {
    id: generateDeviceId(),
    device: {
      ...baseDevice,
      wattage,
      brandSelection,
    },
    timeBlocks: createScenarioTimeBlocks(options.selectedHours),
    duration: options.duration,
    alternativeFuel,
    mealsPerDay: options.mealsPerDay,
    brandSelection,
  };
};

const createDefaultScenarioDevices = (): SelectedDevice[] => {
  const fullDayHours = Array.from({ length: 24 }, (_, hour) => hour);

  const fridge = buildScenarioDevice('fridge', {
    selectedHours: fullDayHours,
    duration: 24,
    wattageOverride: 160,
    brandSelection: {
      source: 'generic',
      sizeLabel: '260L Double Door',
      wattage: 160,
    },
  });

  const tv = buildScenarioDevice('tv', {
    selectedHours: [17, 18, 19, 20, 21],
    duration: 5,
    wattageOverride: 110,
    brandSelection: {
      source: 'generic',
      sizeLabel: '55 inch LED',
      wattage: 110,
    },
  });

  const inductionCooker = buildScenarioDevice('induction-cooker', {
    selectedHours: [7, 12, 19],
    duration: 3,
    wattageOverride: 1800,
    mealsPerDay: 3,
    alternativeFuelKey: 'lpg',
    brandSelection: {
      source: 'generic',
      sizeLabel: 'Single burner',
      wattage: 1800,
    },
  });

  const eveningBulb = buildScenarioDevice('led-bulb', {
    selectedHours: [18, 19, 20, 21],
    duration: 4,
    wattageOverride: 10,
    brandSelection: {
      source: 'generic',
      sizeLabel: 'Warm white 10W',
      wattage: 10,
    },
  });

  return [fridge, tv, inductionCooker, eveningBulb];
};

export function AppProvider({ children }: { children: ReactNode }) {
  // Multi-device array
  const [devices, setDevices] = useState<SelectedDevice[]>([]);
  
  // Current device being configured
  const [currentDevice, setCurrentDevice] = useState<Device | null>(null);
  const [currentTimeBlocks, setCurrentTimeBlocks] = useState<TimeBlock[]>(initializeTimeBlocks());
  const [currentDuration, setCurrentDuration] = useState<number>(1);
  const [currentAlternativeFuel, setCurrentAlternativeFuel] = useState<AlternativeFuel | null>(null);
  const [currentMealsPerDay, setCurrentMealsPerDay] = useState<number>(2);

  // Add a new device to the list
  const addDevice = (device: Device): string => {
    const newDevice: SelectedDevice = {
      id: generateDeviceId(),
      device: { ...device },
      timeBlocks: initializeTimeBlocks(),
      duration: device.category === 'refrigeration' ? 24 : 1,
      alternativeFuel: device.requiresAlternativeFuel ? undefined : undefined,
      mealsPerDay: device.category === 'cooking' ? 2 : undefined,
      brandSelection: device.brandSelection,
    };
    
    setDevices((prev) => [...prev, newDevice]);
    return newDevice.id;
  };

  // Update an existing device
  const updateDevice = (deviceId: string, updates: Partial<SelectedDevice>) => {
    setDevices((prev) =>
      prev.map((d) => (d.id === deviceId ? { ...d, ...updates } : d))
    );
  };

  // Remove a device
  const removeDevice = (deviceId: string) => {
    setDevices((prev) => prev.filter((d) => d.id !== deviceId));
  };

  // Get a specific device
  const getDevice = (deviceId: string): SelectedDevice | undefined => {
    return devices.find((d) => d.id === deviceId);
  };

  // Clear all devices
  const clearAllDevices = () => {
    setDevices([]);
  };

  // Toggle time block for current device being configured
  const toggleCurrentTimeBlock = (hour: number) => {
    setCurrentTimeBlocks((prev) =>
      prev.map((block) =>
        block.hour === hour
          ? { ...block, isSelected: !block.isSelected }
          : block
      )
    );
  };

  // Update time blocks for a specific device
  const updateDeviceTimeBlocks = (deviceId: string, blocks: TimeBlock[]) => {
    updateDevice(deviceId, { timeBlocks: blocks });
  };

  // Toggle time block for a specific device
  const toggleDeviceTimeBlock = (deviceId: string, hour: number) => {
    const device = getDevice(deviceId);
    if (device) {
      const updatedBlocks = device.timeBlocks.map((block) =>
        block.hour === hour ? { ...block, isSelected: !block.isSelected } : block
      );
      updateDeviceTimeBlocks(deviceId, updatedBlocks);
    }
  };

  // Complete device configuration and add to list
  const completeDeviceConfiguration = () => {
    if (!currentDevice) return;

    const newDevice: SelectedDevice = {
      id: generateDeviceId(),
      device: { ...currentDevice },
      timeBlocks: currentTimeBlocks,
      duration: currentDuration,
      alternativeFuel: currentAlternativeFuel || undefined,
      mealsPerDay: currentMealsPerDay,
      brandSelection: currentDevice.brandSelection,
    };

    setDevices((prev) => [...prev, newDevice]);
    resetCurrentConfiguration();
  };

  // Reset current configuration
  const resetCurrentConfiguration = () => {
    setCurrentDevice(null);
    setCurrentTimeBlocks(initializeTimeBlocks());
    setCurrentDuration(1);
    setCurrentAlternativeFuel(null);
    setCurrentMealsPerDay(2);
  };

  // Reset everything
  const resetAll = () => {
    setDevices([]);
    resetCurrentConfiguration();
  };

  // Load devices from external source (e.g., history)
  const loadDevices = (newDevices: SelectedDevice[]) => {
    setDevices(newDevices);
  };

  const loadDefaultScenario = () => {
    const scenarioDevices = createDefaultScenarioDevices();
    setDevices(scenarioDevices);
    resetCurrentConfiguration();
  };

  // Compute aggregated multi-device state
  const multiDeviceState: MultiDeviceState = useMemo(() => {
    if (devices.length === 0) {
      return {
        devices: [],
        aggregatedCosts: {
          scenarioA: {
            total: { daily: 0, monthly: 0, annual: 0 },
            byDevice: {},
            breakdown: { peak: 0, midpeak: 0, offpeak: 0 },
          },
          scenarioB: {
            total: { daily: 0, monthly: 0, annual: 0 },
            byDevice: {},
            breakdown: { peak: 0, midpeak: 0, offpeak: 0 },
          },
          scenarioC: {
            total: { daily: 0, monthly: 0, annual: 0 },
            byDevice: {},
            breakdown: { peak: 0, midpeak: 0, offpeak: 0 },
          },
        },
        aggregatedMetrics: {
          peakUsage: 0,
          midPeakUsage: 0,
          offPeakUsage: 0,
          loadFactor: 0,
          stressScore: 0,
          efficiencyScore: 0,
          totalDailyKWh: 0,
          peakLoadHour: 0,
          deviceContributions: {},
        },
        loadProfile: [],
        optimizedLoadProfile: [],
      };
    }

    const scenarioA = aggregateMultiDeviceCosts(devices, 'current');
    const scenarioB = aggregateMultiDeviceCosts(devices, 'electric');
    const scenarioC = aggregateMultiDeviceCosts(devices, 'optimized');
    const aggregatedMetrics = aggregateGridMetrics(devices);
    const loadProfile = combineLoadProfiles(devices, false);
    const optimizedLoadProfile = combineLoadProfiles(devices, true);

    return {
      devices,
      aggregatedCosts: {
        scenarioA,
        scenarioB,
        scenarioC,
      },
      aggregatedMetrics,
      loadProfile,
      optimizedLoadProfile,
    };
  }, [devices]);

  return (
    <AppContext.Provider
      value={{
        devices,
        addDevice,
        updateDevice,
        removeDevice,
        getDevice,
        clearAllDevices,
        currentDevice,
        setCurrentDevice,
        currentTimeBlocks,
        setCurrentTimeBlocks,
        toggleCurrentTimeBlock,
        currentDuration,
        setCurrentDuration,
        currentAlternativeFuel,
        setCurrentAlternativeFuel,
        currentMealsPerDay,
        setCurrentMealsPerDay,
        completeDeviceConfiguration,
        multiDeviceState,
        updateDeviceTimeBlocks,
        toggleDeviceTimeBlock,
        resetCurrentConfiguration,
        resetAll,
        loadDevices,
        loadDefaultScenario,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
