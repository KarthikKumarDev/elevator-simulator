interface SimulationHeaderProps {
    onDebugClick: () => void;
    onTestsClick: () => void;
    onGuidesClick: () => void;
}

export function SimulationHeader({ onDebugClick, onTestsClick, onGuidesClick }: SimulationHeaderProps) {
    return (
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
                    onClick={onDebugClick}
                    style={{
                        padding: '0.5rem 1rem',
                        background: 'rgba(234, 179, 8, 0.1)',
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
                    onClick={onTestsClick}
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
                    onClick={onGuidesClick}
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
    );
}
