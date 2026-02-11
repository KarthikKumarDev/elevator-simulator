# Project Development Plan (SDLC)

This document outlines the systematic approach to developing, testing, and maintaining the Elevator Simulator project, organized by the Software Development Life Cycle (SDLC) phases.

---

## Phase 1: Planning & Analysis
**Goal**: Define WHAT we are building and ensure a clear understanding of requirements before writing code.

### 1.1 Planning Architecture & File Standards
To maintain a structured development process, distinct aspects of the system must be planned in separate files using standard naming conventions.

| Plan Type | Standard Filename | Content Requirements |
| :--- | :--- | :--- |
### 1.2 LLM-Optimized Spec Writing Guidelines
All component specifications (`*_spec.md`) must be written to be unambiguous and directly actionable by LLM agents.

**A. Philosophy**
Treat specifications as **strict, zero-shot prompts**. If a spec requires the agent to "guess" or "infer" business logic, the spec is defective.

**B. Mandatory Specification Structure**
Every spec file must include:
1.  **Context & Scope**: A 1-2 sentence summary of *why* this exists.
2.  **Data Models (The "What")**:
    *   Strict **TypeScript Interfaces** or **JSON Schemas**.
    *   *Rule*: Never describe data structures in prose if they can be defined in code.
3.  **Core Logic (The "How")**:
    *   **Pseudocode**: For any algorithm, provide Python/TS-like pseudocode.
    *   **State Machines**: Use tables defining `(Current State) + (Event) -> (New State)`.
4.  **Invariants & Constraints**:
    *   Performance limits (e.g., "O(1) lookup required").
    *   System boundaries (e.g., "Must not access DOM directly").
5.  **Edge Cases**: Explicit list of Null/Empty/Error states and required handling.

**C. Formatting Rules**
*   **Keywords**: Use RFC 2119 terms (**MUST**, **MUST NOT**, **SHOULD**) to denote strictness.
*   **No Ambiguity**: Avoid words like "usually", "approximately", or "better". Be binary.
*   **Self-Contained**: Minimize external link references. If context is needed, include it briefly.

**D. Active Validation & Clarification**
*   **Test Assumptions**: Before finalizing a spec, explicitly list any assumptions made.
*   **Ask for Clarity**: If a requirement is vague (e.g., "fast response"), **ASK** the user for a specific metric (e.g., "<200ms").
*   **Decision Points**: Highlight trade-offs and ask for user preference on key architectural decisions.

### 1.3 Key Activities
*   **Requirements Gathering**: Defining core functionality (Business logic, System goals).
*   **UI/UX Definition**: Establishing the visual style, layout, and user interactions.
*   **Test Strategy**: Defining success criteria, coverage goals, and test cases early.

### 1.4 Documentation Map
The following specifications are the source of truth for this phase:

| Document | Description |
| :--- | :--- |
| **[Functional Requirements](./prd.md)** | Goals, Scope, Functional & Non-Functional Requirements. |
| **[UI Specification](./ui_spec.md)** | Layout, Styling Rules, and Interactions. |
| **[Test Plan](./test_plan.md)** | Specific test scenarios, coverage goals, and strategy. |

---

## Phase 2: Design & Architecture
**Goal**: Define HOW we will build the system to ensure scalability and maintainability.

### 2.1 Key Activities
*   **Algorithm Design**: Structure the core logic (e.g., dispatching, data processing).
    *   **Output**: `[name]_algo_spec.md` containing pseudocode, time complexity analysis (Big O), and edge case handling.
*   **High-Level Design (HLD)**: Define system components and data flow.
    *   **Output**: `system_design.md` containing Component Diagrams (Mermaid.js), Sequence Diagrams for critical paths, and API contracts.
*   **Tool Recommendations**: Select the right tools for the job.
    *   **Criteria**: Evaluate libraries based on bundle size, community support, and TS compatibility.
    *   **Output**: `tech_stack.md` (or dedicated section in Design Doc) listing dependencies with justification.

### 2.2 Design Architecture & File Standards
| Plan Type | Standard Filename | Content Requirements |
| :--- | :--- | :--- |
| **System Design** | `system_design.md` | Architectural Blueprint (Component Hierarchy, State Flow). |
| **Algorithm Specs** | `[name]_algo_spec.md` | Detailed logic & math. Must include Pseudocode, Big O analysis, and Edge Cases. |
| **Tool Stack** | `tech_stack.md` | List of libraries/tools with justification (Bundle size, Support). |
| **Coding Standards** | `coding_standards.md` | Language-specific rules (e.g., "React Hooks only", "No Any") and linter config. |
| **UI Implementation** | `ui_design_plan.md` | Component breakdown, CSS Strategy (e.g. Tailwind), and Storybook setup. |
| **API Design** | `api_spec.md` | Endpoints, Request/Response schemas, and Error handling (if applicable). |

### 2.3 Architectural Rules
1.  **Strict Separation of Concerns**:
    *   **UI Layer** (`src/components/`, `src/pages/`): Strictly *renders state* and dispatches *actions*. No simulation logic.
    *   **Simulation Engine** (`src/simulation.ts`): A pure function/module taking state + inputs -> new state. No UI dependencies.
    *   **Types** (`src/types.ts`): Shared but minimal definitions.
2.  **State Management**:
    *   Single source of truth passed down to components.
    *   State updates must be immutable.
3.  **Tick-Based Simulation**:
    *   All logic updates occur in a central `tick()` function (O(N) or O(1) complexity).
    *   UI re-renders purely as a reaction to the state change from `tick()`.
4.  **Configuration**:
    *   No "Magic Numbers". All parameters (floors, speeds) must be in a config object.

---

## Phase 3: Implementation (Development)
**Goal**: Build the system according to the design specifications.

### 3.1 Workflow
1.  **Plan**: Update relevant specs (`plan.md`, `ui_spec.md`) before coding.
2.  **Review**: Wait for user approval.
3.  **Implement**: Write code matching the plan.
4.  **Verify**: Run tests (`npx vitest`) **ONLY** after code changes.

### 3.2 Coding Guidelines (React + TypeScript)
*   **Component Architecture**:
    *   **Size Limit**: **Standard max 150 lines**. Extract at ~100 lines.
    *   **Functional Components**: Use hooks only. No class components.
    *   **Strict Props**: Define interfaces for all props (`interface MyComponentProps`).
    *   **Composition**: Build complex UIs from simple atoms (e.g., `BuildingView` -> `ElevatorShaft` -> `ElevatorCar`).
*   **Business Logic**:
    *   Extract stateful logic into Custom Hooks (e.g., `useSimulationControls`).
    *   Keep logic testable and independent of UI rendering.
*   **TypeScript**:
    *   **Strict Typing**: No `any`. Use `unknown` + narrowing if needed.
    *   **Null Safety**: Use optional chaining (`?.`) and nullish coalescing (`??`).
*   **Styling**:
    *   Follow `ui_spec.md` strictly (Glassmorphism).
    *   Inline styles or CSS modules are acceptable.
*   **Accessibility**:
    *   Semantic HTML (`<button>`, `<main>`).
    *   `aria-label` for icon-only buttons.

---

## Phase 4: Testing & Verification
**Goal**: Ensure the system works as expected and meets quality standards.

### 4.1 Testing Strategy
*   **Unit Tests**: Verify `simulation.ts` logic against `test_plan.md` (Target: 100% Core Logic Coverage).
*   **Component Tests**: Verify rendering and interaction using generic rules from `test_spec.md`.
*   **Integration Tests**: Verify the full simulation loop in `App.tsx`.
*   **Edge Cases**: Explicitly test 0 floors, empty queues, simultaneous requests.

### 4.2 Verification Workflow
*   Run `npm run test:coverage` to identify blind spots.
*   Ensure test descriptions map back to Test Cases (e.g., "TC14: ...").

---

## Phase 5: Deployment & Delivery
**Goal**: Make the application available for use.

### 5.1 Artifact Generation
*   **Build**: Use `vite build` to create optimized static assets.
*   **Reports**: Generate HTML test reports (`test-report/index.html`) and coverage summaries.

### 5.2 Delivery Checklist
*   [ ] Application builds without errors.
*   [ ] All tests pass.
*   [ ] Linter (`eslint`) reports no warnings.
*   [ ] Performance is acceptable (60fps animation).

---

## Phase 6: Maintenance & Evolution
**Goal**: Keep the system healthy, clean, and adaptable to change.

### 6.1 Refactoring Strategy
*   **Trigger**: Component exceeds 100 lines or has mixed responsibilities.
*   **Process**:
    1.  Identify logical sections.
    2.  Extract section to new component.
    3.  Move logic to custom hooks.
    4.  Verify with tests.
*   **Checklist**:
    *   [ ] No regressions (Tests pass).
    *   [ ] No code duplication.
    *   [ ] Clear naming and documentation.

### 6.2 Prompts & LLM Interactions (Internal)
*   **Debugging**: Ask for reproduction steps/logs.
*   **UI Design**: Refer strictly to `ui_spec.md`.
*   **Testing**: Map tests to `test_plan.md` IDs.
