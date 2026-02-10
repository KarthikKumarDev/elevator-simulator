# Component Refactoring Tasks

## Overview
This document tracks components that violate the 150-line limit and need to be refactored into smaller, reusable components.

**Rule**: No React component file should exceed 150 lines.  
**Reference**: See `guides/coding_standards.md` for full details.

---

## Components Requiring Refactoring

### 1. SimulationPage.tsx (208 lines) - HIGH PRIORITY
**Current Size**: 208 lines  
**Target**: < 150 lines  
**Status**: 🔴 Needs Refactoring

**Proposed Refactoring**:
- Extract header section into `SimulationHeader.tsx` component
  - Contains: Title, subtitle, Debug/Tests/Guides buttons
  - Estimated: ~30 lines
- Extract simulation controls logic into custom hook `useSimulationControls.ts`
  - Contains: handleStart, handlePause, handleReset, handleConfigChange
  - Estimated: ~20 lines
- Extract car panel management into custom hook `useCarPanel.ts`
  - Contains: carPanelElevatorId state, handleOpenCarPanel, closeCarPanel, handleCarCall
  - Estimated: ~25 lines
- Remaining `SimulationPage.tsx`: Main layout and component composition
  - Estimated: ~130 lines

**Benefits**:
- Clearer separation of concerns
- Reusable header component
- Testable hooks for business logic
- Easier to understand main page flow

---

### 2. BuildingView.tsx (162 lines) - MEDIUM PRIORITY
**Current Size**: 162 lines  
**Target**: < 150 lines  
**Status**: 🟡 Needs Refactoring

**Proposed Refactoring**:
- Extract floor controls into `FloorControls.tsx` component
  - Contains: Floor label and hall call buttons for a single floor
  - Props: floor, maxFloor, isUpActive, isDownActive, onHallCall
  - Estimated: ~30 lines
- Extract elevator shaft into `ElevatorShaft.tsx` component
  - Contains: Shaft container, floor markers, single elevator car
  - Props: elevator, maxFloor, tickDurationMs, handlers
  - Estimated: ~60 lines
- Extract elevator car into `ElevatorCar.tsx` component (nested in shaft)
  - Contains: Header, cabin, doors, interior, car panel
  - Props: elevator, maxFloor, tickDurationMs, isPopoverOpen, handlers
  - Estimated: ~50 lines
- Remaining `BuildingView.tsx`: Main container layout
  - Estimated: ~40 lines

**Benefits**:
- Each component has a single responsibility
- Easier to test individual elevator behavior
- Floor controls can be reused or modified independently
- Improved code readability

---

### 3. ui.test.tsx (160 lines) - LOW PRIORITY
**Current Size**: 160 lines  
**Target**: < 150 lines (exempt as test file)  
**Status**: ⚪ Exempt (Test File)

**Note**: Test files are exempt from the 150-line rule due to the nature of comprehensive test coverage. However, if the file grows significantly larger (>300 lines), consider splitting into multiple test files by feature area.

**Possible Future Split** (if needed):
- `ui.basic.test.tsx` - Basic rendering and interaction tests
- `ui.simulation.test.tsx` - Simulation state and tick tests
- `ui.integration.test.tsx` - Full integration scenarios

---

## Completed Refactorings

_None yet_

---

## Refactoring Guidelines

### Before Refactoring
1. ✅ Ensure all existing tests pass
2. ✅ Review component dependencies
3. ✅ Plan component boundaries and props interfaces
4. ✅ Consider performance implications (avoid unnecessary re-renders)

### During Refactoring
1. ✅ Extract one component at a time
2. ✅ Maintain existing functionality
3. ✅ Update tests as needed
4. ✅ Verify no regressions after each extraction

### After Refactoring
1. ✅ Run full test suite
2. ✅ Verify UI behavior in browser
3. ✅ Update documentation
4. ✅ Update this tracking document

---

## Timeline

**Target Completion**: TBD

**Priority Order**:
1. SimulationPage.tsx (highest impact, most complex)
2. BuildingView.tsx (core visualization component)

---

## Notes

- All refactoring should maintain backward compatibility
- Props interfaces should be well-documented
- Consider using TypeScript's `Pick` and `Omit` utilities for prop types
- Use `React.memo` for components that render frequently with same props
- Extract shared logic into custom hooks when appropriate
