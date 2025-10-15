'use client';

import React, { useState } from 'react';
import Card from '@/components/shared/Card';
import { useAppContext } from '@/contexts/AppContext';
import { ViewMode } from './load-profile/types';
import { useDeviceVisibility } from './load-profile/useDeviceVisibility';
import { useLoadProfileData } from './load-profile/useLoadProfileData';
import { LoadProfileHeader } from './load-profile/LoadProfileHeader';
import { DeviceVisibilityControls } from './load-profile/DeviceVisibilityControls';
import { LoadProfileChart } from './load-profile/LoadProfileChart';
import { SavingsBanner } from './load-profile/SavingsBanner';
import { LoadProfileEmptyState } from './load-profile/LoadProfileEmptyState';

interface LoadProfileProps {
  showComparison?: boolean;
}

const DEFAULT_VIEW_MODE: ViewMode = 'comparison';

export default function LoadProfile({ showComparison = true }: LoadProfileProps) {
  const { devices } = useAppContext();
  const [viewMode, setViewMode] = useState<ViewMode>(DEFAULT_VIEW_MODE);

  const { visibleDeviceIds, toggleDeviceVisibility, isDeviceVisible } = useDeviceVisibility(devices);
  const { chartData, savings, hasDevices, hasTimeBlocks, isMultiDevice } = useLoadProfileData(
    devices,
    visibleDeviceIds
  );

  if (!hasDevices) {
    return (
      <Card className="p-6 text-center">
        <LoadProfileEmptyState message="Add devices to view load profile" />
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <LoadProfileHeader
        devices={devices}
        isMultiDevice={isMultiDevice}
        showComparison={showComparison}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      <DeviceVisibilityControls
        devices={devices}
        isMultiDevice={isMultiDevice}
        isDeviceVisible={isDeviceVisible}
        onToggleDevice={toggleDeviceVisibility}
      />

      <LoadProfileChart
        chartData={chartData}
        devices={devices}
        visibleDeviceIds={visibleDeviceIds}
        viewMode={viewMode}
        isMultiDevice={isMultiDevice}
        hasTimeBlocks={hasTimeBlocks}
      />

      <SavingsBanner
        showComparison={showComparison}
        hasTimeBlocks={hasTimeBlocks}
        savings={savings}
        isMultiDevice={isMultiDevice}
      />
    </Card>
  );
}
