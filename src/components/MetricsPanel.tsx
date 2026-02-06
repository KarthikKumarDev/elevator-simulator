import type { Metrics } from '../types';

interface Props {
  metrics: Metrics;
}

export function MetricsPanel({ metrics }: Props) {
  return (
    <div className="panel metrics-panel">
      <h2>Metrics</h2>
      <div className="metrics-grid">
        <Metric label="Total Requests" value={metrics.totalRequests} />
        <Metric label="Avg Wait (ticks)" value={metrics.avgWaitTime.toFixed(1)} />
        <Metric label="Max Wait (ticks)" value={metrics.maxWaitTime.toFixed(1)} />
      </div>
    </div>
  );
}

interface MetricProps {
  label: string;
  value: number | string;
}

function Metric({ label, value }: MetricProps) {
  return (
    <div className="metric">
      <div className="metric-label">{label}</div>
      <div className="metric-value">{value}</div>
    </div>
  );
}

