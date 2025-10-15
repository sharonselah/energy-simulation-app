import { LoadProfileType } from './types';

const DAY_MINUTES = 24 * 60;
const PULSING_CYCLE_MINUTES = 8;
const PULSING_ACTIVE_FRACTION = 0.35;
const PULSING_IDLE_MULTIPLIER = 0.08;
const CYCLING_CYCLE_MINUTES = 30;
const CYCLING_ACTIVE_MINUTES = 10;
const CYCLING_ACTIVE_FRACTION = CYCLING_ACTIVE_MINUTES / CYCLING_CYCLE_MINUTES;
const CYCLING_STANDBY_MULTIPLIER = 0.12;

export const LOAD_PROFILE_INTERVAL_MINUTES = 15;

const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

export const getLoadProfileMultiplier = (
  loadProfileType: LoadProfileType,
  relativeMinutes: number
): number => {
  const normalizedMinutes = ((relativeMinutes % DAY_MINUTES) + DAY_MINUTES) % DAY_MINUTES;

  switch (loadProfileType) {
    case 'pulsing': {
      const cycleProgress = (normalizedMinutes % PULSING_CYCLE_MINUTES) / PULSING_CYCLE_MINUTES;
      const isPulseActive = cycleProgress < PULSING_ACTIVE_FRACTION;
      const basePulse = isPulseActive ? 1 : PULSING_IDLE_MULTIPLIER;
      const highFrequencyWave = Math.sin((normalizedMinutes / PULSING_CYCLE_MINUTES) * 2 * Math.PI);
      const secondaryWave =
        Math.sin((normalizedMinutes / (PULSING_CYCLE_MINUTES / 2)) * 2 * Math.PI + Math.PI / 3);
      const jitter = (highFrequencyWave * 0.15) + (secondaryWave * 0.1);
      return clamp(basePulse + jitter, PULSING_IDLE_MULTIPLIER, 1);
    }
    case 'cycling': {
      const cycleProgress = (normalizedMinutes % CYCLING_CYCLE_MINUTES) / CYCLING_CYCLE_MINUTES;
      if (cycleProgress < CYCLING_ACTIVE_FRACTION) {
        return 1;
      }

      const offPhaseProgress =
        (cycleProgress - CYCLING_ACTIVE_FRACTION) / (1 - CYCLING_ACTIVE_FRACTION);
      const compressorCooldown = 1 - offPhaseProgress;
      const standbyWave = Math.sin(offPhaseProgress * Math.PI);
      return clamp(
        CYCLING_STANDBY_MULTIPLIER + compressorCooldown * 0.05 + standbyWave * 0.03,
        CYCLING_STANDBY_MULTIPLIER,
        0.35
      );
    }
    case 'continuous':
    default:
      return 1;
  }
};

export const calculatePowerAtTime = (
  timeMinutes: number,
  startMinutes: number,
  endMinutes: number,
  devicePower: number,
  loadProfileType: LoadProfileType
): number => {
  let adjustedTime = timeMinutes;
  let adjustedEnd = endMinutes;

  if (endMinutes < startMinutes) {
    if (timeMinutes < startMinutes && timeMinutes < endMinutes) {
      adjustedTime = timeMinutes + DAY_MINUTES;
    }
    adjustedEnd = endMinutes + DAY_MINUTES;
  }

  if (adjustedTime < startMinutes || adjustedTime >= adjustedEnd) {
    return 0;
  }

  if (loadProfileType === 'continuous') {
    return devicePower;
  }

  const relativeMinutes = adjustedTime - startMinutes;
  const activeMultiplier = getLoadProfileMultiplier(loadProfileType, relativeMinutes);
  return devicePower * activeMultiplier;
};
