import { ElevatorState } from '../types';
import '../styles.css'; // Ensure we can style it

interface Props {
  elevators: ElevatorState[];
  travelLog: Record<string, number[]>;
  tickDurationMs: number;
}

export function TravelLogPanel({ elevators, travelLog, tickDurationMs }: Props) {
  // We need to render a grid:
  // Col 1: Metric Name
  // Col 2..N: Elevator 1, Elevator 2...

  // Calculate Totals
  const totalTicks = elevators.reduce((sum, e) => sum + e.stats.totalTravelTime, 0);
  const totalPower = elevators.reduce((sum, e) => sum + e.stats.powerConsumed, 0);

  // Convert total ticks to minutes: (ticks * ms/tick) / 60000
  const totalTimeMin = ((totalTicks * tickDurationMs) / 60000).toFixed(2);

  return (
    <div className="panel log-panel">
      <h2>Travel Log & Stats</h2>
      <div
        className="log-grid"
        style={{
          gridTemplateColumns: `auto repeat(${elevators.length}, 1fr)`
        }}
      >
        {/* Header Row */}
        <div className="log-cell log-header-cell">Metric</div>
        {elevators.map(e => (
          <div key={e.id} className="log-cell log-header-cell">{e.id}</div>
        ))}

        {/* Row 1: Travel Time */}
        <div className="log-cell log-label-cell">Moving Time</div>
        {elevators.map(e => (
          <div key={e.id} className="log-cell">{e.stats.totalTravelTime} ticks</div>
        ))}

        {/* Row 2: Power */}
        <div className="log-cell log-label-cell">Power Consumed</div>
        {elevators.map(e => (
          <div key={e.id} className="log-cell">{e.stats.powerConsumed.toFixed(1)} units</div>
        ))}

        {/* Row 3: Sequence */}
        <div className="log-cell log-label-cell">Log Sequence</div>
        {elevators.map(e => {
          const seq = travelLog[e.id] || [];
          return (
            <div key={e.id} className="log-cell log-sequence-cell">
              {seq.length === 0 ? '-' : seq.join(' → ')}
            </div>
          );
        })}
      </div>

      <div className="log-summary">
        <h3>Overall System Usage</h3>
        <div className="summary-row">
          <span>Total Moving Time:</span>
          <strong>{totalTimeMin} minutes</strong>
        </div>
        <div className="summary-row">
          <span>Total Power Consumed:</span>
          <strong>{totalPower.toFixed(1)} units</strong>
        </div>
      </div>
    </div>
  );
}
