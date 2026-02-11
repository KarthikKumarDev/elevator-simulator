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
*   **Functional Spec Generation**: Create detailed specs for each feature.
    *   **Output**: `[feature_name]_functional_spec.md`.
    *   **Structure**:
        1.  **User Stories**: As a [role], I want [feature] so that [benefit].
        2.  **Acceptance Criteria**: Exact conditions for "Done" (Given/When/Then).
        3.  **Visual Requirements**: Wireframes or reference to UI Spec.
        4.  **Edge Cases**: Zero state, Error state, Max limits.
*   **Algorithm Design**: Structure the core logic (e.g., dispatching, data processing).
    *   **Output**: `[name]_algo_spec.md` containing pseudocode, time complexity analysis (Big O), and edge case handling.
*   **High-Level Design (HLD)**: Define system components and data flow.
    *   **Output**: `system_design.md` containing Component Diagrams (Mermaid.js), Sequence Diagrams for critical paths, and API contracts.
*   **Tool Recommendations**: Select the right tools for the job.
    *   **Criteria**: Evaluate libraries based on size, community support, and compatibility.
    *   **Output**: List dependencies with justification.

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
    *   **UI Layer**: Strictly *renders state* and dispatches *actions*. No business logic.
    *   **Core Logic**: A pure function/module taking state + inputs -> new state. No UI dependencies.
    *   **Data Models**: Shared but minimal definitions.
2.  **State Management**:
    *   Single source of truth.
    *   State updates must be immutable.
3.  **Core Loop**:
    *   All logic updates occur in a central processing function.
    *   UI re-renders purely as a reaction to state changes.
4.  **Configuration**:
    *   No "Magic Numbers". All parameters must be in a config object.

---

## Phase 3: Implementation (Development)
**Goal**: Build the system according to the design specifications.

### 3.1 Workflow
1.  **Documentation**: Generate a `[feature_name]_tech_doc.md` before coding.
    *   **Structure**: Overview, Schema Changes, API Contract, Algorithm details, and Edge Cases.
2.  **Context**: Read and understand the specific spec (`*_spec.md`) and the new tech doc.
3.  **Options**: Propose multiple implementation approaches to the User.
4.  **Select**: Wait for User guidance.
5.  **Implement**: Write code according to selection and standards.
6.  **Verify**: Run relevant tests.

### 3.3 Backend Engineering Guidelines
*   **API Definitions**:
    *   **Specification**: Define strict **OpenAPI 3.0** specs as `.json` files before implementation.
    *   **Versioning**: Use semantic versioning (e.g., `/api/v1/resource`) for all endpoints.
*   **Service Configuration**:
    *   Inject configuration via Environment Variables (`process.env`), never hardcode.
    *   Validate config validation on startup (fail fast if missing).
*   **Layered Architecture**:
    *   **Controller Layer**: Handles HTTP parsing, validation, and response formatting only.
    *   **Business Logic Layer (BLL)**: Contains core domain rules. Pure functions where possible.
    *   **Resource Logic Layer (DAL)**: Handles database queries and external service calls.
*   **Database Connections**:
    *   Use connection pooling to manage resources efficiently.
    *   Ensure strict schema validation (ORM or Validator) before writing.

### 3.4 Coding Guidelines (General)
*   **Component Architecture**:
    *   **Size Limit**: Enforce modules/components to be small (e.g., <150 lines). Extract early.
    *   **Modern Practices**: Use modern language features (e.g., functional paradigms over classes where applicable).
    *   **Strict Contracts**: Define clear interfaces for all modules and components.
    *   **Composition**: Build complex UIs/Systems from simple, atomic units.
*   **Business Logic**:
    *   Extract stateful logic into dedicated helpers or services.
    *   Keep logic testable and independent of UI rendering.
*   **Type Safety (If applicable)**:
    *   **Strict Typing**: Avoid 'any' or loose types.
    *   **Null Safety**: Handle null/undefined explicitly.
*   **Styling**:
    *   Follow the defined `ui_spec.md` strictly.
    *   Keep styles modular and maintainable.
*   **Accessibility**:
    *   Use semantic elements/tags suitable for the platform.
    *   Ensure interactive elements have accessible labels.

---

## Phase 4: Testing & Verification
**Goal**: Ensure the system works as expected and meets quality standards.

### 4.1 Test Plan Creation
*   **Analysis**: Start by exhaustively analyzing the Functional Requirements (PRD), Algorithm Specs, and UI Specs.
*   **Grouping**: accurate list of **all possible** test cases, grouped by:
    *   **Module**: (e.g., Core Logic, API, UI Component).
    *   **Type**: (e.g., Unit, Integration, Edge Case).
*   **Output**: A comprehensive `test_plan.md` serving as the source of truth for verification.

### 4.2 Test Implementation
*   **Generation**: Use `test_plan.md` to generate all unit and integration tests.
*   **Modularization**: Create tests in properly modularized files (e.g., co-located `*.test.ts` or `tests/integration/`).
*   **Traceability**: Ensure every generated test references the specific Test Case ID from the plan.

### 4.3 Testing Strategy
*   **Unit Tests**: Verify core logic against `test_plan.md` (Target: 100% Core Logic Coverage).
*   **Component Tests**: Verify rendering and interaction using generic rules from `test_spec.md`.
*   **Integration Tests**: Verify the full application loop.
*   **Edge Cases**: Explicitly test boundary conditions (e.g., empty queues, simultaneous requests).

### 4.4 Verification Workflow
*   Run the test suite to identify blind spots.
*   Ensure test descriptions map back to Test Cases (e.g., "TC14: ...").

---

## Phase 5: Deployment & Delivery
**Goal**: Make the application available for use.

### 5.1 Artifact Generation
*   **Build**: Create optimized assets for the target platform.
*   **Reports**: Generate test reports and coverage summaries.

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
    2.  Extract section to new component/module.
    3.  Move logic to dedicated handlers.
    4.  Verify with tests.
*   **Checklist**:
    *   [ ] No regressions (Tests pass).
    *   [ ] No code duplication.
    *   [ ] Clear naming and documentation.

### 6.2 Prompts & LLM Interactions (Internal)
*   **Debugging**: Ask for reproduction steps/logs.
*   **UI Design**: Refer strictly to `ui_spec.md`.
*   **Testing**: Map tests to `test_plan.md` IDs.
