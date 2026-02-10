# Automated Unit Test Plan: Scenarios

This document defines specific, automated test scenarios to be implemented using a testing framework (e.g., Jest/Vitest). Each scenario targets a specific logic path in `simulation.ts`.

## 1. Setup & Mocks
- **Mock State**: Helper function to generate a clean `SimulationState` (3 Elevators, 10 Floors).
- **Time Stepping**: Helper function `runTicks(state, config, count)` to simulate time progression.

## 2. Test Suite: 50 Unique Cases

### A. Initialization & Configuration (TC01 - TC05)
- **TC01**: Verify initial state creation (correct number of elevators, floors, default config).
- **TC02**: Verify elevators start at Floor 1, Idle, Closed doors.
- **TC03**: Verify metrics initialized to zero (avg wait, power, totals).
- **TC04**: Verify config update resets state correctly (changing floor count updates elevator positions/bounds).
- **TC05**: Verify mode switching toggles internal flags without crashing active simulation.

### B. Request Management (TC06 - TC13)
- **TC06**: Add Hall Call (Normal) - persists in `pendingRequests`.
- **TC07**: Add Car Call (Normal) - immediately assigns to specific elevator.
- **TC08**: Duplicate Hall Call - adding same floor/direction twice should result in single pending request (idempotency).
- **TC09**: Duplicate Car Call - adding same floor for same elevator twice should result in single target.
- **TC10**: Toggle Car Call On/Off - selecting then deselecting a floor removes it from targets.
- **TC11**: Invalid Floor Request - Ensure requests for Floor < 1 or > MaxFloor are rejected or clamped.
- **TC12**: Simultaneous Requests - Adding multiple requests in same tick triggers correct queueing.
- **TC13**: Car Call to Current Floor - Verify immediate rejection or instant door open processing.

### C. Dispatching: Normal Mode (TC14 - TC21)
- **TC14**: Nearest Neighbor - Idle elevator closest to hall call is selected.
- **TC15**: Piggybacking UP - Elevator moving 1->10 picks up new UP request at 5.
- **TC16**: Piggybacking DOWN - Elevator moving 10->1 picks up new DOWN request at 5.
- **TC17**: Direction Priority - Elevator moving UP at 5 ignores DOWN request at 6 (unless idle).
- **TC18**: Target Sorting - Requests added out of order (8, 2, 5) sorted correctly based on current direction.
- **TC19**: Multiple Elevators - 3 Idle elevators, request at 10. Closest one takes it.
- **TC20**: Load Balancing - If E1 is busy, next request assigns to E2 (Idle).
- **TC21**: Reassignment - If E1 becomes unavailable (theoretical), request reassigned (if logic supports).

### D. Dispatching: Eco Mode (TC22 - TC28)
- **TC22**: Generic Eco Trip - Verify movement happens (slowly) to complete request.
- **TC23**: Idle Preservation - E1 active, E2 idle. New request far away waits for E1 instead of waking E2.
- **TC24**: Compatible Piggyback - Active E1 intercepts request in path (Standard Eco behavior).
- **TC25**: Incompatible Wait - E1 moving UP, Request DOWN at current. Request waits for E1 to finish UP then return.
- **TC26**: Zero Idle Power - Confirm Idle elevators consume 0 power over 100 ticks.
- **TC27**: Sequential Handling - UP and DOWN at same floor. Eco handles one, then turns around for other (same car).
- **TC28**: Efficiency Metric - Confirm lower power/tick compared to Normal mode for same distance.

### E. Dispatching: Power Mode (TC29 - TC33)
- **TC29**: Turbo Speed - Move 1->5 takes fewer ticks than Normal mode (jump logic).
- **TC30**: Destination Clamping - Jumping 2 floors does not overshoot destination (e.g., dist=1, must not jump).
- **TC31**: Aggressive Dispatch - E1 busy but far, E2 idle. E2 dispatched immediately regardless of cost to ensure speed.
- **TC32**: High Power Consumption - Verify metrics show significantly higher power usage per floor.
- **TC33**: Max Throughput - Handle batch of 20 random requests faster (fewer total ticks) than Normal/Eco.

### F. Movement & Door Physics (TC34 - TC40)
- **TC34**: Door State Cycle - Verify sequence: Closed -> Opening -> Open -> Closing -> Closed.
- **TC35**: Door Open Duration - Verify door stays Open for `config.doorOpenTicks`.
- **TC36**: Hover Behavior - Hovering `isHovered=true` keeps door Open indefinitely (`ticksRemaining` doesn't decrease).
- **TC37**: Un-Hover - Removing hover resumes closing countdown.
- **TC38**: Re-Open on Arrival - Elevator closing doors, new request at same floor arrives. Doors revert to Opening.
- **TC39**: Movement Calculation - Verify `currentFloor` updates linearly in Normal mode.
- **TC40**: Direction Update - `lastDirection` variable updates only on move or completion, not jittery.

### G. Direction Compatibility Logic (New Feature) (TC41 - TC45)
- **TC41**: Strict Direction Service (UP) - Elevator arriving UP at 5. UP request at 5 completes. DOWN request at 5 remains Active.
- **TC42**: Strict Direction Service (DOWN) - Elevator arriving DOWN at 5. DOWN request completes. UP request remains Active.
- **TC43**: Idle Service - Idle elevator arriving at 5 completes BOTH UP and DOWN requests.
- **TC44**: Car Call Exception - Car call to 5 completes regardless of elevator direction.
- **TC45**: Re-evaluation - The "leftover" incompatible request is eventually picked up by another elevator or the same one on return.

### H. Metrics & Logging (TC46 - TC50)
- **TC46**: Wait Time Calculation - Verify `completedAt - createdAt` is accurate for single request.
- **TC47**: Max Wait Time - Track outlier request (long wait) and ensure metric reflects it.
- **TC48**: Total Requests Count - Verify count increments only on completion.
- **TC49**: Travel Log Sequence - Verify log records `[1, 5, 10]` for a trip involving those stops.
- **TC50**: Intermediate Skips - Verify travel log does NOT record floors passed without stopping (Power mode skips).


## 3. Application & UI Test Plan

### I. UI Components (Rendering & Interaction)
- **TC.UI.01**: Building View Rendering - Verify correct number of floors and shafts are rendered based on config.
- **TC.UI.02**: Elevator Position - Verify elevator style `top` or `transform` updates correctly as `currentFloor` changes.
- **TC.UI.03**: Door Animation - Verify door classes (open/closed) apply correctly based on state.
- **TC.UI.04**: Hall Button Interaction - Verify clicking Up/Down buttons calls `handleHallCall`.
- **TC.UI.05**: Car Panel Modal - Verify clicking an elevator opens the internal button panel.
- **TC.UI.06**: Control Panel Inputs - Verify changing Config (Floors/Elevators) calls `handleConfigChange`.
- **TC.UI.07**: Start/Pause Controls - Verify buttons toggle the `running` state in App.

### J. Integration Testing (App.tsx + Simulation)
- **TC.INT.01**: Tick Loop - Verify `setInterval` in App triggers `tickSimulation` and updates state.
- **TC.INT.02**: State Persistence - Verify state is preserved (or correctly reset) when toggling UI tabs (if applicable).
- **TC.INT.03**: Real-time Metrics - Verify MetricsPanel updates live as requests complete in the simulation.
- **TC.INT.04**: Hover Event - Verify hovering over elevator UI triggers `setElevatorHover` in simulation state.

### K. End-to-End Scenarios (User Flows)
- **TC.E2E.01**: Full User Journey - Start Sim -> Add Requests -> Watch Animation -> Check Logs.
- **TC.E2E.02**: Stress Test UI - Rapidly click multiple buttons and ensure UI doesn't freeze (Responsiveness).
- **TC.E2E.03**: Mobile Layout - Verify responsive adjustments on smaller screens (if supported).

### L. Performance & Reliability
- **TC.PERF.01**: Render Performance - Ensure 60fps animations during heavy movement.
- **TC.PERF.02**: Memory Leak Check - Run simulation for 10 minutes and check for heap growth (manual/profile).

## 4. General Testing Strategy Overview

This section outlines the high-level approach to testing the application.

### Unit Tests
- **Simulation logic**:
    - Tick progression moves elevators correctly.
    - Doors open/close with correct timing.
- **Request handling**:
    - New requests are queued and eventually served.
    - Multiple requests on same floor handled properly.
- **Algorithms**:
    - Correct elevator selected for given scenarios.
    - Queue ordering in elevator is as expected.

### Integration Tests
- **Engine + State**
    - Run multiple ticks and verify expected final state.
    - Simulate a sequence of events (e.g., several calls) and check results.
- **Engine + UI**
    - Given user clicks, verify visual state matches expected simulation state.

### UI Tests
- Rendering of floors and elevators.
- Control buttons (start/pause/reset) behavior.
- Input validation (e.g., invalid floor number config).

### Manual / Exploratory Testing
- Try different configurations and stress conditions.
- Observe behavior when rapidly spamming calls.
- Validate that metrics appear reasonable and consistent with expectations.


### M. UI Component Coverage (TC.UI.08 - TC.UI.32)
**Target: 100% coverage for all UI components**

#### DebugModal Component (Currently 27% coverage)
- **TC.UI.08**: DebugModal Rendering - Verify modal renders when isOpen=true
- **TC.UI.09**: DebugModal Close - Verify onClose callback is called when close button clicked
- **TC.UI.10**: DebugModal Copy - Verify copy button copies logs to clipboard
- **TC.UI.11**: DebugModal Copy Feedback - Verify "Copied!" state appears and reverts after 2 seconds
- **TC.UI.12**: DebugModal Logs Display - Verify logs are displayed as formatted JSON
- **TC.UI.13**: DebugModal Entry Count - Verify entry count footer displays correct number

#### ElevatorCar Component (Currently 31% coverage)
- **TC.UI.14**: ElevatorCar Rendering - Verify car renders with correct ID and direction symbol
- **TC.UI.15**: ElevatorCar Position - Verify translateY calculation based on currentFloor
- **TC.UI.16**: ElevatorCar Doors - Verify door classes change based on doorState
- **TC.UI.17**: ElevatorCar Interior - Verify interior color is applied
- **TC.UI.18**: ElevatorCar Select Button - Verify "Select" button appears when doors open
- **TC.UI.19**: ElevatorCar Popover - Verify car panel popover opens when Select clicked
- **TC.UI.20**: ElevatorCar Floor Selection - Verify clicking floor in popover calls onCarCall
- **TC.UI.21**: ElevatorCar Active Floors - Verify active floors are highlighted in popover
- **TC.UI.22**: ElevatorCar Disabled Current - Verify current floor button is disabled
- **TC.UI.23**: ElevatorCar Hover - Verify onElevatorHover called on mouse enter/leave

#### FloorControls Component (Currently 33% coverage)
- **TC.UI.24**: FloorControls Rendering - Verify floor label and buttons render
- **TC.UI.25**: FloorControls UP Button - Verify UP button calls onHallCall with 'up'
- **TC.UI.26**: FloorControls DOWN Button - Verify DOWN button calls onHallCall with 'down'
- **TC.UI.27**: FloorControls Active State - Verify active class applied when request pending
- **TC.UI.28**: FloorControls Disabled Top - Verify UP button disabled on top floor
- **TC.UI.29**: FloorControls Disabled Bottom - Verify DOWN button disabled on floor 1

#### ControlPanel Component (Currently 86% coverage)
- **TC.UI.30**: ControlPanel Mode Change - Verify mode selector calls onConfigChange
- **TC.UI.31**: ControlPanel Input Validation - Verify floor/elevator inputs enforce min/max
- **TC.UI.32**: ControlPanel Edge Cases - Test all input combinations

### N. Custom Hooks Coverage (TC.HOOK.01 - TC.HOOK.12)
**Target: 100% coverage for all custom hooks**

#### useCarPanel Hook (Currently 30% coverage)
- **TC.HOOK.01**: useCarPanel Open - Verify handleOpenCarPanel sets elevatorId
- **TC.HOOK.02**: useCarPanel Close - Verify closeCarPanel clears elevatorId
- **TC.HOOK.03**: useCarPanel Timeout Clear - Verify timeout is cleared on open
- **TC.HOOK.04**: useCarPanel Car Call - Verify handleCarCall toggles request
- **TC.HOOK.05**: useCarPanel Auto-Close - Verify panel auto-closes after 2 seconds
- **TC.HOOK.06**: useCarPanel Timeout Cleanup - Verify timeout cleared on close

#### useSimulationControls Hook (Currently 75% coverage)
- **TC.HOOK.07**: useSimulationControls Start - Verify handleStart sets running=true
- **TC.HOOK.08**: useSimulationControls Pause - Verify handlePause sets running=false
- **TC.HOOK.09**: useSimulationControls Reset - Verify handleReset creates initial state
- **TC.HOOK.10**: useSimulationControls Config Change - Verify handleConfigChange updates config and resets
- **TC.HOOK.11**: useSimulationControls Tick Loop - Verify interval calls tickSimulation
- **TC.HOOK.12**: useSimulationControls Interval Cleanup - Verify interval cleared on unmount

### O. Page Component Coverage (TC.PAGE.01 - TC.PAGE.10)
**Target: 100% coverage for all page components**

#### SimulationPage (Currently 67% coverage)
- **TC.PAGE.01**: SimulationPage Rendering - Verify all sections render
- **TC.PAGE.02**: SimulationPage Debug Modal - Verify debug button opens modal
- **TC.PAGE.03**: SimulationPage Navigation - Verify Tests/Guides buttons navigate
- **TC.PAGE.04**: SimulationPage Hall Call - Verify handleHallCall adds request
- **TC.PAGE.05**: SimulationPage Elevator Hover - Verify handleElevatorHover updates state

#### GuidesPage (Currently 91% coverage)
- **TC.PAGE.06**: GuidesPage All Guides - Verify all guide links render and navigate
- **TC.PAGE.07**: GuidesPage Back Button - Verify back to simulation navigation

#### TestsPage (Currently 0% coverage)
- **TC.PAGE.08**: TestsPage Rendering - Verify test results iframe renders
- **TC.PAGE.09**: TestsPage Coverage Link - Verify coverage report link works
- **TC.PAGE.10**: TestsPage Back Button - Verify back to simulation navigation

### P. Simulation Logic Edge Cases (TC.SIM.51 - TC.SIM.65)
**Target: 100% coverage for simulation.ts (Currently 90%)**

#### Uncovered Lines in simulation.ts
- **TC.SIM.51**: Multiple Requests Same Floor - Both UP and DOWN at same floor, different elevators
- **TC.SIM.52**: Elevator at Destination - Elevator already at target floor when request added
- **TC.SIM.53**: Door State Transitions - All door state transitions (closed→opening→open→closing→closed)
- **TC.SIM.54**: Hover During Closing - Set hover while doors are closing
- **TC.SIM.55**: Unhover During Open - Remove hover while doors are open
- **TC.SIM.56**: Request Completion Edge - Request completed exactly when elevator arrives
- **TC.SIM.57**: Power Mode Jump Boundary - Jump exactly 2 floors in power mode
- **TC.SIM.58**: Eco Mode Batching - Multiple requests batched to single elevator
- **TC.SIM.59**: Normal Mode Dual Dispatch - Dual-direction dispatch with exactly 2 idle elevators
- **TC.SIM.60**: Normal Mode Dual Skip - Dual-direction dispatch skipped with <2 idle elevators
- **TC.SIM.61**: Direction Change - Elevator changes direction after completing all targets
- **TC.SIM.62**: Empty Target Floors - Elevator with empty targetFloors array
- **TC.SIM.63**: Request at Current Floor - Hall request at elevator's current floor
- **TC.SIM.64**: Piggybacking Edge - Request added exactly at elevator's next target
- **TC.SIM.65**: System Log Entries - Verify all system log types are generated

### Q. Integration & Refactored Components (TC.INT.05 - TC.INT.10)
**Target: Test component composition and hook integration**

- **TC.INT.05**: BuildingView Composition - Verify FloorControls and ElevatorShaft render correctly
- **TC.INT.06**: ElevatorShaft Composition - Verify ElevatorCar renders within shaft
- **TC.INT.07**: SimulationHeader Integration - Verify all buttons trigger correct callbacks
- **TC.INT.08**: Hook State Sync - Verify useCarPanel state syncs with SimulationPage
- **TC.INT.09**: Hook Effect Cleanup - Verify useSimulationControls cleans up interval
- **TC.INT.10**: Color Utility - Verify elevatorColors generates consistent colors

## 5. Coverage Goals & Tracking

### Coverage Targets
**Goal: 100% code coverage across all modules**

| Module | Current | Target | Gap | Priority |
|--------|---------|--------|-----|----------|
| simulation.ts | 90% | 100% | 10% | HIGH |
| Components | 62% | 100% | 38% | HIGH |
| Hooks | 55% | 100% | 45% | HIGH |
| Pages | 70% | 100% | 30% | MEDIUM |
| Utils | 100% | 100% | 0% | ✅ DONE |
| **Overall** | **81%** | **100%** | **19%** | **HIGH** |

### Test Implementation Priority

**Phase 1: Critical Coverage Gaps (HIGH PRIORITY)**
1. UI Components (TC.UI.08-32) - 25 test cases
2. Custom Hooks (TC.HOOK.01-12) - 12 test cases
3. Simulation Edge Cases (TC.SIM.51-65) - 15 test cases

**Phase 2: Page Components (MEDIUM PRIORITY)**
4. TestsPage (TC.PAGE.08-10) - 3 test cases
5. SimulationPage gaps (TC.PAGE.01-05) - 5 test cases
6. GuidesPage gaps (TC.PAGE.06-07) - 2 test cases

**Phase 3: Integration & Polish (LOW PRIORITY)**
7. Component Composition (TC.INT.05-10) - 6 test cases
8. Performance Tests (TC.PERF.01-02) - 2 test cases

**Total New Test Cases: 70**

### Success Criteria
- ✅ All test suites pass (37/37 currently passing)
- ✅ 100% line coverage (currently 84%)
- ✅ 100% branch coverage (currently 66%)
- ✅ 100% function coverage (currently 68%)
- ✅ 100% statement coverage (currently 81%)
- ✅ No untested code paths
- ✅ All edge cases documented and tested
- ✅ All refactored components fully tested

### Coverage Improvement Roadmap

**Week 1: UI Components**
- Implement TC.UI.08-13 (DebugModal) - Expected +5% coverage
- Implement TC.UI.14-23 (ElevatorCar) - Expected +8% coverage
- Implement TC.UI.24-29 (FloorControls) - Expected +4% coverage
- **Target: 98% component coverage**

**Week 2: Hooks & Pages**
- Implement TC.HOOK.01-12 (Hooks) - Expected +6% coverage
- Implement TC.PAGE.01-10 (Pages) - Expected +4% coverage
- **Target: 95% overall coverage**

**Week 3: Edge Cases & Integration**
- Implement TC.SIM.51-65 (Simulation) - Expected +3% coverage
- Implement TC.INT.05-10 (Integration) - Expected +2% coverage
- **Target: 100% overall coverage**

