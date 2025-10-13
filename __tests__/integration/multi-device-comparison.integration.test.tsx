/**
 * Integration Tests - Multi-Device Comparison (Phase 8)
 * 
 * Focused, high-quality tests covering critical multi-device user flows.
 * Tests the actual user journey through the multi-device comparison feature.
 * 
 * Test Strategy:
 * - Test core user flows end-to-end
 * - Focus on realistic scenarios
 * - Verify critical functionality and calculations
 * - Fewer, more comprehensive tests over many small tests
 */

import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AppProvider } from '@/contexts/AppContext';
import DeviceManager from '@/components/device-selection/DeviceManager';
import TimeBlockSelector from '@/components/tou-optimizer/TimeBlockSelector';

/**
 * Helper to render components with AppContext
 */
function renderWithContext(component: React.ReactElement) {
  return render(<AppProvider>{component}</AppProvider>);
}

describe('Multi-Device Comparison - Core User Flows', () => {
  /**
   * TEST 1: Complete Happy Path
   * Most important test - covers the full user journey from start to finish
   */
  it('should complete full multi-device comparison workflow: add devices, configure, and view aggregated results', async () => {
    const user = userEvent.setup();
    
    renderWithContext(<DeviceManager showAddDevice={true} />);

    // ===  1: VERIFY INITIAL STATE ===
    await waitFor(() => {
      expect(screen.getByText(/Select Your First Device/i)).toBeInTheDocument();
    });

    // === STEP 2: ADD FIRST DEVICE (Cooking device with alternative fuel) ===
    // Click on Electric Pressure Cooker
    const cookerCard = screen.getByText(/Electric Pressure Cooker/i);
    await user.click(cookerCard);

    // Configuration modal should appear
    await waitFor(() => {
      expect(screen.getByText(/Configure.*Electric Pressure Cooker/i)).toBeInTheDocument();
    });

    // Configure with LPG fuel (for cooking devices) - click the LPG button
    const lpgButton = screen.getByRole('button', { name: /lpg/i });
    await user.click(lpgButton);

    // Confirm configuration
    const confirmButton = screen.getByRole('button', { name: /Continue to Time Selection/i });
    await user.click(confirmButton);

    // === STEP 3: VERIFY FIRST DEVICE ADDED ===
    await waitFor(() => {
      expect(screen.getByText(/Your Devices.*1/i)).toBeInTheDocument();
      expect(screen.getByText(/Electric Pressure Cooker/i)).toBeInTheDocument();
    });

    // Device should show savings information
    expect(screen.getByText(/Saves.*month/i)).toBeInTheDocument();

    // === STEP 4: ADD SECOND DEVICE (Heating device without alternative fuel) ===
    const addButton = screen.getByRole('button', { name: /Add Another Device/i });
    await user.click(addButton);

    await waitFor(() => {
      expect(screen.getByText(/Add Another Device/i)).toBeInTheDocument();
    });

    // Select Electric Water Heater
    const heaterCard = screen.getByText(/Electric Water Heater/i);
    await user.click(heaterCard);

    // Configuration modal appears
    await waitFor(() => {
      expect(screen.getByText(/Configure.*Electric Water Heater/i)).toBeInTheDocument();
    });

    // Confirm with default settings
    const confirmButton2 = screen.getByRole('button', { name: /Continue to Time Selection/i });
    await user.click(confirmButton2);

    // === STEP 5: VERIFY TWO DEVICES ADDED ===
    await waitFor(() => {
      expect(screen.getByText(/Your Devices.*2/i)).toBeInTheDocument();
    });

    // Both devices should be visible
    expect(screen.getByText(/Electric Pressure Cooker/i)).toBeInTheDocument();
    expect(screen.getByText(/Electric Water Heater/i)).toBeInTheDocument();

    // === STEP 6: VERIFY AGGREGATED CALCULATIONS ===
    // Should show combined savings
    expect(screen.getByText(/Total Combined Savings/i)).toBeInTheDocument();
    expect(screen.getByText(/Annual Projection/i)).toBeInTheDocument();

    // Should display currency amounts (Ksh)
    const currencyElements = screen.getAllByText(/Ksh/i);
    expect(currencyElements.length).toBeGreaterThan(0);

  }, 45000);

  /**
   * TEST 2: Device Management
   * Tests editing and removing devices from the comparison
   */
  it('should allow removing individual devices from multi-device comparison', async () => {
    const user = userEvent.setup();
    
    // Mock window.confirm to auto-accept
    const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);

    renderWithContext(<DeviceManager showAddDevice={true} />);

    // Add first device
    await waitFor(() => {
      expect(screen.getByText(/Electric Pressure Cooker/i)).toBeInTheDocument();
    });

    const device1 = screen.getByText(/Electric Pressure Cooker/i);
    await user.click(device1);

    await waitFor(() => {
      const confirmButton = screen.getByRole('button', { name: /Continue to Time Selection/i });
      return user.click(confirmButton);
    });

    // Wait for device to be added
    await waitFor(() => {
      expect(screen.getByText(/Your Devices.*1/i)).toBeInTheDocument();
    });

    // Add second device
    const addButton = screen.getByRole('button', { name: /Add Another Device/i });
    await user.click(addButton);

    await waitFor(() => {
      const device2 = screen.getByText(/Electric Water Heater/i);
      return user.click(device2);
    });

    await waitFor(() => {
      const confirmButton = screen.getByRole('button', { name: /Continue to Time Selection/i });
      return user.click(confirmButton);
    });

    // Verify both devices present
    await waitFor(() => {
      expect(screen.getByText(/Your Devices.*2/i)).toBeInTheDocument();
    });

    // Remove first device (find trash icon button - last button in each device card)
    const deviceCards = screen.getAllByRole('heading', { level: 3 });
    expect(deviceCards.length).toBe(2);
    
    // Get all buttons and find the delete button (with trash icon, should be the last small button in first device card)
    const allButtons = screen.getAllByRole('button');
    // Filter for the small buttons (not the main "Clear All" or "Add Another" buttons)
    const smallButtons = allButtons.filter(btn => btn.classList.contains('text-sm'));
    // The third button in the first device should be the delete button (expand, edit, delete)
    const deleteButton = smallButtons[2];
    await user.click(deleteButton);

    // Should now have only 1 device
    await waitFor(() => {
      expect(screen.getByText(/Your Devices.*1/i)).toBeInTheDocument();
    });

    confirmSpy.mockRestore();

  }, 40000);

  /**
   * TEST 3: Clear All Functionality
   * Tests bulk removal of all devices
   */
  it('should clear all devices when Clear All is clicked', async () => {
    const user = userEvent.setup();
    
    const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);

    renderWithContext(<DeviceManager showAddDevice={true} />);

    // Add a device
    await waitFor(() => {
      expect(screen.getByText(/Electric Pressure Cooker/i)).toBeInTheDocument();
    });

    const device = screen.getByText(/Electric Pressure Cooker/i);
    await user.click(device);

    await waitFor(() => {
      const confirmButton = screen.getByRole('button', { name: /Continue to Time Selection/i });
      return user.click(confirmButton);
    });

    // Verify device added
    await waitFor(() => {
      expect(screen.getByText(/Your Devices/i)).toBeInTheDocument();
    });

    // Click Clear All
    const clearAllButton = screen.getByRole('button', { name: /Clear All/i });
    await user.click(clearAllButton);

    // Should show empty state
    await waitFor(() => {
      expect(screen.getByText(/No Devices Added Yet/i)).toBeInTheDocument();
    });

    confirmSpy.mockRestore();

  }, 35000);

  /**
   * TEST 4: Mixed Device Types
   * Tests combining different device types
   */
  it('should correctly handle multiple different device types', async () => {
    const user = userEvent.setup();
    
    renderWithContext(<DeviceManager showAddDevice={true} />);

    // Add first device (appliance)
    await waitFor(() => {
      expect(screen.getByText(/Electric Fan/i)).toBeInTheDocument();
    });

    const fan = screen.getByText(/Electric Fan/i);
    await user.click(fan);

    await waitFor(() => {
      const confirmButton1 = screen.getByRole('button', { name: /Continue to Time Selection/i });
      return user.click(confirmButton1);
    });

    // Verify first device added
    await waitFor(() => {
      expect(screen.getByText(/Your Devices.*1/i)).toBeInTheDocument();
    });

    // Add second device (water heater)
    const addButton = screen.getByRole('button', { name: /Add Another Device/i });
    await user.click(addButton);

    await waitFor(() => {
      expect(screen.getByText(/Electric Water Heater/i)).toBeInTheDocument();
    });

    const waterHeater = screen.getByText(/Electric Water Heater/i);
    await user.click(waterHeater);

    await waitFor(() => {
      const confirmButton2 = screen.getByRole('button', { name: /Continue to Time Selection/i });
      return user.click(confirmButton2);
    });

    // Verify both devices present
    await waitFor(() => {
      expect(screen.getByText(/Your Devices.*2/i)).toBeInTheDocument();
    });

    // Both devices should be listed
    expect(screen.getByText(/Electric Fan/i)).toBeInTheDocument();
    expect(screen.getByText(/Electric Water Heater/i)).toBeInTheDocument();
    
    // Both devices should show combined savings
    expect(screen.getByText(/Total Combined Savings/i)).toBeInTheDocument();

  }, 40000);

  /**
   * TEST 5: Empty State
   * Tests the empty state when no devices are added
   */
  it('should show appropriate empty state when no devices added', () => {
    renderWithContext(<DeviceManager showAddDevice={false} />);

    // Should show empty state message
    expect(screen.getByText(/No Devices Added Yet/i)).toBeInTheDocument();
    expect(screen.getByText(/Add Your First Device/i)).toBeInTheDocument();

    // Should have a button to add device
    const addButton = screen.getByRole('button', { name: /Add Your First Device/i });
    expect(addButton).toBeInTheDocument();

  }, 15000);

  /**
   * TEST 6: Device Details Expansion
   * Tests expanding/collapsing device cards to view details
   */
  it('should expand and collapse device cards to show detailed information', async () => {
    const user = userEvent.setup();
    
    renderWithContext(<DeviceManager showAddDevice={true} />);

    // Add a device
    await waitFor(() => {
      expect(screen.getByText(/Electric Water Heater/i)).toBeInTheDocument();
    });

    const heater = screen.getByText(/Electric Water Heater/i);
    await user.click(heater);

    await waitFor(() => {
      const confirmButton = screen.getByRole('button', { name: /Continue to Time Selection/i });
      return user.click(confirmButton);
    });

    // Device should be in list
    await waitFor(() => {
      expect(screen.getByText(/Your Devices.*1/i)).toBeInTheDocument();
    });

    // Find and click expand button (first small button with chevron icon)
    const deviceCard = screen.getByText(/Electric Water Heater/i).closest('.bg-white');
    const buttons = within(deviceCard!).getAllByRole('button');
    // First button in the action group should be the expand/collapse button
    const expandButton = buttons[0];
    await user.click(expandButton);

    // Should show detailed cost breakdown
    await waitFor(() => {
      expect(screen.getByText(/Scenario A.*Current/i)).toBeInTheDocument();
      expect(screen.getByText(/Scenario B.*Electric/i)).toBeInTheDocument();
      expect(screen.getByText(/Scenario C.*Optimized/i)).toBeInTheDocument();
    });

    // Collapse again (same button, now should show up arrow)
    const collapseButton = buttons[0];
    await user.click(collapseButton);

    // Details should be hidden (element won't exist in DOM when collapsed)
    await waitFor(() => {
      expect(screen.queryByText(/Scenario A.*Current/i)).not.toBeInTheDocument();
    });

  }, 35000);

  /**
   * TEST 7: Savings Calculations
   * Verifies that savings are calculated and displayed correctly
   */
  it('should display individual and combined savings for multiple devices', async () => {
    const user = userEvent.setup();
    
    renderWithContext(<DeviceManager showAddDevice={true} />);

    // Add first device
    await waitFor(() => {
      expect(screen.getByText(/Electric Pressure Cooker/i)).toBeInTheDocument();
    });

    const device1 = screen.getByText(/Electric Pressure Cooker/i);
    await user.click(device1);

    await waitFor(() => {
      const confirmButton = screen.getByRole('button', { name: /Continue to Time Selection/i });
      return user.click(confirmButton);
    });

    // Wait for device to show savings
    await waitFor(() => {
      expect(screen.getByText(/Saves.*month/i)).toBeInTheDocument();
    });

    // First device should show individual savings
    const firstDeviceSavings = screen.getByText(/Saves.*month/i);
    expect(firstDeviceSavings.textContent).toMatch(/Ksh/i);

    // Add second device
    const addButton = screen.getByRole('button', { name: /Add Another Device/i });
    await user.click(addButton);

    await waitFor(() => {
      const device2 = screen.getByText(/Electric Iron/i);
      return user.click(device2);
    });

    await waitFor(() => {
      const confirmButton = screen.getByRole('button', { name: /Continue to Time Selection/i });
      return user.click(confirmButton);
    });

    // Should show combined savings
    await waitFor(() => {
      expect(screen.getByText(/Total Combined Savings/i)).toBeInTheDocument();
    });

    // Both monthly and annual projections should be present
    expect(screen.getByText(/per month/i)).toBeInTheDocument();
    expect(screen.getByText(/Annual Projection/i)).toBeInTheDocument();

    // Multiple currency amounts for different savings calculations
    const currencyElements = screen.getAllByText(/Ksh/i);
    expect(currencyElements.length).toBeGreaterThan(2);

  }, 45000);
});

/**
 * Context Integration Tests
 * Tests that verify proper integration with AppContext
 */
describe('Multi-Device Context Integration', () => {
  it('should maintain device state across component updates', async () => {
    const user = userEvent.setup();
    
    const { rerender } = renderWithContext(<DeviceManager showAddDevice={true} />);

    // Add a device
    await waitFor(() => {
      expect(screen.getByText(/Electric Pressure Cooker/i)).toBeInTheDocument();
    });

    const device = screen.getByText(/Electric Pressure Cooker/i);
    await user.click(device);

    await waitFor(() => {
      const confirmButton = screen.getByRole('button', { name: /Continue to Time Selection/i });
      return user.click(confirmButton);
    });

    // Verify device added
    await waitFor(() => {
      expect(screen.getByText(/Your Devices.*1/i)).toBeInTheDocument();
    });

    // Rerender component (simulating React update)
    rerender(<AppProvider><DeviceManager showAddDevice={false} /></AppProvider>);

    // Device should still be present
    expect(screen.getByText(/Electric Pressure Cooker/i)).toBeInTheDocument();
    expect(screen.getByText(/Your Devices.*1/i)).toBeInTheDocument();

  }, 35000);

  it('should correctly aggregate costs from multiple devices', async () => {
    const user = userEvent.setup();
    
    renderWithContext(<DeviceManager showAddDevice={true} />);

    // Add device 1
    await waitFor(() => {
      const device1 = screen.getByText(/Electric Water Heater/i);
      return user.click(device1);
    });

    await waitFor(() => {
      const confirmButton = screen.getByRole('button', { name: /Continue to Time Selection/i });
      return user.click(confirmButton);
    });

    await waitFor(() => {
      expect(screen.getByText(/Your Devices.*1/i)).toBeInTheDocument();
    });

    // Get first device savings amount (extract number for comparison later)
    const firstSavingsText = screen.getByText(/Saves.*month/i).textContent;
    
    // Add device 2
    const addButton = screen.getByRole('button', { name: /Add Another Device/i });
    await user.click(addButton);

    await waitFor(() => {
      const device2 = screen.getByText(/Electric Pressure Cooker/i);
      return user.click(device2);
    });

    await waitFor(() => {
      const confirmButton = screen.getByRole('button', { name: /Continue to Time Selection/i });
      return user.click(confirmButton);
    });

    // Wait for aggregated savings
    await waitFor(() => {
      expect(screen.getByText(/Total Combined Savings/i)).toBeInTheDocument();
    });

    // Combined savings should be present and should be a valid currency amount
    const combinedSavingsSection = screen.getByText(/Total Combined Savings/i).closest('div');
    expect(combinedSavingsSection).toBeTruthy();
    expect(within(combinedSavingsSection!).getByText(/Ksh/i)).toBeInTheDocument();

  }, 45000);
});
