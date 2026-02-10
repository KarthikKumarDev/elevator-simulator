# Elevator Simulation UI Specification

## 1. UI Design Goals
- **Interactive**: Allows real-time interaction with the building and elevators.
- **Visual**: Provides clear visual feedback on elevator state (moving, idle, doors).
- **Control**: Offers comprehensive controls for simulation configuration and execution.
- **Responsive**: Adapts to standard desktop resolutions (mobile-friendly at < 900px).
- **Aesthetic (Glassmorphism)**: Use translucent backgrounds, blur effects (`backdrop-filter`), and subtle borders to create a modern, premium look.
- **Debug-Friendly**: Integrated debug modal for system log inspection and JSON export.
- **Maintainable**: Follow coding standards (see `guides/coding_standards.md`), including the **150-line component limit** for better modularity and reusability.

## 2. Main Layout Structure

### Application Root (`app-root`)
- **Container**: Full viewport height with column flex layout
- **Padding**: 1.5rem all around
- **Background**: Radial gradient from `#0f172a` to `#020617` (dark blue-black)
- **Typography**: Inter font family with system fallbacks

### Header (`app-header`)
- **Title**: 1.8rem, weight 800, gradient text (white to `#94a3b8`)
- **Subtitle**: Gray color (`#9ca3af`) describing the application purpose
- **Action Buttons** (top-right, absolute positioned):
  - **Debug Button**: Yellow-tinted (`rgba(234, 179, 8, 0.1)`) with yellow text and border
  - **Tests Button**: Glassmorphic white with navigation to `/tests`
  - **Guides Button**: Glassmorphic white with navigation to `/guides`
  - All buttons: 0.5rem padding, 6px border-radius, backdrop-filter blur(5px)

### Main Content (`app-main`)
- **Layout**: CSS Grid with 2 columns
  - Left: `minmax(0, 2fr)` - Building visualization
  - Right: `minmax(280px, 1fr)` - Control panels
- **Gap**: 1.5rem between columns
- **Responsive**: Stacks to single column at < 900px viewport width

### Left Panel: Building Visualization (`app-main-left`)
- **Container Style**:
  - Background: `rgba(15, 23, 42, 0.6)` with `backdrop-filter: blur(12px)`
  - Border: 1px solid `rgba(255, 255, 255, 0.1)`
  - Border-radius: 1rem
  - Box-shadow: `0 8px 32px rgba(0, 0, 0, 0.3)`
  - Padding: 1rem
  - Max-height: `calc(100vh - 180px)`

#### Floor Controls Column
- **Layout**: Vertical flex container with space-between
- **Floor Rows**: Each floor has:
  - **Floor Label**: 0.8rem, gray (`#9ca3af`), 60px width, right-aligned, weight 600
  - **Hall Call Buttons**: Vertical stack with 0.2rem gap
    - **UP Button** (↑): Green color (`#4ade80`), disabled on top floor
    - **DOWN Button** (↓): Orange color (`#fb923c`), disabled on floor 1
    - **Active State**: Glowing background with matching color shadow
      - UP Active: `rgba(74, 222, 128, 0.2)` background, `0 0 15px rgba(74, 222, 128, 0.4)` shadow
      - DOWN Active: `rgba(251, 146, 60, 0.2)` background, `0 0 15px rgba(251, 146, 60, 0.4)` shadow

#### Elevator Shafts Container
- **Layout**: Horizontal flex with 1rem gap
- **Shaft Style**:
  - Background: `rgba(255, 255, 255, 0.03)` (extremely subtle)
  - Border: 1px solid `rgba(255, 255, 255, 0.05)`
  - Border-radius: 6px
  - Position: relative (for absolute-positioned cars)
  - **Floor Markers**: Dashed horizontal lines (`rgba(255, 255, 255, 0.1)`) dividing floors

#### Elevator Car
- **Structure**:
  - **Header** (16px height):
    - Background: `rgba(30, 41, 59, 0.9)` with backdrop-filter blur(4px)
    - Border-radius: 4px 4px 0 0
    - Contains: Elevator ID (white, bold) and Direction symbol (cyan `#38bdf8`, bold)
    - Direction symbols: ↑ (up), ↓ (down), • (idle)
  - **Cabin**:
    - Background: `rgba(255, 255, 255, 0.1)` with backdrop-filter blur(4px)
    - Border: 1px solid `rgba(255, 255, 255, 0.2)`
    - Border-radius: 0 0 4px 4px
    - Box-shadow: `0 4px 12px rgba(0, 0, 0, 0.3)`
    - Overflow: hidden (for door animations)

- **Interior**:
  - Randomly generated dark color per elevator (HSL: hue 0-360°, saturation 30-50%, lightness 15-25%)
  - Visible only when doors are open
  - Contains "Select" button when doors are open and car panel is closed

- **Doors**:
  - **Material**: Opaque steel grey gradient (`linear-gradient(90deg, #9ca3af, #6b7280, #9ca3af)`)
  - **Border**: 1px solid `#4b5563`
  - **Animation**: 450ms cubic-bezier(0.4, 0, 0.2, 1) transition
  - **States**:
    - Closed/Closing: translateX(0)
    - Open/Opening: translateX(±90%) (left door -90%, right door +90%)
  - **Split**: Two 50% width panels sliding from center

- **Movement**:
  - **Technique**: CSS `transform: translateY()` for GPU acceleration
  - **Transition**: `transform ${tickDurationMs}ms linear`
  - **Position Calculation**: `translateY(${(maxFloor - currentFloor) * 100}%)`
  - **Height**: `${100 / maxFloor}%` per floor

- **Car Panel Popover**:
  - **Trigger**: Click "Select" button when doors are open
  - **Position**: Centered over elevator car
  - **Style**:
    - Background: `rgba(255, 255, 255, 0.05)` with backdrop-filter blur(16px)
    - Border: 1px solid `rgba(255, 255, 255, 0.15)`
    - Box-shadow: `0 20px 50px rgba(0, 0, 0, 0.5)`
    - Border-radius: 12px
  - **Layout**: 4-column grid with 0.4rem gap
  - **Floor Buttons**:
    - Current floor: disabled
    - Active (in targetFloors): `rgba(56, 189, 248, 0.6)` background with glow
  - **Auto-close**: 2 seconds after last interaction

### Right Panel: Controls & Metrics (`app-main-right`)
- **Same glassmorphic container style as left panel**
- **Contains**: 3 sub-panels stacked vertically

#### Control Panel
- **Configuration Grid**: 2-column layout with 0.6rem gap
  - **Floors Input**: Number input, min 2, max 30
  - **Elevators Input**: Number input, min 1, max 8
  - **Tick Duration**: Number input, min 100ms, max 2000ms, step 100
  - **Door Open Ticks**: Number input, min 1, max 10
  - **Mode Selector**: Full-width dropdown (grid-column: span 2)
    - Options: "Eco Mode (Energy Efficient)", "Normal Mode", "Power Mode (High Performance)"

- **Input Styling**:
  - Background: `rgba(255, 255, 255, 0.05)`
  - Border: 1px solid `rgba(255, 255, 255, 0.1)`
  - Border-radius: 6px
  - Padding: 0.4rem 0.6rem
  - Font-size: 0.9rem
  - Focus: Background `rgba(255, 255, 255, 0.1)`, border `rgba(56, 189, 248, 0.5)`, glow shadow

- **Labels**:
  - Font-size: 0.75rem
  - Color: `rgba(255, 255, 255, 0.7)`
  - Text-transform: uppercase
  - Letter-spacing: 0.5px
  - Font-weight: 500

- **Control Buttons**:
  - **Layout**: 2-column grid with 0.5rem gap
  - **Start/Pause Button**:
    - Primary state: Gradient background `linear-gradient(135deg, #38bdf8, #6366f1)`
    - Hover: Enhanced shadow `0 6px 20px rgba(99, 102, 241, 0.5)`
  - **Reset Button**: Standard glassmorphic style
  - All buttons: Uppercase text, 0.85rem, weight 600, letter-spacing 0.5px

#### Metrics Panel
- **Layout**: 3-column grid with 0.6rem gap
- **Metrics Displayed**:
  - Total Requests (number)
  - Avg Wait (ticks, 1 decimal)
  - Max Wait (ticks, 1 decimal)
- **Metric Card Style**:
  - Background: `rgba(255, 255, 255, 0.03)`
  - Border: 1px solid `rgba(255, 255, 255, 0.05)`
  - Border-radius: 0.5rem
  - Padding: 0.6rem
  - Center-aligned content
- **Label**: 0.7rem, uppercase, `rgba(255, 255, 255, 0.6)`, letter-spacing 0.5px
- **Value**: 1.4rem, weight 700, cyan color (`#38bdf8`)

#### Travel Log & Stats Panel
- **Grid Layout**: Dynamic columns `auto repeat(${elevatorCount}, 1fr)`
- **Rows**:
  1. **Header Row**: Metric label + elevator IDs
  2. **Moving Time**: Ticks per elevator
  3. **Power Consumed**: Units (1 decimal) per elevator
  4. **Log Sequence**: Floor sequence (e.g., "1 → 2 → 3 → 5")

- **Cell Styling**:
  - Background: `rgba(15, 23, 42, 0.8)`
  - Padding: 0.5rem
  - Font-size: 0.8rem
  - Grid gap: 1px with `rgba(255, 255, 255, 0.1)` background (creates borders)
  - Header cells: `rgba(30, 41, 59, 1)` background, cyan text

- **Summary Section**:
  - Total Moving Time (converted to minutes)
  - Total Power Consumed (units)

## 3. Debug Modal

### Trigger
- Click "Debug" button in header (yellow-tinted)

### Modal Structure
- **Overlay**: Fixed position, full viewport
  - Background: `rgba(0, 0, 0, 0.7)` with backdrop-filter blur(5px)
  - Z-index: 1000
  - Centered flex container

- **Modal Window**:
  - Background: `#1E293B` (dark slate)
  - Border: 1px solid `#334155`
  - Border-radius: 12px
  - Box-shadow: `0 25px 50px -12px rgba(0, 0, 0, 0.25)`
  - Size: 80% width (max 800px), 80% height

- **Header**:
  - Title: "System Debug Logs" (1.25rem, white)
  - **Copy JSON Button**: 
    - Default: `rgba(148, 163, 184, 0.1)` background, gray text
    - Copied state: `rgba(34, 197, 94, 0.2)` background, green text (`#4ADE80`)
    - Auto-revert after 2 seconds
  - **Close Button** (×): Large transparent button

- **Log Content**:
  - Background: `#0F172A` (very dark)
  - Color: `#22C55E` (matrix/terminal green)
  - Font-family: monospace
  - Font-size: 0.9rem
  - Scrollable overflow
  - Content: Pretty-printed JSON (2-space indent)

- **Footer**:
  - Entry count display
  - Color: `#64748B` (muted gray)
  - Font-size: 0.8rem

## 4. Visual Feedback & Interactions

### Animations
- **Elevator Movement**:
  - Linear transition matching `tickDurationMs`
  - Smooth translateY transform (GPU-accelerated)
  - No easing for constant speed between floors
  
- **Door Animations**:
  - 450ms cubic-bezier(0.4, 0, 0.2, 1) easing
  - Slide from center outwards (90% translation)
  - Faster than floor-to-floor travel for responsiveness

- **Button Hover**:
  - Background lightens to `rgba(255, 255, 255, 0.1)`
  - Border color changes to `rgba(56, 189, 248, 0.5)`
  - Glow shadow: `0 0 15px rgba(56, 189, 248, 0.3)`
  - Slight upward translation: `translateY(-1px)`
  - All transitions: 0.2s ease

### Color Coding
- **Idle Elevator**: Gray/neutral tones
- **Active/Moving**: Cyan (`#38bdf8`) direction indicator
- **UP Requests**: Green (`#4ade80`)
- **DOWN Requests**: Orange (`#fb923c`)
- **Door Open**: Interior color visible through gap
- **Mode-specific** (future): Eco (green), Normal (blue), Power (red/purple)

### Hover Effects
- **Elevator Hover**: Triggers `setElevatorHover` to hold doors open if already open/opening
- **Button Hover**: Glow effect and elevation
- **Input Focus**: Border color change and subtle glow

### Glassmorphism Design System
- **Major Containers**: `rgba(15, 23, 42, 0.6)` + blur(12px)
- **Sub-panels**: `rgba(255, 255, 255, 0.03)` + subtle borders
- **Buttons**: `rgba(255, 255, 255, 0.05)` + blur(4px)
- **Borders**: `rgba(255, 255, 255, 0.1)` for definition
- **Shadows**: `0 8px 32px rgba(0, 0, 0, 0.3)` for depth
- **Elevator Cabin**: `rgba(255, 255, 255, 0.1)` + blur(4px) - floating glass pod
- **Car Popover**: `rgba(255, 255, 255, 0.05)` + blur(16px) - enhanced blur for overlay

### Request State Logic
- **Hall Requests**: 
  - Active when in `pendingRequests` OR `activeRequests`
  - Glow persists until request is fulfilled
  - Only marked complete when elevator arrives moving in matching direction (or idle)
- **Car Requests**:
  - Active when floor is in elevator's `targetFloors` array
  - Highlighted in car panel popover

## 5. Component Architecture

### BuildingView Component
- **Props**: state, maxFloor, tickDurationMs, event handlers
- **Structure**:
  - Floor controls column (left)
  - Shafts container (right)
  - Per-elevator: shaft, floor markers, car, doors, interior, popover
- **State Management**: Controlled component, all state lifted to parent

### ControlPanel Component
- **Props**: config, running state, event handlers
- **Features**:
  - 2-column grid for inputs
  - Full-width mode selector
  - Start/Pause toggle button
  - Reset button

### MetricsPanel Component
- **Props**: metrics object
- **Display**: 3-column grid of metric cards
- **Formatting**: Numbers with appropriate decimal places

### TravelLogPanel Component
- **Props**: elevators array, travelLog object, tickDurationMs
- **Features**:
  - Dynamic grid based on elevator count
  - Per-elevator stats (moving time, power, sequence)
  - Overall system summary (total time in minutes, total power)

### DebugModal Component
- **Props**: isOpen, onClose, logs array
- **Features**:
  - Copy to clipboard functionality
  - Pretty-printed JSON display
  - Entry count footer
  - Click outside to close (overlay click)

## 6. Responsive Design
- **Breakpoint**: 900px
- **Below 900px**: 
  - Main grid switches to single column
  - Building view and controls stack vertically
- **Scaling**: Building container uses max-height to prevent overflow
- **Font Sizes**: Rem-based for accessibility

## 7. Accessibility Considerations
- **Semantic HTML**: Proper heading hierarchy (h1, h2)
- **Labels**: All inputs have associated labels with htmlFor
- **Disabled States**: Visual indication (opacity 0.2) and cursor default
- **Focus States**: Clear visual feedback with border and shadow
- **Color Contrast**: High contrast text on dark backgrounds
- **Keyboard Navigation**: All interactive elements are focusable

## 8. Performance Optimizations
- **GPU Acceleration**: Transform-based animations (translateY, translateX)
- **Transition Timing**: Matches simulation tick for smooth movement
- **Conditional Rendering**: Car panel only renders when open
- **Refs for State**: Running state in ref to avoid interval recreation
- **Memoization**: maxFloor memoized with useMemo

## 9. Requirement Links
- **FR18**: Start, pause, resume, reset controls
- **FR19**: Configure floors/elevators via inputs
- **FR20**: Algorithm switching (future - currently mode only)
- **FR21**: Operation Mode switching (Eco/Normal/Power dropdown)
- **FR22**: Door Open Duration customization (doorOpenTicks input)
- **FR23**: Hover-to-hold behavior (onElevatorHover handler)
- **FR24**: Detailed Travel Log (TravelLogPanel component)
- **NFR1**: Smooth updates (GPU-accelerated animations)
- **NFR4**: Desktop responsiveness (grid layout, 900px breakpoint)
- **Debug**: System log inspection via Debug modal with JSON export

## 10. Future Enhancements
- **Algorithm Visualization**: Visual indicators for FCFS, SCAN, LOOK
- **Passenger Avatars**: Visual representation of passengers in cars
- **Sound Effects**: Door chimes, movement sounds
- **Dark/Light Mode Toggle**: Theme switching
- **Advanced Metrics**: Charts and graphs for performance over time
- **Export Functionality**: CSV/JSON export of metrics and logs
