import { SelectedDevice } from '@/lib/types';

export type ViewMode = 'current' | 'optimized' | 'comparison';
export type RateType = 'peak' | 'midpeak' | 'offpeak';

export interface LoadProfileChartPoint {
  time: string;
  timeMinutes: number;
  hour: number;
  rateType: RateType;
  rateName: string;
  rate: number;
  currentTotal: number;
  optimizedTotal: number;
  currentCost: number;
  optimizedCost: number;
  [key: string]: string | number;
}

export interface LoadProfileSavings {
  saved: number;
  percentage: number;
  currentTotal: number;
  optimizedTotal: number;
}

export interface LoadProfileTotals {
  currentDailyKWh: number;
  optimizedDailyKWh: number;
  currentDailyCost: number;
  optimizedDailyCost: number;
  currentMonthlyCost: number;
  optimizedMonthlyCost: number;
}

export interface LoadProfileDataResult {
  chartData: LoadProfileChartPoint[];
  savings: LoadProfileSavings;
  totals: LoadProfileTotals;
  hasDevices: boolean;
  hasTimeBlocks: boolean;
  isMultiDevice: boolean;
}

export interface LoadProfileTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: LoadProfileChartPoint }>;
}

export interface DeviceVisibilityState {
  visibleDeviceIds: string[];
  toggleDeviceVisibility: (deviceId: string) => void;
  isDeviceVisible: (deviceId: string) => boolean;
}

export interface LoadProfileHeaderProps {
  devices: SelectedDevice[];
  isMultiDevice: boolean;
  showComparison: boolean;
  viewMode: ViewMode;
  totals: LoadProfileTotals;
  onViewModeChange: (mode: ViewMode) => void;
}

export interface DeviceVisibilityControlsProps {
  devices: SelectedDevice[];
  isMultiDevice: boolean;
  isDeviceVisible: (deviceId: string) => boolean;
  onToggleDevice: (deviceId: string) => void;
}

export interface LoadProfileTooltipComponentProps extends LoadProfileTooltipProps {
  devices: SelectedDevice[];
  visibleDeviceIds: string[];
  isMultiDevice: boolean;
  viewMode: ViewMode;
}

export interface LoadProfileChartProps {
  chartData: LoadProfileChartPoint[];
  devices: SelectedDevice[];
  visibleDeviceIds: string[];
  viewMode: ViewMode;
  isMultiDevice: boolean;
  hasTimeBlocks: boolean;
  totals: LoadProfileTotals;
}

export interface SavingsBannerProps {
  showComparison: boolean;
  hasTimeBlocks: boolean;
  savings: LoadProfileSavings;
  isMultiDevice: boolean;
}

export interface EmptyStateProps {
  message: string;
}
