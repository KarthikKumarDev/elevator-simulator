import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';

// Load all markdown files from guides directory eagerly
const guideFiles = import.meta.glob('../../guides/*.md', { query: '?raw', import: 'default', eager: true });

export function GuidesPage() {
    const navigate = useNavigate();

    // Parse file list
    const fileList = useMemo(() => {
        return Object.keys(guideFiles).map((path) => {
            // Extract filename from path (e.g., "../../guides/PLAN.md" -> "PLAN.md")
            const name = path.split('/').pop() || path;
            return {
                path,
                name,
                content: guideFiles[path] as string
            };
        }).sort((a, b) => a.name.localeCompare(b.name));
    }, []);

    const [selectedPath, setSelectedPath] = useState<string>(fileList[0]?.path || '');

    const selectedContent = useMemo(() => {
        return fileList.find(f => f.path === selectedPath)?.content || '# No content found';
    }, [fileList, selectedPath]);

    return (
        <div className="app-root" style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
            <header className="app-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 1rem' }}>
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

                {/* Spacer or centered title */}
                <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                    <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Project Guides</h1>
                </div>

                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    position: 'absolute',
                    top: '1rem',
                    right: '1rem',
                    zIndex: 10
                }}>
                    <label htmlFor="file-select" style={{ color: '#aaa' }}>Select Guide:</label>
                    <select
                        id="file-select"
                        value={selectedPath}
                        onChange={(e) => setSelectedPath(e.target.value)}
                        style={{
                            padding: '0.4rem',
                            borderRadius: '6px',
                            background: 'rgba(0, 0, 0, 0.3)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            color: 'white',
                            minWidth: '200px'
                        }}
                    >
                        {fileList.map(file => (
                            <option key={file.path} value={file.path}>
                                {file.name}
                            </option>
                        ))}
                    </select>
                </div>
            </header>

            <main style={{ flex: 1, overflow: 'hidden', display: 'flex', justifyContent: 'center', padding: '0.5rem 2rem 2rem 2rem' }}>
                <div className="panel" style={{ width: '100%', maxWidth: '1000px', overflowY: 'auto', padding: '1.5rem', background: 'rgba(20, 20, 25, 0.8)', marginTop: '0.5rem' }}>
                    <div className="markdown-body" style={{ color: '#eee', lineHeight: 1.6 }}>
                        <ReactMarkdown
                            components={{
                                h1: ({ node, ...props }) => <h1 style={{ borderBottom: '1px solid #444', paddingBottom: '0.5rem', color: '#fff' }} {...props} />,
                                h2: ({ node, ...props }) => <h2 style={{ color: '#ddd', marginTop: '1.5rem' }} {...props} />,
                                h3: ({ node, ...props }) => <h3 style={{ color: '#ccc', marginTop: '1rem' }} {...props} />,
                                code: ({ node, ...props }) => <code style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 4px', borderRadius: '4px' }} {...props} />,
                                pre: ({ node, ...props }) => <pre style={{ background: '#111', padding: '1rem', borderRadius: '8px', overflowX: 'auto' }} {...props} />,
                                ul: ({ node, ...props }) => <ul style={{ paddingLeft: '1.5rem' }} {...props} />,
                                li: ({ node, ...props }) => <li style={{ marginBottom: '0.5rem' }} {...props} />,
                                a: ({ node, ...props }) => <a style={{ color: '#646cff' }} {...props} />
                            }}
                        >
                            {selectedContent}
                        </ReactMarkdown>
                    </div>
                </div>
            </main>
        </div>
    );
}
