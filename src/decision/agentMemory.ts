/**
 * Agent Memory & Trajectory Tracking
 * Tracks sliding window history, locked milestones, and cycle repetitions.
 * Compliance: RULES.md § 1 (SRP) & § 6 (<300 lines)
 */

export type AgentActionRecord = {
  readonly stepIndex: number;
  readonly algorithmName: string;
  readonly formula: string;
  readonly description: string;
};

export type AgentMemory = {
  readonly currentStage: string;
  readonly activeSubgoal: string;
  readonly lockedMilestones: readonly string[];
  readonly recentActionHistory: readonly AgentActionRecord[];
  readonly slotCycleCount: number;
  readonly unproductiveStreak: number;
  readonly totalExecutions: number;
};

const MAX_HISTORY_WINDOW = 4;

export function initialAgentMemory(): AgentMemory {
  return {
    currentStage: 'Stage 1: The White Cross',
    activeSubgoal: 'Form the daisy on yellow face and align white edges with matching side centers',
    lockedMilestones: [],
    recentActionHistory: [],
    slotCycleCount: 0,
    unproductiveStreak: 0,
    totalExecutions: 0,
  };
}

export function recordAgentAction(
  memory: AgentMemory,
  record: AgentActionRecord,
  isSameSlot: boolean,
): AgentMemory {
  const updatedHistory = [record, ...memory.recentActionHistory].slice(0, MAX_HISTORY_WINDOW);
  return {
    ...memory,
    recentActionHistory: updatedHistory,
    slotCycleCount: isSameSlot ? memory.slotCycleCount + 1 : 0,
    totalExecutions: memory.totalExecutions + 1,
  };
}

export function updateAgentStage(
  memory: AgentMemory,
  stage: string,
  subgoal: string,
  newMilestone?: string,
): AgentMemory {
  const milestones = newMilestone && !memory.lockedMilestones.includes(newMilestone)
    ? [...memory.lockedMilestones, newMilestone]
    : memory.lockedMilestones;

  return {
    ...memory,
    currentStage: stage,
    activeSubgoal: subgoal,
    lockedMilestones: milestones,
    slotCycleCount: 0,
  };
}

export function resetAgentMemory(isSolved = false): AgentMemory {
  if (isSolved) {
    return {
      currentStage: 'Solved',
      activeSubgoal: 'All 6 faces aligned and oriented',
      lockedMilestones: [
        'White Cross Locked',
        'First Two Layers (F2L) Locked',
        'Yellow Cross Locked',
        'All Faces Solved',
      ],
      recentActionHistory: [],
      slotCycleCount: 0,
      unproductiveStreak: 0,
      totalExecutions: 0,
    };
  }
  return initialAgentMemory();
}
