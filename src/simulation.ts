import type {
  BuildingConfig,
  Direction,
  ElevatorState,
  OperationMode,
  Request,
  SimulationState,
  SystemLogEntry
} from './types';

const DEFAULT_CONFIG: BuildingConfig = {
  floors: 10,
  elevators: 3,
  tickDurationMs: 500,
  doorOpenTicks: 2,
  mode: 'normal'
};

// ============================================================================
// INITIALIZATION
// ============================================================================

export function createInitialState(
  config: BuildingConfig = DEFAULT_CONFIG
): SimulationState {
  const elevators: ElevatorState[] = Array.from({ length: config.elevators }, (_, i) => ({
    id: `E${i + 1}`,
    currentFloor: 1,
    direction: 'idle' as Direction,
    lastDirection: 'idle' as Direction,
    doorState: 'closed' as const,
    doorOpenTicksRemaining: 0,
    isHovered: false,
    targetFloors: [],
    stats: {
      totalTravelTime: 0,
      powerConsumed: 0
    }
  }));

  const travelLog: Record<string, number[]> = {};
  for (const elevator of elevators) {
    travelLog[elevator.id] = [elevator.currentFloor];
  }

  return {
    clockTick: 0,
    elevators,
    pendingRequests: [],
    activeRequests: [],
    completedRequests: [],
    metrics: {
      avgWaitTime: 0,
      maxWaitTime: 0,
      totalRequests: 0
    },
    travelLog,
    systemLogs: [],
    running: false
  };
}

// ============================================================================
// REQUEST MANAGEMENT
// ============================================================================

export function addRequest(
  state: SimulationState,
  request: Omit<Request, 'id' | 'createdAtTick'>
): SimulationState {
  const newRequest: Request = {
    ...request,
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    createdAtTick: state.clockTick
  };

  const log: SystemLogEntry = {
    id: `${Date.now()}-${Math.random()}`,
    tick: state.clockTick,
    type: 'request',
    summary: `New ${request.type} request at Floor ${request.floor} ${request.direction || ''}`,
    details: newRequest,
    timestamp: new Date().toISOString()
  };

  return {
    ...state,
    pendingRequests: [...state.pendingRequests, newRequest],
    systemLogs: [log, ...state.systemLogs].slice(0, 500)
  };
}

export function toggleCarRequest(
  state: SimulationState,
  elevatorId: string,
  floor: number
): SimulationState {
  const elevator = state.elevators.find((e) => e.id === elevatorId);
  if (!elevator) return state;

  if (elevator.targetFloors.includes(floor)) {
    // Remove if already selected
    return {
      ...state,
      elevators: state.elevators.map((e) => {
        if (e.id !== elevatorId) return e;
        return {
          ...e,
          targetFloors: e.targetFloors.filter((f) => f !== floor)
        };
      }),
      activeRequests: state.activeRequests.filter(
        (r) => !(r.assignedElevatorId === elevatorId && r.floor === floor && r.type === 'car')
      )
    };
  } else {
    // Add new car request
    const carRequest: Request = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      type: 'car',
      floor,
      createdAtTick: state.clockTick,
      assignedElevatorId: elevatorId
    };

    return {
      ...state,
      activeRequests: [...state.activeRequests, carRequest],
      elevators: state.elevators.map((e) => {
        if (e.id !== elevatorId) return e;
        return {
          ...e,
          targetFloors: [...e.targetFloors, floor]
        };
      })
    };
  }
}

export function setElevatorHover(
  state: SimulationState,
  elevatorId: string,
  isHovered: boolean
): SimulationState {
  return {
    ...state,
    elevators: state.elevators.map((e) =>
      e.id === elevatorId ? { ...e, isHovered } : e
    )
  };
}

// ============================================================================
// COST FUNCTION & DISPATCHING
// ============================================================================

/**
 * Calculate the cost of assigning a request to an elevator.
 * Lower cost = better match.
 */
function calculateCost(
  elevator: ElevatorState,
  request: Request,
  mode: OperationMode
): number {
  const distance = Math.abs(elevator.currentFloor - request.floor);

  // Car calls have no direction, always compatible
  if (request.type === 'car') {
    return distance;
  }

  // Hall calls require direction compatibility check
  const isCompatible = isElevatorCompatible(elevator, request);

  let cost = distance;

  if (mode === 'eco') {
    if (elevator.direction === 'idle') {
      cost += 0; // Baseline for idle
    } else if (isCompatible) {
      cost -= 50; // Strong preference for piggybacking
    } else {
      cost += 1000; // Strong avoidance
    }
  } else {
    // Normal and Power modes use same cost logic
    if (isCompatible) {
      cost -= 1; // Slight preference
    } else {
      cost += 1000; // Strong avoidance
    }
  }

  return cost;
}

/**
 * Check if an elevator is compatible with a hall request.
 * Compatible means: Idle, OR moving toward request with matching direction.
 */
function isElevatorCompatible(elevator: ElevatorState, request: Request): boolean {
  if (elevator.direction === 'idle') return true;
  if (!request.direction) return true; // Car calls are always compatible

  const isMovingToward =
    (elevator.direction === 'up' && request.floor >= elevator.currentFloor) ||
    (elevator.direction === 'down' && request.floor <= elevator.currentFloor);

  const directionMatches = elevator.direction === request.direction;

  return isMovingToward && directionMatches;
}

/**
 * Assign pending requests to elevators based on cost function.
 */
function dispatchRequests(
  state: SimulationState,
  config: BuildingConfig
): SimulationState {
  let elevators = [...state.elevators];
  let pendingRequests = [...state.pendingRequests];
  let activeRequests = [...state.activeRequests];

  // Normal mode: Check for dual-direction requests at same floor
  if (config.mode === 'normal') {
    // Group pending hall requests by floor
    const hallRequestsByFloor = new Map<number, { up?: typeof pendingRequests[0], down?: typeof pendingRequests[0] }>();

    for (const request of pendingRequests) {
      if (request.type === 'hall' && !request.assignedElevatorId) {
        const floorRequests = hallRequestsByFloor.get(request.floor) || {};
        if (request.direction === 'up') {
          floorRequests.up = request;
        } else if (request.direction === 'down') {
          floorRequests.down = request;
        }
        hallRequestsByFloor.set(request.floor, floorRequests);
      }
    }

    // For floors with both UP and DOWN requests, assign to different elevators
    // BUT only handle ONE floor at a time to avoid exhausting all elevators
    // AND only if we have at least 2 idle elevators available
    const idleElevators = elevators.filter(e => e.direction === 'idle' && e.targetFloors.length === 0);
    let dualFloor: number | null = null;
    let oldestTick = Infinity;

    if (idleElevators.length >= 2) {
      for (const [floor, requests] of hallRequestsByFloor) {
        if (requests.up && requests.down) {
          const minTick = Math.min(requests.up.createdAtTick || 0, requests.down.createdAtTick || 0);
          if (minTick < oldestTick) {
            oldestTick = minTick;
            dualFloor = floor;
          }
        }
      }
    }

    // Assign dual-direction for the selected floor only
    if (dualFloor !== null) {
      const requests = hallRequestsByFloor.get(dualFloor)!;

      // Find two different best elevators
      let bestElevatorUp: ElevatorState | null = null;
      let bestCostUp = Infinity;
      let bestElevatorDown: ElevatorState | null = null;
      let bestCostDown = Infinity;

      // Find best elevator for UP request
      for (const elevator of elevators) {
        const cost = calculateCost(elevator, requests.up!, config.mode);
        if (cost < bestCostUp) {
          bestCostUp = cost;
          bestElevatorUp = elevator;
        }
      }

      // Find best elevator for DOWN request (must be different from UP)
      for (const elevator of elevators) {
        if (elevator.id === bestElevatorUp?.id) continue; // Skip the one assigned to UP
        const cost = calculateCost(elevator, requests.down!, config.mode);
        if (cost < bestCostDown) {
          bestCostDown = cost;
          bestElevatorDown = elevator;
        }
      }

      // Assign UP request
      if (bestElevatorUp) {
        const assignedRequestUp = {
          ...requests.up!,
          assignedElevatorId: bestElevatorUp.id
        };
        activeRequests.push(assignedRequestUp);
        const upIndex = pendingRequests.findIndex(r => r === requests.up);
        if (upIndex >= 0) pendingRequests.splice(upIndex, 1);

        elevators = elevators.map(e => {
          if (e.id === bestElevatorUp!.id) {
            return {
              ...e,
              targetFloors: [...e.targetFloors, assignedRequestUp.floor]
            };
          }
          return e;
        });
      }

      // Assign DOWN request
      if (bestElevatorDown) {
        const assignedRequestDown = {
          ...requests.down!,
          assignedElevatorId: bestElevatorDown.id
        };
        activeRequests.push(assignedRequestDown);
        const downIndex = pendingRequests.findIndex(r => r === requests.down);
        if (downIndex >= 0) pendingRequests.splice(downIndex, 1);

        elevators = elevators.map(e => {
          if (e.id === bestElevatorDown!.id) {
            return {
              ...e,
              targetFloors: [...e.targetFloors, assignedRequestDown.floor]
            };
          }
          return e;
        });
      }
    }
  }

  // Process remaining pending requests (single-direction or non-Normal mode)
  for (let i = pendingRequests.length - 1; i >= 0; i--) {
    const request = pendingRequests[i];

    // Skip if already assigned
    if (request.assignedElevatorId) continue;

    // Find best elevator
    let bestElevator: ElevatorState | null = null;
    let bestCost = Infinity;

    for (const elevator of elevators) {
      const cost = calculateCost(elevator, request, config.mode);
      if (cost < bestCost) {
        bestCost = cost;
        bestElevator = elevator;
      }
    }

    // Eco mode: Idle preservation - don't wake idle if any elevator is active
    if (config.mode === 'eco' && bestElevator?.direction === 'idle') {
      const hasActiveElevator = elevators.some(e => e.direction !== 'idle');
      if (hasActiveElevator) {
        continue; // Defer assignment
      }
    }

    // Assign request
    if (bestElevator) {

      // Create new request object instead of mutating (React Strict Mode runs this twice)
      const assignedRequest = {
        ...request,
        assignedElevatorId: bestElevator.id
      };

      activeRequests.push(assignedRequest);
      pendingRequests.splice(i, 1);

      // Add to target floors
      elevators = elevators.map(e => {
        if (e.id === bestElevator!.id) {
          const updated = {
            ...e,
            targetFloors: [...e.targetFloors, assignedRequest.floor]
          };
          return updated;
        }
        return e;
      });
    }
  }

  return {
    ...state,
    elevators,
    pendingRequests,
    activeRequests
  };
}

// ============================================================================
// LOOK ALGORITHM - TARGET SCHEDULING
// ============================================================================

/**
 * Sort target floors using LOOK algorithm.
 * Continues in current direction until no more targets ahead, then reverses.
 */
function sortTargetFloors(
  currentFloor: number,
  direction: Direction,
  targets: number[]
): number[] {
  if (targets.length === 0) return [];

  // Remove duplicates
  const uniqueTargets = Array.from(new Set(targets));

  // If idle, just sort ascending
  if (direction === 'idle') {
    return uniqueTargets.sort((a, b) => Math.abs(a - currentFloor) - Math.abs(b - currentFloor));
  }

  // Partition into ahead and behind
  const ahead: number[] = [];
  const behind: number[] = [];

  for (const target of uniqueTargets) {
    if (direction === 'up') {
      if (target >= currentFloor) {
        ahead.push(target);
      } else {
        behind.push(target);
      }
    } else {
      // direction === 'down'
      if (target <= currentFloor) {
        ahead.push(target);
      } else {
        behind.push(target);
      }
    }
  }

  // Sort ahead in travel direction, behind in reverse
  if (direction === 'up') {
    ahead.sort((a, b) => a - b); // Ascending
    behind.sort((a, b) => b - a); // Descending for return trip
  } else {
    ahead.sort((a, b) => b - a); // Descending
    behind.sort((a, b) => a - b); // Ascending for return trip
  }

  return [...ahead, ...behind];
}

/**
 * Determine the next direction based on current position and targets.
 */
function determineNextDirection(
  currentFloor: number,
  currentDirection: Direction,
  sortedTargets: number[]
): Direction {
  if (sortedTargets.length === 0) return 'idle';

  const nextTarget = sortedTargets[0];

  if (nextTarget > currentFloor) return 'up';
  if (nextTarget < currentFloor) return 'down';

  // At target floor - maintain current direction if more targets ahead
  if (currentDirection === 'up' && sortedTargets.some(t => t > currentFloor)) return 'up';
  if (currentDirection === 'down' && sortedTargets.some(t => t < currentFloor)) return 'down';

  return 'idle';
}

// ============================================================================
// MOVEMENT PHYSICS
// ============================================================================

/**
 * Move elevator toward next target based on operation mode.
 */
function moveElevator(
  elevator: ElevatorState,
  config: BuildingConfig
): ElevatorState {
  if (elevator.targetFloors.length === 0) {
    return { ...elevator, direction: 'idle' };
  }

  // Sort targets
  const sortedTargets = sortTargetFloors(
    elevator.currentFloor,
    elevator.direction,
    elevator.targetFloors
  );

  if (sortedTargets.length === 0) {
    return { ...elevator, direction: 'idle', targetFloors: [] };
  }

  const nextTarget = sortedTargets[0];

  // Already at target - don't move
  if (elevator.currentFloor === nextTarget) {
    return elevator;
  }

  // Determine movement direction
  const moveDirection: Direction = nextTarget > elevator.currentFloor ? 'up' : 'down';

  // Calculate movement distance based on mode
  let floorsToMove = 1;

  if (config.mode === 'power') {
    const distance = Math.abs(nextTarget - elevator.currentFloor);
    if (distance > 1) {
      floorsToMove = 2; // Turbo speed
    }
  } else if (config.mode === 'eco') {
    // 50% chance to skip movement (half speed)
    if (Math.random() < 0.5) {
      floorsToMove = 0;
    }
  }

  // Move elevator
  let newFloor = elevator.currentFloor;
  if (floorsToMove > 0) {
    if (moveDirection === 'up') {
      newFloor = Math.min(elevator.currentFloor + floorsToMove, nextTarget, config.floors);
    } else {
      newFloor = Math.max(elevator.currentFloor - floorsToMove, nextTarget, 1);
    }
  }

  // Calculate power consumption based on mode
  const distanceMoved = Math.abs(newFloor - elevator.currentFloor);
  let powerConsumed = distanceMoved;

  if (config.mode === 'power') {
    powerConsumed = distanceMoved * 2; // High power consumption
  } else if (config.mode === 'eco') {
    powerConsumed = distanceMoved * 0.5; // Energy efficient
  }

  return {
    ...elevator,
    currentFloor: newFloor,
    direction: moveDirection,
    lastDirection: moveDirection,
    targetFloors: sortedTargets,
    stats: {
      ...elevator.stats,
      totalTravelTime: elevator.stats.totalTravelTime + 1,
      powerConsumed: elevator.stats.powerConsumed + powerConsumed
    }
  };
}

// ============================================================================
// DOOR MANAGEMENT
// ============================================================================

/**
 * Update door state for an elevator.
 */
function updateDoorState(
  elevator: ElevatorState,
  config: BuildingConfig,
  hasRequestAtFloor: boolean
): ElevatorState {
  const { doorState, doorOpenTicksRemaining, isHovered, currentFloor, targetFloors } = elevator;

  // Check if we should open doors
  const shouldOpen = targetFloors.includes(currentFloor) || hasRequestAtFloor;

  switch (doorState) {
    case 'closed':
      if (shouldOpen) {
        return { ...elevator, doorState: 'opening' };
      }
      return elevator;

    case 'opening':
      return {
        ...elevator,
        doorState: 'open',
        doorOpenTicksRemaining: config.doorOpenTicks,
        // Remove current floor from targets when doors open
        targetFloors: targetFloors.filter(f => f !== currentFloor)
      };

    case 'open':
      if (isHovered) {
        // Hold doors open while hovered
        return elevator;
      }

      if (doorOpenTicksRemaining > 0) {
        return {
          ...elevator,
          doorOpenTicksRemaining: doorOpenTicksRemaining - 1
        };
      }

      // Check if new request arrived while open
      if (hasRequestAtFloor && !targetFloors.includes(currentFloor)) {
        // Reset timer
        return {
          ...elevator,
          doorOpenTicksRemaining: config.doorOpenTicks
        };
      }

      return { ...elevator, doorState: 'closing' };

    case 'closing':
      // Re-open if new request arrives
      if (hasRequestAtFloor || targetFloors.includes(currentFloor)) {
        return { ...elevator, doorState: 'opening' };
      }

      return { ...elevator, doorState: 'closed' };

    default:
      return elevator;
  }
}

// ============================================================================
// REQUEST COMPLETION
// ============================================================================

/**
 * Check if a request should be completed.
 * Implements strict direction matching with terminal/turnaround exception.
 */
function shouldCompleteRequest(
  elevator: ElevatorState,
  request: Request
): boolean {
  // Must be at the floor with doors open
  if (elevator.currentFloor !== request.floor) return false;
  if (elevator.doorState !== 'open') return false;

  // Car calls have no direction - always complete
  if (!request.direction) return true;

  // Idle elevator serves everything
  if (elevator.direction === 'idle') return true;

  // Check direction compatibility
  const directionsMatch = elevator.direction === request.direction;

  // Check if this is end of run (terminal/turnaround)
  const hasTargetsAhead = elevator.direction === 'up'
    ? elevator.targetFloors.some(f => f > elevator.currentFloor)
    : elevator.targetFloors.some(f => f < elevator.currentFloor);

  const isEndOfRun = !hasTargetsAhead;

  // Complete if:\n  // 1. Directions match (compatible request - serve it regardless of end-of-run status)
  // 2. Directions don't match AND is end of run (turnaround - serve opposite direction)
  // 
  // This handles three cases:
  // - Pass-through: UP elevator at floor 5, UP request, continuing to floor 10 (match, not end)
  // - Final destination: UP elevator at floor 8, UP request, no more targets (match, is end)
  // - Turnaround: UP elevator at floor 10, DOWN request, no more UP targets (no match, is end)
  //
  // What we DON'T complete:
  // - Incompatible pass-through: UP elevator at floor 5, DOWN request, continuing UP (no match, not end)
  if (directionsMatch) return true;
  if (!directionsMatch && isEndOfRun) return true;

  return false;
}

/**
 * Complete requests that are satisfied.
 */
function completeRequests(
  state: SimulationState,
  config: BuildingConfig
): SimulationState {
  let activeRequests = [...state.activeRequests];
  let completedRequests = [...state.completedRequests];

  for (let i = activeRequests.length - 1; i >= 0; i--) {
    const request = activeRequests[i];
    const elevator = state.elevators.find(e => e.id === request.assignedElevatorId);

    if (!elevator) continue;

    if (shouldCompleteRequest(elevator, request)) {
      // Complete the request
      const completedRequest: Request = {
        ...request,
        completedAtTick: state.clockTick
      };

      completedRequests.push(completedRequest);
      activeRequests.splice(i, 1);
    }
  }

  // Recalculate metrics from ALL completed requests
  let totalWaitTime = 0;
  let maxWaitTime = 0;

  for (const req of completedRequests) {
    if (req.completedAtTick !== undefined) {
      const waitTime = req.completedAtTick - req.createdAtTick;
      totalWaitTime += waitTime;
      maxWaitTime = Math.max(maxWaitTime, waitTime);
    }
  }

  const totalRequests = completedRequests.length;
  const avgWaitTime = totalRequests > 0 ? totalWaitTime / totalRequests : 0;

  return {
    ...state,
    activeRequests,
    completedRequests,
    metrics: {
      avgWaitTime,
      maxWaitTime,
      totalRequests
    }
  };
}

// ============================================================================
// LOGGING
// ============================================================================

function generateLogs(
  prevState: SimulationState,
  newState: SimulationState
): SystemLogEntry[] {
  const logs: SystemLogEntry[] = [];

  for (let i = 0; i < newState.elevators.length; i++) {
    const prev = prevState.elevators[i];
    const curr = newState.elevators[i];

    // Movement log
    if (curr.currentFloor !== prev.currentFloor) {
      logs.push({
        id: `${Date.now()}-${Math.random()}`,
        tick: newState.clockTick,
        type: 'movement',
        summary: `Elevator ${curr.id} moved to Floor ${curr.currentFloor}`,
        details: { from: prev.currentFloor, to: curr.currentFloor, direction: curr.direction },
        timestamp: new Date().toISOString()
      });
    } else if (curr.direction === 'idle' && prev.direction !== 'idle') {
      logs.push({
        id: `${Date.now()}-${Math.random()}`,
        tick: newState.clockTick,
        type: 'movement',
        summary: `Elevator ${curr.id} stopped at Floor ${curr.currentFloor}`,
        details: { floor: curr.currentFloor },
        timestamp: new Date().toISOString()
      });
    }

    // Door log
    if (curr.doorState !== prev.doorState) {
      logs.push({
        id: `${Date.now()}-${Math.random()}`,
        tick: newState.clockTick,
        type: 'door',
        summary: `Elevator ${curr.id} doors are ${curr.doorState}`,
        details: { from: prev.doorState, to: curr.doorState, floor: curr.currentFloor },
        timestamp: new Date().toISOString()
      });
    }
  }

  return logs;
}

// ============================================================================
// MAIN TICK FUNCTION
// ============================================================================

export function tickSimulation(
  state: SimulationState,
  config: BuildingConfig
): SimulationState {
  const prevState = state;

  // 1. Dispatch pending requests
  let newState = dispatchRequests(state, config);

  // 2. Update each elevator
  const updatedElevators = newState.elevators.map(elevator => {
    // Check if there are requests at current floor
    const hasRequestAtFloor = newState.activeRequests.some(
      r => r.assignedElevatorId === elevator.id && r.floor === elevator.currentFloor
    );

    // Update doors first
    let updated = updateDoorState(elevator, config, hasRequestAtFloor);

    // Move only if doors are closed
    if (updated.doorState === 'closed') {
      updated = moveElevator(updated, config);
    }

    return updated;
  });

  newState = {
    ...newState,
    elevators: updatedElevators
  };

  // 3. Complete requests
  newState = completeRequests(newState, config);

  // 4. Update travel logs
  const travelLog = { ...newState.travelLog };
  for (const elevator of newState.elevators) {
    const prevFloor = prevState.elevators.find(e => e.id === elevator.id)?.currentFloor;
    if (prevFloor !== elevator.currentFloor) {
      travelLog[elevator.id] = [...(travelLog[elevator.id] || []), elevator.currentFloor];
    }
  }

  // 5. Generate logs
  const newLogs = generateLogs(prevState, newState);

  return {
    ...newState,
    clockTick: state.clockTick + 1,
    travelLog,
    systemLogs: [...newLogs, ...newState.systemLogs].slice(0, 500)
  };
}
