# Elevator Simulation UI Specification

## 1. UI Design Goals
- **Interactive**: Allows real-time interaction with the building and elevators.
- **Visual**: Provides clear visual feedback on elevator state (moving, idle, doors).
- **Control**: Offers comprehensive controls for simulation configuration and execution.
- **Responsive**: Adapts to standard desktop resolutions.
- **Aesthetic (Glassmorphism)**: Use translucent backgrounds, blur effects (`backdrop-filter`), and subtle borders to create a modern, premium look.

## 2. Main Layout Structure
### Left/Center Panel: Building Visualization
- **Floor Stack**: Vertical stack of floors, with Floor N at the top and Floor 1 at the bottom.
- **Elevator Shafts**: Vertical columns representing each elevator's path.
- **Elevator Car**: Visual representation of the car within the shaft.
  - **Position**: Smoothly animates between floors.
  - **Direction**: Indicators (arrows) showing current direction (UP/DOWN/IDLE).
  - **Door State**: Visual representation of doors opening/closing.
  - **Occupancy**: (Optional) Visual cue for passengers.
- **Floor Controls**:
  - **Hall Call Buttons**: UP/DOWN buttons on each floor.
  - **Active State**: Buttons light up when pressed.
- **Car Panel (Popover/Modal)**:
  - Accessible by clicking on an elevator.
  - **Floor Buttons**: Grid of buttons (1..N) to select destination.
  - **Status**: Visual feedback for selected floors (highlighted) and current floor (disabled).

### Right/Bottom Panel: Controls & Metrics
- **Simulation Controls**:
  - **Play/Pause**: Toggle simulation running state.
  - **Reset**: Clear all requests and return elevators to ground floor.
  - **Speed Control**: Slider or inputs to adjust `tickDurationMs`.
- **Configuration**:
  - **Building Config**: Inputs for Number of Floors, Number of Elevators.
  - **Mode Selector**: Dropdown/Tabs to switch between **Eco**, **Normal**, and **Power** modes.
- **Metrics Dashboard**:
  - **Live Stats**: Average Wait Time, Max Wait Time, Total Requests.
  - **Travel Log**: Per-elevator breakdown of sequence, moving time, and power consumption.
- **Timeline/Log**: (Optional) Scrolling text log of major events (Arrived, Door Open, etc.).

## 3. Visual Feedback & Interactions
- **Animations**:
  - **Smooth Lift Movement**:
    - **Technique**: Use CSS `transform: translateY()` for high-performance rendering (avoid `top` or `margin`).
    - **Transition Handling**:
      - Apply `transition: transform [duration] linear` to the elevator style.
      - **Duration Logic**: The transition duration *must* match the simulation's `tickDurationMs` to ensure the car reaches the next floor exactly when the logical tick updates.
      - **Easing**: Use `linear` easing for movement between floors to maintain constant speed. Use `ease-in-out` only for start/stop sequences if implementing acceleration physics.
    - **Frame Rate Independence**: The visual position should be decoupled from the logical state updates. While the logic updates every tick, the UI should smoothly interpolate between the old and new positions.
    - **Power Mode**: In Power mode (jumping floors), the transition duration should be adjusted proportionally (e.g., if jumping 2 floors in 1 tick, the speed is visibly faster but smooth).
  - **Door Animations**:
    - **Technique**: CSS `width` or `scaleX` transition on two door panels.
    - **Visual**: Doors should slide open from the center outwards.
    - **Timing**: Open/Close animations should be visually distinctly faster than floor-to-floor travel to feel responsive.
- **Color Coding**:
  - **Idle**: Gray/Neutral.
  - **Active/Moving**: Blue (Normal), Green (Eco), Red/Purple (Power).
  - **Door Open**: Distinct visual state (e.g., "gap" in the box).
- **Hover Effects**:
  - Hovering over an elevator holds the door open (if already open/opening).
  - Tooltips showing precise status (current target, load).
- **Glassmorphism & Styling**:
  - **Panels**: Use `background: rgba(15, 23, 42, 0.6)` with `backdrop-filter: blur(12px)` for major containers (Building View, Control Panel). 
  - **Borders**: Subtle white borders `border: 1px solid rgba(255, 255, 255, 0.1)` to define edges without heaviness.
  - **Shadows**: Soft, diffuse shadows `box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3)` to create depth.
  - **Elevators**: Elevators should feel like "floating" glass pods within the shafts. Use `rgba(255, 255, 255, 0.1)` fill with brighter borders.
  - **Elevator Doors**: Opaque steel grey gradient (`#9ca3af` to `#6b7280`) with solid borders. No transparency to ensure interior is hidden when closed.
  - **Elevator Interior**: Randomly generated dark interior color for each elevator (visible only when doors open).
  - **Buttons**:
    - **Default**: `background: rgba(255, 255, 255, 0.05)`, `border: 1px solid rgba(255, 255, 255, 0.1)`, `backdrop-filter: blur(4px)`.
    - **Hover**: Glow effect `box-shadow: 0 0 10px rgba(56, 189, 248, 0.3)` and slightly lighter background.
    - **Active (Hall Calls)**: Persist glow effect `rgba(74, 222, 128, 0.4)` (Up) or `rgba(251, 146, 60, 0.4)` (Down) until request is fulfilled.
  - **Control Panel**:
    - **Layout**: 2-column Grid for inputs, full-width row for Mode selector.
    - **Inputs**: Glassmorphic style `background: rgba(255, 255, 255, 0.05)`, translucent borders.
    - **Typography**: Uppercase, semi-transparent labels (`0.75rem`) for a technical look.
    - **Spacing**: Compact vertical alignment (reduced gaps/padding) to minimize panel height.
  - **Interactions**:
    - **Select Button**: Only visible when elevator doors are open. Hidden if the car panel is already open.
    - **Car Panel**: Auto-closes after 2 seconds of inactivity. Glass background significantly reduced opacity `rgba(255, 255, 255, 0.05)` to remove dark overlay.
    - **Request Logic**: Hall requests are only marked "Completed" if the serving elevator is moving in the matching direction (or idle). Incompatible requests remain active/glowing until served properly.
- **Responsiveness**:
  - UI scaling to fit the vertical height of the building or scrollable container for high floor counts.

## 4. Requirement Links
- **FR18**: Start, pause, resume, reset.
- **FR19**: Configure floors/elevators.
- **FR20**: Algorithm switching.
- **FR21**: Operation Mode switching.
- **FR22**: Door Open Duration customization.
- **FR23**: Hover-to-hold behavior.
- **FR24**: Detailed Travel Log.
- **NFR1**: Smooth updates.
- **NFR4**: Desktop responsiveness.
