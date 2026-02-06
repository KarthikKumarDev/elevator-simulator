import { useState } from 'react';
import { SystemLogEntry } from '../types';

interface DebugModalProps {
    isOpen: boolean;
    onClose: () => void;
    logs: SystemLogEntry[];
}

export function DebugModal({ isOpen, onClose, logs }: DebugModalProps) {
    const [isCopied, setIsCopied] = useState(false);

    if (!isOpen) return null;

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(JSON.stringify(logs, null, 2));
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy logs:', err);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            zIndex: 1000,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backdropFilter: 'blur(5px)'
        }}>
            <div style={{
                backgroundColor: '#1E293B',
                borderRadius: '12px',
                width: '80%',
                maxWidth: '800px',
                height: '80%',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                border: '1px solid #334155'
            }}>
                <div style={{
                    padding: '1.5rem',
                    borderBottom: '1px solid #334155',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <h2 style={{ margin: 0, color: '#F8FAFC', fontSize: '1.25rem' }}>System Debug Logs</h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <button
                            onClick={handleCopy}
                            style={{
                                padding: '0.5rem 1rem',
                                backgroundColor: isCopied ? 'rgba(34, 197, 94, 0.2)' : 'rgba(148, 163, 184, 0.1)',
                                color: isCopied ? '#4ADE80' : '#94A3B8',
                                border: `1px solid ${isCopied ? '#4ADE80' : '#475569'}`,
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '0.85rem',
                                transition: 'all 0.2s',
                                fontWeight: 500
                            }}
                        >
                            {isCopied ? 'Copied!' : 'Copy JSON'}
                        </button>
                        <button
                            onClick={onClose}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: '#94A3B8',
                                cursor: 'pointer',
                                fontSize: '1.5rem',
                                padding: '0.5rem',
                                lineHeight: '1rem',
                                display: 'flex',
                                alignItems: 'center'
                            }}
                        >
                            ×
                        </button>
                    </div>
                </div>

                <div style={{
                    flex: 1,
                    overflow: 'auto',
                    padding: '1.5rem',
                    backgroundColor: '#0F172A',
                    color: '#22C55E', // Matrix/Terminal Green
                    fontFamily: 'monospace',
                    fontSize: '0.9rem'
                }}>
                    <pre>{JSON.stringify(logs, null, 2)}</pre>
                </div>

                <div style={{
                    padding: '1rem',
                    borderTop: '1px solid #334155',
                    textAlign: 'right',
                    color: '#64748B',
                    fontSize: '0.8rem'
                }}>
                    {logs.length} entries captured
                </div>
            </div>
        </div>
    );
}
