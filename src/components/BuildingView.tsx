import type { Direction, SimulationState } from '../types';
import { FloorControls } from './FloorControls';
import { ElevatorShaft } from './ElevatorShaft';
import { getElevatorColor } from '../utils/elevatorColors';

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
        {floors.map((floor) => (
          <FloorControls
            key={floor}
            floor={floor}
            maxFloor={maxFloor}
            state={state}
            onHallCall={onHallCall}
          />
        ))}
      </div>

      {/* Right Column: Elevator Shafts */}
      <div className="shafts-container">
        {state.elevators.map((elevator) => {
          const isPopoverOpen = openCarPanelElevatorId === elevator.id;
          const interiorColor = getElevatorColor(elevator.id);

          return (
            <ElevatorShaft
              key={elevator.id}
              elevator={elevator}
              floors={floors}
              maxFloor={maxFloor}
              tickDurationMs={tickDurationMs}
              isPopoverOpen={isPopoverOpen}
              interiorColor={interiorColor}
              onOpenCarPanel={onOpenCarPanel}
              onCarCall={onCarCall}
              onElevatorHover={onElevatorHover}
            />
          );
        })}
      </div>
    </div>
  );
}
