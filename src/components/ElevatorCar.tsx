import type { Direction, ElevatorState } from '../types';

interface ElevatorCarProps {
    elevator: ElevatorState;
    maxFloor: number;
    tickDurationMs: number;
    isPopoverOpen: boolean;
    interiorColor: string;
    onOpenCarPanel: (elevatorId: string) => void;
    onCarCall: (elevatorId: string, floor: number) => void;
    onElevatorHover: (elevatorId: string, isHovered: boolean) => void;
}

export function ElevatorCar({
    elevator,
    maxFloor,
    tickDurationMs,
    isPopoverOpen,
    interiorColor,
    onOpenCarPanel,
    onCarCall,
    onElevatorHover
}: ElevatorCarProps) {
    return (
        <div
            className={[
                'elevator-car',
                `door-${elevator.doorState}`
            ].join(' ')}
            style={{
                height: `${100 / maxFloor}%`,
                transform: `translateY(${(maxFloor - elevator.currentFloor) * 100}%)`,
                transition: `transform ${tickDurationMs}ms linear`
            }}
            onMouseEnter={() => onElevatorHover(elevator.id, true)}
            onMouseLeave={() => onElevatorHover(elevator.id, false)}
        >
            <div className="elevator-header">
                <span className="elevator-id">{elevator.id}</span>
                <span className="elevator-direction">
                    {symbolForDirection(
                        elevator.lastDirection === 'idle' ? elevator.direction : elevator.lastDirection
                    )}
                </span>
            </div>

            <div className="elevator-cabin">
                <div className={`elevator-door door-left ${elevator.doorState}`} />
                <div className={`elevator-door door-right ${elevator.doorState}`} />

                <div className="elevator-interior" style={{ background: interiorColor }}>
                    <div className="elevator-car-buttons">
                        {(elevator.doorState === 'open' || elevator.doorState === 'opening') && !isPopoverOpen && (
                            <button
                                className="car-button"
                                onClick={() => onOpenCarPanel(elevator.id)}
                            >
                                Select
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {isPopoverOpen && (
                <div className="car-popover" style={{ bottom: '100%', marginBottom: '10px' }}>
                    {Array.from({ length: maxFloor }, (_, i) => i + 1).map((f) => {
                        const isActive = elevator.targetFloors.includes(f);
                        return (
                            <button
                                key={f}
                                className={`car-button car-popover-button ${isActive ? 'active' : ''}`}
                                disabled={f === elevator.currentFloor}
                                onClick={() => onCarCall(elevator.id, f)}
                            >
                                {f}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

function symbolForDirection(direction: Direction) {
    if (direction === 'up') return '↑';
    if (direction === 'down') return '↓';
    return '•';
}
