export type Direction = 'up' | 'down' | 'idle';

export type DoorState = 'open' | 'closed' | 'opening' | 'closing';

export type OperationMode = 'eco' | 'normal' | 'power';

export interface BuildingConfig {
  floors: number;
  elevators: number;
  tickDurationMs: number;
  doorOpenTicks: number;
  mode: OperationMode;
}

export interface Request {
  id: string;
  type: 'hall' | 'car';
  floor: number;
  direction?: Exclude<Direction, 'idle'>;
  createdAtTick: number;
  assignedElevatorId?: string;
  completedAtTick?: number;
}

export interface ElevatorStats {
  totalTravelTime: number;
  powerConsumed: number;
}

export interface ElevatorState {
  id: string;
  currentFloor: number;
  // Direction used by the movement logic (may go idle when there are no targets).
  direction: Direction;
  // Last non-idle direction of travel, used for UI so the arrow persists at stops.
  lastDirection: Direction;
  doorState: DoorState;
  doorOpenTicksRemaining: number;
  isHovered: boolean;
  targetFloors: number[];
  stats: ElevatorStats;
}

export interface Metrics {
  avgWaitTime: number;
  maxWaitTime: number;
  totalRequests: number;
}

export interface SystemLogEntry {
  id: string; // Unique ID for keying
  tick: number;
  type: 'request' | 'movement' | 'door';
  summary: string;
  details: any;
  timestamp: string; // ISO Time
}

export interface SimulationState {
  clockTick: number;
  elevators: ElevatorState[];
  pendingRequests: Request[];
  activeRequests: Request[];
  completedRequests: Request[];
  metrics: Metrics;
  // For each elevator, the chronological sequence of floors it has visited.
  travelLog: Record<string, number[]>;
  systemLogs: SystemLogEntry[];
  running: boolean;
}

