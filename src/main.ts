import './ui/panel.css';
import { createCoach } from './app/coach';
import { runEffects } from './app/effects';
import { initialState, reduce, type Action, type AppState } from './app/state';
import { randomScramble } from './cube/scramble';
import { isSolved } from './cube/state';
import { createBrowserJevClient } from './jev/client';
import { createScene } from './scene/index';
import { solveBeginner } from './solver/beginner/index';
import { createKociembaClient } from './solver/kociembaClient';
import { createPanel } from './ui/panel';

function required(id: string): HTMLElement {
  const node = document.getElementById(id);
  if (node === null) throw new Error(`index.html is missing #${id}`);
  return node;
}

let state: AppState = initialState();

const kociemba = createKociembaClient();
const jev = createBrowserJevClient();

const scene = createScene(required('scene'), {
  onUserMove: (move) => dispatch({ type: 'move', move }),
});

// Camera Presets Overlay
const sceneWrapper = document.getElementById('scene-wrapper');
let autoCamera = true;

if (sceneWrapper) {
  const cameraPresetsBar = document.createElement('div');
  cameraPresetsBar.className = 'scene-camera-presets';
  cameraPresetsBar.innerHTML = `
    <button class="cam-btn active" data-preset="auto" title="Auto-track stage">🎯 Stage View</button>
    <button class="cam-btn" data-preset="bottom" title="View White Cross & bottom layer">⬇ Bottom (Cross)</button>
    <button class="cam-btn" data-preset="top" title="View Yellow Face & top layer">⬆ Top (Last Layer)</button>
    <button class="cam-btn" data-preset="default" title="Balanced perspective view">📐 Home</button>
  `;
  cameraPresetsBar.addEventListener('click', (e) => {
    const target = (e.target as HTMLElement).closest<HTMLButtonElement>('.cam-btn');
    if (!target) return;
    cameraPresetsBar.querySelectorAll('.cam-btn').forEach((b) => b.classList.remove('active'));
    target.classList.add('active');
    const preset = target.dataset.preset;
    if (preset === 'auto') {
      autoCamera = true;
      updateSceneTargeting();
    } else if (preset === 'bottom' || preset === 'top' || preset === 'default' || preset === 'front') {
      autoCamera = false;
      scene.setCameraPreset(preset);
    }
  });
  sceneWrapper.appendChild(cameraPresetsBar);
}

function updateSceneTargeting(): void {
  const currentStep = state.solution?.steps[state.stepIndex];
  if (currentStep) {
    scene.highlightFacelets(currentStep.targetFacelets);
    if (autoCamera) {
      scene.setCameraStage(currentStep.stage);
    }
  } else {
    scene.highlightFacelets([]);
  }
}

let isAutoSolving = false;
let isExecutingStep = false;

async function executeAgentStep(): Promise<void> {
  if (isExecutingStep || scene.isBusy()) return;
  if (state.solution === null) {
    solveTeach();
  }
  if (state.solution === null) return;

  const currentStep = state.solution.steps[state.stepIndex];
  if (!currentStep) {
    isAutoSolving = false;
    panel.setPlaying(false);
    panel.render(state);
    return;
  }

  isExecutingStep = true;
  try {
    // 1. NEURAL INFERENCE FIRST:
    // Request decision from local Laya ModernBERT 421M. Real response payload renders on screen.
    await panel.inferStep(state.cube, currentStep, state.stepIndex, state.solution.steps.length);

    // 2. NOW EXECUTE 3D MOVE:
    dispatch({ type: 'stepNext' });
  } catch (err: unknown) {
    if ((err as Error)?.name !== 'AbortError') {
      console.error('Agent step error:', err);
    }
  } finally {
    isExecutingStep = false;
    if (!isAutoSolving) {
      panel.setPlaying(false);
    }
  }
}

const panel = createPanel(required('panel'), {
  onScramble: () => {
    isAutoSolving = false;
    panel.abortInference();
    panel.setPlaying(false);
    dispatch({ type: 'scramble', moves: randomScramble(25, Math.random) });
    solveTeach();
  },
  onReset: () => {
    isAutoSolving = false;
    panel.abortInference();
    panel.setPlaying(false);
    dispatch({ type: 'reset' });
    updateSceneTargeting();
  },
  onUndo: () => {
    isAutoSolving = false;
    panel.abortInference();
    panel.setPlaying(false);
    dispatch({ type: 'undo' });
    updateSceneTargeting();
  },
  onSolveFast: () => solveFast(),
  onSolveTeach: () => solveTeach(),
  onStepNext: async () => {
    if (scene.isBusy() || isExecutingStep) return;
    if (state.solution === null) {
      solveTeach();
    }
    await executeAgentStep();
  },
  onPlayAll: async () => {
    if (scene.isBusy() || isExecutingStep) return;
    if (state.solution === null) {
      solveTeach();
    }
    if (state.solution === null) return;
    isAutoSolving = true;
    panel.setPlaying(true);
    await executeAgentStep();
  },
  onStop: () => {
    isAutoSolving = false;
    panel.abortInference();
    panel.setPlaying(false);
    dispatch({ type: 'stop' });
  },
});

function solveFast(): void {
  if (scene.isBusy() || isExecutingStep) {
    panel.log('Wait for the current animation to finish');
    return;
  }
  isAutoSolving = false;
  panel.setPlaying(false);
  panel.setStatus('solving (kociemba)…');
  const started = performance.now();
  kociemba
    .solve(state.cube)
    .then((solution) => {
      panel.setStatus(`kociemba: ${Math.round(performance.now() - started)} ms`);
      dispatch({ type: 'solutionReady', solution, mode: 'playing' });
    })
    .catch((error: unknown) => {
      panel.setStatus('idle');
      panel.logError(error instanceof Error ? error.message : String(error));
    });
}

function solveTeach(): void {
  if (scene.isBusy() || isExecutingStep) {
    panel.log('Wait for the current animation to finish');
    return;
  }
  try {
    const started = performance.now();
    const solution = solveBeginner(state.cube);
    panel.setStatus(`beginner: ${Math.round(performance.now() - started)} ms`);
    dispatch({ type: 'solutionReady', solution, mode: 'teach' });
  } catch (error: unknown) {
    panel.logError(error instanceof Error ? error.message : String(error));
  }
}

const coach = createCoach({ jev, kociemba, panel, getState: () => state, dispatch, now: () => performance.now() });

function dispatch(action: Action): void {
  const before = state.cube;
  const { next, effects } = reduce(state, action);
  state = next;
  runEffects(effects, { scene, panel });
  updateSceneTargeting();
  panel.render(state);
  if (action.type === 'move') coach.onUserMove(before, action.move, state.cube);
  else if (state.cube !== before) coach.invalidate();
}

scene.onIdle(() => {
  if (isAutoSolving) {
    if (isSolved(state.cube) || (state.solution && state.stepIndex >= state.solution.steps.length)) {
      isAutoSolving = false;
      panel.setPlaying(false);
      panel.render(state);
    } else {
      setTimeout(() => {
        if (isAutoSolving && !scene.isBusy() && !isExecutingStep) {
          executeAgentStep();
        }
      }, 120);
    }
  } else if (state.solveMode === 'playing') {
    dispatch({ type: 'animationsIdle' });
  }
});
panel.render(state);

// Dev-only hook for browser tests and demos: where a sticker is on screen.
if (import.meta.env.DEV) {
  Object.assign(window, { jevRubik: { projectFacelet: scene.projectFacelet } });
}
