import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export function TestsPage() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'tests' | 'coverage'>('tests');

    return (
        <div className="app-root" style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
            <style>{`
                .nav-chip {
                    padding: 6px 12px;
                    border-radius: 6px;
                    font-size: 0.85rem;
                    font-weight: 500;
                    color: #94a3b8;
                    border: 1px solid transparent;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    transition: all 0.2s;
                    background: transparent;
                }
                .nav-chip:hover {
                    background: rgba(255, 255, 255, 0.05);
                    color: #e2e8f0;
                }
                .nav-chip.active {
                    background: rgba(59, 130, 246, 0.15);
                    color: #60a5fa;
                    border-color: rgba(59, 130, 246, 0.3);
                }
            `}</style>
            <header className="app-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem 1rem', position: 'relative' }}>
                <button
                    onClick={() => navigate('/')}
                    style={{
                        position: 'absolute',
                        top: '1rem',
                        left: '1rem',
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        color: 'white',
                        padding: '0.4rem 0.8rem',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        zIndex: 10
                    }}
                >
                    ← Back
                </button>
                <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Test Suite Reports</h1>

                <div style={{
                    position: 'absolute',
                    top: '1rem',
                    right: '1rem',
                    display: 'flex',
                    gap: '0.5rem',
                    zIndex: 10
                }}>
                    <button
                        onClick={() => setActiveTab('tests')}
                        className={`nav-chip ${activeTab === 'tests' ? 'active' : ''}`}
                    >
                        📊 Test Results
                    </button>
                    <button
                        onClick={() => setActiveTab('coverage')}
                        className={`nav-chip ${activeTab === 'coverage' ? 'active' : ''}`}
                    >
                        📈 Code Coverage
                    </button>
                </div>
            </header>

            <main style={{ flex: 1, border: 'none', background: '#111' }}>
                {activeTab === 'tests' ? (
                    <iframe
                        src="/test-report/index.html"
                        title="Vitest Report"
                        style={{ width: '100%', height: '100%', border: 'none' }}
                    />
                ) : (
                    <iframe
                        src="/coverage/index.html"
                        title="Coverage Report"
                        style={{ width: '100%', height: '100%', border: 'none' }}
                    />
                )}
            </main>
        </div>
    );
}
