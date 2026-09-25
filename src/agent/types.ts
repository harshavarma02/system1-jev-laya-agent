import type { CubeMatrixState } from '../cube/matrix';
import type { CubeState, Move } from '../cube/types';
import type { Stage } from '../solver/types';
import type { AgentMemory } from '../decision/agentMemory';

export type SensoryObservation = {
  readonly cube: CubeState;
  readonly matrix: CubeMatrixState;
  readonly isSolved: boolean;
  readonly detectedStage: Stage;
  readonly stageTitle: string;
  readonly defaultSubgoal: string;
  readonly milestoneLock?: string;
  readonly memory: AgentMemory;
  readonly timestamp: number;
};

export type CandidateAlgorithm = {
  readonly name: string;
  readonly formula: string;
  readonly moves: readonly Move[];
  readonly targetFacelets: readonly number[];
  readonly plainEnglishMoves: readonly string[];
  readonly rule: string;
  readonly reasoning: string;
};

export type LayaDecision = {
  readonly engine: string;
  readonly latencyMs: number;
  readonly stageTitle: string;
  readonly detectedCase: string;
  readonly selectedAlgorithm: CandidateAlgorithm;
  readonly confidence: number;
  readonly probabilities: Readonly<Record<string, number>>;
  readonly groundedReasoning: string;
  readonly speedcuberRule: string;
};

export type AgentCycleResult = {
  readonly observation: SensoryObservation;
  readonly decision: LayaDecision;
  readonly nextCube: CubeState;
  readonly movesToAnimate: readonly Move[];
  readonly updatedMemory: AgentMemory;
};
