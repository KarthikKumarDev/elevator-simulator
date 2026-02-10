import type { ElevatorState } from '../types';
import { ElevatorCar } from './ElevatorCar';

interface ElevatorShaftProps {
    elevator: ElevatorState;
    floors: number[];
    maxFloor: number;
    tickDurationMs: number;
    isPopoverOpen: boolean;
    interiorColor: string;
    onOpenCarPanel: (elevatorId: string) => void;
    onCarCall: (elevatorId: string, floor: number) => void;
    onElevatorHover: (elevatorId: string, isHovered: boolean) => void;
}

export function ElevatorShaft({
    elevator,
    floors,
    maxFloor,
    tickDurationMs,
    isPopoverOpen,
    interiorColor,
    onOpenCarPanel,
    onCarCall,
    onElevatorHover
}: ElevatorShaftProps) {
    return (
        <div className="shaft">
            {/* Background markers for each floor to visualize grid in shaft */}
            {floors.map((floor) => (
                <div className="shaft-floor-marker" key={floor} />
            ))}

            {/* The Moving Car */}
            <ElevatorCar
                elevator={elevator}
                maxFloor={maxFloor}
                tickDurationMs={tickDurationMs}
                isPopoverOpen={isPopoverOpen}
                interiorColor={interiorColor}
                onOpenCarPanel={onOpenCarPanel}
                onCarCall={onCarCall}
                onElevatorHover={onElevatorHover}
            />
        </div>
    );
}
