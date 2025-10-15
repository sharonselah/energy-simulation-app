import { useMemo } from 'react';
import { SelectedDevice } from '@/lib/types';
import { TOU_TARIFFS } from '@/lib/constants';
import { TIME_INTERVAL } from './constants';
import {
  calculatePowerAtTime,
  generateTimeSlots,
  getRateTypeForHour,
  timeToMinutes,
} from './timeUtils';
import {
  LoadProfileChartPoint,
  LoadProfileDataResult,
  LoadProfileSavings,
} from './types';

export const useLoadProfileData = (
  devices: SelectedDevice[],
  visibleDeviceIds: string[]
): LoadProfileDataResult => {
  const visibleSet = useMemo(() => new Set(visibleDeviceIds), [visibleDeviceIds]);
  const hasDevices = devices.length > 0;
  const isMultiDevice = devices.length > 1;

  const chartData = useMemo<LoadProfileChartPoint[]>(() => {
    if (!hasDevices) {
      return [];
    }

    const timeSlots = generateTimeSlots();

    return timeSlots.map((timeStr) => {
      const timeMinutes = timeToMinutes(timeStr);
      const hour = Math.floor(timeMinutes / 60);
      const rateType = getRateTypeForHour(hour);
      const rate = TOU_TARIFFS[rateType];

      let currentTotalPower = 0;
      let optimizedTotalPower = 0;
      const currentDevicePowers: Record<string, number> = {};
      const optimizedDevicePowers: Record<string, number> = {};

      devices.forEach((device) => {
        if (!visibleSet.has(device.id)) {
          return;
        }

        let currentPower = 0;
        device.timeBlocks.forEach((block) => {
          if (!block.isSelected) {
            return;
          }
          const startMinutes = block.hour * 60;
          const endMinutes = startMinutes + 60;
          currentPower += calculatePowerAtTime(
            timeMinutes,
            startMinutes,
            endMinutes,
            device.device.wattage,
            device.device.loadProfileType
          );
        });

        currentDevicePowers[device.id] = currentPower;
        currentTotalPower += currentPower;

        let optimizedPower = 0;
        const hasSelectedBlocks = device.timeBlocks.some((block) => block.isSelected);

        if (hasSelectedBlocks && rateType === 'offpeak') {
          device.timeBlocks.forEach((block) => {
            if (!block.isSelected) {
              return;
            }
            const blockHour = block.hour;
            if ((hour >= 22 || hour < 6) && blockHour >= 18 && blockHour < 22) {
              const startMinutes = (block.hour * 60) + (4 * 60);
              const endMinutes = startMinutes + 60;
              optimizedPower += calculatePowerAtTime(
                timeMinutes,
                startMinutes % (24 * 60),
                endMinutes % (24 * 60),
                device.device.wattage,
                device.device.loadProfileType
              );
            }
          });
        }

        optimizedDevicePowers[device.id] = optimizedPower;
        optimizedTotalPower += optimizedPower;
      });

      const currentCost = (currentTotalPower / 1000) * rate * (TIME_INTERVAL / 60);
      const optimizedCost = (optimizedTotalPower / 1000) * rate * (TIME_INTERVAL / 60);

      const dataPoint: LoadProfileChartPoint = {
        time: timeStr,
        timeMinutes,
        hour,
        rateType,
        rateName: rateType === 'peak' ? 'Peak' : rateType === 'midpeak' ? 'Mid-Peak' : 'Off-Peak',
        rate,
        currentTotal: currentTotalPower,
        optimizedTotal: optimizedTotalPower,
        currentCost,
        optimizedCost,
      };

      if (isMultiDevice) {
        devices.forEach((device) => {
          if (!visibleSet.has(device.id)) {
            return;
          }

          dataPoint[`current_${device.id}`] = currentDevicePowers[device.id] || 0;
          dataPoint[`optimized_${device.id}`] = optimizedDevicePowers[device.id] || 0;
        });
      }

      return dataPoint;
    });
  }, [devices, hasDevices, isMultiDevice, visibleSet]);

  const savings = useMemo<LoadProfileSavings>(() => {
    if (!chartData.length) {
      return {
        saved: 0,
        percentage: 0,
        currentTotal: 0,
        optimizedTotal: 0,
      };
    }

    const currentTotal = chartData.reduce((sum, data) => sum + data.currentCost, 0);
    const optimizedTotal = chartData.reduce((sum, data) => sum + data.optimizedCost, 0);
    const saved = currentTotal - optimizedTotal;
    const percentage = currentTotal > 0 ? (saved / currentTotal) * 100 : 0;

    return { saved, percentage, currentTotal, optimizedTotal };
  }, [chartData]);

  const hasTimeBlocks = useMemo(
    () => devices.some((device) => device.timeBlocks.some((block) => block.isSelected)),
    [devices]
  );

  return {
    chartData,
    savings,
    hasDevices,
    hasTimeBlocks,
    isMultiDevice,
  };
};
