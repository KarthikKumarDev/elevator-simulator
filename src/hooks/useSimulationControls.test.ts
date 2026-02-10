import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSimulationControls } from './useSimulationControls';
import { createInitialState } from '../simulation';
import type { BuildingConfig, SimulationState } from '../types';

const DEFAULT_CONFIG: BuildingConfig = {
    floors: 10,
    elevators: 3,
    tickDurationMs: 500,
    doorOpenTicks: 5,
    mode: 'normal'
};

describe('useSimulationControls Hook', () => {
    let setState: ReturnType<typeof vi.fn>;
    let setConfig: ReturnType<typeof vi.fn>;
    let state: SimulationState;
    let config: BuildingConfig;

    beforeEach(() => {
        state = createInitialState(DEFAULT_CONFIG);
        config = { ...DEFAULT_CONFIG };
        setState = vi.fn();
        setConfig = vi.fn();
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    // TC.HOOK.07: useSimulationControls Start
    it('TC.HOOK.07: should set running=true when handleStart is called', () => {
        const { result } = renderHook(() =>
            useSimulationControls({ config, state, setState, setConfig })
        );

        act(() => {
            result.current.handleStart();
        });

        expect(setState).toHaveBeenCalledWith(expect.any(Function));

        // Verify the updater function sets running to true
        const updater = setState.mock.calls[0][0];
        const newState = updater({ ...state, running: false });
        expect(newState.running).toBe(true);
    });

    // TC.HOOK.08: useSimulationControls Pause
    it('TC.HOOK.08: should set running=false when handlePause is called', () => {
        const { result } = renderHook(() =>
            useSimulationControls({ config, state, setState, setConfig })
        );

        act(() => {
            result.current.handlePause();
        });

        expect(setState).toHaveBeenCalledWith(expect.any(Function));

        // Verify the updater function sets running to false
        const updater = setState.mock.calls[0][0];
        const newState = updater({ ...state, running: true });
        expect(newState.running).toBe(false);
    });

    // TC.HOOK.09: useSimulationControls Reset
    it('TC.HOOK.09: should create initial state when handleReset is called', () => {
        const { result } = renderHook(() =>
            useSimulationControls({ config, state, setState, setConfig })
        );

        act(() => {
            result.current.handleReset();
        });

        expect(setState).toHaveBeenCalled();

        // Verify setState was called with a new initial state
        const newState = setState.mock.calls[0][0];
        expect(newState).toHaveProperty('elevators');
        expect(newState).toHaveProperty('pendingRequests');
        expect(newState).toHaveProperty('activeRequests');
        expect(newState.tick).toBe(0);
    });

    // TC.HOOK.10: useSimulationControls Config Change
    it('TC.HOOK.10: should update config and reset state when handleConfigChange is called', () => {
        const { result } = renderHook(() =>
            useSimulationControls({ config, state, setState, setConfig })
        );

        const newConfig: BuildingConfig = {
            ...DEFAULT_CONFIG,
            floors: 15,
            elevators: 5
        };

        act(() => {
            result.current.handleConfigChange(newConfig);
        });

        expect(setConfig).toHaveBeenCalledWith(newConfig);
        expect(setState).toHaveBeenCalled();

        // Verify setState was called with a new initial state
        const newState = setState.mock.calls[0][0];
        expect(newState.tick).toBe(0);
    });

    // TC.HOOK.11: useSimulationControls Tick Loop
    it('TC.HOOK.11: should call tickSimulation at regular intervals when running', () => {
        const runningState = { ...state, running: true };

        renderHook(() =>
            useSimulationControls({ config, state: runningState, setState, setConfig })
        );

        // Clear initial calls
        setState.mockClear();

        // Advance time by tick duration
        act(() => {
            vi.advanceTimersByTime(500);
        });

        // setState should have been called by the interval
        expect(setState).toHaveBeenCalled();
    });

    it('should not call tickSimulation when not running', () => {
        const stoppedState = { ...state, running: false };

        renderHook(() =>
            useSimulationControls({ config, state: stoppedState, setState, setConfig })
        );

        // Clear initial calls
        setState.mockClear();

        // Advance time by tick duration
        act(() => {
            vi.advanceTimersByTime(500);
        });

        // setState should not have been called
        expect(setState).not.toHaveBeenCalled();
    });

    // TC.HOOK.12: useSimulationControls Interval Cleanup
    it('TC.HOOK.12: should clear interval on unmount', () => {
        const { unmount } = renderHook(() =>
            useSimulationControls({ config, state, setState, setConfig })
        );

        const timerCount = vi.getTimerCount();

        unmount();

        // Timer should be cleared
        expect(vi.getTimerCount()).toBeLessThan(timerCount);
    });

    it('should recreate interval when tickDurationMs changes', () => {
        const { rerender } = renderHook(
            ({ config }) => useSimulationControls({ config, state, setState, setConfig }),
            { initialProps: { config: DEFAULT_CONFIG } }
        );

        setState.mockClear();

        // Change tick duration
        const newConfig = { ...DEFAULT_CONFIG, tickDurationMs: 1000 };
        rerender({ config: newConfig });

        // Advance by old duration - should not trigger
        act(() => {
            vi.advanceTimersByTime(500);
        });

        expect(setState).not.toHaveBeenCalled();

        // Advance by new duration - should trigger
        act(() => {
            vi.advanceTimersByTime(500); // Total 1000ms
        });

        // Now it should have been called
        expect(setState).toHaveBeenCalled();
    });

    it('should use refs to avoid stale closures', () => {
        let currentState = { ...state, running: true };
        const dynamicSetState = vi.fn((updater) => {
            if (typeof updater === 'function') {
                currentState = updater(currentState);
            }
        });

        renderHook(() =>
            useSimulationControls({
                config,
                state: currentState,
                setState: dynamicSetState,
                setConfig
            })
        );

        // Advance time
        act(() => {
            vi.advanceTimersByTime(500);
        });

        // Should have called setState
        expect(dynamicSetState).toHaveBeenCalled();
    });
});
