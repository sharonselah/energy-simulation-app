/**
 * Unit Tests for Calculation Functions
 * 
 * These tests verify the core calculation functions work correctly.
 * They serve as a foundation and proof that the test infrastructure is working.
 */

import {
  calculateTOUCost,
  calculateFuelCostBreakdown,
  generateOptimizedTimeBlocks,
  getRateTypeForHour,
} from '@/lib/calculations';
import { TOU_TARIFFS, ALTERNATIVE_FUELS, FUEL_DAILY_CONSUMPTION } from '@/lib/constants';
import { TimeBlock, Device, AlternativeFuel } from '@/lib/types';

describe('Phase 3: Calculation Functions', () => {
  const mockDevice: Device = {
    id: 'test-device',
    name: 'Test Device',
    type: 'Test',
    category: 'other',
    wattage: 1000,
    typicalUsageHours: 1,
    requiresAlternativeFuel: false,
  };

  describe('getRateTypeForHour', () => {
    it('should return correct rate types for different hours', () => {
      // Off-peak hours (22:00 - 06:00)
      expect(getRateTypeForHour(23)).toBe('offpeak');
      expect(getRateTypeForHour(0)).toBe('offpeak');
      expect(getRateTypeForHour(5)).toBe('offpeak');

      // Mid-peak hours (06:00 - 18:00)
      expect(getRateTypeForHour(6)).toBe('midpeak');
      expect(getRateTypeForHour(12)).toBe('midpeak');
      expect(getRateTypeForHour(17)).toBe('midpeak');

      // Peak hours (18:00 - 22:00)
      expect(getRateTypeForHour(18)).toBe('peak');
      expect(getRateTypeForHour(20)).toBe('peak');
      expect(getRateTypeForHour(21)).toBe('peak');
    });
  });

  describe('calculateTOUCost', () => {
    it('should calculate cost correctly for peak hours', () => {
      const timeBlocks: TimeBlock[] = [
        { hour: 18, isSelected: true, rateType: 'peak' },
        { hour: 19, isSelected: true, rateType: 'peak' },
      ];

      const result = calculateTOUCost(mockDevice, timeBlocks, 2); // 1000W, 2 hours

      expect(result.daily).toBe(40); // 2 kWh * 20 KES/kWh
      expect(result.breakdown.peak).toBe(40);
    });

    it('should calculate cost correctly for off-peak hours', () => {
      const timeBlocks: TimeBlock[] = [
        { hour: 23, isSelected: true, rateType: 'offpeak' },
        { hour: 0, isSelected: true, rateType: 'offpeak' },
      ];

      const result = calculateTOUCost(mockDevice, timeBlocks, 2); // 1000W, 2 hours

      expect(result.daily).toBe(16); // 2 kWh * 8 KES/kWh
      expect(result.breakdown.offpeak).toBe(16);
    });

    it('should calculate cost correctly for mixed hours', () => {
      const timeBlocks: TimeBlock[] = [
        { hour: 12, isSelected: true, rateType: 'midpeak' },
        { hour: 18, isSelected: true, rateType: 'peak' },
        { hour: 23, isSelected: true, rateType: 'offpeak' },
      ];

      const result = calculateTOUCost(mockDevice, timeBlocks, 3); // 1000W, 3 hours

      // 1 hour mid-peak = 1 * 12 = 12
      // 1 hour peak = 1 * 20 = 20
      // 1 hour off-peak = 1 * 8 = 8
      // Total = 40
      expect(result.daily).toBe(40);
      expect(result.breakdown.midpeak).toBe(12);
      expect(result.breakdown.peak).toBe(20);
      expect(result.breakdown.offpeak).toBe(8);
    });

    it('should return monthly and annual costs', () => {
      const timeBlocks: TimeBlock[] = [
        { hour: 12, isSelected: true, rateType: 'midpeak' },
      ];

      const result = calculateTOUCost(mockDevice, timeBlocks, 1); // 1000W, 1 hour

      expect(result.daily).toBe(12);
      expect(result.monthly).toBe(12 * 30);
      expect(result.annual).toBe(12 * 365);
    });
  });

  describe('calculateFuelCostBreakdown', () => {
    it('should calculate charcoal costs correctly', () => {
      const fuel: AlternativeFuel = {
        ...ALTERNATIVE_FUELS.charcoal,
        dailyConsumption: FUEL_DAILY_CONSUMPTION.charcoal,
      };

      const result = calculateFuelCostBreakdown(fuel);

      const expectedDaily = fuel.costPerUnit * fuel.dailyConsumption;
      
      expect(result.daily).toBe(expectedDaily);
      expect(result.monthly).toBe(expectedDaily * 30);
      expect(result.annual).toBe(expectedDaily * 365);
    });

    it('should calculate LPG costs correctly', () => {
      const fuel: AlternativeFuel = {
        ...ALTERNATIVE_FUELS.lpg,
        dailyConsumption: FUEL_DAILY_CONSUMPTION.lpg,
      };

      const result = calculateFuelCostBreakdown(fuel);

      const expectedDaily = fuel.costPerUnit * fuel.dailyConsumption;
      
      expect(result.daily).toBe(expectedDaily);
    });

    it('should calculate kerosene costs correctly', () => {
      const fuel: AlternativeFuel = {
        ...ALTERNATIVE_FUELS.kerosene,
        dailyConsumption: FUEL_DAILY_CONSUMPTION.kerosene,
      };

      const result = calculateFuelCostBreakdown(fuel);

      const expectedDaily = fuel.costPerUnit * fuel.dailyConsumption;
      
      expect(result.daily).toBe(expectedDaily);
    });

    it('should calculate firewood costs correctly', () => {
      const fuel: AlternativeFuel = {
        ...ALTERNATIVE_FUELS.firewood,
        dailyConsumption: FUEL_DAILY_CONSUMPTION.firewood,
      };

      const result = calculateFuelCostBreakdown(fuel);

      const expectedDaily = fuel.costPerUnit * fuel.dailyConsumption;
      
      expect(result.daily).toBe(expectedDaily);
    });
  });

  describe('generateOptimizedTimeBlocks', () => {
    it('should generate optimized time blocks with off-peak priority', () => {
      const result = generateOptimizedTimeBlocks(4); // 4 hours duration

      const selectedBlocks = result.filter(b => b.isSelected);
      expect(selectedBlocks).toHaveLength(4);

      // All selected blocks should be off-peak (since we only need 4 hours)
      const offPeakSelected = selectedBlocks.filter(b => b.rateType === 'offpeak');
      expect(offPeakSelected).toHaveLength(4);
    });

    it('should use mid-peak when off-peak is insufficient', () => {
      const result = generateOptimizedTimeBlocks(10); // 10 hours duration

      const selectedBlocks = result.filter(b => b.isSelected);
      expect(selectedBlocks).toHaveLength(10);

      // Should have all 8 off-peak hours plus 2 mid-peak
      const offPeakSelected = selectedBlocks.filter(b => b.rateType === 'offpeak');
      const midPeakSelected = selectedBlocks.filter(b => b.rateType === 'midpeak');
      
      expect(offPeakSelected).toHaveLength(8);
      expect(midPeakSelected).toHaveLength(2);
    });

    it('should use peak hours only when necessary', () => {
      const result = generateOptimizedTimeBlocks(23); // 23 hours duration

      const selectedBlocks = result.filter(b => b.isSelected);
      expect(selectedBlocks).toHaveLength(23);

      // Should have 8 off-peak + 12 mid-peak + 3 peak (6am-5pm = 12 midpeak hours)
      const offPeakSelected = selectedBlocks.filter(b => b.rateType === 'offpeak');
      const midPeakSelected = selectedBlocks.filter(b => b.rateType === 'midpeak');
      const peakSelected = selectedBlocks.filter(b => b.rateType === 'peak');
      
      expect(offPeakSelected).toHaveLength(8);
      expect(midPeakSelected).toHaveLength(12);
      expect(peakSelected).toHaveLength(3);
    });

    it('should return 24 time blocks', () => {
      const result = generateOptimizedTimeBlocks(5);
      expect(result).toHaveLength(24);
    });

    it('should handle edge case of 0 hours', () => {
      const result = generateOptimizedTimeBlocks(0);

      const selectedBlocks = result.filter(b => b.isSelected);
      expect(selectedBlocks).toHaveLength(0);
    });

    it('should handle maximum of 24 hours', () => {
      const result = generateOptimizedTimeBlocks(24);

      const selectedBlocks = result.filter(b => b.isSelected);
      expect(selectedBlocks).toHaveLength(24);
    });
  });

  describe('Cost Comparison Scenarios', () => {
    it('should show savings from peak to off-peak optimization', () => {
      const peakBlocks: TimeBlock[] = [
        { hour: 18, isSelected: true, rateType: 'peak' },
        { hour: 19, isSelected: true, rateType: 'peak' },
      ];

      const offPeakBlocks: TimeBlock[] = [
        { hour: 23, isSelected: true, rateType: 'offpeak' },
        { hour: 0, isSelected: true, rateType: 'offpeak' },
      ];

      const peakCost = calculateTOUCost(mockDevice, peakBlocks, 2);
      const offPeakCost = calculateTOUCost(mockDevice, offPeakBlocks, 2);

      // Peak = 2 * 20 = 40 KES
      // Off-peak = 2 * 8 = 16 KES
      // Savings = 24 KES (60%)
      const savings = peakCost.daily - offPeakCost.daily;
      const savingsPercentage = (savings / peakCost.daily) * 100;

      expect(peakCost.daily).toBe(40);
      expect(offPeakCost.daily).toBe(16);
      expect(savings).toBe(24);
      expect(savingsPercentage).toBe(60);
    });

    it('should demonstrate massive savings from charcoal to electric', () => {
      const charcoalFuel: AlternativeFuel = {
        ...ALTERNATIVE_FUELS.charcoal,
        dailyConsumption: FUEL_DAILY_CONSUMPTION.charcoal,
      };
      
      const charcoalCost = calculateFuelCostBreakdown(charcoalFuel);
      
      const electricBlocks: TimeBlock[] = [
        { hour: 23, isSelected: true, rateType: 'offpeak' },
        { hour: 0, isSelected: true, rateType: 'offpeak' },
      ];
      
      const electricCost = calculateTOUCost(mockDevice, electricBlocks, 2);

      // Charcoal: ~225 KES/day
      // Electric (off-peak): 16 KES/day
      // Savings: ~209 KES/day (~93%)
      expect(charcoalCost.daily).toBeGreaterThan(200);
      expect(electricCost.daily).toBe(16);
      
      const savings = charcoalCost.daily - electricCost.daily;
      const savingsPercentage = (savings / charcoalCost.daily) * 100;
      
      expect(savingsPercentage).toBeGreaterThan(90); // Over 90% savings!
    });
  });
});

