const elevatorColorMap: Record<string, string> = {};

export function getElevatorColor(id: string): string {
    if (!elevatorColorMap[id]) {
        // Generate a Dark random color
        // Low HSL lightness for dark interior
        const hue = Math.floor(Math.random() * 360);
        const saturation = 30 + Math.floor(Math.random() * 20); // 30-50% - muted
        const lightness = 15 + Math.floor(Math.random() * 10);  // 15-25% - dark
        elevatorColorMap[id] = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    }
    return elevatorColorMap[id];
}
