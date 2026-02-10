import { useEffect, useRef } from 'react';
import type { BuildingConfig, SimulationState } from '../types';
import { createInitialState, tickSimulation } from '../simulation';

interface UseSimulationControlsProps {
    config: BuildingConfig;
    state: SimulationState;
    setState: React.Dispatch<React.SetStateAction<SimulationState>>;
    setConfig: React.Dispatch<React.SetStateAction<BuildingConfig>>;
}

export function useSimulationControls({
    config,
    state,
    setState,
    setConfig
}: UseSimulationControlsProps) {
    // Use ref to store latest config so interval callback can access it
    const configRef = useRef(config);
    configRef.current = config;

    // Track running state in ref to avoid recreating interval
    const runningRef = useRef(state.running);
    runningRef.current = state.running;

    // Simulation tick effect
    useEffect(() => {
        const id = setInterval(() => {
            if (!runningRef.current) {
                return; // Skip if not running
            }

            setState((prev) => tickSimulation(prev, configRef.current));
        }, config.tickDurationMs);

        return () => clearInterval(id);
    }, [config.tickDurationMs, setState]);

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

    return {
        handleStart,
        handlePause,
        handleReset,
        handleConfigChange
    };
}
