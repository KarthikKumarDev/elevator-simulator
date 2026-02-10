import { useState, useRef } from 'react';
import type { SimulationState } from '../types';
import { toggleCarRequest } from '../simulation';

interface UseCarPanelProps {
    setState: React.Dispatch<React.SetStateAction<SimulationState>>;
}

export function useCarPanel({ setState }: UseCarPanelProps) {
    const [carPanelElevatorId, setCarPanelElevatorId] = useState<string | null>(null);
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

    return {
        carPanelElevatorId,
        handleOpenCarPanel,
        closeCarPanel,
        handleCarCall
    };
}
