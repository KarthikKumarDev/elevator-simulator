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

