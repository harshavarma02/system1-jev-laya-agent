import { extractCubeMatrix } from '../cube/matrix';
import { isSolved } from '../cube/state';
import type { CubeState } from '../cube/types';
import type { AgentMemory } from '../decision/agentMemory';
import { solveWhiteCorners } from '../solver/beginner/corners';
import { solveWhiteCross } from '../solver/beginner/cross';
import { solveYellowCorners, solveYellowCross, solveYellowEdges, solveYellowFace } from '../solver/beginner/lastLayer';
import { solveMiddleEdges } from '../solver/beginner/middle';
import type { StageResult } from '../solver/beginner/pieces';
import type { Stage } from '../solver/types';
import type { SensoryObservation } from './types';

const STAGE_EVALUATORS: readonly { readonly stage: Stage; readonly fn: (cube: CubeState) => StageResult }[] = [
  { stage: 'white_cross', fn: solveWhiteCross },
  { stage: 'white_corners', fn: solveWhiteCorners },
  { stage: 'middle_edges', fn: solveMiddleEdges },
  { stage: 'yellow_cross', fn: solveYellowCross },
  { stage: 'yellow_face', fn: solveYellowFace },
  { stage: 'yellow_corners', fn: solveYellowCorners },
  { stage: 'yellow_edges', fn: solveYellowEdges },
];

export const STAGE_TITLES: Readonly<Record<Stage, { title: string; subgoal: string; milestone?: string }>> = {
  white_cross: {
    title: 'Stage 1: The White Cross',
    subgoal: 'Align white edge side colors with center pieces and flip into place',
    milestone: 'The Daisy & White Cross Locked',
  },
  white_corners: {
    title: 'Stage 2: White Corners (First Layer)',
    subgoal: 'Place corner above target slot and insert with Righty or Lefty algorithm',
    milestone: 'First Layer Complete & Locked',
  },
  middle_edges: {
    title: 'Stage 3: Second Layer Edges',
    subgoal: 'Move edge away from target slot, trigger algorithm, then insert corner',
    milestone: 'First Two Layers (F2L) Locked',
  },
  yellow_cross: {
    title: 'Stage 4: Yellow Cross',
    subgoal: 'Form a yellow cross on top face using front turn + Righty Algorithm',
    milestone: 'Yellow Cross Formed & Locked',
  },
  yellow_face: {
    title: 'Stage 5: Orient Yellow Face (Sune)',
    subgoal: 'Orient all yellow stickers facing upwards',
    milestone: 'Full Yellow Face Oriented',
  },
  yellow_corners: {
    title: 'Stage 6: Permute Yellow Corners (Niklas)',
    subgoal: 'Cycle yellow corners until every corner sits between its matching centers',
    milestone: 'All 8 Corners Permuted & Locked',
  },
  yellow_edges: {
    title: 'Stage 7: Permute Yellow Edges (U-Perm)',
    subgoal: 'Cycle remaining yellow edges to finish the entire cube',
    milestone: 'All 6 Faces Completely Solved',
  },
  optimal: {
    title: 'Optimal Math Solution',
    subgoal: 'Execute shortest kociemba path',
  },
};

export function sense(cube: CubeState, memory: AgentMemory): SensoryObservation {
  const matrix = extractCubeMatrix(cube);
  const solved = isSolved(cube);

  let detectedStage: Stage = 'white_cross';
  if (!solved) {
    for (const item of STAGE_EVALUATORS) {
      const result = item.fn(cube);
      if (result.steps.length > 0) {
        detectedStage = item.stage;
        break;
      }
    }
  } else {
    detectedStage = 'yellow_edges';
  }

  const meta = STAGE_TITLES[detectedStage] ?? STAGE_TITLES.white_cross;

  return {
    cube,
    matrix,
    isSolved: solved,
    detectedStage,
    stageTitle: meta.title,
    defaultSubgoal: meta.subgoal,
    milestoneLock: meta.milestone,
    memory,
    timestamp: Date.now(),
  };
}
