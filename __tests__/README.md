# Phase 3 Integration Tests

This directory contains high-quality integration tests for Phase 3 of the Energy Simulation Game, focusing on complete user flows and real-world scenarios.

## Philosophy

These tests follow the principle of **fewer, high-quality tests** that validate:
- Complete user journeys (not isolated components)
- Real-world usage patterns
- State persistence and navigation
- Critical business logic

## Test Structure

### Integration Tests (`/integration/`)

Integration tests simulate real user interactions from start to finish. They test the application as a whole rather than isolated units.

#### 1. **phase3-user-flow.integration.test.tsx**
**Purpose**: Tests the complete end-to-end user journey through Phase 3

**Key Scenarios**:
- ✅ Complete flow: Device selection → Configuration → Time selection → Cost analysis
- ✅ Navigation back to configuration with state maintained
- ✅ Reset functionality clears all state
- ✅ Cooking device with fuel selection
- ✅ Non-cooking device without fuel options
- ✅ Time block selection and deselection
- ✅ Bulk selection for off-peak hours

**Why these tests matter**: They ensure the core user experience works seamlessly from start to finish.

#### 2. **cost-comparison.integration.test.tsx**
**Purpose**: Tests the three-scenario cost comparison functionality

**Key Scenarios**:
- **Scenario A**:
  - ✅ Displays fuel costs for cooking devices
  - ✅ Shows "grid electricity" for non-cooking devices
  
- **Scenario B**:
  - ✅ Calculates costs based on selected time blocks
  - ✅ Shows TOU rate breakdown (peak/mid-peak/off-peak)
  - ✅ Displays peak-heavy warning when appropriate
  
- **Scenario C**:
  - ✅ Generates optimized time blocks
  - ✅ Calculates savings vs current pattern
  - ✅ Shows recommended off-peak time ranges

- **Comparison Chart**:
  - ✅ Displays bar chart with all scenarios
  - ✅ Shows total savings summary
  
- **Smart Tips**:
  - ✅ Displays context-aware recommendations
  - ✅ Shows different tips for different patterns
  - ✅ Includes TOU rate reference guide

**Why these tests matter**: They validate the core value proposition - showing users how much they can save.

#### 3. **navigation.integration.test.tsx**
**Purpose**: Tests navigation flows and state management

**Key Scenarios**:
- **Forward Navigation**:
  - ✅ Device selection → Configuration
  - ✅ Configuration → Time selection
  - ✅ Time selection → Analysis
  
- **Backward Navigation**:
  - ✅ Analysis → Configuration
  - ✅ Edit configuration after viewing analysis
  
- **Device Change**:
  - ✅ Change device from configuration view
  - ✅ Change device from analysis view
  - ✅ Clear analysis state when changing device
  
- **Reset Functionality**:
  - ✅ Reset all state with Start Over button
  - ✅ Clear time blocks when resetting
  
- **State Persistence**:
  - ✅ Maintain time blocks during navigation
  - ✅ Maintain device config during navigation
  
- **Step Indicators**:
  - ✅ Update as user progresses
  - ✅ Show current step as active

**Why these tests matter**: They ensure users can navigate freely without losing their work.

## Running Tests

### Run all tests
```bash
pnpm test
```

### Run integration tests only
```bash
pnpm test:integration
```

### Watch mode (for development)
```bash
pnpm test:watch
```

### Coverage report
```bash
pnpm test:coverage
```

## Test Patterns & Best Practices

### 1. **User-Centric Testing**
Tests simulate real user interactions using `@testing-library/user-event`:
```typescript
const user = userEvent.setup();
await user.click(button);
await user.type(input, 'value');
await user.selectOptions(select, 'option');
```

### 2. **Semantic Queries**
Tests use accessible queries that mirror how users interact:
```typescript
screen.getByRole('button', { name: /View Cost Analysis/i })
screen.getByText(/Electric Pressure Cooker/i)
screen.getByLabelText(/Hours per day/i)
```

### 3. **Async Handling**
Tests properly wait for async updates:
```typescript
await waitFor(() => {
  expect(screen.getByText(/Cost Comparison/i)).toBeInTheDocument();
});
```

### 4. **Helper Functions**
Complex setup is abstracted into reusable helpers:
```typescript
async function setupDeviceAndTimeBlocks(user) {
  // ... complete device selection and configuration
}
```

### 5. **Meaningful Timeouts**
Tests use appropriate timeouts for complex flows:
```typescript
it('should complete full flow', async () => {
  // ... test code
}, 30000); // 30 second timeout for complex integration test
```

## Test Coverage Goals

These integration tests focus on **behavior coverage** rather than line coverage:

- ✅ **Critical User Paths**: All primary user journeys are tested
- ✅ **Error States**: Invalid states and edge cases are handled
- ✅ **State Management**: Context state persists correctly across navigation
- ✅ **Business Logic**: Cost calculations and optimizations are accurate
- ✅ **UI Feedback**: Users see appropriate messages and warnings

## What's NOT Tested (Intentionally)

Following the principle of "fewer, high-quality tests":

- ❌ **Component Styling**: Visual appearance is not tested
- ❌ **Isolated Components**: Individual components in isolation
- ❌ **Implementation Details**: Internal state, prop changes, etc.
- ❌ **Third-party Libraries**: Recharts, Lucide icons, etc.
- ❌ **Static Content**: Informational text and documentation

## Debugging Tests

### Run specific test file
```bash
pnpm test phase3-user-flow
```

### Run specific test case
```bash
pnpm test -t "should complete the full flow"
```

### Debug in VS Code
Add breakpoints and use the Jest extension, or add:
```typescript
console.log(screen.debug()); // Print current DOM
```

### Common Issues

**Issue**: Tests timeout
**Solution**: Increase timeout or check if async operations are properly awaited

**Issue**: Element not found
**Solution**: Use `screen.debug()` to see current DOM, check query selectors

**Issue**: State not persisting
**Solution**: Ensure `AppProvider` wraps the component properly

## Maintenance

### When to Update Tests

- ✅ **User flow changes**: Update corresponding integration test
- ✅ **New features**: Add new test scenarios
- ✅ **Bug fixes**: Add regression test if appropriate
- ❌ **Refactoring**: Tests should still pass without changes
- ❌ **Styling changes**: No test updates needed

### Adding New Tests

1. Identify the user flow or scenario to test
2. Choose the appropriate test file (or create a new one)
3. Write the test using user-centric queries
4. Ensure it tests behavior, not implementation
5. Run and verify the test passes
6. Update this README if adding new test file

## Test Statistics

- **Total Integration Test Suites**: 3
- **Total Test Cases**: ~35
- **Average Test Duration**: 15-20 seconds per test
- **Coverage**: All critical Phase 3 user flows

## Dependencies

- **Jest**: Test framework
- **@testing-library/react**: React component testing utilities
- **@testing-library/user-event**: User interaction simulation
- **@testing-library/jest-dom**: Custom Jest matchers for DOM
- **ts-jest**: TypeScript support for Jest
- **identity-obj-proxy**: CSS module mocking

## CI/CD Integration

To integrate with CI/CD pipelines:

```bash
# In your CI pipeline
pnpm install
pnpm test:integration
```

For coverage thresholds, add to `jest.config.ts`:
```typescript
coverageThreshold: {
  global: {
    statements: 70,
    branches: 70,
    functions: 70,
    lines: 70,
  },
},
```

## Future Enhancements

Potential additions for comprehensive testing:

- [ ] **Phase 4 Tests**: Load profile visualization tests
- [ ] **E2E Tests**: Full browser automation with Playwright
- [ ] **Performance Tests**: Measure render times and interactions
- [ ] **Accessibility Tests**: Automated a11y testing with jest-axe
- [ ] **Visual Regression**: Screenshot comparison tests

## Questions?

For questions about these tests, refer to:
- **Phase 3 Summary**: `PHASE_3_SUMMARY.md`
- **Testing Library Docs**: https://testing-library.com/
- **Jest Docs**: https://jestjs.io/

---

**Last Updated**: October 9, 2025  
**Test Framework**: Jest 30 + React Testing Library 16  
**Test Philosophy**: Fewer, high-quality integration tests for user flows

