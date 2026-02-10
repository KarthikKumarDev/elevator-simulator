import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useCarPanel } from './useCarPanel';
import type { SimulationState } from '../types';
import { createInitialState } from '../simulation';

const DEFAULT_CONFIG = {
    floors: 10,
    elevators: 3,
    tickDurationMs: 500,
    doorOpenTicks: 5,
    mode: 'normal' as const
};

describe('useCarPanel Hook', () => {
    let setState: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        setState = vi.fn((updater) => {
            if (typeof updater === 'function') {
                const currentState = createInitialState(DEFAULT_CONFIG);
                updater(currentState);
            }
        });
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    // TC.HOOK.01: useCarPanel Open
    it('TC.HOOK.01: should set elevatorId when handleOpenCarPanel is called', () => {
        const { result } = renderHook(() => useCarPanel({ setState }));

        expect(result.current.carPanelElevatorId).toBeNull();

        act(() => {
            result.current.handleOpenCarPanel('E1');
        });

        expect(result.current.carPanelElevatorId).toBe('E1');
    });

    // TC.HOOK.02: useCarPanel Close
    it('TC.HOOK.02: should clear elevatorId when closeCarPanel is called', () => {
        const { result } = renderHook(() => useCarPanel({ setState }));

        act(() => {
            result.current.handleOpenCarPanel('E1');
        });

        expect(result.current.carPanelElevatorId).toBe('E1');

        act(() => {
            result.current.closeCarPanel();
        });

        expect(result.current.carPanelElevatorId).toBeNull();
    });

    // TC.HOOK.03: useCarPanel Timeout Clear
    it('TC.HOOK.03: should clear existing timeout when opening new panel', () => {
        const { result } = renderHook(() => useCarPanel({ setState }));

        act(() => {
            result.current.handleOpenCarPanel('E1');
        });

        act(() => {
            result.current.handleOpenCarPanel('E2');
        });

        expect(result.current.carPanelElevatorId).toBe('E2');
    });

    // TC.HOOK.04: useCarPanel Car Call
    it('TC.HOOK.04: should call setState when handleCarCall is invoked', () => {
        const { result } = renderHook(() => useCarPanel({ setState }));

        act(() => {
            result.current.handleCarCall('E1', 5);
        });

        expect(setState).toHaveBeenCalled();
    });

    // TC.HOOK.05: useCarPanel Auto-Close
    it('TC.HOOK.05: should auto-close panel after 2 seconds when car call is made', async () => {
        const { result } = renderHook(() => useCarPanel({ setState }));

        act(() => {
            result.current.handleOpenCarPanel('E1');
        });

        expect(result.current.carPanelElevatorId).toBe('E1');

        act(() => {
            result.current.handleCarCall('E1', 5);
        });

        // Panel should still be open immediately after call
        expect(result.current.carPanelElevatorId).toBe('E1');

        // Advance timers by 2 seconds
        act(() => {
            vi.advanceTimersByTime(2000);
        });

        // Panel should now be closed
        await waitFor(() => {
            expect(result.current.carPanelElevatorId).toBeNull();
        });
    });

    // TC.HOOK.06: useCarPanel Timeout Cleanup
    it('TC.HOOK.06: should clear timeout when closeCarPanel is called', () => {
        const { result } = renderHook(() => useCarPanel({ setState }));

        act(() => {
            result.current.handleOpenCarPanel('E1');
        });

        act(() => {
            result.current.handleCarCall('E1', 5);
        });

        // Close panel before timeout
        act(() => {
            result.current.closeCarPanel();
        });

        expect(result.current.carPanelElevatorId).toBeNull();

        // Advance timers - panel should stay closed
        act(() => {
            vi.advanceTimersByTime(2000);
        });

        expect(result.current.carPanelElevatorId).toBeNull();
    });

    it('should clear timeout on multiple car calls', () => {
        const { result } = renderHook(() => useCarPanel({ setState }));

        act(() => {
            result.current.handleOpenCarPanel('E1');
        });

        act(() => {
            result.current.handleCarCall('E1', 5);
        });

        // Make another call before timeout
        act(() => {
            vi.advanceTimersByTime(1000);
            result.current.handleCarCall('E1', 7);
        });

        // Should still be open
        expect(result.current.carPanelElevatorId).toBe('E1');

        // Advance by another 1 second (total 2 seconds from first call, 1 from second)
        act(() => {
            vi.advanceTimersByTime(1000);
        });

        // Should still be open (only 1 second since last call)
        expect(result.current.carPanelElevatorId).toBe('E1');

        // Advance by another 1 second (2 seconds since last call)
        act(() => {
            vi.advanceTimersByTime(1000);
        });

        // Should now be closed
        expect(result.current.carPanelElevatorId).toBeNull();
    });
});
