## Elevator Simulation UI – Design, Development & Test Plan

### 1. Goals and Scope

- **Primary goal**: Build an interactive, UI-based elevator simulator that visualizes elevator movement, handles user requests realistically, and allows testing of different control algorithms.
- **Scope**:
  - Multiple floors (configurable).
  - One or more elevators (configurable).
  - Basic request handling (internal car buttons, external hall calls).
  - Visualization of elevator position, direction, doors, and queues, with clear vertical separation between floors.
  - Basic metrics (e.g., wait time, travel time) for evaluation.

### 2. Requirements

#### 2.1 Functional Requirements
*Refer to `prd.md` for detailed functional requirements.*

#### 2.2 Non-Functional Requirements

- **NFR1**: UI should update smoothly at simulation tick intervals (no major jank).
- **NFR2**: Code should be modular: clear separation of UI, simulation engine, and state management.
- **NFR3**: Easy to extend with new algorithms or additional metrics.
- **NFR4**: Basic responsiveness for common desktop resolutions; optional mobile support.

### 3. High-Level Architecture

- **UI Layer**
  - Renders building, floors, elevator cars, buttons, metrics.
  - Handles user input (button clicks, configuration).
  - Subscribes to simulation state changes.

- **Simulation Engine**
  - Core logic: state machine for each elevator.
  - Request handling and scheduling algorithm (per-elevator, one-request-queue-at-a-time).
  - Time-stepped updates (tick function).
  - Metrics calculation (wait times, travel times).

- **State Management**
  - Single source of truth for:
    - Global config (floors, elevators, speed).
    - Elevator states.
    - Pending and active requests.
    - Simulation clock and history.
  - Supports undo/clear if needed (optional).

- **Integration**
  - UI triggers events (new request, config change, control commands).
  - Simulation engine consumes events and updates state each tick.
  - UI re-renders based on updated state.

### 4. Data Model (Conceptual)

- **Core Types / Objects**
  - **BuildingConfig**
    - `floors: number`
    - `elevators: number`
    - `tickDurationMs: number`
  - **ElevatorState**
    - `id: string`
    - `currentFloor: number`
    - `direction: 'up' | 'down' | 'idle'`
    - `doorState: 'open' | 'closed' | 'opening' | 'closing'`
    - `targetFloors: number[]` (queue)
    - `passengers: Passenger[]` (optional, can be simplified).
  - **Request**
    - `type: 'hall' | 'car'`
    - `floor: number`
    - `direction?: 'up' | 'down'` (for hall calls)
    - `createdAtTick: number`
    - `assignedElevatorId?: string` (elevator currently responsible for serving this request)
    - `completedAtTick?: number`
  - **SimulationState**
    - `clockTick: number`
    - `elevators: ElevatorState[]`
    - `pendingRequests: Request[]`
    - `activeRequests: Request[]`
    - `completedRequests: Request[]`
    - `metrics: Metrics`

  - **Metrics**
    - `avgWaitTime: number`
    - `maxWaitTime: number`
    - `avgTravelTime: number`
    - `totalRequests: number`

### 5. UI Design
*Refer to `ui_spec.md` for detailed UI/UX specifications and layout designs.*

### 6. Algorithm Design (Initial Version)

- **Baseline Strategy (Collective Control / Simple Dispatcher)**
  - Each elevator maintains a queue of target floors and **completes its current queue before accepting new assignments**.
  - New requests start in a global pending list and are only assigned to elevators whose queues are empty:
    - For hall calls, assign to the closest idle/compatible elevator.
    - For internal car calls, bind the request to the car that initiated it.
  - Elevators:
    - Move one floor per tick toward their next target floor.
    - Open and close doors in discrete states when they arrive at a target floor.
    - Transition to idle when their queue is empty and there are no assigned requests.
  - **Operation Modes**:
    - **1. Eco Mode (Energy Saver)**
      - **Goal**: Absolute minimization of power consumption.
      - **Movement**: **Half Speed**. Elevators have a 50% probability to wait (skip a tick) during movement, simulating slower, energy-efficient motors.
      - **Dispatching**: **Strict Idle Preservation**.
        - The system will **NEVER** wake up a stationary (Idle) elevator if there is *any* currently moving (Active) elevator in the building, regardless of distance.
        - New requests must wait for the active elevator to become free or compatible.
        - Idle elevators are only utilized if the entire system is stationary.
      - **Conflict Handling**: Simultaneous UP/DOWN requests at the same floor are handled sequentially by the same active elevator to avoid activating a second car.
    
    - **2. Normal Mode (Balanced)**
      - **Goal**: Balance between passenger wait times and system efficiency.
      - **Movement**: **Standard Speed**. Elevators move 1 floor per simulation tick.
      - **Dispatching**: **Collective Control**.
        - Assigns requests to the elevator with the lowest "Cost" (Distance + Compatibility).
        - passing elevators will pick up passengers (Piggybacking).
        - Idle elevators will be awakened if they are the closest or best option.
      - **Conflict Handling**: Standard behavior. If one elevator serves UP, a second elevator *may* serve DOWN if it is nearby an available, but the system does not force spread.

    - **3. Power Mode (Turbo / High Performance)**
      - **Goal**: Minimize Passenger Wait Times.
      - **Movement**: **Double Speed**. Elevators skip floors (moving 2 floors per tick) when traveling distances of 2 or more, simulating high-speed express travel.
      - **Dispatching**: **Aggressive Availability**.
        - Standard cost-based assignment but with the hardware advantage of speed.
      - **Conflict Handling**: **Maximum Throughput**.
        - Due to standard dispatching logic combined with high speed, availability is cycled quickly.
        - Like Normal mode, conflicting requests will trigger a second elevator if the closest one is incompatible (busy going the other way), ensuring both passengers move as soon as possible.


- **Future Enhancements (Optional)**
  - Advanced cost-based scheduling (e.g., considering future demand).
  - Group control with load balancing.
  - Priority requests (VIP, emergency).

### 7. Development Plan & Milestones

#### Milestone 1: Project Setup

- **Tasks**
  - Choose tech stack (e.g., React + TypeScript for web; or desktop framework if preferred).
  - Initialize project structure (UI, simulation, tests folders/modules).
  - Set up linting, formatting, and basic CI (lint + tests).

#### Milestone 2: Core Simulation Engine (Headless)

- **Tasks**
  - Implement data models (`ElevatorState`, `Request`, `SimulationState`).
  - Implement simulation loop (tick-based update function).
  - Implement request queueing and assignment logic (baseline algorithm).
  - Implement movement and door state transitions per tick.
  - Add basic metrics collection.
  - Write unit tests for:
    - Elevator movement between floors.
    - Door open/close timing.
    - Request assignment and completion.
    - Metrics calculations.

#### Milestone 3: Basic UI Integration

- **Tasks**
  - Create UI layout: building, elevators, floor labels.
  - Connect UI to simulation state:
    - Display elevator positions and directions.
    - Basic start/pause/reset controls.
  - Wire user input:
    - Clicking floors for hall calls.
    - Internal car buttons.
  - Ensure consistent state updates and re-renders at tick intervals.
  - Add smoke tests / simple integration tests where feasible.

#### Milestone 4: Enhanced UX & Configuration

- **Tasks**
  - Add configuration panel (floors, elevators, speed, algorithm selection).
  - Add metrics panel with charts or live stats.
  - Improve visuals/animations for elevator movement and doors.
  - Add logging panel (timeline of events).

#### Milestone 5: Testing & Validation

- **Tasks**
  - Expand unit tests for:
    - Edge cases (multiple simultaneous requests, conflicting directions).
    - Algorithm decisions (correct elevator chosen).
  - Add UI tests (e.g., using Playwright/Cypress) for critical flows:
    - Creating hall and car calls.
    - Verifying that elevators respond and metrics update.
  - Manual test scenarios:
    - Single elevator, few floors: simple use case.
    - Multiple elevators, heavy load (many requests).
    - Stress test with randomized requests.
  - Identify and fix performance bottlenecks (if any).

### 8. Testing Strategy (Details)

- **Unit Tests**
  - **Simulation logic**:
    - Tick progression moves elevators correctly.
    - Doors open/close with correct timing.
  - **Request handling**:
    - New requests are queued and eventually served.
    - Multiple requests on same floor handled properly.
  - **Algorithms**:
    - Correct elevator selected for given scenarios.
    - Queue ordering in elevator is as expected.

- **Integration Tests**
  - **Engine + State**
    - Run multiple ticks and verify expected final state.
    - Simulate a sequence of events (e.g., several calls) and check results.
  - **Engine + UI**
    - Given user clicks, verify visual state matches expected simulation state.

- **UI Tests**
  - Rendering of floors and elevators.
  - Control buttons (start/pause/reset) behavior.
  - Input validation (e.g., invalid floor number config).

- **Manual / Exploratory Testing**
  - Try different configurations and stress conditions.
  - Observe behavior when rapidly spamming calls.
  - Validate that metrics appear reasonable and consistent with expectations.

### 9. Documentation & Extensions

- **Documentation**
  - High-level README with:
    - Overview and goals.
    - How to run the simulator.
    - Configuration options.
    - Known limitations.
  - Internal docs:
    - Explanation of scheduling algorithms.
    - Data model and state flow diagrams.

- **Possible Extensions**
  - Passenger modeling (capacity, boarding/alighting times, crowds).
  - Advanced analytics (per-floor wait times, heatmaps).
  - Saving/loading simulation scenarios.
  - AI/ML-based scheduling experiments.

### 10. UI & Enhancement Workflow

To ensure high-quality visual output and adherence to requirements, all future UI changes and major enhancements must follow this strict process:

1.  **Drafting**: Create a detailed plan in the relevant specification file (e.g., `guides/ui_spec.md` or a new section in `guides/plan.md`).
    *   Include specific CSS properties, layout strategies, and interaction details.
    *   Describe expected animations, logic changes, and test criteria.
2.  **Review**: Present the plan to the User for approval.
    *   **Do not write code** until the plan is explicitly approved by the User.
3.  **Implementation**: Precise execution of the approved plan.
4.  **Verification**: Update the specification/documentation to reflect the final state if minor adjustments were made during implementation.
