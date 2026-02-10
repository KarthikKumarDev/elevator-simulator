import type { Direction, SimulationState } from '../types';

interface FloorControlsProps {
    floor: number;
    maxFloor: number;
    state: SimulationState;
    onHallCall: (floor: number, direction: Exclude<Direction, 'idle'>) => void;
}

export function FloorControls({ floor, maxFloor, state, onHallCall }: FloorControlsProps) {
    const isUpActive = state.pendingRequests.some(r => r.floor === floor && r.direction === 'up' && r.type === 'hall')
        || state.activeRequests.some(r => r.floor === floor && r.direction === 'up' && r.type === 'hall');
    const isDownActive = state.pendingRequests.some(r => r.floor === floor && r.direction === 'down' && r.type === 'hall')
        || state.activeRequests.some(r => r.floor === floor && r.direction === 'down' && r.type === 'hall');

    return (
        <div className="floor-control-row">
            <div className="floor-label">Floor {floor}</div>
            <div className="floor-hall-calls">
                <button
                    className={`hall-button up ${isUpActive ? 'active' : ''}`}
                    disabled={floor === maxFloor}
                    onClick={() => onHallCall(floor, 'up')}
                >
                    ↑
                </button>
                <button
                    className={`hall-button down ${isDownActive ? 'active' : ''}`}
                    disabled={floor === 1}
                    onClick={() => onHallCall(floor, 'down')}
                >
                    ↓
                </button>
            </div>
        </div>
    );
}
