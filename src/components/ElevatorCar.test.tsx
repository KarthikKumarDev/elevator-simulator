import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ElevatorCar } from './ElevatorCar';
import type { ElevatorState } from '../types';

describe('ElevatorCar Component', () => {
    const mockElevator: ElevatorState = {
        id: 'E1',
        currentFloor: 5,
        targetFloors: [8, 10],
        direction: 'up',
        lastDirection: 'up',
        doorState: 'closed',
        doorTicksRemaining: 0,
        isHovered: false,
        movingTicks: 0,
        powerConsumed: 10.5
    };

    const defaultProps = {
        elevator: mockElevator,
        maxFloor: 10,
        tickDurationMs: 500,
        isPopoverOpen: false,
        interiorColor: 'hsl(180, 40%, 20%)',
        onOpenCarPanel: vi.fn(),
        onCarCall: vi.fn(),
        onElevatorHover: vi.fn()
    };

    // TC.UI.14: ElevatorCar Rendering
    it('TC.UI.14: should render car with correct ID and direction symbol', () => {
        render(<ElevatorCar {...defaultProps} />);

        expect(screen.getByText('E1')).toBeInTheDocument();
        expect(screen.getByText('↑')).toBeInTheDocument();
    });

    it('should show down arrow for down direction', () => {
        const downElevator = { ...mockElevator, direction: 'down' as const, lastDirection: 'down' as const };
        render(<ElevatorCar {...defaultProps} elevator={downElevator} />);

        expect(screen.getByText('↓')).toBeInTheDocument();
    });

    it('should show dot for idle direction', () => {
        const idleElevator = { ...mockElevator, direction: 'idle' as const, lastDirection: 'idle' as const };
        render(<ElevatorCar {...defaultProps} elevator={idleElevator} />);

        expect(screen.getByText('•')).toBeInTheDocument();
    });

    // TC.UI.15: ElevatorCar Position
    it('TC.UI.15: should calculate correct translateY based on currentFloor', () => {
        const { container } = render(<ElevatorCar {...defaultProps} />);

        const carElement = container.querySelector('.elevator-car');
        const expectedTransform = `translateY(${(10 - 5) * 100}%)`;

        expect(carElement).toHaveStyle({ transform: expectedTransform });
    });

    it('should calculate correct height based on maxFloor', () => {
        const { container } = render(<ElevatorCar {...defaultProps} />);

        const carElement = container.querySelector('.elevator-car');
        const expectedHeight = `${100 / 10}%`;

        expect(carElement).toHaveStyle({ height: expectedHeight });
    });

    // TC.UI.16: ElevatorCar Doors
    it('TC.UI.16: should apply correct door classes based on doorState', () => {
        const { container, rerender } = render(<ElevatorCar {...defaultProps} />);

        let leftDoor = container.querySelector('.door-left');
        expect(leftDoor).toHaveClass('closed');

        const openElevator = { ...mockElevator, doorState: 'open' as const };
        rerender(<ElevatorCar {...defaultProps} elevator={openElevator} />);

        leftDoor = container.querySelector('.door-left');
        expect(leftDoor).toHaveClass('open');
    });

    // TC.UI.17: ElevatorCar Interior
    it('TC.UI.17: should apply interior color', () => {
        const { container } = render(<ElevatorCar {...defaultProps} />);

        const interior = container.querySelector('.elevator-interior');
        expect(interior).toHaveStyle({ background: 'hsl(180, 40%, 20%)' });
    });

    // TC.UI.18: ElevatorCar Select Button
    it('TC.UI.18: should show Select button when doors are open', () => {
        const openElevator = { ...mockElevator, doorState: 'open' as const };
        render(<ElevatorCar {...defaultProps} elevator={openElevator} />);

        expect(screen.getByText('Select')).toBeInTheDocument();
    });

    it('should show Select button when doors are opening', () => {
        const openingElevator = { ...mockElevator, doorState: 'opening' as const };
        render(<ElevatorCar {...defaultProps} elevator={openingElevator} />);

        expect(screen.getByText('Select')).toBeInTheDocument();
    });

    it('should not show Select button when doors are closed', () => {
        render(<ElevatorCar {...defaultProps} />);

        expect(screen.queryByText('Select')).not.toBeInTheDocument();
    });

    it('should not show Select button when popover is open', () => {
        const openElevator = { ...mockElevator, doorState: 'open' as const };
        render(<ElevatorCar {...defaultProps} elevator={openElevator} isPopoverOpen={true} />);

        expect(screen.queryByText('Select')).not.toBeInTheDocument();
    });

    // TC.UI.19: ElevatorCar Popover
    it('TC.UI.19: should call onOpenCarPanel when Select button is clicked', () => {
        const onOpenCarPanel = vi.fn();
        const openElevator = { ...mockElevator, doorState: 'open' as const };
        render(<ElevatorCar {...defaultProps} elevator={openElevator} onOpenCarPanel={onOpenCarPanel} />);

        const selectButton = screen.getByText('Select');
        fireEvent.click(selectButton);

        expect(onOpenCarPanel).toHaveBeenCalledWith('E1');
    });

    it('should render car panel popover when isPopoverOpen is true', () => {
        const openElevator = { ...mockElevator, doorState: 'open' as const };
        render(<ElevatorCar {...defaultProps} elevator={openElevator} isPopoverOpen={true} />);

        // Should show floor buttons 1-10
        for (let i = 1; i <= 10; i++) {
            expect(screen.getByText(i.toString())).toBeInTheDocument();
        }
    });

    // TC.UI.20: ElevatorCar Floor Selection
    it('TC.UI.20: should call onCarCall when floor button is clicked in popover', () => {
        const onCarCall = vi.fn();
        const openElevator = { ...mockElevator, doorState: 'open' as const };
        render(<ElevatorCar {...defaultProps} elevator={openElevator} isPopoverOpen={true} onCarCall={onCarCall} />);

        const floor7Button = screen.getByText('7');
        fireEvent.click(floor7Button);

        expect(onCarCall).toHaveBeenCalledWith('E1', 7);
    });

    // TC.UI.21: ElevatorCar Active Floors
    it('TC.UI.21: should highlight active floors in popover', () => {
        const openElevator = { ...mockElevator, doorState: 'open' as const, targetFloors: [8, 10] };
        render(<ElevatorCar {...defaultProps} elevator={openElevator} isPopoverOpen={true} />);

        const floor8Button = screen.getByText('8');
        const floor10Button = screen.getByText('10');
        const floor7Button = screen.getByText('7');

        expect(floor8Button).toHaveClass('active');
        expect(floor10Button).toHaveClass('active');
        expect(floor7Button).not.toHaveClass('active');
    });

    // TC.UI.22: ElevatorCar Disabled Current
    it('TC.UI.22: should disable current floor button in popover', () => {
        const openElevator = { ...mockElevator, doorState: 'open' as const, currentFloor: 5 };
        render(<ElevatorCar {...defaultProps} elevator={openElevator} isPopoverOpen={true} />);

        const floor5Button = screen.getByText('5');
        expect(floor5Button).toBeDisabled();
    });

    // TC.UI.23: ElevatorCar Hover
    it('TC.UI.23: should call onElevatorHover on mouse enter', () => {
        const onElevatorHover = vi.fn();
        const { container } = render(<ElevatorCar {...defaultProps} onElevatorHover={onElevatorHover} />);

        const carElement = container.querySelector('.elevator-car');
        fireEvent.mouseEnter(carElement!);

        expect(onElevatorHover).toHaveBeenCalledWith('E1', true);
    });

    it('should call onElevatorHover on mouse leave', () => {
        const onElevatorHover = vi.fn();
        const { container } = render(<ElevatorCar {...defaultProps} onElevatorHover={onElevatorHover} />);

        const carElement = container.querySelector('.elevator-car');
        fireEvent.mouseLeave(carElement!);

        expect(onElevatorHover).toHaveBeenCalledWith('E1', false);
    });

    it('should use lastDirection when direction is idle', () => {
        const idleElevator = { ...mockElevator, direction: 'idle' as const, lastDirection: 'down' as const };
        render(<ElevatorCar {...defaultProps} elevator={idleElevator} />);

        expect(screen.getByText('↓')).toBeInTheDocument();
    });
});
