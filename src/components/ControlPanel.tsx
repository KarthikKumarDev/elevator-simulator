import type { BuildingConfig } from '../types';

interface Props {
  config: BuildingConfig;
  running: boolean;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onConfigChange: (config: BuildingConfig) => void;
}

export function ControlPanel({
  config,
  running,
  onStart,
  onPause,
  onReset,
  onConfigChange
}: Props) {
  const handleNumberChange =
    (field: keyof BuildingConfig) =>
      (e: React.ChangeEvent<HTMLInputElement>): void => {
        const value = Number(e.target.value) || 0;
        const next: BuildingConfig = { ...config, [field]: value };
        onConfigChange(next);
      };

  return (
    <div className="panel control-panel">
      <h2>Controls</h2>

      <div className="control-group">
        <div className="control-row">
          <label htmlFor="floors-input">Floors</label>
          <input
            id="floors-input"
            type="number"
            min={2}
            max={30}
            value={config.floors}
            onChange={handleNumberChange('floors')}
          />
        </div>

        <div className="control-row">
          <label htmlFor="elevators-input">Elevators</label>
          <input
            id="elevators-input"
            type="number"
            min={1}
            max={8}
            value={config.elevators}
            onChange={handleNumberChange('elevators')}
          />
        </div>

        <div className="control-row">
          <label htmlFor="tick-input">Tick (ms)</label>
          <input
            id="tick-input"
            type="number"
            min={100}
            max={2000}
            step={100}
            value={config.tickDurationMs}
            onChange={handleNumberChange('tickDurationMs')}
          />
        </div>

        <div className="control-row">
          <label htmlFor="door-open-input">Door Open (ticks)</label>
          <input
            id="door-open-input"
            type="number"
            min={1}
            max={10}
            value={config.doorOpenTicks}
            onChange={handleNumberChange('doorOpenTicks')}
          />
        </div>

        <div className="control-row full-width">
          <label htmlFor="mode-select">Mode</label>
          <select
            id="mode-select"
            value={config.mode}
            onChange={(e) =>
              onConfigChange({ ...config, mode: e.target.value as any })
            }
          >
            <option value="eco">Eco Mode (Energy Efficient)</option>
            <option value="normal">Normal Mode</option>
            <option value="power">Power Mode (High Performance)</option>
          </select>
        </div>
      </div>

      <div className="control-buttons-row">
        {!running ? (
          <button className="primary" onClick={onStart}>
            Start
          </button>
        ) : (
          <button onClick={onPause}>Pause</button>
        )}
        <button onClick={onReset}>Reset</button>
      </div>
    </div>
  );
}

