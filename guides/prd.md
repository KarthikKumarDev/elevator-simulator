# Functional Requirements Specification

## 1. Floors & Elevators
- **FR1**: Support N floors (e.g., 2–20, configurable).
- **FR2**: Support M elevators (e.g., 1–8, configurable).
- **FR3**: Each elevator has its own state (current floor, direction, door state, request queue).

## 2. User Interactions
- **FR4**: User can initiate hall calls (Up/Down) on each floor.
- **FR5**: User can press car call buttons inside each elevator (select destination floor).
- **FR6**: Ability to clear/reset simulation.

## 3. Simulation Behavior
- **FR7**: Time-based simulation loop (tick-based or real-time interval).
- **FR8**: Elevators move one floor per configurable time unit.
- **FR9**: Door open/close is modeled with time delay.
- **FR10**: Basic scheduling algorithm (e.g., collective control / SCAN-like).
- **FR11**: Avoid invalid actions (e.g., going below floor 1 or above max floor).
- **FR12**: Configurable simulation speed (slow/normal/fast).

## 4. Visualization & Status
- **FR13**: Show building view with floors and elevator positions.
- **FR14**: Indicate elevator direction (up/down/idle).
- **FR15**: Indicate door state (open/closed).
- **FR16**: Show active requests and queues (per-elevator or global).
- **FR17**: Display basic metrics: number of completed trips, average wait time, max wait, etc.

## 5. Control & Configuration
- **FR18**: Start, pause, resume, and reset simulation.
- **FR19**: Configure number of floors and elevators before starting.
- **FR20**: Optionally switch between different elevator algorithms (e.g., simple vs advanced).
- **FR21**: Support different operation modes (Eco, Normal, Power).
- **FR22**: Door Open Duration customization (in ticks) from the control panel.
- **FR23**: "Hold Open" behavior on hover (doors do not close if mouse is over elevator).
- **FR24**: Detailed per-elevator Travel Log, including moving time, power consumption, and floor sequence.

## 6. Goals and Scope
- **Primary goal**: Build an interactive, UI-based elevator simulator that visualizes elevator movement, handles user requests realistically, and allows testing of different control algorithms.
- **Scope**:
  - Multiple floors (configurable).
  - One or more elevators (configurable).
  - Basic request handling (internal car buttons, external hall calls).
  - Visualization of elevator position, direction, doors, and queues, with clear vertical separation between floors.
  - Basic metrics (e.g., wait time, travel time) for evaluation.

## 7. Non-Functional Requirements
- **NFR1**: UI should update smoothly at simulation tick intervals (no major jank).
- **NFR2**: Code should be modular: clear separation of UI, simulation engine, and state management.
- **NFR3**: Easy to extend with new algorithms or additional metrics.
- **NFR4**: Basic responsiveness for common desktop resolutions; optional mobile support.

## 8. Future Extensions
- Advanced cost-based scheduling (e.g., considering future demand).
- Group control with load balancing.
- Priority requests (VIP, emergency).
- Passenger modeling (capacity, boarding/alighting times, crowds).
- Advanced analytics (per-floor wait times, heatmaps).
- Saving/loading simulation scenarios.
- AI/ML-based scheduling experiments.
