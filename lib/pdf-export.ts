import jsPDF from 'jspdf';
import { MultiDeviceState, SelectedDevice } from './types';
import { formatCurrency } from './calculations';

/**
 * Generate a comprehensive PDF report for multi-device comparison
 */
export async function generatePDF(
  multiDeviceState: MultiDeviceState,
  devices: SelectedDevice[]
): Promise<void> {
  const { aggregatedCosts, aggregatedMetrics } = multiDeviceState;
  
  // Create new PDF document (A4 size)
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;
  
  let yPosition = margin;

  // Helper function to add a new page if needed
  const checkPageBreak = (requiredSpace: number) => {
    if (yPosition + requiredSpace > pageHeight - margin) {
      pdf.addPage();
      yPosition = margin;
      return true;
    }
    return false;
  };

  // Header
  pdf.setFillColor(22, 52, 102); // Primary color #163466
  pdf.rect(0, 0, pageWidth, 40, 'F');
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Energy Savings Report', margin, 20);
  
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Your Personalized Energy Comparison Analysis', margin, 30);
  
  yPosition = 50;

  // Report date
  pdf.setTextColor(100, 100, 100);
  pdf.setFontSize(10);
  const reportDate = new Date().toLocaleDateString('en-KE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  pdf.text(`Generated: ${reportDate}`, margin, yPosition);
  yPosition += 10;

  // Executive Summary Section
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Executive Summary', margin, yPosition);
  yPosition += 8;

  // Summary box
  pdf.setFillColor(240, 253, 244); // Light green
  pdf.roundedRect(margin, yPosition, contentWidth, 40, 3, 3, 'F');
  
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(0, 0, 0);
  
  const monthlySavingsAtoC = aggregatedCosts.scenarioA.total.monthly - aggregatedCosts.scenarioC.total.monthly;
  const annualSavingsAtoC = aggregatedCosts.scenarioA.total.annual - aggregatedCosts.scenarioC.total.annual;
  const percentageSavings = aggregatedCosts.scenarioA.total.monthly > 0 
    ? ((monthlySavingsAtoC / aggregatedCosts.scenarioA.total.monthly) * 100) 
    : 0;

  pdf.text(`Number of Devices Analyzed: ${devices.length}`, margin + 5, yPosition + 8);
  pdf.text(`Monthly Savings Potential: ${formatCurrency(monthlySavingsAtoC)}`, margin + 5, yPosition + 16);
  pdf.text(`Annual Savings Potential: ${formatCurrency(annualSavingsAtoC)}`, margin + 5, yPosition + 24);
  pdf.text(`Percentage Savings: ${percentageSavings.toFixed(1)}%`, margin + 5, yPosition + 32);
  
  yPosition += 48;

  // Device List Section
  checkPageBreak(15 + devices.length * 12);
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Devices in Your Comparison', margin, yPosition);
  yPosition += 8;

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  
  devices.forEach((selectedDevice, index) => {
    checkPageBreak(12);
    
    const deviceCostA = aggregatedCosts.scenarioA.byDevice[selectedDevice.id];
    const deviceCostC = aggregatedCosts.scenarioC.byDevice[selectedDevice.id];
    const deviceSavings = deviceCostA && deviceCostC 
      ? deviceCostA.monthly - deviceCostC.monthly 
      : 0;

    pdf.setFillColor(249, 250, 251);
    pdf.roundedRect(margin, yPosition, contentWidth, 10, 2, 2, 'F');
    
    pdf.text(
      `${index + 1}. ${selectedDevice.device.name} (${selectedDevice.device.wattage}W, ${selectedDevice.duration}h/day)`,
      margin + 3,
      yPosition + 7
    );
    
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(34, 197, 94); // Green
    pdf.text(
      `Saves: ${formatCurrency(deviceSavings)}/mo`,
      pageWidth - margin - 40,
      yPosition + 7
    );
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0);
    
    yPosition += 12;
  });

  yPosition += 5;

  // Cost Comparison Section
  checkPageBreak(60);
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Cost Comparison by Scenario', margin, yPosition);
  yPosition += 10;

  // Scenario A
  pdf.setFillColor(254, 242, 242); // Light red
  pdf.roundedRect(margin, yPosition, contentWidth, 35, 3, 3, 'F');
  
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Scenario A: Current Usage', margin + 5, yPosition + 8);
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text('(Alternative fuels and/or grid electricity)', margin + 5, yPosition + 14);
  
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`Daily: ${formatCurrency(aggregatedCosts.scenarioA.total.daily)}`, margin + 5, yPosition + 22);
  pdf.text(`Monthly: ${formatCurrency(aggregatedCosts.scenarioA.total.monthly)}`, margin + 60, yPosition + 22);
  pdf.text(`Annual: ${formatCurrency(aggregatedCosts.scenarioA.total.annual)}`, margin + 120, yPosition + 22);
  
  yPosition += 40;

  // Scenario B
  checkPageBreak(35);
  pdf.setFillColor(254, 249, 195); // Light yellow
  pdf.roundedRect(margin, yPosition, contentWidth, 35, 3, 3, 'F');
  
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Scenario B: Electric (Current Usage Pattern)', margin + 5, yPosition + 8);
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text('(Using electric appliances with your current usage times)', margin + 5, yPosition + 14);
  
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`Daily: ${formatCurrency(aggregatedCosts.scenarioB.total.daily)}`, margin + 5, yPosition + 22);
  pdf.text(`Monthly: ${formatCurrency(aggregatedCosts.scenarioB.total.monthly)}`, margin + 60, yPosition + 22);
  pdf.text(`Annual: ${formatCurrency(aggregatedCosts.scenarioB.total.annual)}`, margin + 120, yPosition + 22);
  
  yPosition += 40;

  // Scenario C
  checkPageBreak(35);
  pdf.setFillColor(240, 253, 244); // Light green
  pdf.roundedRect(margin, yPosition, contentWidth, 35, 3, 3, 'F');
  
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(21, 128, 61); // Dark green
  pdf.text('Scenario C: Optimized TOU Usage ⭐', margin + 5, yPosition + 8);
  
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text('(Using electric appliances with optimized time-of-use scheduling)', margin + 5, yPosition + 14);
  
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`Daily: ${formatCurrency(aggregatedCosts.scenarioC.total.daily)}`, margin + 5, yPosition + 22);
  pdf.text(`Monthly: ${formatCurrency(aggregatedCosts.scenarioC.total.monthly)}`, margin + 60, yPosition + 22);
  pdf.text(`Annual: ${formatCurrency(aggregatedCosts.scenarioC.total.annual)}`, margin + 120, yPosition + 22);
  
  yPosition += 40;

  // Grid Metrics Section
  checkPageBreak(50);
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(0, 0, 0);
  pdf.text('Grid Usage Metrics', margin, yPosition);
  yPosition += 10;

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  
  pdf.text(`Total Daily Energy: ${aggregatedMetrics.totalDailyKWh.toFixed(2)} kWh`, margin, yPosition);
  yPosition += 6;
  
  pdf.text(`Peak Hour Usage: ${aggregatedMetrics.peakUsage.toFixed(2)} kWh`, margin, yPosition);
  yPosition += 6;
  
  pdf.text(`Off-Peak Usage: ${aggregatedMetrics.offPeakUsage.toFixed(2)} kWh`, margin, yPosition);
  yPosition += 6;
  
  pdf.text(`Load Factor: ${aggregatedMetrics.loadFactor.toFixed(1)}%`, margin, yPosition);
  yPosition += 6;
  
  pdf.text(`Efficiency Score: ${aggregatedMetrics.efficiencyScore.toFixed(1)}/10`, margin, yPosition);
  yPosition += 10;

  // Optimization Tips
  checkPageBreak(40);
  pdf.setFillColor(219, 234, 254); // Light blue
  pdf.roundedRect(margin, yPosition, contentWidth, 35, 3, 3, 'F');
  
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('💡 Key Recommendations', margin + 5, yPosition + 8);
  
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.text('1. Shift usage to off-peak hours (10:00 PM - 6:00 AM) for maximum savings', margin + 5, yPosition + 16);
  pdf.text('2. Avoid peak hours (6:00 PM - 10:00 PM) when electricity rates are highest', margin + 5, yPosition + 22);
  pdf.text('3. Distribute your device usage throughout the day to reduce peak load', margin + 5, yPosition + 28);
  
  yPosition += 40;

  // Footer
  checkPageBreak(20);
  pdf.setFontSize(8);
  pdf.setTextColor(150, 150, 150);
  pdf.text('Generated by Energy Simulation Game', margin, pageHeight - 15);
  pdf.text(`Page ${pdf.getCurrentPageInfo().pageNumber}`, pageWidth - margin - 15, pageHeight - 15);
  
  // Add QR code placeholder text (you can integrate a real QR code library if needed)
  pdf.setFontSize(7);
  pdf.text('Visit our website to create your own comparison', margin, pageHeight - 10);

  // Save the PDF
  pdf.save(`energy-savings-report-${new Date().getTime()}.pdf`);
}



