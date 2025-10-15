import { TOU_TIME_BANDS } from '@/lib/constants';
import {
  LOAD_PROFILE_INTERVAL_MINUTES,
  calculatePowerAtTime as calculateDevicePowerAtTime,
} from '@/lib/loadProfile';
import { RateType } from './types';

const DAY_MINUTES = 24 * 60;

export const timeToMinutes = (timeStr: string): number => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

export const minutesToTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60) % 24;
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

export const generateTimeSlots = (): string[] => {
  const slots: string[] = [];
  for (let minutes = 0; minutes < DAY_MINUTES; minutes += LOAD_PROFILE_INTERVAL_MINUTES) {
    slots.push(minutesToTime(minutes));
  }
  return slots;
};

export const getRateTypeForHour = (hour: number): RateType => {
  for (const band of TOU_TIME_BANDS) {
    if (hour >= band.start && hour <= band.end) {
      return band.type as RateType;
    }
  }
  return 'offpeak';
};

export const calculatePowerAtTime = calculateDevicePowerAtTime;
