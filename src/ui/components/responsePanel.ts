import type { SpeedcuberResponse } from '../../decision/speedcuberPayload';
import { formatCompactJson, highlightJson } from './syntaxHighlight';

export type ResponsePanelApi = {
  readonly element: HTMLElement;
  update(response: SpeedcuberResponse): void;
  showEvaluating(meta: { model: string; step: number; totalSteps: number; stage: string; target: string }): void;
  showReady(message?: string): void;
  showSolved(): void;
};

export function createResponsePanel(): ResponsePanelApi {
  const container = document.createElement('aside');
  container.className = 'studio-panel studio-panel-right';

  const header = document.createElement('div');
  header.className = 'panel-header';
  header.innerHTML = `
    <div class="panel-tag-row">
      <span class="panel-tag">02. SYSTEM 1 DECISION</span>
      <span class="code-status-badge">READY</span>
    </div>
    <div class="panel-title-row">
      <h2 class="panel-title">RESPONSE PAYLOAD</h2>
      <button type="button" class="copy-payload-btn" title="Copy response JSON">📋 Copy</button>
    </div>
    <div class="panel-endpoint-meta">
      <span class="latency-meta">⚡ <strong class="latency-val">-- ms</strong></span>
      <span class="meta-dot">·</span>
      <span>Laya ModernBERT 421M</span>
    </div>
  `;

  const copyBtn = header.querySelector<HTMLButtonElement>('.copy-payload-btn')!;
  const latencyVal = header.querySelector<HTMLElement>('.latency-val')!;
  const statusBadge = header.querySelector<HTMLElement>('.code-status-badge')!;
  let currentJson = '';

  copyBtn.addEventListener('click', () => {
    if (currentJson) {
      navigator.clipboard?.writeText(currentJson);
      copyBtn.textContent = '✓ Copied';
      setTimeout(() => { copyBtn.textContent = '📋 Copy'; }, 1500);
    }
  });

  const codeContainer = document.createElement('div');
  codeContainer.className = 'payload-code-container flex-fill';

  const pre = document.createElement('pre');
  pre.className = 'payload-code full-height';
  codeContainer.appendChild(pre);

  container.append(header, codeContainer);

  return {
    element: container,
    update(response) {
      currentJson = formatCompactJson(response);
      statusBadge.textContent = '200 OK';
      statusBadge.className = 'code-status-badge';
      latencyVal.textContent = `${response.latency_ms.toFixed(1)} ms`;
      pre.innerHTML = highlightJson(response);
    },
    showEvaluating({ model, step, totalSteps, stage, target }) {
      const evaluatingObj = {
        status: 'evaluating',
        engine: model,
        query: 'POST /v1/systemone',
        step: `${step} of ${totalSteps}`,
        stage,
        target_piece: target,
        live_neural_inference: true,
      };
      currentJson = formatCompactJson(evaluatingObj);
      statusBadge.textContent = '⚡ INFERRING...';
      statusBadge.className = 'code-status-badge code-status-inferring';
      latencyVal.textContent = 'running...';
      pre.innerHTML = highlightJson(evaluatingObj);
    },
    showReady(message = 'Click [Step Decision] or [Auto Solve] to run live neural inference.') {
      const readyObj = {
        status: 'ready',
        engine: 'convaiinnovations/laya-modernbert-421m',
        endpoint: 'http://127.0.0.1:8000/v1/systemone',
        message,
      };
      currentJson = formatCompactJson(readyObj);
      statusBadge.textContent = 'READY';
      statusBadge.className = 'code-status-badge';
      latencyVal.textContent = '-- ms';
      pre.innerHTML = highlightJson(readyObj);
    },
    showSolved() {
      const solvedObj = {
        status: 'solved',
        model: 'convaiinnovations/laya-modernbert-421m',
        message: 'All 6 faces in identity state. Cube completely solved!',
      };
      currentJson = formatCompactJson(solvedObj);
      statusBadge.textContent = '✓ SOLVED';
      statusBadge.className = 'code-status-badge code-status-solved';
      latencyVal.textContent = '0.0 ms';
      pre.innerHTML = highlightJson(solvedObj);
    },
  };
}
