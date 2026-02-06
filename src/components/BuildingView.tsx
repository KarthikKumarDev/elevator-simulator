import type { Direction, SimulationState } from '../types';

interface Props {
  state: SimulationState;
  maxFloor: number;
  tickDurationMs: number;
  onHallCall: (floor: number, direction: Exclude<Direction, 'idle'>) => void;
  onCarCall: (elevatorId: string, floor: number) => void;
  openCarPanelElevatorId: string | null;
  onOpenCarPanel: (elevatorId: string) => void;
  onCloseCarPanel: () => void;
  onElevatorHover: (elevatorId: string, isHovered: boolean) => void;
}

export function BuildingView({
  state,
  maxFloor,
  tickDurationMs,
  onHallCall,
  onCarCall,
  openCarPanelElevatorId,
  onOpenCarPanel,
  onCloseCarPanel,
  onElevatorHover
}: Props) {
  const floors = Array.from({ length: maxFloor }, (_, i) => maxFloor - i);

  return (
    <div className="building-container">
      {/* Left Column: Floor Controls */}
      <div className="floor-controls-column">
        {floors.map((floor) => {
          const isUpActive = state.pendingRequests.some(r => r.floor === floor && r.direction === 'up' && r.type === 'hall')
            || state.activeRequests.some(r => r.floor === floor && r.direction === 'up' && r.type === 'hall');
          const isDownActive = state.pendingRequests.some(r => r.floor === floor && r.direction === 'down' && r.type === 'hall')
            || state.activeRequests.some(r => r.floor === floor && r.direction === 'down' && r.type === 'hall');

          return (
            <div className="floor-control-row" key={floor}>
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
              {/* Horizontal line extending to shafts? Handled by CSS on row or separate markers */}
            </div>
          );
        })}
      </div>

      {/* Right Column: Elevator Shafts */}
      <div className="shafts-container">
        {state.elevators.map((elevator) => {
          // Calculate active floors for car panel popover
          const isPopoverOpen = openCarPanelElevatorId === elevator.id;
          const interiorColor = getElevatorColor(elevator.id);

          return (
            <div className="shaft" key={elevator.id}>
              {/* Background markers for each floor to visualize grid in shaft */}
              {floors.map((floor) => (
                <div className="shaft-floor-marker" key={floor} />
              ))}

              {/* The Moving Car */}
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
            </div>
          );
        })}
      </div>
    </div>
  );
}

function symbolForDirection(direction: Direction) {
  if (direction === 'up') return '↑';
  if (direction === 'down') return '↓';
  return '•';
}

const elevatorColorMap: Record<string, string> = {};
function getElevatorColor(id: string) {
  if (!elevatorColorMap[id]) {
    // Generate a Dark random color
    // Low HSL lightness for dark interior
    const hue = Math.floor(Math.random() * 360);
    const saturation = 30 + Math.floor(Math.random() * 20); // 30-50% - muted
    const lightness = 15 + Math.floor(Math.random() * 10);  // 15-25% - dark
    elevatorColorMap[id] = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  }
  return elevatorColorMap[id];
}

