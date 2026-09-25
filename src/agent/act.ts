import { applyMoves, isSolved } from '../cube/state';
import type { CubeState } from '../cube/types';
import { recordAgentAction, type AgentMemory } from '../decision/agentMemory';
import { sense } from './sense';
import type { AgentCycleResult, LayaDecision, SensoryObservation } from './types';

export function act(
  obs: SensoryObservation,
  decision: LayaDecision,
  currentMemory: AgentMemory,
  stepIndex: number,
): AgentCycleResult {
  const algo = decision.selectedAlgorithm;
  const nextCube: CubeState = algo.moves.length > 0 ? applyMoves(obs.cube, algo.moves) : obs.cube;

  let updatedMemory: AgentMemory = currentMemory;
  if (algo.moves.length > 0) {
    updatedMemory = recordAgentAction(
      updatedMemory,
      {
        stepIndex,
        algorithmName: algo.name,
        formula: algo.formula,
        description: `Executed ${algo.name} (${algo.formula})`,
      },
      false,
    );
  }

  if (obs.milestoneLock && !updatedMemory.lockedMilestones.includes(obs.milestoneLock)) {
    updatedMemory = {
      ...updatedMemory,
      lockedMilestones: [...updatedMemory.lockedMilestones, obs.milestoneLock],
    };
  }

  if (isSolved(nextCube)) {
    updatedMemory = {
      ...updatedMemory,
      lockedMilestones: Array.from(new Set([...updatedMemory.lockedMilestones, 'All 6 Faces Completely Solved'])),
    };
  }

  return {
    observation: obs,
    decision,
    nextCube,
    movesToAnimate: algo.moves,
    updatedMemory,
  };
}
