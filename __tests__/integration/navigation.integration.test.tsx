/**
 * Phase 3 Integration Tests - Navigation Flows
 * 
 * Tests focused on navigation between different views:
 * - Configuration <-> Analysis navigation
 * - Device change flow
 * - State persistence during navigation
 * - Reset functionality
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Home from '@/app/page';

describe('Phase 3: Navigation Flows', () => {
  /**
   * Helper function to complete initial setup
   */
  async function setupDeviceAndTimeBlocks(user: ReturnType<typeof userEvent.setup>) {
    // Select device
    const device = screen.getByText(/Electric Pressure Cooker/i).closest('div');
    await user.click(device!);

    // Confirm configuration
    await waitFor(() => {
      const confirmButton = screen.getByRole('button', { name: /Confirm/i });
      return user.click(confirmButton);
    });

    // Select time block
    const hour14 = screen.getByText('14:00').closest('button');
    await user.click(hour14!);
  }

  describe('Forward Navigation', () => {
    it('should navigate from device selection to configuration', async () => {
      const user = userEvent.setup();
      render(<Home />);

      // Initial state: Device selection
      expect(screen.getByText(/Select Device/i)).toBeInTheDocument();

      // Click on a device
      const device = screen.getByText(/Electric Water Heater/i).closest('div');
      await user.click(device!);

      // Should show configuration modal
      await waitFor(() => {
        expect(screen.getByText(/Configure/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Hours per day/i)).toBeInTheDocument();
      });
    }, 15000);

    it('should navigate from configuration to time selection', async () => {
      const user = userEvent.setup();
      render(<Home />);

      // Select device
      const device = screen.getByText(/Electric Pressure Cooker/i).closest('div');
      await user.click(device!);

      // Complete configuration
      await waitFor(() => {
        const confirmButton = screen.getByRole('button', { name: /Confirm/i });
        return user.click(confirmButton);
      });

      // Should show time selection
      await waitFor(() => {
        expect(screen.getByText(/Select Times/i)).toBeInTheDocument();
        expect(screen.getByText(/00:00/)).toBeInTheDocument();
        expect(screen.getByText(/23:00/)).toBeInTheDocument();
      });
    }, 15000);

    it('should navigate from time selection to analysis', async () => {
      const user = userEvent.setup();
      render(<Home />);

      await setupDeviceAndTimeBlocks(user);

      // Click View Analysis
      const analysisButton = screen.getByRole('button', { name: /View Cost Analysis/i });
      await user.click(analysisButton);

      // Should show cost comparison
      await waitFor(() => {
        expect(screen.getByText(/Cost Comparison Analysis/i)).toBeInTheDocument();
        expect(screen.getByText(/Scenario A/i)).toBeInTheDocument();
        expect(screen.getByText(/Scenario B/i)).toBeInTheDocument();
        expect(screen.getByText(/Scenario C/i)).toBeInTheDocument();
      });
    }, 20000);
  });

  describe('Backward Navigation', () => {
    it('should navigate back from analysis to configuration', async () => {
      const user = userEvent.setup();
      render(<Home />);

      await setupDeviceAndTimeBlocks(user);

      // Go to analysis
      const analysisButton = screen.getByRole('button', { name: /View Cost Analysis/i });
      await user.click(analysisButton);

      await waitFor(() => {
        expect(screen.getByText(/Cost Comparison Analysis/i)).toBeInTheDocument();
      });

      // Navigate back
      const backButton = screen.getByRole('button', { name: /Back to Configuration/i });
      await user.click(backButton);

      // Should show time selection again
      await waitFor(() => {
        expect(screen.getByText(/Select Times/i)).toBeInTheDocument();
        expect(screen.queryByText(/Cost Comparison Analysis/i)).not.toBeInTheDocument();
      });
    }, 20000);

    it('should allow editing configuration after viewing analysis', async () => {
      const user = userEvent.setup();
      render(<Home />);

      await setupDeviceAndTimeBlocks(user);

      // Go to analysis
      const analysisButton = screen.getByRole('button', { name: /View Cost Analysis/i });
      await user.click(analysisButton);

      await waitFor(() => {
        expect(screen.getByText(/Cost Comparison Analysis/i)).toBeInTheDocument();
      });

      // Navigate back
      const backButton = screen.getByRole('button', { name: /Back to Configuration/i });
      await user.click(backButton);

      // Edit configuration
      const editConfigButton = screen.getByRole('button', { name: /Edit Config/i });
      await user.click(editConfigButton);

      // Should show configuration modal
      await waitFor(() => {
        expect(screen.getByLabelText(/Hours per day/i)).toBeInTheDocument();
      });
    }, 20000);
  });

  describe('Device Change Navigation', () => {
    it('should allow changing device from configuration view', async () => {
      const user = userEvent.setup();
      render(<Home />);

      await setupDeviceAndTimeBlocks(user);

      // Click Change Device
      const changeDeviceButton = screen.getByRole('button', { name: /Change Device/i });
      await user.click(changeDeviceButton);

      // Should return to device selection
      await waitFor(() => {
        expect(screen.getByText(/Select Device/i)).toBeInTheDocument();
        expect(screen.queryByText(/Electric Pressure Cooker/i)).toBeInTheDocument(); // In catalog
      });
    }, 15000);

    it('should allow changing device from analysis view', async () => {
      const user = userEvent.setup();
      render(<Home />);

      await setupDeviceAndTimeBlocks(user);

      // Go to analysis
      const analysisButton = screen.getByRole('button', { name: /View Cost Analysis/i });
      await user.click(analysisButton);

      await waitFor(() => {
        expect(screen.getByText(/Cost Comparison Analysis/i)).toBeInTheDocument();
      });

      // Click Change Device
      const changeDeviceButton = screen.getByRole('button', { name: /Change Device/i });
      await user.click(changeDeviceButton);

      // Should return to device selection
      await waitFor(() => {
        expect(screen.getByText(/Select Device/i)).toBeInTheDocument();
        expect(screen.queryByText(/Cost Comparison Analysis/i)).not.toBeInTheDocument();
      });
    }, 20000);

    it('should clear analysis state when changing device', async () => {
      const user = userEvent.setup();
      render(<Home />);

      // Complete flow with first device
      await setupDeviceAndTimeBlocks(user);

      const analysisButton = screen.getByRole('button', { name: /View Cost Analysis/i });
      await user.click(analysisButton);

      await waitFor(() => {
        expect(screen.getByText(/Cost Comparison Analysis/i)).toBeInTheDocument();
      });

      // Change device
      const changeDeviceButton = screen.getByRole('button', { name: /Change Device/i });
      await user.click(changeDeviceButton);

      // Select new device
      await waitFor(() => {
        const newDevice = screen.getByText(/Electric Water Heater/i).closest('div');
        return user.click(newDevice!);
      });

      // Confirm new device
      await waitFor(() => {
        const confirmButton = screen.getByRole('button', { name: /Confirm/i });
        return user.click(confirmButton);
      });

      // Should be at time selection, NOT analysis
      await waitFor(() => {
        expect(screen.getByText(/Select Times/i)).toBeInTheDocument();
        expect(screen.queryByText(/Cost Comparison Analysis/i)).not.toBeInTheDocument();
      });
    }, 25000);
  });

  describe('Reset Functionality', () => {
    it('should reset all state with Start Over button', async () => {
      const user = userEvent.setup();
      render(<Home />);

      await setupDeviceAndTimeBlocks(user);

      // Click Start Over
      const startOverButton = screen.getByRole('button', { name: /Start Over/i });
      await user.click(startOverButton);

      // Should return to initial state
      await waitFor(() => {
        expect(screen.getByText(/Select Device/i)).toBeInTheDocument();
        expect(screen.getByText(/Compare Costs/i)).toBeInTheDocument();
        expect(screen.queryByText(/14:00/)).not.toBeInTheDocument();
      });
    }, 15000);

    it('should clear time blocks when resetting', async () => {
      const user = userEvent.setup();
      render(<Home />);

      // Select device and time blocks
      const device = screen.getByText(/Electric Pressure Cooker/i).closest('div');
      await user.click(device!);

      await waitFor(() => {
        const confirmButton = screen.getByRole('button', { name: /Confirm/i });
        return user.click(confirmButton);
      });

      // Select multiple time blocks
      const hour10 = screen.getByText('10:00').closest('button');
      const hour11 = screen.getByText('11:00').closest('button');
      await user.click(hour10!);
      await user.click(hour11!);

      await waitFor(() => {
        expect(screen.getByText(/2 hours/i)).toBeInTheDocument();
      });

      // Reset
      const startOverButton = screen.getByRole('button', { name: /Start Over/i });
      await user.click(startOverButton);

      // Select same device again
      await waitFor(() => {
        const deviceAgain = screen.getByText(/Electric Pressure Cooker/i).closest('div');
        return user.click(deviceAgain!);
      });

      await waitFor(() => {
        const confirmButton = screen.getByRole('button', { name: /Confirm/i });
        return user.click(confirmButton);
      });

      // Time blocks should be cleared
      await waitFor(() => {
        expect(screen.queryByText(/2 hours/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/View Cost Analysis/i)).not.toBeInTheDocument();
      });
    }, 20000);
  });

  describe('State Persistence', () => {
    it('should maintain selected time blocks when navigating back from analysis', async () => {
      const user = userEvent.setup();
      render(<Home />);

      await setupDeviceAndTimeBlocks(user);

      // Select additional time blocks
      const hour15 = screen.getByText('15:00').closest('button');
      const hour16 = screen.getByText('16:00').closest('button');
      await user.click(hour15!);
      await user.click(hour16!);

      await waitFor(() => {
        expect(screen.getByText(/3 hours/i)).toBeInTheDocument();
      });

      // Go to analysis
      const analysisButton = screen.getByRole('button', { name: /View Cost Analysis/i });
      await user.click(analysisButton);

      await waitFor(() => {
        expect(screen.getByText(/Cost Comparison Analysis/i)).toBeInTheDocument();
      });

      // Navigate back
      const backButton = screen.getByRole('button', { name: /Back to Configuration/i });
      await user.click(backButton);

      // Time blocks should still be selected
      await waitFor(() => {
        expect(screen.getByText(/3 hours/i)).toBeInTheDocument();
      });
    }, 20000);

    it('should maintain device configuration when navigating between views', async () => {
      const user = userEvent.setup();
      render(<Home />);

      // Select cooking device with specific config
      const device = screen.getByText(/Electric Pressure Cooker/i).closest('div');
      await user.click(device!);

      await waitFor(async () => {
        const durationInput = screen.getByLabelText(/Hours per day/i);
        await user.clear(durationInput);
        await user.type(durationInput, '3');
        
        const fuelSelect = screen.getByRole('combobox', { name: /Current Fuel/i });
        await user.selectOptions(fuelSelect, 'LPG');

        const confirmButton = screen.getByRole('button', { name: /Confirm/i });
        return user.click(confirmButton);
      });

      // Verify configuration is shown
      await waitFor(() => {
        expect(screen.getByText(/3h per day/i)).toBeInTheDocument();
      });

      // Select time block and view analysis
      const hour12 = screen.getByText('12:00').closest('button');
      await user.click(hour12!);

      const analysisButton = screen.getByRole('button', { name: /View Cost Analysis/i });
      await user.click(analysisButton);

      await waitFor(() => {
        expect(screen.getByText(/Cost Comparison Analysis/i)).toBeInTheDocument();
      });

      // Navigate back
      const backButton = screen.getByRole('button', { name: /Back to Configuration/i });
      await user.click(backButton);

      // Configuration should still be there
      await waitFor(() => {
        expect(screen.getByText(/3h per day/i)).toBeInTheDocument();
      });
    }, 20000);
  });

  describe('Step Indicators', () => {
    it('should update step indicators as user progresses', async () => {
      const user = userEvent.setup();
      render(<Home />);

      // Step 1: Device selection
      expect(screen.getByText(/Select Device/i)).toBeInTheDocument();
      const step1Indicator = screen.getByText(/Select Device/i).closest('div');
      expect(step1Indicator).toHaveTextContent('1');

      // Select device
      const device = screen.getByText(/Electric Pressure Cooker/i).closest('div');
      await user.click(device!);

      // Step 2: Configuration
      await waitFor(() => {
        const confirmButton = screen.getByRole('button', { name: /Confirm/i });
        return user.click(confirmButton);
      });

      // Step should show as completed
      await waitFor(() => {
        const step2Indicator = screen.getByText(/Configure/i).closest('div');
        expect(step2Indicator).toHaveTextContent('✓');
      });

      // Step 3: Time selection
      expect(screen.getByText(/Select Times/i)).toBeInTheDocument();
    }, 20000);

    it('should show current step as active', async () => {
      const user = userEvent.setup();
      render(<Home />);

      await setupDeviceAndTimeBlocks(user);

      // Current step (3: Select Times) should be highlighted/active
      const step3Indicator = screen.getByText(/Select Times/i).closest('div');
      expect(step3Indicator).toBeInTheDocument();
      
      // Should have active styling (this would depend on implementation)
      // We're just checking it's visible
      expect(step3Indicator?.textContent).toContain('3');
    }, 15000);
  });
});

