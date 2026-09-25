import type { ModelEngine } from '../../decision/decisionTypes';

export type HeaderHandlers = {
  onScramble(): void;
  onReset(): void;
  onUndo(): void;
  onSolveFast(): void;
  onSolveTeach(): void;
  onStepNext(): void;
  onPlayAll(): void;
  onStop(): void;
  onToggleModel(engine: ModelEngine): void;
};

export type HeaderApi = {
  readonly element: HTMLElement;
  updateState(hasSteps: boolean, isPlaying: boolean, canUndo: boolean): void;
  setModel(engine: ModelEngine): void;
};

export function createHeader(handlers: HeaderHandlers): HeaderApi {
  const container = document.createElement('header');
  container.className = 'studio-header';

  // Left branding
  const brand = document.createElement('div');
  brand.className = 'studio-brand';
  brand.innerHTML = `
    <div class="brand-badge">⚡ LOCAL NEURAL</div>
    <div class="brand-text-col">
      <span class="brand-title">LAYA 421M DECISION STUDIO</span>
      <span class="brand-sub">AUTONOMOUS SYSTEM 1 SPEEDCUBER</span>
    </div>
  `;

  // Model Selector
  const modelToggle = document.createElement('div');
  modelToggle.className = 'model-selector';
  
  const layaBtn = document.createElement('button');
  layaBtn.type = 'button';
  layaBtn.className = 'model-pill active';
  layaBtn.innerHTML = '<span class="pill-dot live"></span>⚡ Laya 421M <span class="pill-meta">Local · 350ms</span>';
  layaBtn.addEventListener('click', () => handlers.onToggleModel('laya'));

  const jevBtn = document.createElement('button');
  jevBtn.type = 'button';
  jevBtn.className = 'model-pill';
  jevBtn.innerHTML = '☁️ Jev 1.13 <span class="pill-meta">API Cloud</span>';
  jevBtn.addEventListener('click', () => handlers.onToggleModel('jev'));

  modelToggle.append(layaBtn, jevBtn);

  // Right Actions: Clear Hierarchy (Hero Primary CTA + Secondary + Ghost Utilities)
  const actions = document.createElement('div');
  actions.className = 'studio-actions';

  const scrambleBtn = createBtn('scramble', '🎲 Scramble', handlers.onScramble, 'studio-btn-secondary');
  const playAllBtn = createBtn('step-play-all', '▶ Auto Solve (Laya)', handlers.onPlayAll, 'studio-btn-hero');
  const stepNextBtn = createBtn('step-next', '⏭ Step Decision', handlers.onStepNext, 'studio-btn-secondary');
  const stopBtn = createBtn('step-stop', '⏹ Stop', handlers.onStop, 'studio-btn-ghost');
  const undoBtn = createBtn('undo', '↩ Undo', handlers.onUndo, 'studio-btn-ghost');
  const resetBtn = createBtn('reset', '↺ Reset', handlers.onReset, 'studio-btn-ghost');

  actions.append(scrambleBtn, playAllBtn, stepNextBtn, stopBtn, undoBtn, resetBtn);
  container.append(brand, modelToggle, actions);

  function createBtn(testId: string, label: string, onClick: () => void, extraClass = ''): HTMLButtonElement {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `studio-btn ${extraClass}`.trim();
    btn.dataset.testid = testId;
    btn.textContent = label;
    btn.addEventListener('click', onClick);
    return btn;
  }

  return {
    element: container,
    setModel(engine) {
      layaBtn.classList.toggle('active', engine === 'laya');
      jevBtn.classList.toggle('active', engine === 'jev');
    },
    updateState(hasSteps, isPlaying, canUndo) {
      stepNextBtn.disabled = isPlaying;
      playAllBtn.disabled = isPlaying;
      stopBtn.disabled = !isPlaying;
      undoBtn.disabled = !canUndo || isPlaying;
      playAllBtn.classList.toggle('running', isPlaying);
    },
  };
}
