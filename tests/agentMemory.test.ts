import { describe, expect, it } from 'vitest';
import { initialAgentMemory, recordAgentAction, updateAgentStage, resetAgentMemory } from '../src/decision/agentMemory';

describe('agentMemory', () => {
  it('initializes with clean default values', () => {
    const memory = initialAgentMemory();
    expect(memory.recentActionHistory).toHaveLength(0);
    expect(memory.lockedMilestones).toHaveLength(0);
    expect(memory.slotCycleCount).toBe(0);
    expect(memory.totalExecutions).toBe(0);
  });

  it('keeps a sliding window of recent actions', () => {
    let memory = initialAgentMemory();
    for (let i = 1; i <= 6; i++) {
      memory = recordAgentAction(
        memory,
        {
          stepIndex: i,
          algorithmName: `Algo ${i}`,
          formula: `Formula ${i}`,
          description: `Action ${i}`,
        },
        false,
      );
    }

    // Sliding window capped at MAX_HISTORY_WINDOW (4)
    expect(memory.recentActionHistory).toHaveLength(4);
    expect(memory.recentActionHistory[0].stepIndex).toBe(6);
    expect(memory.recentActionHistory[3].stepIndex).toBe(3);
    expect(memory.totalExecutions).toBe(6);
  });

  it('locks milestones without duplication', () => {
    let memory = initialAgentMemory();
    memory = updateAgentStage(memory, 'Stage 1', 'Subgoal 1', 'White Cross Locked');
    memory = updateAgentStage(memory, 'Stage 1', 'Subgoal 1', 'White Cross Locked');
    expect(memory.lockedMilestones).toEqual(['White Cross Locked']);

    memory = updateAgentStage(memory, 'Stage 2', 'Subgoal 2', 'F2L Locked');
    expect(memory.lockedMilestones).toEqual(['White Cross Locked', 'F2L Locked']);
  });

  it('resets memory appropriately when solved', () => {
    const solvedMem = resetAgentMemory(true);
    expect(solvedMem.currentStage).toBe('Solved');
    expect(solvedMem.lockedMilestones).toContain('All Faces Solved');
  });
});
