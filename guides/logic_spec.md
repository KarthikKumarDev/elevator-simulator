# Elevator Simulation Logic Specification

This document details the core logic used in the Elevator Simulator, focusing on Request Assignment, Target Scheduling (LOOK Algorithm), and Movement Physics.

## 1. Request Assignment (Dispatching)

When a **Hall Call** is received, the system selects the "best" elevator using a `Cost Function`.

### Cost Function Logic
For each elevator, a `cost` is calculated relative to the request `(floor, direction)`:

1.  **Base Cost**: Distance (floors) between `currentFloor` and `request.floor`.
2.  **Compatibility Check**:
    *   **Compatible**: Elevator is `Idle`, or moving towards the request AND in the matching direction.
    *   **Incompatible**: Moving away, or moving towards but with wrong direction (e.g., passing a Down call while going Up).
3.  **Mode Adjustments**:
    *   **Normal Mode**:
        *   Compatible: `-1` bonus (Slight preference).
        *   Incompatible: `+1000` penalty (Strong avoidance).
    *   **Eco Mode**:
        *   Compatible: `-50` bonus (Strong preference for piggybacking).
        *   Idle: `+0` (Baseline).
        *   Incompatible: `+1000` penalty.
        *   **Idle Preservation**: If an Idle elevator is the best candidate, but *any* other elevator is Active (even if currently incompatible), the assignment is deferred to avoid waking the idle car.

## 2. Target Scheduling (LOOK Algorithm)

Each elevator maintains a list of `targetFloors`. This list is re-sorted every tick to ensure efficient travel.

### The LOOK Algorithm
The sorting logic prevents oscillation and ensures the elevator continues in its current direction until all requests in that direction are served:

1.  **Partition**: Targets are split into two groups relative to the `currentFloor`:
    *   **Ahead**: Targets reachable by continuing in the current `direction`.
    *   **Behind**: Targets requiring a direction reversal.
2.  **Sort**:
    *   **Ahead** targets are sorted in the direction of travel (Ascending for Up, Descending for Down).
    *   **Behind** targets are sorted in the reverse direction (for the return trip).
3.  **Concatenate**: `targetFloors = [...Ahead, ...Behind]`.

### Peek Validation (Loop Prevention)
To prevent infinite loops where an elevator passes through a floor incorrectly:

*   **Condition**: The check is only applied if the elevator is **Passing Through** (continuing in the same direction after the stop).
*   **Exemption**: If the elevator is **Turning Around** (reversing direction after the stop), the stop is always allowed (as it is necessary to service the terminal request).
*   **Logic**:
    *   If `nextDirection` == `currentDirection`:
        *   Verify if there is a compatible request at the stop (matching direction or car call).
        *   If NO compatible request exists, the stop is skipped to prevent an invalid pickup (e.g., stopping for a Down call while continuing Up).

### 4. Direction Management
*   **Arrival**: When an elevator arrives at a floor (`opening` doors), it **retains its current direction**. This ensures it remains compatible with requests matching its arrival direction (e.g., Arriving 'Up' at the top floor allows serving the 'Up' request there).
*   **Departure**: The direction is updated only when the elevator actually begins to **move** towards a new target.

### 5. Request Completion Logic
A request is marked as **Completed** when:
1.  Elevator is at the requested floor.
2.  Doors are `Open`.
3.  **Compatibility Check Passes**:
    *   **Strict Match**: Request direction matches Elevator direction (e.g., Up/Up).
    *   **Terminal/Turnaround Exception**: If the elevator has **no further targets** (or only the current floor remains in targets), it is considered a **Terminal Stop**. In this case, the request is completed regardless of direction mismatch (e.g., Arriving Up to serve a Down request at the top floor).
    *   **Normal**: 1 floor per tick.
    *   **Power**: Accelerates to 2 floors per tick if distance > 1.
    *   **Eco**: ~0.5 floors per tick (skips movement every other tick).
*   **Door Operation**:
    *   States: `Closed` -> `Opening` (1 tick) -> `Open` (N ticks) -> `Closing` (1 tick) -> `Closed`.
    *   **Hover**: Hovering over an elevator holds doors `Open` indefinitely.
    *   **Re-Open**: Arriving requests while `Closing` force doors back to `Opening`.

## 4. Completion Phase
A request is marked **Completed** only when:
1.  Elevator is at the floor.
2.  Doors are `Open`.
3.  Direction is **Compatible** (e.g., Elevator going Up can serve Up calls and Drop-offs, but not Down calls).
