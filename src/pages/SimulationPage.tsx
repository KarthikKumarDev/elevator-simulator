import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createInitialState, addRequest, setElevatorHover } from '../simulation';
import type { BuildingConfig, Direction, SimulationState } from '../types';
import { BuildingView } from '../components/BuildingView';
import { ControlPanel } from '../components/ControlPanel';
import { MetricsPanel } from '../components/MetricsPanel';
import { TravelLogPanel } from '../components/TravelLogPanel';
import { DebugModal } from '../components/DebugModal';
import { SimulationHeader } from '../components/SimulationHeader';
import { useSimulationControls } from '../hooks/useSimulationControls';
import { useCarPanel } from '../hooks/useCarPanel';

const DEFAULT_CONFIG: BuildingConfig = {
    floors: 10,
    elevators: 3,
    tickDurationMs: 500,
    doorOpenTicks: 5,
    mode: 'normal'
};

export function SimulationPage() {
    const navigate = useNavigate();
    const [config, setConfig] = useState<BuildingConfig>(DEFAULT_CONFIG);
    const [state, setState] = useState<SimulationState>(() =>
        createInitialState(DEFAULT_CONFIG)
    );
    const [isDebugOpen, setIsDebugOpen] = useState(false);

    const maxFloor = useMemo(() => config.floors, [config.floors]);

    // Custom hooks for business logic
    const { handleStart, handlePause, handleReset, handleConfigChange } = useSimulationControls({
        config,
        state,
        setState,
        setConfig
    });

    const { carPanelElevatorId, handleOpenCarPanel, closeCarPanel, handleCarCall } = useCarPanel({
        setState
    });

    // Event handlers
    const handleHallCall = (floor: number, direction: Exclude<Direction, 'idle'>) => {
        setState((prev) =>
            addRequest(prev, {
                type: 'hall',
                floor,
                direction
            })
        );
    };

    const handleElevatorHover = (elevatorId: string, isHovered: boolean) => {
        setState((prev) => setElevatorHover(prev, elevatorId, isHovered));
    };

    return (
        <div className="app-root">
            <SimulationHeader
                onDebugClick={() => setIsDebugOpen(true)}
                onTestsClick={() => navigate('/tests')}
                onGuidesClick={() => navigate('/guides')}
            />

            <main className="app-main">
                <section className="app-main-left">
                    <BuildingView
                        state={state}
                        maxFloor={maxFloor}
                        tickDurationMs={config.tickDurationMs}
                        onHallCall={handleHallCall}
                        onCarCall={handleCarCall}
                        openCarPanelElevatorId={carPanelElevatorId}
                        onOpenCarPanel={handleOpenCarPanel}
                        onCloseCarPanel={closeCarPanel}
                        onElevatorHover={handleElevatorHover}
                    />
                </section>

                <section className="app-main-right">
                    <ControlPanel
                        config={config}
                        running={state.running}
                        onStart={handleStart}
                        onPause={handlePause}
                        onReset={handleReset}
                        onConfigChange={handleConfigChange}
                    />
                    <MetricsPanel metrics={state.metrics} />
                    <TravelLogPanel
                        elevators={state.elevators}
                        travelLog={state.travelLog}
                        tickDurationMs={config.tickDurationMs}
                    />
                </section>
            </main>

            <DebugModal
                isOpen={isDebugOpen}
                onClose={() => setIsDebugOpen(false)}
                logs={state.systemLogs}
            />
        </div>
    );
}
