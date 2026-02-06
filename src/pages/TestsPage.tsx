import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export function TestsPage() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'tests' | 'coverage'>('tests');

    return (
        <div className="app-root" style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
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
            </header>

            {/* Tabs */}
            <div style={{
                display: 'flex',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                background: 'rgba(0, 0, 0, 0.3)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
                <button
                    onClick={() => setActiveTab('tests')}
                    style={{
                        padding: '0.5rem 1rem',
                        background: activeTab === 'tests' ? 'rgba(59, 130, 246, 0.5)' : 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '6px',
                        color: 'white',
                        cursor: 'pointer',
                        fontWeight: activeTab === 'tests' ? 'bold' : 'normal'
                    }}
                >
                    📊 Test Results
                </button>
                <button
                    onClick={() => setActiveTab('coverage')}
                    style={{
                        padding: '0.5rem 1rem',
                        background: activeTab === 'coverage' ? 'rgba(59, 130, 246, 0.5)' : 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '6px',
                        color: 'white',
                        cursor: 'pointer',
                        fontWeight: activeTab === 'coverage' ? 'bold' : 'normal'
                    }}
                >
                    📈 Code Coverage
                </button>
            </div>

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
