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
