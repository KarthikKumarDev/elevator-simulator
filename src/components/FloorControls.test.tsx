import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FloorControls } from './FloorControls';
import { createInitialState } from '../simulation';

const DEFAULT_CONFIG = {
    floors: 10,
    elevators: 3,
    tickDurationMs: 500,
    doorOpenTicks: 5,
    mode: 'normal' as const
};

describe('FloorControls Component', () => {
    // TC.UI.24: FloorControls Rendering
    it('TC.UI.24: should render floor label and buttons', () => {
        const state = createInitialState(DEFAULT_CONFIG);
        const onHallCall = vi.fn();

        render(
            <FloorControls
                floor={5}
                maxFloor={10}
                state={state}
                onHallCall={onHallCall}
            />
        );

        expect(screen.getByText('Floor 5')).toBeInTheDocument();
        expect(screen.getByText('↑')).toBeInTheDocument();
        expect(screen.getByText('↓')).toBeInTheDocument();
    });

    // TC.UI.25: FloorControls UP Button
    it('TC.UI.25: should call onHallCall with "up" when UP button clicked', () => {
        const state = createInitialState(DEFAULT_CONFIG);
        const onHallCall = vi.fn();

        render(
            <FloorControls
                floor={5}
                maxFloor={10}
                state={state}
                onHallCall={onHallCall}
            />
        );

        const upButton = screen.getByText('↑');
        fireEvent.click(upButton);

        expect(onHallCall).toHaveBeenCalledWith(5, 'up');
    });

    // TC.UI.26: FloorControls DOWN Button
    it('TC.UI.26: should call onHallCall with "down" when DOWN button clicked', () => {
        const state = createInitialState(DEFAULT_CONFIG);
        const onHallCall = vi.fn();

        render(
            <FloorControls
                floor={5}
                maxFloor={10}
                state={state}
                onHallCall={onHallCall}
            />
        );

        const downButton = screen.getByText('↓');
        fireEvent.click(downButton);

        expect(onHallCall).toHaveBeenCalledWith(5, 'down');
    });

    // TC.UI.27: FloorControls Active State
    it('TC.UI.27: should apply active class when UP request is pending', () => {
        const state = createInitialState(DEFAULT_CONFIG);
        state.pendingRequests.push({
            type: 'hall',
            floor: 5,
            direction: 'up',
            createdAtTick: 1
        });
        const onHallCall = vi.fn();

        render(
            <FloorControls
                floor={5}
                maxFloor={10}
                state={state}
                onHallCall={onHallCall}
            />
        );

        const upButton = screen.getByText('↑');
        expect(upButton).toHaveClass('active');
    });

    it('should apply active class when DOWN request is pending', () => {
        const state = createInitialState(DEFAULT_CONFIG);
        state.pendingRequests.push({
            type: 'hall',
            floor: 5,
            direction: 'down',
            createdAtTick: 1
        });
        const onHallCall = vi.fn();

        render(
            <FloorControls
                floor={5}
                maxFloor={10}
                state={state}
                onHallCall={onHallCall}
            />
        );

        const downButton = screen.getByText('↓');
        expect(downButton).toHaveClass('active');
    });

    it('should apply active class when request is in activeRequests', () => {
        const state = createInitialState(DEFAULT_CONFIG);
        state.activeRequests.push({
            type: 'hall',
            floor: 5,
            direction: 'up',
            createdAtTick: 1,
            assignedElevatorId: 'E1'
        });
        const onHallCall = vi.fn();

        render(
            <FloorControls
                floor={5}
                maxFloor={10}
                state={state}
                onHallCall={onHallCall}
            />
        );

        const upButton = screen.getByText('↑');
        expect(upButton).toHaveClass('active');
    });

    // TC.UI.28: FloorControls Disabled Top
    it('TC.UI.28: should disable UP button on top floor', () => {
        const state = createInitialState(DEFAULT_CONFIG);
        const onHallCall = vi.fn();

        render(
            <FloorControls
                floor={10}
                maxFloor={10}
                state={state}
                onHallCall={onHallCall}
            />
        );

        const upButton = screen.getByText('↑');
        expect(upButton).toBeDisabled();
    });

    // TC.UI.29: FloorControls Disabled Bottom
    it('TC.UI.29: should disable DOWN button on floor 1', () => {
        const state = createInitialState(DEFAULT_CONFIG);
        const onHallCall = vi.fn();

        render(
            <FloorControls
                floor={1}
                maxFloor={10}
                state={state}
                onHallCall={onHallCall}
            />
        );

        const downButton = screen.getByText('↓');
        expect(downButton).toBeDisabled();
    });

    it('should enable both buttons on middle floors', () => {
        const state = createInitialState(DEFAULT_CONFIG);
        const onHallCall = vi.fn();

        render(
            <FloorControls
                floor={5}
                maxFloor={10}
                state={state}
                onHallCall={onHallCall}
            />
        );

        const upButton = screen.getByText('↑');
        const downButton = screen.getByText('↓');

        expect(upButton).not.toBeDisabled();
        expect(downButton).not.toBeDisabled();
    });
});
