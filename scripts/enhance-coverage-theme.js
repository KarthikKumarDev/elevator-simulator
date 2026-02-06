#!/usr/bin/env node

/**
 * This script enhances the coverage report HTML files with better styling
 * for dark mode compatibility and improved readability.
 */

const fs = require('fs');
const path = require('path');

const coverageDir = path.join(__dirname, '../coverage');

// Custom CSS to inject for better visibility
const customCSS = `
<style>
/* Enhanced Coverage Report Styling for Better Visibility */
body {
    background: #ffffff !important;
    color: #1a1a1a !important;
}

.wrapper {
    background: #ffffff !important;
}

h1, h2, h3, h4, h5, h6 {
    color: #1a1a1a !important;
}

.quiet {
    color: #666666 !important;
}

.strong {
    color: #000000 !important;
    font-weight: bold;
}

a {
    color: #0066cc !important;
}

a:hover {
    color: #0052a3 !important;
}

.coverage-summary {
    background: #ffffff !important;
}

.coverage-summary th {
    background: #f0f0f0 !important;
    color: #1a1a1a !important;
    font-weight: bold;
}

.coverage-summary td {
    color: #1a1a1a !important;
}

.file {
    color: #1a1a1a !important;
}

.pct {
    color: #1a1a1a !important;
}

.abs {
    color: #666666 !important;
}

.status-line {
    background: #e0e0e0 !important;
}

.footer {
    background: #f5f5f5 !important;
    color: #666666 !important;
    border-top: 1px solid #ddd !important;
}

/* Code highlighting improvements */
.prettyprint {
    background: #f8f8f8 !important;
    border: 1px solid #ddd !important;
}

.pln {
    color: #1a1a1a !important;
}

.str {
    color: #0066cc !important;
}

.kwd {
    color: #7c3aed !important;
}

.com {
    color: #6b7280 !important;
}

.typ {
    color: #059669 !important;
}

.lit {
    color: #dc2626 !important;
}

.pun, .opn, .clo {
    color: #1a1a1a !important;
}

.tag {
    color: #7c3aed !important;
}

.atn {
    color: #059669 !important;
}

.atv {
    color: #0066cc !important;
}

/* Coverage status colors - keep these vibrant */
.high {
    background: #dcfce7 !important;
    color: #166534 !important;
}

.medium {
    background: #fef3c7 !important;
    color: #92400e !important;
}

.low {
    background: #fee2e2 !important;
    color: #991b1b !important;
}

/* Line coverage in detail view */
.cline-yes {
    background: #dcfce7 !important;
}

.cline-no {
    background: #fee2e2 !important;
}

.cline-neutral {
    background: #f3f4f6 !important;
}

/* Ensure table rows are readable */
tbody tr:hover {
    background: #f9fafb !important;
}

/* Input styling */
input[type="search"] {
    background: #ffffff !important;
    color: #1a1a1a !important;
    border: 1px solid #d1d5db !important;
    padding: 0.5rem;
    border-radius: 4px;
}
</style>
`;

function injectCSS(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');

        // Check if custom CSS is already injected
        if (content.includes('Enhanced Coverage Report Styling')) {
            console.log(`Already enhanced: ${filePath}`);
            return;
        }

        // Inject custom CSS before </head>
        content = content.replace('</head>', `${customCSS}\n</head>`);

        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Enhanced: ${filePath}`);
    } catch (error) {
        console.error(`Error processing ${filePath}:`, error.message);
    }
}

function processDirectory(dir) {
    if (!fs.existsSync(dir)) {
        console.log(`Coverage directory not found: ${dir}`);
        return;
    }

    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            processDirectory(filePath);
        } else if (file.endsWith('.html')) {
            injectCSS(filePath);
        }
    });
}

console.log('Enhancing coverage report styling...');
processDirectory(coverageDir);
console.log('Done!');
