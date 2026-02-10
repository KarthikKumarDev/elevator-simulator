# Elevator Simulation

A comprehensive elevator control system simulator built with React and TypeScript. Experiment with different elevator algorithms and operation modes to optimize performance metrics.

## Features

- **Interactive Visualization**: Real-time building view with animated elevators
- **Multiple Operation Modes**: Eco, Normal, and Power modes with different optimization strategies
- **Comprehensive Metrics**: Track wait times, travel distances, and power consumption
- **Debug Tools**: System log inspection with JSON export
- **Responsive Design**: Modern glassmorphic UI that adapts to different screen sizes

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:5174](http://localhost:5174) to view the simulation.

### Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# View coverage report
npm run test:ui
```

### Building

```bash
npm run build
```

## Project Structure

```
elevator-simulator/
├── src/
│   ├── components/      # Reusable UI components
│   ├── pages/           # Page-level components
│   ├── types/           # TypeScript type definitions
│   ├── simulation.ts    # Core simulation logic
│   └── styles.css       # Global styles
├── guides/              # Documentation
│   ├── coding_standards.md      # Coding guidelines
│   ├── elevator_simulation_spec.md
│   ├── prd.md
│   ├── test_plan.md
│   └── ui_spec.md
└── tests/               # Test files
```

## Documentation

- **[Product Requirements](guides/prd.md)**: Feature specifications and requirements
- **[Simulation Spec](guides/elevator_simulation_spec.md)**: Elevator algorithm details
- **[UI Specification](guides/ui_spec.md)**: Complete UI design documentation
- **[Test Plan](guides/test_plan.md)**: Testing strategy and test cases
- **[Coding Standards](guides/coding_standards.md)**: Code quality guidelines and best practices

## Coding Standards

This project follows strict coding standards to maintain code quality:

- **150-line component limit**: React components must not exceed 150 lines
- **TypeScript strict mode**: Full type safety with no implicit any
- **Comprehensive testing**: Aim for >80% test coverage
- **Accessibility**: WCAG AA compliance for all UI elements

See [guides/coding_standards.md](guides/coding_standards.md) for complete details.

## Operation Modes

### Eco Mode (Energy Efficient)
- Minimizes power consumption
- Batches requests to reduce travel
- Prefers idle elevators over moving ones

### Normal Mode
- Balanced approach between efficiency and responsiveness
- Dual-direction dispatch when resources permit
- Standard SCAN algorithm with piggybacking

### Power Mode (High Performance)
- Minimizes passenger wait times
- Aggressive dispatching
- Can skip floors for faster service

## Technologies

- **React 18**: UI framework
- **TypeScript**: Type-safe development
- **Vite**: Fast build tool and dev server
- **Vitest**: Unit testing framework
- **React Router**: Client-side routing

## Contributing

1. Follow the coding standards in `guides/coding_standards.md`
2. Write tests for new features
3. Ensure all tests pass before submitting
4. Update documentation as needed

## License

MIT
