import html2canvas from 'html2canvas';
import { MultiDeviceState, SelectedDevice } from './types';
import { formatCurrency } from './calculations';

/**
 * Generate a shareable image for social media (WhatsApp-friendly)
 */
export async function generateShareImage(
  multiDeviceState: MultiDeviceState,
  devices: SelectedDevice[]
): Promise<void> {
  const { aggregatedCosts } = multiDeviceState;
  
  const monthlySavingsAtoC = aggregatedCosts.scenarioA.total.monthly - aggregatedCosts.scenarioC.total.monthly;
  const annualSavingsAtoC = aggregatedCosts.scenarioA.total.annual - aggregatedCosts.scenarioC.total.annual;
  const percentageSavings = aggregatedCosts.scenarioA.total.monthly > 0 
    ? ((monthlySavingsAtoC / aggregatedCosts.scenarioA.total.monthly) * 100) 
    : 0;

  // Create a temporary div for the share card
  const shareCard = document.createElement('div');
  shareCard.style.cssText = `
    position: fixed;
    left: -9999px;
    top: 0;
    width: 1080px;
    padding: 60px;
    background: linear-gradient(135deg, #163466 0%, #1e4a7d 100%);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: white;
    border-radius: 0;
  `;

  shareCard.innerHTML = `
    <div style="background: white; border-radius: 24px; padding: 50px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);">
      <!-- Header -->
      <div style="text-align: center; margin-bottom: 40px;">
        <h1 style="font-size: 48px; font-weight: 800; color: #163466; margin: 0 0 10px 0;">
          ⚡ My Energy Savings Report
        </h1>
        <p style="font-size: 24px; color: #6b7280; margin: 0;">
          ${devices.length} Device${devices.length !== 1 ? 's' : ''} Comparison
        </p>
      </div>

      <!-- Key Metrics -->
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 40px;">
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; border-radius: 16px; text-align: center;">
          <div style="font-size: 18px; font-weight: 600; margin-bottom: 10px; opacity: 0.9;">Monthly Savings</div>
          <div style="font-size: 42px; font-weight: 800;">${formatCurrency(monthlySavingsAtoC)}</div>
        </div>
        <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 30px; border-radius: 16px; text-align: center;">
          <div style="font-size: 18px; font-weight: 600; margin-bottom: 10px; opacity: 0.9;">Annual Savings</div>
          <div style="font-size: 42px; font-weight: 800;">${formatCurrency(annualSavingsAtoC)}</div>
        </div>
        <div style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); padding: 30px; border-radius: 16px; text-align: center;">
          <div style="font-size: 18px; font-weight: 600; margin-bottom: 10px; opacity: 0.9;">Cost Reduction</div>
          <div style="font-size: 42px; font-weight: 800;">${percentageSavings.toFixed(1)}%</div>
        </div>
      </div>

      <!-- Devices List -->
      <div style="background: #f9fafb; padding: 30px; border-radius: 16px; margin-bottom: 30px;">
        <h3 style="font-size: 24px; font-weight: 700; color: #111827; margin: 0 0 20px 0;">My Devices</h3>
        <div style="display: grid; gap: 12px;">
          ${devices.slice(0, 5).map((device, index) => {
            const deviceCostA = aggregatedCosts.scenarioA.byDevice[device.id];
            const deviceCostC = aggregatedCosts.scenarioC.byDevice[device.id];
            const deviceSavings = deviceCostA && deviceCostC 
              ? deviceCostA.monthly - deviceCostC.monthly 
              : 0;
            
            return `
              <div style="background: white; padding: 20px; border-radius: 12px; display: flex; justify-content: space-between; align-items: center; border: 2px solid #e5e7eb;">
                <div>
                  <div style="font-size: 20px; font-weight: 600; color: #111827;">${index + 1}. ${device.device.name}</div>
                  <div style="font-size: 16px; color: #6b7280;">${device.device.wattage}W • ${device.duration}h/day</div>
                </div>
                <div style="font-size: 20px; font-weight: 700; color: #10b981;">
                  ${formatCurrency(deviceSavings)}/mo
                </div>
              </div>
            `;
          }).join('')}
          ${devices.length > 5 ? `
            <div style="text-align: center; padding: 10px; color: #6b7280; font-size: 16px;">
              + ${devices.length - 5} more device${devices.length - 5 !== 1 ? 's' : ''}
            </div>
          ` : ''}
        </div>
      </div>

      <!-- Cost Comparison -->
      <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 30px; border-radius: 16px; margin-bottom: 30px;">
        <h3 style="font-size: 24px; font-weight: 700; color: #92400e; margin: 0 0 20px 0;">💰 Cost Comparison</h3>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;">
          <div style="text-align: center;">
            <div style="font-size: 16px; color: #92400e; margin-bottom: 8px;">Current</div>
            <div style="font-size: 28px; font-weight: 800; color: #78350f;">${formatCurrency(aggregatedCosts.scenarioA.total.monthly)}</div>
          </div>
          <div style="text-align: center;">
            <div style="font-size: 16px; color: #92400e; margin-bottom: 8px;">Electric</div>
            <div style="font-size: 28px; font-weight: 800; color: #78350f;">${formatCurrency(aggregatedCosts.scenarioB.total.monthly)}</div>
          </div>
          <div style="text-align: center;">
            <div style="font-size: 16px; color: #15803d; margin-bottom: 8px;">Optimized ⭐</div>
            <div style="font-size: 28px; font-weight: 800; color: #15803d;">${formatCurrency(aggregatedCosts.scenarioC.total.monthly)}</div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div style="text-align: center; padding-top: 20px; border-top: 2px solid #e5e7eb;">
        <p style="font-size: 18px; color: #6b7280; margin: 0;">
          🌍 Calculate your own savings at <strong style="color: #163466;">Energy Simulation Game</strong>
        </p>
      </div>
    </div>
  `;

  document.body.appendChild(shareCard);

  try {
    // Generate canvas from the card
    const canvas = await html2canvas(shareCard, {
      backgroundColor: null,
      scale: 2, // Higher quality
      logging: false,
      useCORS: true,
    });

    // Convert to blob and download
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `energy-savings-${new Date().getTime()}.png`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
      }
    }, 'image/png');
  } finally {
    // Clean up
    document.body.removeChild(shareCard);
  }
}

/**
 * Generate individual device comparison cards for sharing
 */
export async function generateDeviceCard(
  device: SelectedDevice,
  deviceCostA: number,
  deviceCostC: number
): Promise<void> {
  const deviceSavings = deviceCostA - deviceCostC;
  const percentageSavings = deviceCostA > 0 ? ((deviceSavings / deviceCostA) * 100) : 0;

  const shareCard = document.createElement('div');
  shareCard.style.cssText = `
    position: fixed;
    left: -9999px;
    top: 0;
    width: 800px;
    padding: 40px;
    background: linear-gradient(135deg, #163466 0%, #1e4a7d 100%);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `;

  shareCard.innerHTML = `
    <div style="background: white; border-radius: 20px; padding: 40px; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="font-size: 36px; font-weight: 800; color: #163466; margin: 0 0 10px 0;">
          ${device.device.name}
        </h1>
        <p style="font-size: 20px; color: #6b7280; margin: 0;">
          ${device.device.wattage}W • ${device.duration}h per day
        </p>
      </div>

      <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; border-radius: 16px; text-align: center; margin-bottom: 25px;">
        <div style="font-size: 20px; margin-bottom: 10px; opacity: 0.9;">Monthly Savings</div>
        <div style="font-size: 56px; font-weight: 800;">${formatCurrency(deviceSavings)}</div>
        <div style="font-size: 24px; font-weight: 600; margin-top: 10px;">${percentageSavings.toFixed(1)}% Cost Reduction</div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 25px;">
        <div style="background: #fef2f2; padding: 20px; border-radius: 12px; text-align: center; border: 2px solid #fecaca;">
          <div style="font-size: 16px; color: #991b1b; margin-bottom: 8px;">Current Cost</div>
          <div style="font-size: 28px; font-weight: 800; color: #7f1d1d;">${formatCurrency(deviceCostA)}</div>
        </div>
        <div style="background: #f0fdf4; padding: 20px; border-radius: 12px; text-align: center; border: 2px solid #bbf7d0;">
          <div style="font-size: 16px; color: #166534; margin-bottom: 8px;">Optimized Cost</div>
          <div style="font-size: 28px; font-weight: 800; color: #14532d;">${formatCurrency(deviceCostC)}</div>
        </div>
      </div>

      <div style="text-align: center; padding-top: 20px; border-top: 2px solid #e5e7eb;">
        <p style="font-size: 16px; color: #6b7280; margin: 0;">
          💡 <strong>Energy Simulation Game</strong> - Discover Your Savings
        </p>
      </div>
    </div>
  `;

  document.body.appendChild(shareCard);

  try {
    const canvas = await html2canvas(shareCard, {
      backgroundColor: null,
      scale: 2,
      logging: false,
      useCORS: true,
    });

    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `${device.device.name.toLowerCase().replace(/\s+/g, '-')}-savings-${new Date().getTime()}.png`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
      }
    }, 'image/png');
  } finally {
    document.body.removeChild(shareCard);
  }
}



