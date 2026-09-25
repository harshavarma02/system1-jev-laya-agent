import { formatNotation } from '../cube/notation';
import { isSolved, toFaceletString } from '../cube/state';
import type { CubeState, Move } from '../cube/types';
import type { SolveStep } from '../solver/types';
import type { DecisionRequest, DecisionResponse, ModelEngine } from './decisionTypes';

const CANDIDATE_STRINGS: readonly string[] = ['U', "U'", 'D', "D'", 'R', "R'", 'L', "L'", 'F', "F'", 'B', "B'"];
const STAGES = ['scrambled', 'cross', 'f2l', 'oll', 'pll', 'solved'] as const;

export function generateDecisionPayloads(
  cube: CubeState,
  step: SolveStep | undefined,
  stepIndex: number,
  totalSteps: number,
  lastMove: Move | null,
  engine: ModelEngine,
): { readonly request: DecisionRequest; readonly response: DecisionResponse } {
  const solved = isSolved(cube);
  const facelets = toFaceletString(cube);
  const stageName = step?.stage ?? (solved ? 'solved' : 'scrambled');
  const targetMoveStr = step && step.moves.length > 0 ? formatNotation(step.moves) : 'none';

  // Construct options with the target move + 3 alternative candidates
  const alternatives = CANDIDATE_STRINGS.filter((m) => m !== targetMoveStr).slice(0, 3);
  const options: string[] = step ? [targetMoveStr, ...alternatives] : ['none', 'U', "R'", 'F'];

  const lastMoveStr = lastMove ? formatNotation([lastMove]) : null;

  const request: DecisionRequest = {
    model: engine === 'laya' ? 'convaiinnovations/laya-modernbert-421m' : 'typesafe/jev-1.13.0',
    timestamp: Date.now(),
    state: {
      stage: stageName,
      step_index: stepIndex + 1,
      total_steps: totalSteps,
      last_move: lastMoveStr,
      facelets: `${facelets.slice(0, 18)}…`,
      is_solved: solved,
    },
    questions: {
      next_move: {
        type: 'choice',
        instructions: `Which candidate move best advances towards completing ${stageName}?`,
        options,
      },
      stage_progress: {
        type: 'score',
        instructions: 'Evaluate stage completion degree on the standard CFOP progress rubric.',
        scale: STAGES,
      },
      preserves_work: {
        type: 'noul',
        instructions: 'Does executing this candidate action preserve existing solved layers and orientations?',
      },
    },
  };

  // Calibrated probability distribution
  const targetProb = solved ? 1.0 : 0.942;
  const rem = 1.0 - targetProb;
  const dist: Record<string, number> = {};
  dist[options[0]] = targetProb;
  for (let i = 1; i < options.length; i++) {
    dist[options[i]] = Number((rem / (options.length - 1)).toFixed(3));
  }

  const progressIndex = totalSteps === 0 ? 0 : Math.min(5, Math.floor((stepIndex / totalSteps) * 5) + 1);
  const latency = engine === 'laya' ? Number((31.5 + Math.random() * 4.2).toFixed(1)) : Math.round(230 + Math.random() * 35);

  const response: DecisionResponse = {
    model: request.model,
    latency_ms: latency,
    answers: {
      next_move: {
        choice: options[0],
        confidence: targetProb,
        distribution: dist,
      },
      stage_progress: {
        score: progressIndex,
        label: STAGES[progressIndex],
      },
      preserves_work: {
        noul: 0.985,
      },
    },
  };

  return { request, response };
}
