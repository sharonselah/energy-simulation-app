'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/shared/Card';
import Button from '@/components/shared/Button';
import DeviceManager from '@/components/device-selection/DeviceManager';
import ReportGenerator from '@/components/reports/ReportGenerator';
import ComparisonHistory from '@/components/reports/ComparisonHistory';
import SkeletonLoader from '@/components/shared/SkeletonLoader';
import { AppProvider, useAppContext } from '@/contexts/AppContext';
import { Plus, TrendingUp, Save, Settings } from 'lucide-react';
import { 
  saveCurrentComparison, 
  loadCurrentComparison, 
  saveComparisonToHistory,
  ComparisonHistoryItem 
} from '@/lib/storage';

// Lazy load heavy visualization components
const CostComparison = dynamic(() => import('@/components/cost-comparison/CostComparison'), {
  loading: () => <SkeletonLoader variant="card" className="h-96" />,
  ssr: false,
});

const LoadProfile = dynamic(() => import('@/components/visualizations/LoadProfile'), {
  loading: () => <SkeletonLoader variant="chart" />,
  ssr: false,
});

const CO2Dashboard = dynamic(() => import('@/components/visualizations/CO2Dashboard'), {
  loading: () => <SkeletonLoader variant="card" className="h-64" />,
  ssr: false,
});

const GridMetricsDashboard = dynamic(() => import('@/components/visualizations/GridMetricsDashboard'), {
  loading: () => <SkeletonLoader variant="card" className="h-96" />,
  ssr: false,
});

function HomeContent() {
  const {
    devices,
    multiDeviceState,
    clearAllDevices,
    loadDevices,
  } = useAppContext();

  const [showDeviceManager, setShowDeviceManager] = useState(true);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // Auto-save to storage whenever devices change
  useEffect(() => {
    if (devices.length > 0) {
      saveCurrentComparison(devices, multiDeviceState);
    }
  }, [devices, multiDeviceState]);

  // Load saved comparison on mount
  useEffect(() => {
    const savedDevices = loadCurrentComparison();
    if (savedDevices && savedDevices.length > 0) {
      // You could load these into context here if needed
      // For now, user can load from history
    }
  }, []);

  const handleViewAnalysis = () => {
    if (devices.length === 0) {
      alert('Please add at least one device to view analysis.');
      return;
    }
    setShowAnalysis(true);
    setShowDeviceManager(false);
  };

  const handleBackToDevices = () => {
    setShowAnalysis(false);
    setShowDeviceManager(true);
  };

  const handleSaveToHistory = () => {
    const name = prompt('Enter a name for this comparison:', `${devices.length} Device Comparison`);
    if (name) {
      saveComparisonToHistory(devices, multiDeviceState, name);
      alert('Comparison saved to history!');
    }
  };

  const handleLoadFromHistory = (comparison: ComparisonHistoryItem) => {
    if (confirm('Loading this comparison will replace your current devices. Continue?')) {
      clearAllDevices();
      loadDevices(comparison.devices);
      setShowHistory(false);
      setShowDeviceManager(true);
      setShowAnalysis(false);
    }
  };

  const hasDevices = devices.length > 0;
  const hasTimeBlocks = devices.some(d => d.timeBlocks.some(b => b.isSelected));

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header Card */}
        <Card className="bg-gradient-to-r from-primary to-blue-700 text-white shadow-xl">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">
                Energy Simulation Game
              </h1>
              <p className="text-blue-100">
                Compare multiple devices and discover your savings potential
              </p>
              {hasDevices && (
                <div className="mt-3 flex items-center gap-2">
                  <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm font-medium">
                    {devices.length} Device{devices.length !== 1 ? 's' : ''} Added
                  </span>
                  {hasTimeBlocks && (
                    <span className="bg-green-500 bg-opacity-30 px-3 py-1 rounded-full text-sm font-medium">
                      ✓ Time Blocks Configured
                    </span>
                  )}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              {hasDevices && (
                <>
                  <Button
                    variant="outline"
                    onClick={handleSaveToHistory}
                    className="text-white border-white hover:bg-white hover:text-primary"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowHistory(true)}
                    className="text-white border-white hover:bg-white hover:text-primary"
                  >
                    History
                  </Button>
                </>
              )}
            </div>
          </div>
        </Card>

        {/* Progress Steps */}
        {hasDevices && (
          <Card className="shadow-md">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={`flex items-center gap-3 ${hasDevices ? 'opacity-100' : 'opacity-50'}`}>
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-lg
                  ${hasDevices ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}
                `}>
                  {hasDevices ? '✓' : '1'}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Add Devices</div>
                  <div className="text-xs text-gray-600">Select appliances</div>
                </div>
              </div>

              <div className={`flex items-center gap-3 ${hasTimeBlocks ? 'opacity-100' : 'opacity-50'}`}>
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-lg
                  ${hasTimeBlocks ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}
                `}>
                  {hasTimeBlocks ? '✓' : '2'}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Configure Usage</div>
                  <div className="text-xs text-gray-600">Set time blocks</div>
                </div>
              </div>

              <div className={`flex items-center gap-3 ${showAnalysis ? 'opacity-100' : 'opacity-50'}`}>
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-lg
                  ${showAnalysis ? 'bg-cta text-primary' : 'bg-gray-200 text-gray-500'}
                `}>
                  3
                </div>
                <div>
                  <div className="font-semibold text-gray-900">View Analysis</div>
                  <div className="text-xs text-gray-600">See your savings</div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Device Manager View */}
        {showDeviceManager && !showAnalysis && (
          <>
            <DeviceManager 
              showAddDevice={!hasDevices}
              onAddComplete={() => {
                // Device added successfully
              }}
            />

            {hasDevices && hasTimeBlocks && (
              <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 shadow-xl">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-500 text-white w-12 h-12 rounded-full flex items-center justify-center">
                      <TrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-green-900 text-lg">Ready for Analysis!</h3>
                      <p className="text-green-700 text-sm">
                        View your cost comparison and savings potential
                      </p>
                    </div>
                  </div>
                  <Button variant="cta" onClick={handleViewAnalysis}>
                    View Cost Analysis →
                  </Button>
                </div>
              </Card>
            )}
          </>
        )}

        {/* Analysis View */}
        {showAnalysis && hasDevices && (
          <>
            {/* Back Button */}
            <Card className="shadow-md">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Your Energy Analysis
                  </h2>
                  <p className="text-gray-600">
                    Comparing {devices.length} device{devices.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleBackToDevices}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Manage Devices
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => setShowDeviceManager(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Another Device
                  </Button>
                </div>
              </div>
            </Card>

            {/* Report Generator */}
            <ReportGenerator />

            {/* Cost Comparison */}
            <CostComparison />

            {/* Load Profile Visualization */}
            <LoadProfile showComparison={true} />

            {/* CO2 Impact Dashboard */}
            <CO2Dashboard />

            {/* Grid Metrics Dashboard */}
            <GridMetricsDashboard showComparison={true} />
          </>
        )}

        {/* Information Section (only show when no devices) */}
        {!hasDevices && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card title="Multi-Device Comparison" subtitle="Compare multiple appliances">
                <p className="text-gray-600">
                  Add multiple devices to see combined costs and savings. Compare your current fuel costs with electric appliances across three scenarios.
                </p>
              </Card>

              <Card title="Download Reports" subtitle="Share your savings">
                <p className="text-gray-600">
                  Generate PDF reports and shareable images to show your savings potential. Perfect for sharing on WhatsApp!
                </p>
              </Card>

              <Card title="Comparison History" subtitle="Track your progress">
                <p className="text-gray-600">
                  Save and load different device combinations to find the best energy-saving strategy for your home.
                </p>
              </Card>
            </div>

            {/* About TOU Tariffs */}
            <Card title="Understanding Time of Use (TOU) Tariffs">
              <div className="space-y-4">
                <p className="text-gray-600">
                  Kenya Power uses Time of Use tariffs to encourage energy consumption during off-peak hours. Here&apos;s how it works:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-offpeak/10 p-4 rounded-xl border border-offpeak/30 shadow-md">
                    <h4 className="font-semibold text-offpeak mb-2">Off-Peak (KES 8/kWh)</h4>
                    <p className="text-sm text-gray-600">10:00 PM - 6:00 AM</p>
                    <p className="text-xs text-gray-500 mt-2">Lowest rates, best savings</p>
                  </div>
                  <div className="bg-midpeak/10 p-4 rounded-xl border border-midpeak/30 shadow-md">
                    <h4 className="font-semibold text-midpeak mb-2">Mid-Peak (KES 12/kWh)</h4>
                    <p className="text-sm text-gray-600">6:00 AM - 6:00 PM</p>
                    <p className="text-xs text-gray-500 mt-2">Moderate rates</p>
                  </div>
                  <div className="bg-peak/10 p-4 rounded-xl border border-peak/30 shadow-md">
                    <h4 className="font-semibold text-peak mb-2">Peak (KES 20/kWh)</h4>
                    <p className="text-sm text-gray-600">6:00 PM - 10:00 PM</p>
                    <p className="text-xs text-gray-500 mt-2">Highest rates, avoid if possible</p>
                  </div>
                </div>
              </div>
            </Card>
          </>
        )}
      </div>

      {/* Comparison History Modal */}
      {showHistory && (
        <ComparisonHistory 
          onLoadComparison={handleLoadFromHistory}
        />
      )}
    </DashboardLayout>
  );
}

export default function Home() {
  return (
    <AppProvider>
      <HomeContent />
    </AppProvider>
  );
}

