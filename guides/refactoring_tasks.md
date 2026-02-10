# Component Refactoring Tasks

## Overview
This document tracks components that violate the 150-line limit and need to be refactored into smaller, reusable components.

**Rule**: No React component file should exceed 150 lines.  
**Reference**: See `guides/coding_standards.md` for full details.

---

## Components Requiring Refactoring

### 1. SimulationPage.tsx - ✅ COMPLETED
**Original Size**: 208 lines  
**New Size**: 107 lines  
**Status**: ✅ Refactored (2026-02-10)

**Refactoring Completed**:
- ✅ Extracted `SimulationHeader.tsx` component (71 lines)
  - Contains: Title, subtitle, Debug/Tests/Guides buttons
- ✅ Created `useSimulationControls.ts` custom hook (60 lines)
  - Contains: Simulation tick logic, start/pause/reset/config handlers
- ✅ Created `useCarPanel.ts` custom hook (40 lines)
  - Contains: Car panel state, open/close/call handlers with timeout
- ✅ Simplified `SimulationPage.tsx` to 107 lines (main layout and composition)

**Benefits Achieved**:
- Clearer separation of concerns
- Reusable header component
- Testable hooks for business logic
- Easier to understand main page flow
- **49% reduction in file size**

---

### 2. BuildingView.tsx - ✅ COMPLETED
**Original Size**: 162 lines  
**New Size**: 70 lines  
**Status**: ✅ Refactored (2026-02-10)

**Refactoring Completed**:
- ✅ Extracted `FloorControls.tsx` component (37 lines)
  - Contains: Floor label and hall call buttons for a single floor
  - Props: floor, maxFloor, state, onHallCall
- ✅ Extracted `ElevatorShaft.tsx` component (47 lines)
  - Contains: Shaft container, floor markers, elevator car composition
  - Props: elevator, floors, maxFloor, tickDurationMs, handlers
- ✅ Extracted `ElevatorCar.tsx` component (90 lines)
  - Contains: Header, cabin, doors, interior, car panel popover
  - Props: elevator, maxFloor, tickDurationMs, isPopoverOpen, handlers
- ✅ Created `utils/elevatorColors.ts` utility (13 lines)
  - Contains: Elevator color generation and caching logic
- ✅ Simplified `BuildingView.tsx` to 70 lines (main container layout)

**Benefits Achieved**:
- Each component has a single responsibility
- Easier to test individual elevator behavior
- Floor controls are reusable and independent
- Improved code readability
- **57% reduction in file size**

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

### ✅ SimulationPage.tsx (Completed: 2026-02-10)
- **Before**: 208 lines
- **After**: 107 lines
- **Reduction**: 49%
- **New Components**: SimulationHeader.tsx (71 lines)
- **New Hooks**: useSimulationControls.ts (60 lines), useCarPanel.ts (40 lines)

### ✅ BuildingView.tsx (Completed: 2026-02-10)
- **Before**: 162 lines
- **After**: 70 lines
- **Reduction**: 57%
- **New Components**: FloorControls.tsx (37 lines), ElevatorShaft.tsx (47 lines), ElevatorCar.tsx (90 lines)
- **New Utilities**: elevatorColors.ts (13 lines)

**Overall Impact**:
- 2 components refactored
- 4 new reusable components created
- 2 custom hooks extracted
- 1 utility module created
- **All 37 tests passing** ✅
- Average file size reduction: **53%**

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

**Target Completion**: ✅ COMPLETED (2026-02-10)

**Completed Tasks**:
1. ✅ SimulationPage.tsx - Refactored successfully
2. ✅ BuildingView.tsx - Refactored successfully

**All components now comply with the 150-line limit!**

---

## Notes

- All refactoring should maintain backward compatibility
- Props interfaces should be well-documented
- Consider using TypeScript's `Pick` and `Omit` utilities for prop types
- Use `React.memo` for components that render frequently with same props
- Extract shared logic into custom hooks when appropriate
