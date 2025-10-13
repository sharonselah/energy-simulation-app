# Energy Simulation Game - Core Library Documentation

This directory contains the core business logic, data models, and calculation functions for the Energy Simulation Game.

## Files Overview

### `types.ts`
TypeScript interfaces and type definitions for the entire application.

**Key Types:**
- `Device` - Appliance specifications
- `TimeBlock` - Hour-by-hour usage tracking
- `UsagePattern` - Complete usage pattern for a device
- `CostBreakdown` - Cost calculations (daily/monthly/annual)
- `AlternativeFuel` - Non-electric fuel specifications
- `EmissionData` - CO2 tracking and environmental impact
- `GridMetrics` - Grid performance metrics

### `constants.ts`
Reference data for Kenya market including:
- Device catalog with wattages
- TOU tariff rates
- Alternative fuel prices
- Emission factors
- Grid calculation weights

### `calculations.ts`
Pure calculation functions for all app logic.

## Usage Examples

### Basic Cost Calculation

```typescript
import { calculateElectricityCost, TOU_TARIFFS } from './lib';

// Calculate cost for 1000W device running 2 hours at off-peak rate
const cost = calculateElectricityCost(1000, 2, TOU_TARIFFS.offpeak);
// Returns: 16.0 (KES)
```

### Complete TOU Cost with Time Blocks

```typescript
import { calculateTOUCost, DEVICE_CATALOG, getRateTypeForHour } from './lib';

// Get device
const epc = DEVICE_CATALOG.find(d => d.id === 'electric-pressure-cooker')!;

// Create time blocks (example: cooking at 7pm for 1.5 hours)
const timeBlocks = Array.from({ length: 24 }, (_, hour) => ({
  hour,
  isSelected: hour === 19, // 7pm
  rateType: getRateTypeForHour(hour)
}));

const costs = calculateTOUCost(epc, timeBlocks, 1.5);
console.log(`Daily: KES ${costs.daily}`);
console.log(`Monthly: KES ${costs.monthly}`);
console.log(`Annual: KES ${costs.annual}`);
```

### Alternative Fuel Cost Comparison

```typescript
import { calculateFuelCostBreakdown, ALTERNATIVE_FUELS, FUEL_DAILY_CONSUMPTION } from './lib';

const charcoalFuel = {
  ...ALTERNATIVE_FUELS.charcoal,
  dailyConsumption: FUEL_DAILY_CONSUMPTION.charcoal
};

const costs = calculateFuelCostBreakdown(charcoalFuel);
console.log(`Charcoal monthly cost: KES ${costs.monthly}`);
```

### CO2 Emissions Tracking

```typescript
import { calculateEmissionData, DEVICE_CATALOG } from './lib';

const epc = DEVICE_CATALOG.find(d => d.id === 'electric-pressure-cooker')!;
const dailyKWh = (epc.wattage * 1.5) / 1000; // 1.5 hours/day

const emissions = calculateEmissionData(dailyKWh, charcoalFuel);
console.log(`Current emissions: ${emissions.current} kg CO2/month`);
console.log(`Baseline emissions: ${emissions.baseline} kg CO2/month`);
console.log(`Saved: ${emissions.saved} kg CO2/month`);
console.log(`Equivalent to ${emissions.treesEquivalent} trees/year`);
```

### Grid Metrics Analysis

```typescript
import { calculateGridMetrics } from './lib';

const metrics = calculateGridMetrics(device, timeBlocks, hoursPerDay);
console.log(`Peak usage: ${metrics.peakUsage} kWh`);
console.log(`Load factor: ${metrics.loadFactor}%`);
console.log(`Stress score: ${metrics.stressScore}`);
console.log(`Efficiency score: ${metrics.efficiencyScore}/10`);
```

### Generate Optimized Usage Pattern

```typescript
import { generateOptimizedTimeBlocks, calculateTOUCost } from './lib';

// Generate optimized pattern for 2 hours of usage
const optimizedBlocks = generateOptimizedTimeBlocks(2);

// Calculate optimized cost
const optimizedCost = calculateTOUCost(device, optimizedBlocks, 2);
console.log(`Optimized monthly cost: KES ${optimizedCost.monthly}`);

// Show recommended hours
const recommendedHours = optimizedBlocks
  .filter(b => b.isSelected)
  .map(b => b.hour);
console.log(`Use device at: ${recommendedHours.join(', ')}:00`);
```

## TOU Time Bands (Kenya)

| Time Period | Hours | Rate Type | Rate (KES/kWh) |
|-------------|-------|-----------|----------------|
| Off-Peak | 10pm - 6am (22:00-06:00) | `offpeak` | 8.00 |
| Mid-Peak | 6am - 6pm (06:00-18:00) | `midpeak` | 12.00 |
| Peak | 6pm - 10pm (18:00-22:00) | `peak` | 20.00 |

## Emission Factors (Kenya)

| Energy Source | Emission Factor | Unit |
|--------------|-----------------|------|
| Grid Electricity | 0.45 | kg CO2/kWh |
| Charcoal | 9.5 | kg CO2/kg |
| LPG | 3.0 | kg CO2/kg |
| Kerosene | 2.5 | kg CO2/liter |
| Firewood | 1.8 | kg CO2/kg |

## Efficiency Score Calculation

The efficiency score (0-10) is a composite metric based on:

- **40%** - Off-peak usage percentage (higher is better)
- **30%** - Load factor (higher is better)
- **30%** - Grid stress level (lower is better)

**Score Interpretation:**
- 8-10: Excellent (grid-friendly user)
- 6-7: Good (reasonable usage pattern)
- 4-5: Fair (room for improvement)
- 0-3: Poor (high grid stress, recommend optimization)

## Grid Stress Scoring

Grid stress is calculated as:
```
stress = (peak_kWh × 3) + (midpeak_kWh × 2) + (offpeak_kWh × 1)
```

**Categories:**
- Low: < 5 (mainly off-peak usage)
- Medium: 5-10 (mixed usage)
- High: > 10 (peak-heavy usage)

## Load Factor

Load factor measures how efficiently power is used over time:
```
load_factor = (average_load / peak_load) × 100%
```

**Interpretation:**
- 70-100%: Excellent (consistent usage)
- 50-69%: Good (moderate variation)
- 30-49%: Fair (significant variation)
- 0-29%: Poor (highly variable usage)

## Cost Savings Tips

Based on our calculations, here are typical savings:

1. **Shift from Charcoal to Electric (optimized):** ~94% savings
2. **Shift from LPG to Electric (optimized):** ~77% savings
3. **Shift from Peak to Off-peak:** ~60% savings
4. **Maximize off-peak usage:** Can reduce monthly bills by 40-60%

## Environmental Impact

Example monthly CO2 savings by switching to electric:
- Charcoal → Electric: ~407 kg CO2 saved
- Firewood → Electric: ~141 kg CO2 saved
- LPG → Electric: ~16 kg CO2 saved

Annual equivalents in trees planted:
- Charcoal → Electric: ~233 trees
- Firewood → Electric: ~81 trees
- LPG → Electric: ~9 trees

## Testing

All calculation functions are pure (no side effects) and easily testable. Example test:

```typescript
import { calculateElectricityCost } from './calculations';

test('calculates electricity cost correctly', () => {
  const cost = calculateElectricityCost(1000, 2, 10);
  expect(cost).toBe(20); // 1kW × 2h × 10 KES/kWh = 20 KES
});
```

## Contributing

When updating constants:
1. Verify data with official Kenya Power tariffs
2. Cross-reference fuel prices with current market rates
3. Update emission factors if new research is available
4. Document sources in comments

When adding calculations:
1. Keep functions pure (no side effects)
2. Add TypeScript types for all parameters
3. Include JSDoc comments
4. Add example usage in this README
5. Test with realistic Kenyan market scenarios

