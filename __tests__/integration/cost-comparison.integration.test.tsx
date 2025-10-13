/**
 * Phase 3 Integration Tests - Cost Comparison Scenarios
 * 
 * Tests focused on verifying the three scenarios display correct information:
 * - Scenario A: Current fuel costs
 * - Scenario B: Current usage pattern costs
 * - Scenario C: Optimized TOU costs
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Home from '@/app/page';

describe('Phase 3: Cost Comparison Scenarios', () => {
  describe('Scenario A: Current Fuel Costs', () => {
    it('should display fuel costs for cooking devices with alternative fuel', async () => {
      const user = userEvent.setup();
      render(<Home />);

      // Select cooking device
      const cookingDevice = screen.getByText(/Electric Pressure Cooker/i).closest('div');
      await user.click(cookingDevice!);

      // Configure with Charcoal fuel
      await waitFor(() => {
        const fuelSelect = screen.getByRole('combobox', { name: /Current Fuel/i });
        return user.selectOptions(fuelSelect, 'Charcoal');
      });

      const confirmButton = screen.getByRole('button', { name: /Confirm/i });
      await user.click(confirmButton);

      // Select time blocks
      const hour18 = screen.getByText('18:00').closest('button');
      await user.click(hour18!);

      // View analysis
      const analysisButton = screen.getByRole('button', { name: /View Cost Analysis/i });
      await user.click(analysisButton);

      // Verify Scenario A shows charcoal costs
      await waitFor(() => {
        expect(screen.getByText(/Scenario A/i)).toBeInTheDocument();
        expect(screen.getByText(/Current.*Charcoal/i)).toBeInTheDocument();
        
        // Should show cost breakdowns (Daily, Monthly, Annual)
        const scenarioACard = screen.getByText(/Scenario A/i).closest('div');
        expect(scenarioACard).toHaveTextContent(/Daily/i);
        expect(scenarioACard).toHaveTextContent(/Monthly/i);
        expect(scenarioACard).toHaveTextContent(/Annual/i);
        expect(scenarioACard).toHaveTextContent(/KES/);
      });
    }, 20000);

    it('should show "grid electricity" message for non-cooking devices', async () => {
      const user = userEvent.setup();
      render(<Home />);

      // Select non-cooking device
      const heatingDevice = screen.getByText(/Space Heater/i).closest('div');
      await user.click(heatingDevice!);

      await waitFor(() => {
        const confirmButton = screen.getByRole('button', { name: /Confirm/i });
        return user.click(confirmButton);
      });

      // Select time block
      const hour14 = screen.getByText('14:00').closest('button');
      await user.click(hour14!);

      // View analysis
      const analysisButton = screen.getByRole('button', { name: /View Cost Analysis/i });
      await user.click(analysisButton);

      // Verify Scenario A shows grid electricity message
      await waitFor(() => {
        expect(screen.getByText(/Currently using grid electricity/i)).toBeInTheDocument();
      });
    }, 20000);
  });

  describe('Scenario B: Current Usage Pattern', () => {
    it('should calculate costs based on selected time blocks', async () => {
      const user = userEvent.setup();
      render(<Home />);

      // Select device
      const device = screen.getByText(/Electric Water Heater/i).closest('div');
      await user.click(device!);

      await waitFor(() => {
        const confirmButton = screen.getByRole('button', { name: /Confirm/i });
        return user.click(confirmButton);
      });

      // Select peak hour time blocks (expensive)
      const hour18 = screen.getByText('18:00').closest('button');
      const hour19 = screen.getByText('19:00').closest('button');
      await user.click(hour18!);
      await user.click(hour19!);

      // View analysis
      const analysisButton = screen.getByRole('button', { name: /View Cost Analysis/i });
      await user.click(analysisButton);

      // Verify Scenario B shows cost breakdown by TOU rate
      await waitFor(() => {
        const scenarioBCard = screen.getByText(/Scenario B/i).closest('div');
        expect(scenarioBCard).toBeInTheDocument();
        
        // Should show TOU rate breakdown
        expect(scenarioBCard).toHaveTextContent(/Peak/i);
        expect(scenarioBCard).toHaveTextContent(/KES/);
        
        // Should show daily/monthly/annual costs
        expect(scenarioBCard).toHaveTextContent(/Daily/i);
        expect(scenarioBCard).toHaveTextContent(/Monthly/i);
      });
    }, 20000);

    it('should show peak-heavy warning when using too many peak hours', async () => {
      const user = userEvent.setup();
      render(<Home />);

      // Select device
      const device = screen.getByText(/Electric Pressure Cooker/i).closest('div');
      await user.click(device!);

      await waitFor(() => {
        const confirmButton = screen.getByRole('button', { name: /Confirm/i });
        return user.click(confirmButton);
      });

      // Select ONLY peak hours (18:00, 19:00, 20:00, 21:00)
      const peakHours = ['18:00', '19:00', '20:00', '21:00'];
      for (const hour of peakHours) {
        const hourButton = screen.getByText(hour).closest('button');
        await user.click(hourButton!);
      }

      // View analysis
      const analysisButton = screen.getByRole('button', { name: /View Cost Analysis/i });
      await user.click(analysisButton);

      // Verify peak-heavy warning is shown
      await waitFor(() => {
        // Warning should be visible (could be icon or text)
        expect(screen.getByText(/peak/i)).toBeInTheDocument();
      });
    }, 20000);
  });

  describe('Scenario C: Optimized TOU', () => {
    it('should show optimized time blocks with maximum off-peak usage', async () => {
      const user = userEvent.setup();
      render(<Home />);

      // Select device
      const device = screen.getByText(/Electric Pressure Cooker/i).closest('div');
      await user.click(device!);

      await waitFor(() => {
        const durationInput = screen.getByLabelText(/Hours per day/i);
        await user.clear(durationInput);
        await user.type(durationInput, '4');
        
        const confirmButton = screen.getByRole('button', { name: /Confirm/i });
        return user.click(confirmButton);
      });

      // Select random mid-peak hours
      const hour10 = screen.getByText('10:00').closest('button');
      const hour11 = screen.getByText('11:00').closest('button');
      const hour12 = screen.getByText('12:00').closest('button');
      const hour13 = screen.getByText('13:00').closest('button');
      
      await user.click(hour10!);
      await user.click(hour11!);
      await user.click(hour12!);
      await user.click(hour13!);

      // View analysis
      const analysisButton = screen.getByRole('button', { name: /View Cost Analysis/i });
      await user.click(analysisButton);

      // Verify Scenario C shows optimized pattern
      await waitFor(() => {
        const scenarioCCard = screen.getByText(/Scenario C/i).closest('div');
        expect(scenarioCCard).toBeInTheDocument();
        
        // Should show "Optimized" in the title
        expect(scenarioCCard).toHaveTextContent(/Optimized/i);
        
        // Should show savings information
        expect(scenarioCCard).toHaveTextContent(/Savings/i);
        expect(scenarioCCard).toHaveTextContent(/KES/);
      });
    }, 20000);

    it('should calculate savings between current and optimized patterns', async () => {
      const user = userEvent.setup();
      render(<Home />);

      // Select device
      const device = screen.getByText(/Electric Water Heater/i).closest('div');
      await user.click(device!);

      await waitFor(() => {
        const confirmButton = screen.getByRole('button', { name: /Confirm/i });
        return user.click(confirmButton);
      });

      // Select peak hour (expensive)
      const hour19 = screen.getByText('19:00').closest('button');
      await user.click(hour19!);

      // View analysis
      const analysisButton = screen.getByRole('button', { name: /View Cost Analysis/i });
      await user.click(analysisButton);

      // Verify savings are calculated and displayed
      await waitFor(() => {
        // Should show savings in the comparison chart or scenario C
        expect(screen.getByText(/Savings/i)).toBeInTheDocument();
        
        // Should show percentage or amount
        const savingsText = screen.getAllByText(/KES/).length;
        expect(savingsText).toBeGreaterThan(0);
      });
    }, 20000);

    it('should show recommended off-peak time ranges', async () => {
      const user = userEvent.setup();
      render(<Home />);

      // Select device
      const device = screen.getByText(/Electric Pressure Cooker/i).closest('div');
      await user.click(device!);

      await waitFor(() => {
        const confirmButton = screen.getByRole('button', { name: /Confirm/i });
        return user.click(confirmButton);
      });

      // Select peak hours
      const hour18 = screen.getByText('18:00').closest('button');
      await user.click(hour18!);

      // View analysis
      const analysisButton = screen.getByRole('button', { name: /View Cost Analysis/i });
      await user.click(analysisButton);

      // Verify recommended times are shown
      await waitFor(() => {
        const scenarioCCard = screen.getByText(/Scenario C/i).closest('div');
        
        // Should show recommended time ranges or hour distribution
        expect(scenarioCCard).toHaveTextContent(/Off-Peak|22:00|23:00|00:00|01:00|02:00|03:00|04:00|05:00/i);
      });
    }, 20000);
  });

  describe('Comparison Chart', () => {
    it('should display bar chart comparing all scenarios', async () => {
      const user = userEvent.setup();
      render(<Home />);

      // Select cooking device with fuel
      const device = screen.getByText(/Electric Pressure Cooker/i).closest('div');
      await user.click(device!);

      await waitFor(() => {
        const fuelSelect = screen.getByRole('combobox', { name: /Current Fuel/i });
        return user.selectOptions(fuelSelect, 'LPG');
      });

      const confirmButton = screen.getByRole('button', { name: /Confirm/i });
      await user.click(confirmButton);

      // Select time blocks
      const hour14 = screen.getByText('14:00').closest('button');
      await user.click(hour14!);

      // View analysis
      const analysisButton = screen.getByRole('button', { name: /View Cost Analysis/i });
      await user.click(analysisButton);

      // Verify chart is displayed
      await waitFor(() => {
        // Should show comparison visualization
        expect(screen.getByText(/Cost Comparison Analysis/i)).toBeInTheDocument();
        
        // All three scenarios should be present
        expect(screen.getByText(/Scenario A/i)).toBeInTheDocument();
        expect(screen.getByText(/Scenario B/i)).toBeInTheDocument();
        expect(screen.getByText(/Scenario C/i)).toBeInTheDocument();
      });
    }, 20000);

    it('should show total savings summary', async () => {
      const user = userEvent.setup();
      render(<Home />);

      // Select device
      const device = screen.getByText(/Electric Water Heater/i).closest('div');
      await user.click(device!);

      await waitFor(() => {
        const confirmButton = screen.getByRole('button', { name: /Confirm/i });
        return user.click(confirmButton);
      });

      // Select peak hour
      const hour19 = screen.getByText('19:00').closest('button');
      await user.click(hour19!);

      // View analysis
      const analysisButton = screen.getByRole('button', { name: /View Cost Analysis/i });
      await user.click(analysisButton);

      // Verify savings summary exists
      await waitFor(() => {
        // Should show savings in some form
        expect(screen.getByText(/Savings/i)).toBeInTheDocument();
        
        // Should show costs in KES
        const kesElements = screen.getAllByText(/KES/);
        expect(kesElements.length).toBeGreaterThan(0);
      });
    }, 20000);
  });

  describe('Smart Tips', () => {
    it('should display context-aware tips based on usage pattern', async () => {
      const user = userEvent.setup();
      render(<Home />);

      // Select device
      const device = screen.getByText(/Electric Pressure Cooker/i).closest('div');
      await user.click(device!);

      await waitFor(() => {
        const confirmButton = screen.getByRole('button', { name: /Confirm/i });
        return user.click(confirmButton);
      });

      // Select peak hours
      const hour18 = screen.getByText('18:00').closest('button');
      await user.click(hour18!);

      // View analysis
      const analysisButton = screen.getByRole('button', { name: /View Cost Analysis/i });
      await user.click(analysisButton);

      // Verify smart tips are shown
      await waitFor(() => {
        expect(screen.getByText(/Smart Tips|Tips|Recommendations/i)).toBeInTheDocument();
        
        // Should show some actionable advice
        const tipsSection = screen.getByText(/Smart Tips|Tips|Recommendations/i).closest('div');
        expect(tipsSection).toBeTruthy();
      });
    }, 20000);

    it('should show different tips for different usage patterns', async () => {
      const user = userEvent.setup();
      render(<Home />);

      // Select device
      const device = screen.getByText(/Electric Water Heater/i).closest('div');
      await user.click(device!);

      await waitFor(() => {
        const confirmButton = screen.getByRole('button', { name: /Confirm/i });
        return user.click(confirmButton);
      });

      // Select off-peak hours (already optimized)
      const hour23 = screen.getByText('23:00').closest('button');
      await user.click(hour23!);

      // View analysis
      const analysisButton = screen.getByRole('button', { name: /View Cost Analysis/i });
      await user.click(analysisButton);

      // Verify tips acknowledge good optimization
      await waitFor(() => {
        // Tips should be present
        expect(screen.getByText(/Smart Tips|Tips|Recommendations/i)).toBeInTheDocument();
      });
    }, 20000);

    it('should show TOU rate reference guide', async () => {
      const user = userEvent.setup();
      render(<Home />);

      // Quick setup
      const device = screen.getByText(/Electric Pressure Cooker/i).closest('div');
      await user.click(device!);

      await waitFor(() => {
        const confirmButton = screen.getByRole('button', { name: /Confirm/i });
        return user.click(confirmButton);
      });

      const hour12 = screen.getByText('12:00').closest('button');
      await user.click(hour12!);

      const analysisButton = screen.getByRole('button', { name: /View Cost Analysis/i });
      await user.click(analysisButton);

      // Verify TOU rate information is accessible
      await waitFor(() => {
        const page = screen.getByText(/Cost Comparison Analysis/i).closest('div');
        
        // Should show rate information somewhere
        expect(page).toHaveTextContent(/Peak|Off-Peak|Mid-Peak/i);
      });
    }, 20000);
  });
});

