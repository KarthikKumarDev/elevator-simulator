# Coding Standards

## React Component Guidelines

### Component Size Limit
**Rule**: A single React component file must not exceed **150 lines** of code.

**Rationale**:
- Improves readability and maintainability
- Encourages separation of concerns
- Promotes reusable component design
- Makes testing easier
- Reduces cognitive load when reviewing code

**Enforcement**:
- Components exceeding 150 lines must be refactored into smaller, reusable sub-components
- Extract logical sections into separate components
- Consider using composition patterns (children, render props, HOCs)
- Move complex logic to custom hooks when appropriate

**Examples of Refactoring**:

```tsx
// ❌ Bad: Large monolithic component (200+ lines)
export function LargeComponent() {
  // 200+ lines of JSX and logic
}

// ✅ Good: Broken into smaller components
export function MainComponent() {
  return (
    <div>
      <Header />
      <ContentSection />
      <Footer />
    </div>
  );
}

function Header() { /* ... */ }
function ContentSection() { /* ... */ }
function Footer() { /* ... */ }
```

**Current Violations** (as of 2026-02-10):
- `src/pages/SimulationPage.tsx` - 208 lines → Needs refactoring
- `src/components/BuildingView.tsx` - 162 lines → Needs refactoring

**Exceptions**:
- Test files (*.test.tsx, *.test.ts) are exempt from this rule due to the nature of comprehensive test coverage
- Configuration files and setup files are exempt

---

## TypeScript Guidelines

### Type Safety
- Always use explicit types for function parameters and return values
- Avoid using `any` type unless absolutely necessary
- Use `unknown` instead of `any` when type is truly unknown
- Leverage TypeScript's type inference where it improves readability

### Interfaces vs Types
- Use `interface` for object shapes that may be extended
- Use `type` for unions, intersections, and primitives
- Be consistent within a module

---

## File Organization

### Directory Structure
```
src/
├── components/     # Reusable UI components
├── pages/          # Page-level components (route handlers)
├── types/          # TypeScript type definitions
├── utils/          # Utility functions
└── styles/         # Global styles and CSS
```

### Naming Conventions
- **Components**: PascalCase (e.g., `BuildingView.tsx`)
- **Utilities**: camelCase (e.g., `calculateCost.ts`)
- **Types**: PascalCase (e.g., `ElevatorState`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `DEFAULT_CONFIG`)

---

## Code Quality

### Formatting
- Use Prettier for consistent code formatting
- 2-space indentation
- Single quotes for strings (except JSX attributes)
- Trailing commas in multi-line structures

### Comments
- Write self-documenting code with clear variable and function names
- Add comments for complex logic or non-obvious decisions
- Use JSDoc for public APIs and exported functions

### Testing
- Write tests for all business logic
- Aim for high test coverage (>80%)
- Use descriptive test names that explain the scenario
- Follow the Arrange-Act-Assert pattern

---

## Performance

### React Best Practices
- Use `useMemo` and `useCallback` to prevent unnecessary re-renders
- Avoid inline function definitions in JSX when possible
- Use `React.memo` for expensive components that render frequently
- Prefer CSS transforms over layout-triggering properties

### Bundle Size
- Import only what you need (tree-shaking friendly)
- Lazy load routes and heavy components
- Avoid large dependencies when smaller alternatives exist

---

## Accessibility

### WCAG Compliance
- All interactive elements must be keyboard accessible
- Provide proper ARIA labels where needed
- Maintain sufficient color contrast (WCAG AA minimum)
- Use semantic HTML elements

### Forms
- Associate labels with inputs using `htmlFor`
- Provide clear error messages
- Support keyboard navigation

---

## Version Control

### Commit Messages
- Use conventional commit format: `type(scope): message`
- Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
- Keep messages concise but descriptive

### Pull Requests
- Keep PRs focused on a single concern
- Include tests for new features
- Update documentation when needed
- Request review before merging

---

## Documentation

### Code Documentation
- Document complex algorithms and business logic
- Keep README.md up to date
- Maintain guides for major features

### API Documentation
- Document all exported functions and types
- Include usage examples
- Specify parameter types and return values
