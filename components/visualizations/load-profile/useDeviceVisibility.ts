import { useCallback, useEffect, useMemo, useState } from 'react';
import { SelectedDevice } from '@/lib/types';
import { DeviceVisibilityState } from './types';

export const useDeviceVisibility = (devices: SelectedDevice[]): DeviceVisibilityState => {
  const [visibilityMap, setVisibilityMap] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(devices.map((device) => [device.id, true]))
  );

  useEffect(() => {
    setVisibilityMap((prev) => {
      const next: Record<string, boolean> = {};
      devices.forEach((device) => {
        next[device.id] = prev[device.id] ?? true;
      });
      return next;
    });
  }, [devices]);

  const toggleDeviceVisibility = useCallback((deviceId: string) => {
    setVisibilityMap((prev) => ({
      ...prev,
      [deviceId]: !prev[deviceId],
    }));
  }, []);

  const visibleDeviceIds = useMemo(
    () => Object.entries(visibilityMap)
      .filter(([, isVisible]) => isVisible)
      .map(([deviceId]) => deviceId),
    [visibilityMap]
  );

  const isDeviceVisible = useCallback(
    (deviceId: string) => visibilityMap[deviceId] ?? true,
    [visibilityMap]
  );

  return {
    visibleDeviceIds,
    toggleDeviceVisibility,
    isDeviceVisible,
  };
};
