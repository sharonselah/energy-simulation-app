/**
 * Phase 3 Integration Tests - Complete User Flow
 * 
 * These tests cover the main user journeys through Phase 3:
 * 1. Complete device selection → configuration → time selection → cost analysis
 * 2. Navigation between views
 * 3. Cost comparison across scenarios
 */

import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Home from '@/app/page';
import { DEVICE_CATALOG } from '@/lib/constants';

describe('Phase 3: Complete User Flow', () => {
  describe('End-to-End User Journey', () => {
    it('should complete the full flow from device selection to cost analysis', async () => {
      const user = userEvent.setup();
      render(<Home />);

      // Step 1: Verify we start at device selection
      expect(screen.getByText(/Energy Simulation Game/i)).toBeInTheDocument();
      expect(screen.getByText(/Select Device/i)).toBeInTheDocument();

      // Step 2: Select a device (Electric Pressure Cooker)
      const deviceCard = screen.getByText(/Electric Pressure Cooker/i).closest('div');
      expect(deviceCard).toBeInTheDocument();
      await user.click(deviceCard!);

      // Step 3: Configure the device
      await waitFor(() => {
        expect(screen.getByText(/Configure/i)).toBeInTheDocument();
      });

      // Set duration
      const durationInput = screen.getByLabelText(/Hours per day/i) || screen.getByDisplayValue('1');
      await user.clear(durationInput);
      await user.type(durationInput, '2');

      // Select alternative fuel (Charcoal)
      const fuelSelect = screen.getByRole('combobox', { name: /Current Fuel/i });
      await user.selectOptions(fuelSelect, 'Charcoal');

      // Confirm configuration
      const confirmButton = screen.getByRole('button', { name: /Confirm/i });
      await user.click(confirmButton);

      // Step 4: Select time blocks
      await waitFor(() => {
        expect(screen.getByText(/Select Times/i)).toBeInTheDocument();
      });

      // Select peak hour time blocks (18:00-20:00)
      const hour18 = screen.getByText('18:00').closest('button');
      const hour19 = screen.getByText('19:00').closest('button');
      
      await user.click(hour18!);
      await user.click(hour19!);

      // Step 5: View Cost Analysis
      await waitFor(() => {
        const analysisButton = screen.getByRole('button', { name: /View Cost Analysis/i });
        expect(analysisButton).toBeInTheDocument();
        return user.click(analysisButton);
      });

      // Step 6: Verify Cost Comparison View
      await waitFor(() => {
        expect(screen.getByText(/Cost Comparison Analysis/i)).toBeInTheDocument();
        
        // Verify all three scenarios are displayed
        expect(screen.getByText(/Scenario A/i)).toBeInTheDocument();
        expect(screen.getByText(/Scenario B/i)).toBeInTheDocument();
        expect(screen.getByText(/Scenario C/i)).toBeInTheDocument();
        
        // Verify smart tips are shown
        expect(screen.getByText(/Smart Tips/i)).toBeInTheDocument();
      });
    }, 30000); // Increase timeout for full flow

    it('should navigate back to configuration and maintain state', async () => {
      const user = userEvent.setup();
      render(<Home />);

      // Select device
      const deviceCard = screen.getByText(/Electric Water Heater/i).closest('div');
      await user.click(deviceCard!);

      // Configure
      await waitFor(() => {
        const confirmButton = screen.getByRole('button', { name: /Confirm/i });
        return user.click(confirmButton);
      });

      // Select time blocks
      const hour22 = screen.getByText('22:00').closest('button');
      await user.click(hour22!);

      // View analysis
      const analysisButton = screen.getByRole('button', { name: /View Cost Analysis/i });
      await user.click(analysisButton);

      // Verify we're in analysis view
      await waitFor(() => {
        expect(screen.getByText(/Cost Comparison Analysis/i)).toBeInTheDocument();
      });

      // Navigate back to configuration
      const backButton = screen.getByRole('button', { name: /Back to Configuration/i });
      await user.click(backButton);

      // Verify we're back at configuration and state is maintained
      await waitFor(() => {
        expect(screen.getByText(/Electric Water Heater/i)).toBeInTheDocument();
        expect(screen.getByText(/Select Times/i)).toBeInTheDocument();
        
        // Verify time block is still selected
        const hour22After = screen.getByText('22:00').closest('button');
        expect(hour22After).toHaveClass(/selected/i, /bg-/); // Check for selected styling
      });
    }, 20000);

    it('should reset all state when using Start Over', async () => {
      const user = userEvent.setup();
      render(<Home />);

      // Select and configure device
      const deviceCard = screen.getByText(/Electric Pressure Cooker/i).closest('div');
      await user.click(deviceCard!);

      await waitFor(() => {
        const confirmButton = screen.getByRole('button', { name: /Confirm/i });
        return user.click(confirmButton);
      });

      // Select time block
      const hour14 = screen.getByText('14:00').closest('button');
      await user.click(hour14!);

      // Click Start Over
      const startOverButton = screen.getByRole('button', { name: /Start Over/i });
      await user.click(startOverButton);

      // Verify we're back at initial state
      await waitFor(() => {
        expect(screen.getByText(/Select Device/i)).toBeInTheDocument();
        expect(screen.getByText(/Compare Costs/i)).toBeInTheDocument();
        expect(screen.queryByText(/Electric Pressure Cooker/i)).not.toBeInTheDocument();
      });
    }, 15000);
  });

  describe('Device Configuration', () => {
    it('should handle cooking device with fuel selection', async () => {
      const user = userEvent.setup();
      render(<Home />);

      // Select a cooking device
      const cookingDevice = screen.getByText(/Electric Induction Cooktop/i).closest('div');
      await user.click(cookingDevice!);

      await waitFor(() => {
        // Verify fuel options are shown for cooking devices
        expect(screen.getByLabelText(/Current Fuel/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Meals per day/i)).toBeInTheDocument();
      });

      // Select LPG as fuel
      const fuelSelect = screen.getByRole('combobox', { name: /Current Fuel/i });
      await user.selectOptions(fuelSelect, 'LPG');

      const confirmButton = screen.getByRole('button', { name: /Confirm/i });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(screen.getByText(/Electric Induction Cooktop/i)).toBeInTheDocument();
      });
    }, 15000);

    it('should handle non-cooking device without fuel selection', async () => {
      const user = userEvent.setup();
      render(<Home />);

      // Select a non-cooking device
      const heatingDevice = screen.getByText(/Space Heater/i).closest('div');
      await user.click(heatingDevice!);

      await waitFor(() => {
        // Verify fuel options are NOT shown for non-cooking devices
        expect(screen.queryByLabelText(/Current Fuel/i)).not.toBeInTheDocument();
        expect(screen.queryByLabelText(/Meals per day/i)).not.toBeInTheDocument();
        
        // But duration should be shown
        expect(screen.getByLabelText(/Hours per day/i)).toBeInTheDocument();
      });
    }, 15000);
  });

  describe('Time Block Selection', () => {
    it('should allow selecting individual time blocks', async () => {
      const user = userEvent.setup();
      render(<Home />);

      // Setup: Select and configure device
      const deviceCard = screen.getByText(/Electric Pressure Cooker/i).closest('div');
      await user.click(deviceCard!);

      await waitFor(() => {
        const confirmButton = screen.getByRole('button', { name: /Confirm/i });
        return user.click(confirmButton);
      });

      // Select multiple time blocks
      const hour10 = screen.getByText('10:00').closest('button');
      const hour11 = screen.getByText('11:00').closest('button');
      const hour12 = screen.getByText('12:00').closest('button');

      await user.click(hour10!);
      await user.click(hour11!);
      await user.click(hour12!);

      // Verify selection count
      await waitFor(() => {
        expect(screen.getByText(/3 hours/i)).toBeInTheDocument();
      });
    }, 15000);

    it('should allow deselecting time blocks', async () => {
      const user = userEvent.setup();
      render(<Home />);

      // Setup: Select and configure device
      const deviceCard = screen.getByText(/Electric Water Heater/i).closest('div');
      await user.click(deviceCard!);

      await waitFor(() => {
        const confirmButton = screen.getByRole('button', { name: /Confirm/i });
        return user.click(confirmButton);
      });

      // Select and then deselect a time block
      const hour15 = screen.getByText('15:00').closest('button');
      await user.click(hour15!); // Select
      
      await waitFor(() => {
        expect(screen.getByText(/1 hour/i)).toBeInTheDocument();
      });

      await user.click(hour15!); // Deselect

      await waitFor(() => {
        expect(screen.queryByText(/View Cost Analysis/i)).not.toBeInTheDocument();
      });
    }, 15000);

    it('should use bulk selection for off-peak hours', async () => {
      const user = userEvent.setup();
      render(<Home />);

      // Setup: Select and configure device
      const deviceCard = screen.getByText(/Electric Pressure Cooker/i).closest('div');
      await user.click(deviceCard!);

      await waitFor(() => {
        const confirmButton = screen.getByRole('button', { name: /Confirm/i });
        return user.click(confirmButton);
      });

      // Click "Select All Off-Peak"
      const offPeakButton = screen.getByRole('button', { name: /Off-Peak/i });
      await user.click(offPeakButton);

      // Verify multiple hours are selected (off-peak is 22:00-06:00 = 8 hours)
      await waitFor(() => {
        expect(screen.getByText(/8 hours/i)).toBeInTheDocument();
      });
    }, 15000);
  });
});

