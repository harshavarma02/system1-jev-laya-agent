import type { ModelEngine } from '../../decision/decisionTypes';

export type TelemetryApi = {
  readonly element: HTMLElement;
  update(data: {
    status: string;
    stepIndex: number;
    totalSteps: number;
    historyCount: number;
    engine: ModelEngine;
    latencyMs: number;
    isSolved: boolean;
  }): void;
};

export function createTelemetryBar(): TelemetryApi {
  const bar = document.createElement('footer');
  bar.className = 'studio-telemetry-bar';

  const left = document.createElement('div');
  left.className = 'telemetry-group telemetry-left';

  const center = document.createElement('div');
  center.className = 'telemetry-group telemetry-progress';

  const right = document.createElement('div');
  right.className = 'telemetry-group telemetry-right';

  bar.append(left, center, right);

  return {
    element: bar,
    update({ status, stepIndex, totalSteps, historyCount, engine, latencyMs, isSolved }) {
      const pct = totalSteps > 0 ? Math.round((stepIndex / totalSteps) * 100) : isSolved ? 100 : 0;
      
      left.innerHTML = `
        <span class="telemetry-pill ${isSolved ? 'pill-success' : 'pill-active'}">
          ${isSolved ? '✓ SOLVED' : '<span class="telemetry-dot live"></span> SYSTEM 1 READY'}
        </span>
        <span class="telemetry-item">Session Moves: <strong>${historyCount}</strong></span>
      `;

      center.innerHTML = `
        <div class="progress-label">
          <span>PROGRESS</span>
          <span>${stepIndex} / ${totalSteps} (${pct}%)</span>
        </div>
        <div class="progress-track">
          <div class="progress-fill" style="width: ${pct}%"></div>
        </div>
      `;

      right.innerHTML = `
        <span class="telemetry-item">Latency: <strong>${latencyMs.toFixed(1)} ms</strong></span>
        <span class="telemetry-item">Engine: <strong>${engine === 'laya' ? 'Laya ModernBERT 421M' : 'Jev 1.13'}</strong></span>
        <span class="telemetry-item pill-cost">Edge Native · $0.00</span>
      `;
    },
  };
}
