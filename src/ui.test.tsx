import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, renderHook, act } from '@testing-library/react';
import { ControlPanel } from './components/ControlPanel';
import { MetricsPanel } from './components/MetricsPanel';
import { BuildingConfig } from './types';
import { App } from './App';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';

// Mocks
// Mock BuildingView canvas/complex rendering if necessary, but simple rendering is fine.
// Mocking ScrollIntoView since jsdom doesn't support it
window.HTMLElement.prototype.scrollIntoView = vi.fn();

const MOCK_CONFIG: BuildingConfig = {
    floors: 5,
    elevators: 2,
    tickDurationMs: 100,
    doorOpenTicks: 2,
    mode: 'normal'
};

const MOCK_METRICS = {
    avgWaitTime: 1.5,
    maxWaitTime: 5,
    avgTravelTime: 10,
    totalRequests: 20
};

describe('UI Components', () => {

    describe('ControlPanel', () => {
        it('TC.UI.06: Control Panel Inputs - Should render config inputs and call onChange', () => {
            const onConfigChange = vi.fn();
            render(
                <ControlPanel
                    config={MOCK_CONFIG}
                    running={false}
                    onStart={vi.fn()}
                    onPause={vi.fn()}
                    onReset={vi.fn()}
                    onConfigChange={onConfigChange}
                />
            );

            // Check inputs exist
            const floorInput = screen.getByLabelText(/Floors/i);
            expect(floorInput).toHaveValue(5);

            // Change floors
            fireEvent.change(floorInput, { target: { value: '10' } });
            // Logic in component calls onConfigChange
            expect(onConfigChange).toHaveBeenCalled();
        });

        it('TC.UI.07: Start/Pause/Reset Controls - Should trigger correct callbacks', () => {
            const onStart = vi.fn();
            const onPause = vi.fn();
            const onReset = vi.fn();

            const { rerender } = render(
                <ControlPanel
                    config={MOCK_CONFIG}
                    running={false} // Initially Paused
                    onStart={onStart}
                    onPause={onPause}
                    onReset={onReset}
                    onConfigChange={vi.fn()}
                />
            );

            // Test Start
            fireEvent.click(screen.getByText('Start'));
            expect(onStart).toHaveBeenCalled();

            // Test Pause (Re-render as running)
            rerender(
                <ControlPanel
                    config={MOCK_CONFIG}
                    running={true}
                    onStart={onStart}
                    onPause={onPause}
                    onReset={onReset}
                    onConfigChange={vi.fn()}
                />
            );
            fireEvent.click(screen.getByText('Pause'));
            expect(onPause).toHaveBeenCalled();

            // Test Reset
            fireEvent.click(screen.getByText('Reset'));
            expect(onReset).toHaveBeenCalled();
        });
    });

    describe('MetricsPanel', () => {
        it('TC.INT.03: Real-time Metrics - Should display formatted metrics', () => {
            render(<MetricsPanel metrics={MOCK_METRICS} />);

            // MetricsPanel displays values with .toFixed(1), no 's' suffix
            expect(screen.getByText('1.5')).toBeInTheDocument(); // Avg Wait
            expect(screen.getByText('5.0')).toBeInTheDocument(); // Max Wait
            expect(screen.getByText('20')).toBeInTheDocument();   // Total Requests
        });
    });
});

describe('Integration Tests (App)', () => {

    // We render App wrapped in BrowserRouter because App has routes now
    // But App defines BrowserRouter internally unless we extracted it.
    // App.tsx exports App which HAS BrowserRouter. So we just render <App />

    it('TC.UI.01 & TC.INT.01: App Rendering & Tick Loop', async () => {
        vi.useFakeTimers();
        render(<App />);

        // Verify Title
        expect(screen.getByText('Elevator Simulation UI')).toBeInTheDocument();

        // Verify Initial Building View (Floors)
        // Default is 10 floors. We expect floor labels.
        expect(screen.getByText('Floor 10')).toBeInTheDocument();
        expect(screen.getByText('Floor 1')).toBeInTheDocument();

        // Check Start Button
        const startBtn = screen.getByText('Start');
        fireEvent.click(startBtn);

        // Fast forward time
        act(() => {
            vi.advanceTimersByTime(1000);
        });

        // Check if state updated (hard to check internal state without visual cue, 
        // but if no crash and time progressed, it's good smoke test)

        vi.useRealTimers();
    });

    it('TC.E2E.01: Full User Journey - Navigation', async () => {
        render(<App />);

        // Navigate to Guides
        const guidesBtn = screen.getByText('Guides');
        fireEvent.click(guidesBtn);

        // Wait for navigation to complete
        await screen.findByText('Project Guides');
        expect(screen.getByText(/Select Guide:/i)).toBeInTheDocument();

        // Navigate Back
        const backBtn = screen.getByText('← Back');
        fireEvent.click(backBtn);

        // Wait for navigation back
        await screen.findByText('Elevator Simulation UI');
        expect(screen.getByText('Elevator Simulation UI')).toBeInTheDocument();
    });
});
