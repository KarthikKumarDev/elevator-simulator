import type {
  BuildingConfig,
  Direction,
  ElevatorState,
  OperationMode,
  Request,
  SimulationState
} from './types';

const DEFAULT_CONFIG: BuildingConfig = {
  floors: 10,
  elevators: 3,
  tickDurationMs: 500,
  doorOpenTicks: 2,
  mode: 'normal'
};

export function createInitialState(
  config: BuildingConfig = DEFAULT_CONFIG
): SimulationState {
  const elevators: ElevatorState[] = Array.from({ length: config.elevators }, (_, i) => ({
    id: `E${i + 1}`,
    currentFloor: 1,
    direction: 'idle',
    lastDirection: 'idle',
    doorState: 'closed',
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
    // Start each elevator log at its initial floor.
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
    running: false
  };
}

export function addRequest(
  state: SimulationState,
  request: Omit<Request, 'id' | 'createdAtTick'>
): SimulationState {
  const newRequest: Request = {
    ...request,
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    createdAtTick: state.clockTick
  };

  return { ...state, pendingRequests: [...state.pendingRequests, newRequest] };
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
      // Remove associated active/pending requests to prevent zombie requests
      activeRequests: state.activeRequests.filter(
        (req) =>
          !(
            req.assignedElevatorId === elevatorId &&
            req.floor === floor &&
            req.type === 'car'
          )
      ),
      pendingRequests: state.pendingRequests.filter(
        (req) =>
          !(
            req.assignedElevatorId === elevatorId &&
            req.floor === floor &&
            req.type === 'car'
          )
      )
    };
  } else {
    // Add if not selected
    return addRequest(state, {
      type: 'car',
      floor,
      assignedElevatorId: elevatorId
    });
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

function chooseElevatorForRequest(
  elevators: ElevatorState[],
  request: Request,
  mode: OperationMode
): ElevatorState | undefined {
  let best: { elevator: ElevatorState; cost: number } | undefined;

  for (const elevator of elevators) {
    // Cost starts with distance
    const distance = Math.abs(elevator.currentFloor - request.floor);
    let cost = distance;

    // Check availability/compatibility
    const isIdle = elevator.direction === 'idle';
    const isMovingTowards =
      (elevator.direction === 'up' && request.floor >= elevator.currentFloor) ||
      (elevator.direction === 'down' && request.floor <= elevator.currentFloor);

    // For Hall calls, direction must match. For Car calls, just getting there is enough (piggyback).
    // Usually car calls have no direction, but here request.direction is set for hall calls.
    const directionMatch =
      !request.direction || // Car call or indiscriminate
      elevator.direction === request.direction;

    // Compatibility check for Eco (Collective Control)
    // We can only assign to a busy elevator if it's moving towards the floor AND directions allow.
    const isCompatible = !isIdle && isMovingTowards && directionMatch;

    if (mode === 'eco') {
      // Eco Logic: Strongly prefer Compatible Active elevators.
      // Penalize Idle elevators to encourage using the active one.

      if (isCompatible) {
        cost -= 50; // Huge bonus for piggybacking
      } else if (isIdle) {
        cost += 0; // Baseline
      } else {
        // Busy but Incompatible (wrong way or passed already) -> Do not select essentially.
        // We add a massive penalty or skip.
        // If we strictly filter candidates in tickSimulation, this might be redundant, 
        // but robust scoring handles it.
        cost += 1000;
      }
    } else {
      // Normal/Power Logic (Baseline)
      // Original logic used directionScore. Let's map roughly to that.
      // -1 for compatible, +1 for incompatible, 0 for idle.
      // Distance is main factor.

      if (isIdle) {
        cost += 0;
      } else if (isCompatible) {
        cost -= 1; // Slight preference for flow
      } else {
        cost += 1000; // Prefer not to interrupt/confuse logic if not compatible
      }
    }

    if (!best || cost < best.cost) {
      best = { elevator, cost };
    }
  }

  // Eco Constraint: If we found an Idle elevator as 'best', but there are Active elevators 
  // running (even if incompatible right now), we prefer to WAIT (return undefined) 
  // rather than waking the idle one.
  if (mode === 'eco' && best && best.elevator.direction === 'idle') {
    const hasAnyActive = elevators.some(
      (e) => e.direction !== 'idle' || e.targetFloors.length > 0
    );
    if (hasAnyActive) {
      // We have active elevators, but the best candidate was Idle (meaning no compatible active found).
      // We choose to wait.
      return undefined;
    }
  }

  // If best cost is 1000+ (incompatible), implies no suitable candidate found 
  // (e.g. all busy going wrong way, no idle).
  if (best && best.cost >= 1000) {
    return undefined;
  }

  return best?.elevator;
}

export function updateElevatorDirection(elevator: ElevatorState): Direction {
  if (elevator.targetFloors.length === 0) {
    return 'idle';
  }

  const nextTarget = elevator.targetFloors[0];
  if (nextTarget > elevator.currentFloor) return 'up';
  if (nextTarget < elevator.currentFloor) return 'down';
  return 'idle';
}

// ... move updateElevatorDirection ...

function stepElevator(
  elevator: ElevatorState,
  config: BuildingConfig
): ElevatorState {
  // Power Constants
  const POWER_COSTS = {
    eco: { move: 1, door: 0.5, idle: 0 },
    normal: { move: 2, door: 1, idle: 0 },
    power: { move: 5, door: 2, idle: 0 }
  };
  const costs = POWER_COSTS[config.mode];

  // Helper to accumulate stats
  const addStats = (e: ElevatorState, time: number, power: number): ElevatorState => ({
    ...e,
    stats: {
      totalTravelTime: e.stats.totalTravelTime + time,
      powerConsumed: e.stats.powerConsumed + power
    }
  });

  if (elevator.doorState === 'opening') {
    return addStats({
      ...elevator,
      doorState: 'open',
      doorOpenTicksRemaining: config.doorOpenTicks
    }, 1, costs.door);
  }
  if (elevator.doorState === 'open') {
    // If hovered, don't decrement tickets regarding door closure, effectually keeping it open
    if (elevator.isHovered) {
      // Idle while held open? Low cost or door cost? Let's say idle cost.
      return addStats(elevator, 1, costs.idle);
    }
    if (elevator.doorOpenTicksRemaining > 1) {
      return addStats({
        ...elevator,
        doorOpenTicksRemaining: elevator.doorOpenTicksRemaining - 1
      }, 1, costs.idle);
    }
    return addStats({ ...elevator, doorState: 'closing', doorOpenTicksRemaining: 0 }, 1, costs.door);
  }
  if (elevator.doorState === 'closing') {
    return addStats({ ...elevator, doorState: 'closed' }, 1, costs.door);
  }

  if (elevator.targetFloors.length === 0) {
    // Idle
    return addStats({ ...elevator, direction: 'idle' }, 0, costs.idle);
  }

  // Operation Mode Logic: Speed/Movement Modification
  // Eco: Move every 2nd tick (simulate by checking clock or keeping internal sub-tick state?
  // Use a random check or simple modulus simulation for now.
  // Actually, we can just skip movement 50% of the time, or better:
  // If Eco mode, only move if simulation tick is even? We don't have global tick passed here easily
  // without changing signature again. But we can assume typical tick-based.
  // Alternative: "Eco" just means moves slower.
  // "Power": Moves 2 floors at once if distance > 1?

  let floorsToMove = 1;
  const isPower = config.mode === 'power';
  const isEco = config.mode === 'eco';

  // Eco: 50% chance to skip movement tick (effective 50% speed)
  if (isEco && Math.random() > 0.5) {
    // Waiting for eco tick
    return addStats(elevator, 1, costs.idle);
  }

  // Power: Accelerate! If distance >= 2, move 2 floors.
  const nextTarget = elevator.targetFloors[0];
  if (isPower) {
    const dist = Math.abs(elevator.currentFloor - nextTarget);
    if (dist >= 2) {
      floorsToMove = 2;
    }
  }

  if (elevator.currentFloor === nextTarget) {
    const [, ...restTargets] = elevator.targetFloors;
    // Power/Normal: Fast door opening?
    // Let's just standard open.
    // Transitioning to opening takes a tick? No, we return state 'opening' immediately for NEXT tick to process?
    // stepElevator returns the state for the current tick.
    // If we return doorState: 'opening', we consumed this tick to make that decision/transition.
    // So we charge cost.
    return addStats({
      ...elevator,
      targetFloors: restTargets,
      direction: updateElevatorDirection({ ...elevator, targetFloors: restTargets }),
      doorState: 'opening'
    }, 1, costs.door);
  }

  const direction: Direction = nextTarget > elevator.currentFloor ? 'up' : 'down';

  // Calculate new floor with jump
  let newFloor = elevator.currentFloor + (direction === 'up' ? floorsToMove : -floorsToMove);

  // Clamp: Don't overshoot target
  if (direction === 'up' && newFloor > nextTarget) newFloor = nextTarget;
  if (direction === 'down' && newFloor < nextTarget) newFloor = nextTarget;

  // Check if we accidentally jumped over a different target?
  // For simplicity, we only look at the PRIMARY target (index 0). 
  // Advanced logic would check for intermediate stops. 
  // We'll stick to primary target logic for MVP of "Power Mode".

  // Moving cost: Base * floorsMoved? Or just per tick? 
  // Power moves 2 floors in 1 tick. Cost should probably be higher per tick (already set to 5 vs 2).
  // So standard 'costs.move' is per tick.

  return addStats({
    ...elevator,
    currentFloor: newFloor,
    direction,
    lastDirection: direction
  }, 1, costs.move);
}

export function tickSimulation(
  state: SimulationState,
  config: BuildingConfig
): SimulationState {
  const clockTick = state.clockTick + 1;

  const elevators: ElevatorState[] = state.elevators.map((e) => ({ ...e }));

  // ASSIGNMENT PHASE
  // 1. Reset targetFloors and rebuild from Active Requests to ensure persistence
  elevators.forEach(e => {
    e.targetFloors = [];
  });

  const nextActive: Request[] = [];
  const remainingPending: Request[] = [];

  // Re-process all active requests to ensure they are in target lists
  for (const req of state.activeRequests) {
    const elev = elevators.find(e => e.id === req.assignedElevatorId);
    if (elev) {
      // Check for STUCK LOOP condition:
      // If elevator is at the floor, and direction is incompatible, DO NOT add to targetFloors.
      // This allows the elevator to leave.
      // It will re-add this floor to targets once it leaves (currentFloor != req.floor).
      const isAtFloor = elev.currentFloor === req.floor;
      const isCompatible =
        !req.direction ||
        elev.direction === 'idle' ||
        elev.direction === req.direction;

      if (isAtFloor && !isCompatible) {
        // Do not add to targets
      } else {
        elev.targetFloors.push(req.floor);
      }
      nextActive.push(req);
    } else {
      // Orphaned request? Should not happen.
      remainingPending.push({ ...req, assignedElevatorId: undefined });
    }
  }

  // Process Pending Requests
  for (const req of state.pendingRequests) {
    if (req.assignedElevatorId) {
      // Should have been in active? Or manually set? Handle as Active.
      // Logic duplicate of above but simple adoption
      const elev = elevators.find(e => e.id === req.assignedElevatorId);
      if (elev) {
        elev.targetFloors.push(req.floor);
        nextActive.push(req);
        continue;
      }
    }

    // Hall Calls Logic
    const elev = chooseElevatorForRequest(elevators, req, config.mode);
    if (!elev) {
      remainingPending.push(req);
      continue;
    }

    // Assign
    elev.targetFloors.push(req.floor);
    nextActive.push({ ...req, assignedElevatorId: elev.id });
  }

  // Sort Targets and Update Direction
  elevators.forEach(e => {
    e.targetFloors = Array.from(new Set(e.targetFloors)).sort((a, b) => {
      if (e.direction === 'down') return b - a;
      return a - b;
    });
    // Important: Update direction based on new targets? 
    // stepElevator does this. But we need stable direction for compatibility checks next tick.
    // e.direction = updateElevatorDirection(e); 
    // Actually `updateElevatorDirection` relies on `targetFloors`.
    // If we don't update direction here, `chooseElevatorForRequest` uses stale direction?
    // `tickSimulation` doesn't strictly update direction until `stepElevator`. 
    // But we just modified `targetFloors`. 
    // Let's leave direction update to `stepElevator` to avoid jumpiness.
  });

  // MOVEMENT PHASE
  const prevElevators = state.elevators;
  const updatedElevators = elevators.map((e) => stepElevator(e, config));

  // UPDATE TRAVEL LOG (only record stops where doors open, to avoid intermediate floors)
  const travelLog: Record<string, number[]> = { ...state.travelLog };
  updatedElevators.forEach((elevator, index) => {
    const prev = prevElevators[index];
    if (!prev) return;

    // Log only when we are arriving at a floor and starting to open doors,
    // which corresponds to a meaningful stop in the travel sequence.
    if (elevator.doorState === 'opening') {
      const seq = travelLog[elevator.id] ?? [prev.currentFloor];
      const last = seq[seq.length - 1];
      if (last !== elevator.currentFloor) {
        travelLog[elevator.id] = [...seq, elevator.currentFloor];
      } else {
        travelLog[elevator.id] = seq;
      }
    }
  });

  // COMPLETION + METRICS PHASE
  const stillActive: Request[] = [];
  const completed: Request[] = [...state.completedRequests];

  let totalRequests = state.metrics.totalRequests;
  let totalWaitTime = state.metrics.avgWaitTime * state.metrics.totalRequests;
  let maxWaitTime = state.metrics.maxWaitTime;

  for (const req of nextActive) {
    const servingElevator = updatedElevators.find(
      (e) =>
        e.id === req.assignedElevatorId &&
        e.doorState === 'open' &&
        e.currentFloor === req.floor
    );

    let isCompleted = false;

    if (servingElevator && !req.completedAtTick) {
      const isCompatible =
        !req.direction ||
        servingElevator.direction === 'idle' ||
        servingElevator.direction === req.direction;

      if (isCompatible) {
        // When serving a hall request, pin the visible direction to the
        // request's direction (up/down) while at the destination floor.
        if (req.direction) {
          servingElevator.lastDirection = req.direction;
        }

        const completedAtTick = clockTick;
        const waitTime = completedAtTick - req.createdAtTick;

        totalRequests += 1;
        totalWaitTime += waitTime;
        maxWaitTime = Math.max(maxWaitTime, waitTime);

        completed.push({
          ...req,
          completedAtTick
        });
        isCompleted = true;
      }
    }

    if (!isCompleted) {
      stillActive.push(req);
    }
  }

  const avgWaitTime = totalRequests === 0 ? 0 : totalWaitTime / totalRequests;

  return {
    ...state,
    clockTick,
    elevators: updatedElevators,
    pendingRequests: remainingPending,
    activeRequests: stillActive,
    completedRequests: completed,
    travelLog,
    metrics: {
      avgWaitTime,
      maxWaitTime,
      totalRequests
    }
  };
}

