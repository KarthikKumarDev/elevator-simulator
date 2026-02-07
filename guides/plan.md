# Development Plan

## 1. Documentation Map
This section links to the detailed specifications for each component of the project.

| Document | Description |
| :--- | :--- |
| **[Functional Requirements](./prd.md)** | Defines *what* the system should do (Goals, Scope, FRs, NFRs). |
| **[UI Specification](./ui_spec.md)** | Defines *how* the system should look (Layout, Styling, Interactions). |
| **[Simulation Logic](./elevator_simulation_spec.md)** | Defines the core algorithms (Dispatching, Movement, Modes). |
| **[Test Plan](./test_plan.md)** | Defines specific test scenarios and strategy (Unit, Integration, E2E). |

---

## 2. Implementation Rules

1.  **Strict Separation of Concerns**:
    -   **UI Layer** (`src/components/`, `src/pages/`) must strictly *render state* and dispatch *actions*. It must clear of simulation logic.
    -   **Simulation Engine** (`src/simulation.ts`) must be a pure function or contained module that takes state + inputs and returns new state. No UI dependencies.
    -   **Types** (`src/types.ts`) should be shared but minimal.
    
2.  **State Management**:
    -   Use a single source of truth (likely a React Context or simple state object for this scale) passed down to components.
    -   State updates must be immutable.

3.  **Tick-Based Simulation**:
    -   All logic updates happen in a `tick()` function.
    -   UI re-renders reacting to the state change produced by `tick()`.

4.  **No "Magic Numbers"**:
    -   Configuration (floors, speed, etc.) must be parameterized in a config object, not hardcoded.

5.  **Workflow**:
    -   **Plan First**: Before writing code, update the relevant specification file (`plan.md`, `ui_spec.md`, etc.).
    -   **Review**: Wait for user approval on the plan.
    -   **Implement**: Write code matching the plan.
    -   **Verify**: Run relevant tests (`npx vitest`) **ONLY** after code changes. Do not run tests for documentation-only updates.

---

## 3. Coding Guidelines (React + TypeScript)

### React
-   **Functional Components**: Use functional components with hooks. Avoid class components.
-   **Props Interface**: Always define a strict interface for component props.
    ```typescript
    interface MyComponentProps {
      isActive: boolean;
      onToggle: () => void;
    }
    ```
-   **Memoization**: Use `useMemo` for expensive calculations (like derived metrics) and `useCallback` for event handlers passed to children to avoid unnecessary re-renders.
-   **Styling**: Use standard CSS modules or styled-components (if configured). Keep styles co-located or modular. For this project, inline styles or simple CSS files are acceptable given the `ui_spec.md` emphasis on specific visual properties.

### TypeScript
-   **Strict Typing**: Avoid `any`. Use `unknown` if type is truly ambiguous, then narrow.
-   **Interfaces vs Types**: Prefer `interface` for public APIs/Props, `type` for unions/complex compositions.
-   **Null Safety**: Use optional chaining (`?.`) and nullish coalescing (`??`).

---

## 4. Best Practices

-   **Testing**:
    -   Write unit tests for *logic* (simulation engine) independent of UI.
    -   Test edge cases (e.g., 0 floors, empty queues, simultaneous requests).
-   **Performance**:
    -   The simulation loop can run frequently (e.g., 100ms). specific care must be taken to ensure the `tick` logic is O(N) or O(1), not O(N^2) where N is requests/elevators.
-   **Accessibility (a11y)**:
    -   Ensure buttons have `aria-label` if they are icon-only.
    -   Use semantic HTML (`<button>`, `<main>`, `<header>`).
-   **Code Quality**:
    -   Keep components small (Single Responsibility Principle).
    -   Comments should explain *why*, not *what*.

---

## 5. Prompts & LLM Interactions (Internal Guide)
*Use these guidelines when generating code or explanations.*

-   **When debugging**: Always ask for the reproduction steps or the specific log entry that indicates failure.
-   **When designing UI**: Refer strictly to the "Glassmorphism" rules in `ui_spec.md`.
-   **When creating/updating tests**: Ensure test descriptions map back to the Test Cases in `test_plan.md` (e.g., "TC14: ...").
