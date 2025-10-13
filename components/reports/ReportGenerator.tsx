'use client';

import React from 'react';
import { useAppContext } from '@/contexts/AppContext';
import Card from '@/components/shared/Card';
import Button from '@/components/shared/Button';
import { Download, Share2, FileText } from 'lucide-react';
import { formatCurrency } from '@/lib/calculations';
import { generatePDF } from '@/lib/pdf-export';
import { generateShareImage } from '@/lib/image-export';

export default function ReportGenerator() {
  const { multiDeviceState, devices } = useAppContext();
  const [isGenerating, setIsGenerating] = React.useState(false);

  if (devices.length === 0) {
    return null;
  }

  const { aggregatedCosts } = multiDeviceState;
  const monthlySavingsAtoC = aggregatedCosts.scenarioA.total.monthly - aggregatedCosts.scenarioC.total.monthly;
  const annualSavingsAtoC = aggregatedCosts.scenarioA.total.annual - aggregatedCosts.scenarioC.total.annual;
  const percentageSavings = aggregatedCosts.scenarioA.total.monthly > 0 
    ? ((monthlySavingsAtoC / aggregatedCosts.scenarioA.total.monthly) * 100) 
    : 0;

  const handleDownloadPDF = async () => {
    setIsGenerating(true);
    try {
      await generatePDF(multiDeviceState, devices);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShareImage = async () => {
    setIsGenerating(true);
    try {
      await generateShareImage(multiDeviceState, devices);
    } catch (error) {
      console.error('Error generating share image:', error);
      alert('Failed to generate share image. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="shadow-xl">
      <div className="space-y-6">
        {/* Report Header */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
              <FileText className="w-7 h-7 text-primary" />
              Your Energy Savings Report
            </h2>
            <p className="text-gray-600">
              Complete comparison analysis for {devices.length} device{devices.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Key Savings Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200 shadow-md">
            <p className="text-sm font-medium text-green-700 mb-1">Monthly Savings</p>
            <p className="text-3xl font-bold text-green-900">
              {formatCurrency(monthlySavingsAtoC)}
            </p>
            <p className="text-xs text-green-600 mt-1">Current vs Optimized</p>
          </div>
          
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-xl border border-blue-200 shadow-md">
            <p className="text-sm font-medium text-blue-700 mb-1">Annual Savings</p>
            <p className="text-3xl font-bold text-blue-900">
              {formatCurrency(annualSavingsAtoC)}
            </p>
            <p className="text-xs text-blue-600 mt-1">Yearly projection</p>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200 shadow-md">
            <p className="text-sm font-medium text-purple-700 mb-1">Savings Percentage</p>
            <p className="text-3xl font-bold text-purple-900">
              {percentageSavings.toFixed(1)}%
            </p>
            <p className="text-xs text-purple-600 mt-1">Cost reduction</p>
          </div>
        </div>

        {/* Device List */}
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-3">Devices in Your Comparison:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {devices.map((selectedDevice, index) => {
              const deviceCostA = aggregatedCosts.scenarioA.byDevice[selectedDevice.id];
              const deviceCostC = aggregatedCosts.scenarioC.byDevice[selectedDevice.id];
              const deviceSavings = deviceCostA && deviceCostC 
                ? deviceCostA.monthly - deviceCostC.monthly 
                : 0;

              return (
                <div 
                  key={selectedDevice.id} 
                  className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">
                        {index + 1}. {selectedDevice.device.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {selectedDevice.device.wattage}W • {selectedDevice.duration}h/day
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-green-600">
                        {formatCurrency(deviceSavings)}/mo
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Cost Breakdown */}
        <div className="bg-gradient-to-r from-primary/5 to-blue-50 p-6 rounded-xl border border-primary/20">
          <h3 className="font-semibold text-gray-900 mb-4">Complete Cost Comparison</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-2">Scenario A: Current</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(aggregatedCosts.scenarioA.total.monthly)}<span className="text-sm font-normal">/mo</span>
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">Scenario B: Electric (Current Times)</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(aggregatedCosts.scenarioB.total.monthly)}<span className="text-sm font-normal">/mo</span>
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">Scenario C: Optimized TOU</p>
              <p className="text-2xl font-bold text-green-700">
                {formatCurrency(aggregatedCosts.scenarioC.total.monthly)}<span className="text-sm font-normal">/mo</span>
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
          <Button
            variant="cta"
            onClick={handleDownloadPDF}
            disabled={isGenerating}
            className="flex-1 min-w-[200px]"
          >
            <Download className="w-4 h-4 mr-2" />
            {isGenerating ? 'Generating...' : 'Download PDF Report'}
          </Button>
          
          <Button
            variant="primary"
            onClick={handleShareImage}
            disabled={isGenerating}
            className="flex-1 min-w-[200px]"
          >
            <Share2 className="w-4 h-4 mr-2" />
            {isGenerating ? 'Generating...' : 'Share as Image'}
          </Button>
        </div>

        <div className="text-xs text-gray-500 text-center pt-2">
          <p>💡 Tip: Share your savings with friends to help them discover energy-efficient options!</p>
        </div>
      </div>
    </Card>
  );
}



