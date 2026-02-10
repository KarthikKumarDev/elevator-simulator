import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { DebugModal } from './DebugModal';
import type { SystemLogEntry } from '../types';

describe('DebugModal Component', () => {
    const mockLogs: SystemLogEntry[] = [
        { id: '1', tick: 1, summary: 'Test log 1', type: 'request', details: {}, timestamp: '2024-01-01T00:00:00Z' },
        { id: '2', tick: 2, summary: 'Test log 2', type: 'movement', details: {}, timestamp: '2024-01-01T00:00:01Z' },
        { id: '3', tick: 3, summary: 'Test log 3', type: 'door', details: {}, timestamp: '2024-01-01T00:00:02Z' }
    ];

    // TC.UI.08: DebugModal Rendering
    it('TC.UI.08: should render modal when isOpen is true', () => {
        render(
            <DebugModal
                isOpen={true}
                onClose={vi.fn()}
                logs={mockLogs}
            />
        );

        expect(screen.getByText('System Debug Logs')).toBeInTheDocument();
        expect(screen.getByText('3 entries captured')).toBeInTheDocument();
    });

    it('should not render modal when isOpen is false', () => {
        const { container } = render(
            <DebugModal
                isOpen={false}
                onClose={vi.fn()}
                logs={mockLogs}
            />
        );

        expect(container.firstChild).toBeNull();
    });

    // TC.UI.09: DebugModal Close
    it('TC.UI.09: should call onClose when close button is clicked', () => {
        const onClose = vi.fn();
        render(
            <DebugModal
                isOpen={true}
                onClose={onClose}
                logs={mockLogs}
            />
        );

        const closeButton = screen.getByText('×');
        fireEvent.click(closeButton);

        expect(onClose).toHaveBeenCalledTimes(1);
    });

    // TC.UI.10: DebugModal Copy
    it('TC.UI.10: should copy logs to clipboard when copy button is clicked', async () => {
        const mockWriteText = vi.fn().mockResolvedValue(undefined);
        Object.assign(navigator, {
            clipboard: {
                writeText: mockWriteText
            }
        });

        render(
            <DebugModal
                isOpen={true}
                onClose={vi.fn()}
                logs={mockLogs}
            />
        );

        const copyButton = screen.getByText('Copy JSON');
        fireEvent.click(copyButton);

        await waitFor(() => {
            expect(mockWriteText).toHaveBeenCalledWith(JSON.stringify(mockLogs, null, 2));
        });
    });

    // TC.UI.11: DebugModal Copy Feedback
    it('TC.UI.11: should show "Copied!" feedback and revert after 2 seconds', async () => {
        vi.useFakeTimers();
        const mockWriteText = vi.fn().mockResolvedValue(undefined);
        Object.assign(navigator, {
            clipboard: {
                writeText: mockWriteText
            }
        });

        render(
            <DebugModal
                isOpen={true}
                onClose={vi.fn()}
                logs={mockLogs}
            />
        );

        const copyButton = screen.getByText('Copy JSON');
        fireEvent.click(copyButton);

        // Wait for the async clipboard operation and state update
        await waitFor(() => {
            expect(screen.getByText('Copied!')).toBeInTheDocument();
        }, { timeout: 100 });

        // Advance timers by 2 seconds
        act(() => {
            vi.advanceTimersByTime(2000);
        });

        // Wait for state to revert
        await waitFor(() => {
            expect(screen.getByText('Copy JSON')).toBeInTheDocument();
        }, { timeout: 100 });

        vi.useRealTimers();
    });

    // TC.UI.12: DebugModal Logs Display
    it('TC.UI.12: should display logs as formatted JSON', () => {
        render(
            <DebugModal
                isOpen={true}
                onClose={vi.fn()}
                logs={mockLogs}
            />
        );

        const preElement = screen.getByText((content, element) => {
            return element?.tagName === 'PRE' && content.includes('Test log 1');
        });

        expect(preElement).toBeInTheDocument();
        expect(preElement.textContent).toContain('"tick": 1');
        expect(preElement.textContent).toContain('"message": "Test log 1"');
    });

    // TC.UI.13: DebugModal Entry Count
    it('TC.UI.13: should display correct entry count in footer', () => {
        render(
            <DebugModal
                isOpen={true}
                onClose={vi.fn()}
                logs={mockLogs}
            />
        );

        expect(screen.getByText('3 entries captured')).toBeInTheDocument();
    });

    it('should display correct count for empty logs', () => {
        render(
            <DebugModal
                isOpen={true}
                onClose={vi.fn()}
                logs={[]}
            />
        );

        expect(screen.getByText('0 entries captured')).toBeInTheDocument();
    });

    it('should display correct count for single log', () => {
        render(
            <DebugModal
                isOpen={true}
                onClose={vi.fn()}
                logs={[mockLogs[0]]}
            />
        );

        expect(screen.getByText('1 entries captured')).toBeInTheDocument();
    });
});
