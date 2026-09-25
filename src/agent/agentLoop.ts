import type { CubeState } from '../cube/types';
import type { AgentMemory } from '../decision/agentMemory';
import type { ModelEngine } from '../decision/decisionTypes';
import { act } from './act';
import { decide } from './decide';
import { sense } from './sense';
import type { AgentCycleResult } from './types';

export function runAgentCycle(
  cube: CubeState,
  memory: AgentMemory,
  engine: ModelEngine = 'laya',
  stepIndex = 0,
): AgentCycleResult {
  const observation = sense(cube, memory);
  const decision = decide(observation, engine);
  return act(observation, decision, memory, stepIndex);
}
