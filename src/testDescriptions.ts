/**
 * Test Descriptions Registry
 * 
 * This file contains descriptions for all test cases in the project.
 * Each description should be no more than 5 lines and explain what the test verifies.
 */

export const testDescriptions: Record<string, string> = {
    // ===== Simulation Tests =====
    'TC.SIM.01': 'Verifies that the simulation initializes with the correct number of elevators, all starting at floor 1 with idle state and closed doors.',

    'TC.SIM.02': 'Tests that hall call requests are properly added to the pending requests queue when a user presses UP or DOWN buttons.',

    'TC.SIM.03': 'Ensures that the dispatch algorithm correctly assigns pending hall requests to the most appropriate elevator based on proximity and direction.',

    'TC.SIM.04': 'Validates that elevators move in the correct direction (up/down) towards their target floors and update their current floor position.',

    'TC.SIM.05': 'Checks that elevator doors open when reaching a target floor and remain open for the configured duration (doorOpenTicks).',

    'TC.SIM.06': 'Verifies that elevator doors close after the open duration expires and the elevator is ready to move to the next target.',

    'TC.SIM.07': 'Tests that car call requests (floor selections inside the elevator) are added to the elevator\'s target floors list.',

    'TC.SIM.08': 'Ensures that requests are marked as completed and removed from active requests when the elevator services them.',

    'TC.SIM.09': 'Validates that metrics (avg wait time, max wait time, total requests) are calculated correctly based on request timestamps.',

    'TC.SIM.10': 'Tests that the travel log correctly records each elevator\'s floor history as it moves through the building.',

    // ===== UI Component Tests =====
    'TC.UI.01': 'Verifies that the main App component renders without errors and displays all major UI sections (building view, control panel, metrics).',

    'TC.UI.02': 'Tests that the BuildingView component correctly renders floor controls and elevator shafts based on the simulation state.',

    'TC.UI.03': 'Ensures that clicking hall call buttons (UP/DOWN) triggers the correct callback with floor number and direction.',

    'TC.UI.04': 'Validates that the ControlPanel displays configuration inputs and control buttons (Start, Pause, Reset) correctly.',

    'TC.UI.05': 'Tests that the MetricsPanel displays real-time metrics (wait times, request count) with proper formatting.',

    'TC.UI.06': 'Verifies that changing configuration values in the ControlPanel triggers the onChange callback with updated config.',

    'TC.UI.07': 'Ensures that Start, Pause, and Reset buttons in the ControlPanel trigger their respective callback functions.',

    'TC.UI.08': 'Tests that the DebugModal renders when isOpen is true and displays the system logs header and entry count.',

    'TC.UI.09': 'Verifies that clicking the close button (×) in the DebugModal triggers the onClose callback.',

    'TC.UI.10': 'Tests that clicking the "Copy JSON" button copies the system logs to the clipboard in JSON format.',

    'TC.UI.11': 'Validates that after copying, the button text changes to "Copied!" for 2 seconds before reverting to "Copy JSON".',

    'TC.UI.12': 'Ensures that the DebugModal displays system logs as formatted JSON with proper indentation and structure.',

    'TC.UI.13': 'Tests that the DebugModal footer displays the correct count of log entries (0, 1, or multiple entries).',

    'TC.UI.14': 'Verifies that the ElevatorCar component renders with the correct elevator ID and direction symbol (↑, ↓, or •).',

    'TC.UI.15': 'Tests that the elevator car is positioned correctly using CSS translateY based on its current floor.',

    'TC.UI.16': 'Validates that the elevator doors apply the correct CSS classes (open/closed) based on the doorState.',

    'TC.UI.17': 'Ensures that the elevator interior applies the correct background color passed via the interiorColor prop.',

    'TC.UI.18': 'Tests that the "Select" button appears when elevator doors are open or opening, allowing floor selection.',

    'TC.UI.19': 'Verifies that clicking the "Select" button calls onOpenCarPanel with the correct elevator ID.',

    'TC.UI.20': 'Tests that clicking a floor button in the car panel popover calls onCarCall with elevator ID and floor number.',

    'TC.UI.21': 'Validates that floor buttons in the car panel are highlighted (active class) when they are in the elevator\'s target floors.',

    'TC.UI.22': 'Ensures that the current floor button in the car panel is disabled to prevent selecting the same floor.',

    'TC.UI.23': 'Tests that mouse enter and leave events on the elevator car trigger onElevatorHover with the correct hover state.',

    'TC.UI.24': 'Verifies that FloorControls renders the floor label and UP/DOWN buttons for a given floor.',

    'TC.UI.25': 'Tests that clicking the UP button in FloorControls calls onHallCall with the floor number and "up" direction.',

    'TC.UI.26': 'Tests that clicking the DOWN button in FloorControls calls onHallCall with the floor number and "down" direction.',

    'TC.UI.27': 'Validates that UP/DOWN buttons show active state when there are pending or active requests for that floor and direction.',

    'TC.UI.28': 'Ensures that the UP button is disabled on the top floor since elevators cannot go higher.',

    'TC.UI.29': 'Ensures that the DOWN button is disabled on floor 1 since elevators cannot go lower.',

    'TC.UI.30': 'Tests that ControlPanel mode change triggers the onConfigChange callback with the updated configuration.',

    'TC.UI.31': 'Validates that ControlPanel input validation prevents invalid values (e.g., negative floors, zero elevators).',

    'TC.UI.32': 'Tests that ControlPanel handles edge cases like maximum values for floors, elevators, and tick duration.',

    // ===== Custom Hooks Tests =====
    'TC.HOOK.01': 'Verifies that calling handleOpenCarPanel sets the carPanelElevatorId state to the specified elevator ID.',

    'TC.HOOK.02': 'Tests that calling closeCarPanel clears the carPanelElevatorId state back to null.',

    'TC.HOOK.03': 'Ensures that opening a new car panel while one is already open clears any existing timeout and updates the ID.',

    'TC.HOOK.04': 'Validates that calling handleCarCall triggers setState to add a car call request to the simulation state.',

    'TC.HOOK.05': 'Tests that after making a car call, the panel automatically closes after 2 seconds using a timeout.',

    'TC.HOOK.06': 'Verifies that manually closing the car panel clears any pending auto-close timeout to prevent state updates.',

    'TC.HOOK.07': 'Tests that calling handleStart sets the simulation running state to true via setState.',

    'TC.HOOK.08': 'Tests that calling handlePause sets the simulation running state to false via setState.',

    'TC.HOOK.09': 'Validates that calling handleReset creates a new initial state with clockTick=0 and running=false.',

    'TC.HOOK.10': 'Tests that calling handleConfigChange updates both the config and resets the simulation state.',

    'TC.HOOK.11': 'Verifies that the simulation tick loop calls tickSimulation at regular intervals when running is true.',

    'TC.HOOK.12': 'Ensures that the interval is properly cleared on component unmount to prevent memory leaks.',

    // ===== Integration Tests =====
    'TC.INT.01': 'Tests the complete integration of the App component with simulation state updates and UI rendering.',

    'TC.INT.02': 'Validates that hall calls flow through the entire system: UI click → state update → elevator dispatch → UI update.',

    'TC.INT.03': 'Tests that real-time metrics are calculated and displayed correctly as the simulation progresses.',

    'TC.INT.04': 'Verifies that the travel log updates in real-time as elevators move between floors.',

    'TC.INT.05': 'Tests that BuildingView correctly composes FloorControls and ElevatorShaft components with proper data flow.',

    'TC.INT.06': 'Validates that ElevatorShaft correctly composes ElevatorCar with shaft structure and floor markers.',

    'TC.INT.07': 'Tests that SimulationHeader integrates properly with navigation and modal opening functionality.',

    'TC.INT.08': 'Verifies that custom hooks (useCarPanel, useSimulationControls) maintain synchronized state.',

    'TC.INT.09': 'Tests that hook cleanup effects (intervals, timeouts) are properly executed on unmount.',

    'TC.INT.10': 'Validates that the elevator color utility generates consistent colors across component renders.',

    // ===== E2E Tests =====
    'TC.E2E.01': 'Tests a complete user journey: navigating to different pages (Tests, Guides) and returning to the simulation.',

    'TC.E2E.02': 'Validates a full simulation workflow: configure → start → make requests → observe elevator movement → pause → reset.',

    // ===== Simulation Edge Cases =====
    'TC.SIM.51': 'Tests handling of multiple requests at the same floor with different directions (up and down).',

    'TC.SIM.52': 'Validates behavior when an elevator is already at the requested floor when a hall call is made.',

    'TC.SIM.53': 'Tests all possible door state transitions: closed → opening → open → closing → closed.',

    'TC.SIM.54': 'Verifies that hover state changes (isHovered true/false) are correctly applied to elevator state.',

    'TC.SIM.55': 'Tests edge cases in request completion when multiple requests target the same floor.',

    'TC.SIM.56': 'Validates power mode jump boundaries when switching between normal, eco, and power modes.',

    'TC.SIM.57': 'Tests eco mode request batching behavior to minimize elevator trips and energy consumption.',

    'TC.SIM.58': 'Validates normal mode dual dispatch allowing multiple elevators to handle requests simultaneously.',

    'TC.SIM.59': 'Tests direction change behavior when an elevator completes all requests in one direction.',

    'TC.SIM.60': 'Validates handling of empty target floors array when all requests are completed.',

    'TC.SIM.61': 'Tests piggybacking edge cases where passengers join an elevator already in motion.',

    'TC.SIM.62': 'Validates that system log entries are created for all major events (requests, movements, door actions).',

    'TC.SIM.63': 'Tests concurrent request handling when multiple users press buttons simultaneously.',

    'TC.SIM.64': 'Validates elevator priority logic when multiple elevators are equidistant from a request.',

    'TC.SIM.65': 'Tests boundary conditions: floor 1 (bottom), max floor (top), and transitions between them.'
};

/**
 * Get description for a test case by its ID
 */
export function getTestDescription(testId: string): string {
    return testDescriptions[testId] || 'No description available for this test case.';
}

/**
 * Get all test descriptions
 */
export function getAllDescriptions(): Record<string, string> {
    return { ...testDescriptions };
}
