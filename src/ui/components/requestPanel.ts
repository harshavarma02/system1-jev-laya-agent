import type { SpeedcuberRequest } from '../../decision/speedcuberPayload';
import { formatCompactJson, highlightJson } from './syntaxHighlight';

export type RequestPanelApi = {
  readonly element: HTMLElement;
  update(request: SpeedcuberRequest): void;
};

export function createRequestPanel(): RequestPanelApi {
  const container = document.createElement('aside');
  container.className = 'studio-panel studio-panel-left';

  const header = document.createElement('div');
  header.className = 'panel-header';
  header.innerHTML = `
    <div class="panel-tag-row">
      <span class="panel-tag">01. SPATIAL &amp; MEMORY STREAM</span>
      <span class="code-method-badge">POST</span>
    </div>
    <div class="panel-title-row">
      <h2 class="panel-title">REQUEST PAYLOAD</h2>
      <button type="button" class="copy-payload-btn" title="Copy request JSON">📋 Copy</button>
    </div>
    <div class="panel-endpoint-meta">
      <code>/v1/systemone</code>
      <span class="meta-dot">·</span>
      <span>6-Face Matrix + Memory</span>
    </div>
  `;

  const copyBtn = header.querySelector<HTMLButtonElement>('.copy-payload-btn')!;
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
    update(request) {
      currentJson = formatCompactJson(request);
      pre.innerHTML = highlightJson(request);
    },
  };
}
