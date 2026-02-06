import { useEffect, useMemo, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createInitialState, addRequest, tickSimulation, setElevatorHover, toggleCarRequest } from '../simulation';
import type { BuildingConfig, Direction, SimulationState } from '../types';
import { BuildingView } from '../components/BuildingView';
import { ControlPanel } from '../components/ControlPanel';
import { MetricsPanel } from '../components/MetricsPanel';
import { TravelLogPanel } from '../components/TravelLogPanel';
import { DebugModal } from '../components/DebugModal';

// Default Config reused here
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
    const [carPanelElevatorId, setCarPanelElevatorId] = useState<string | null>(null);
    const [isDebugOpen, setIsDebugOpen] = useState(false);

    const maxFloor = useMemo(() => config.floors, [config.floors]);

    useEffect(() => {
        if (!state.running) return;
        const id = setInterval(() => {
            setState((prev) => tickSimulation(prev, config));
        }, config.tickDurationMs);
        return () => clearInterval(id);
    }, [state.running, config.tickDurationMs]);

    const handleStart = () => {
        setState((prev) => ({ ...prev, running: true }));
    };

    const handlePause = () => {
        setState((prev) => ({ ...prev, running: false }));
    };

    const handleReset = () => {
        setState(createInitialState(config));
    };

    const handleConfigChange = (next: BuildingConfig) => {
        setConfig(next);
        setState(createInitialState(next));
    };

    const handleHallCall = (floor: number, direction: Exclude<Direction, 'idle'>) => {
        setState((prev) =>
            addRequest(prev, {
                type: 'hall',
                floor,
                direction
            })
        );
    };

    const panelTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleOpenCarPanel = (elevatorId: string) => {
        if (panelTimeoutRef.current) clearTimeout(panelTimeoutRef.current);
        setCarPanelElevatorId(elevatorId);
    };

    const closeCarPanel = () => {
        setCarPanelElevatorId(null);
        if (panelTimeoutRef.current) {
            clearTimeout(panelTimeoutRef.current);
            panelTimeoutRef.current = null;
        }
    };

    const handleCarCall = (elevatorId: string, floor: number) => {
        setState((prev) => toggleCarRequest(prev, elevatorId, floor));
        if (panelTimeoutRef.current) clearTimeout(panelTimeoutRef.current);
        panelTimeoutRef.current = setTimeout(() => {
            setCarPanelElevatorId(null);
            panelTimeoutRef.current = null;
        }, 2000);
    };

    const handleElevatorHover = (elevatorId: string, isHovered: boolean) => {
        setState((prev) => setElevatorHover(prev, elevatorId, isHovered));
    };

    return (
        <div className="app-root">
            <header className="app-header" style={{ position: 'relative' }}>
                <div style={{ flex: 1 }}>
                    <h1>Elevator Simulation UI</h1>
                    <p>Visualize and experiment with elevator control strategies.</p>
                </div>
                <div style={{
                    position: 'absolute',
                    top: '1rem',
                    right: '1rem',
                    display: 'flex',
                    gap: '0.5rem',
                    zIndex: 10
                }}>
                    <button
                        className="debug-btn"
                        onClick={() => setIsDebugOpen(true)}
                        style={{
                            padding: '0.5rem 1rem',
                            background: 'rgba(234, 179, 8, 0.1)', // Yellow tint
                            border: '1px solid rgba(234, 179, 8, 0.3)',
                            color: '#EAB308',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            backdropFilter: 'blur(5px)',
                            marginRight: '0.5rem'
                        }}
                    >
                        Debug
                    </button>
                    <button
                        className="tests-btn"
                        onClick={() => navigate('/tests')}
                        style={{
                            padding: '0.5rem 1rem',
                            background: 'rgba(255, 255, 255, 0.1)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            color: 'white',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            backdropFilter: 'blur(5px)'
                        }}
                    >
                        Tests
                    </button>
                    <button
                        className="guides-btn"
                        onClick={() => navigate('/guides')}
                        style={{
                            padding: '0.5rem 1rem',
                            background: 'rgba(255, 255, 255, 0.1)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            color: 'white',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            backdropFilter: 'blur(5px)'
                        }}
                    >
                        Guides
                    </button>
                </div>
            </header>
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
