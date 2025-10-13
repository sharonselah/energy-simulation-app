/**
 * Phase 4 Integration Tests - Load Profile Visualization
 * 
 * These high-quality integration tests cover the main Phase 4 user journeys:
 * 1. Complete flow from device selection to load profile visualization
 * 2. View mode switching (Current/Optimized/Comparison)
 * 3. Savings calculation and display for different usage patterns
 * 4. TOU rate visualization
 * 
 * These tests focus on user flows rather than implementation details.
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Home from '@/app/page';

describe('Phase 4: Load Profile Visualization', () => {
  describe('End-to-End Load Profile Journey', () => {
    it('should complete full flow and display load profile with optimization savings', async () => {
      const user = userEvent.setup();
      render(<Home />);

      // Step 1: Select Electric Water Heater
      const deviceCard = screen.getByText(/Electric Water Heater/i).closest('button');
      await user.click(deviceCard!);

      // Step 2: Configure device (wait for config screen with heading)
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /Configure.*Electric Water Heater/i })).toBeInTheDocument();
      });

      const durationInput = screen.getByLabelText(/Hours per day/i) || screen.getByDisplayValue('1');
      await user.clear(durationInput);
      await user.type(durationInput, '2');

      const confirmButton = screen.getByRole('button', { name: /Confirm/i });
      await user.click(confirmButton);

      // Step 3: Select peak hour time blocks (18:00-19:00 = expensive)
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /Select Times/i })).toBeInTheDocument();
      });

      const hour18 = screen.getByText('18:00').closest('button');
      const hour19 = screen.getByText('19:00').closest('button');
      await user.click(hour18!);
      await user.click(hour19!);

      // Verify 2 hours selected
      await waitFor(() => {
        expect(screen.getByText(/2 hours/i)).toBeInTheDocument();
      });

      // Step 4: Navigate to analysis
      await waitFor(() => {
        const analysisButton = screen.getByRole('button', { name: /View Cost Analysis/i });
        return user.click(analysisButton);
      });

      // Step 5: Verify Load Profile section is displayed
      await waitFor(() => {
        expect(screen.getByText(/24-Hour Load Profile/i)).toBeInTheDocument();
        expect(screen.getByText(/Electric Water Heater.*1500W/i)).toBeInTheDocument();
      }, { timeout: 5000 });

      // Step 6: Verify TOU rate legend
      expect(screen.getByText(/Off-Peak.*10pm-6am.*KES 8\/kWh/i)).toBeInTheDocument();
      expect(screen.getByText(/Mid-Peak.*6am-6pm.*KES 12\/kWh/i)).toBeInTheDocument();
      expect(screen.getByText(/Peak.*6pm-10pm.*KES 20\/kWh/i)).toBeInTheDocument();

      // Step 7: Verify view mode buttons exist
      expect(screen.getByRole('button', { name: /^Current$/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /^Optimized$/i })).toBeInTheDocument();
      const compareButton = screen.getByRole('button', { name: /^Compare$/i });
      expect(compareButton).toBeInTheDocument();
      expect(compareButton).toHaveClass(/bg-cta/); // Default active view

      // Step 8: Verify optimization savings are shown (peak hours should show savings)
      expect(screen.getByText(/Optimization Savings/i)).toBeInTheDocument();
      expect(screen.getByText(/could save/i)).toBeInTheDocument();
      expect(screen.getByText(/Current: KES/i)).toBeInTheDocument();
      expect(screen.getByText(/Optimized: KES/i)).toBeInTheDocument();

      // Step 9: Verify interactive hint is shown (for Comparison mode)
      expect(screen.getByText(/Click on the chart to toggle time blocks/i)).toBeInTheDocument();
    }, 50000);
  });

  describe('View Mode Functionality', () => {
    it('should switch between all three view modes correctly', async () => {
      const user = userEvent.setup();
      render(<Home />);

      // Quick setup to analysis view
      const deviceCard = screen.getByText(/Electric Pressure Cooker/i).closest('button');
      await user.click(deviceCard!);

      await waitFor(() => {
        const confirmButton = screen.getByRole('button', { name: /Confirm/i });
        return user.click(confirmButton);
      });

      // Select off-peak hour
      const hour22 = screen.getByText('22:00').closest('button');
      await user.click(hour22!);

      await waitFor(() => {
        const analysisButton = screen.getByRole('button', { name: /View Cost Analysis/i });
        return user.click(analysisButton);
      });

      // Wait for load profile
      await waitFor(() => {
        expect(screen.getByText(/24-Hour Load Profile/i)).toBeInTheDocument();
      });

      // Test view mode switching
      const currentButton = screen.getByRole('button', { name: /^Current$/i });
      const optimizedButton = screen.getByRole('button', { name: /^Optimized$/i });
      const compareButton = screen.getByRole('button', { name: /^Compare$/i });

      // Default: Comparison mode should be active
      expect(compareButton).toHaveClass(/bg-cta/);
      expect(screen.getByText(/Click on the chart to toggle time blocks/i)).toBeInTheDocument();

      // Switch to Current view
      await user.click(currentButton);
      await waitFor(() => {
        expect(currentButton).toHaveClass(/bg-primary/);
        expect(screen.getByText(/Click on the chart to toggle time blocks/i)).toBeInTheDocument();
      });

      // Switch to Optimized view
      await user.click(optimizedButton);
      await waitFor(() => {
        expect(optimizedButton).toHaveClass(/bg-green/);
        // Interactive hint should NOT show in optimized-only view
        expect(screen.queryByText(/Click on the chart to toggle time blocks/i)).not.toBeInTheDocument();
      });

      // Switch back to Comparison
      await user.click(compareButton);
      await waitFor(() => {
        expect(compareButton).toHaveClass(/bg-cta/);
        // Hint should appear again
        expect(screen.getByText(/Click on the chart to toggle time blocks/i)).toBeInTheDocument();
      });
    }, 50000);
  });

  describe('Savings Optimization', () => {
    it('should display meaningful savings when using peak hours', async () => {
      const user = userEvent.setup();
      render(<Home />);

      // Setup with peak hour usage
      const deviceCard = screen.getByText(/Electric Water Heater/i).closest('button');
      await user.click(deviceCard!);

      await waitFor(() => {
        const confirmButton = screen.getByRole('button', { name: /Confirm/i });
        return user.click(confirmButton);
      });

      // Select peak hour (expensive)
      const hour18 = screen.getByText('18:00').closest('button');
      await user.click(hour18!);

      await waitFor(() => {
        const analysisButton = screen.getByRole('button', { name: /View Cost Analysis/i });
        return user.click(analysisButton);
      });

      // Verify savings card appears with content
      await waitFor(() => {
        expect(screen.getByText(/Optimization Savings/i)).toBeInTheDocument();
        expect(screen.getByText(/could save/i)).toBeInTheDocument();
        
        // Should show daily savings amount
        const savingsText = screen.getByText(/could save/i).textContent || '';
        expect(savingsText).toMatch(/KES \d+\.\d{2}\/day/);
        
        // Should show percentage reduction
        expect(savingsText).toMatch(/\d+\.\d%.*reduction/);
        
        // Should show cost breakdown
        expect(screen.getByText(/Current: KES/i)).toBeInTheDocument();
        expect(screen.getByText(/Optimized: KES/i)).toBeInTheDocument();
      });
    }, 50000);
  });
});
