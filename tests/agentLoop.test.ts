import { describe, expect, it } from 'vitest';
import { runAgentCycle } from '../src/agent/agentLoop';
import { sense } from '../src/agent/sense';
import { decide } from '../src/agent/decide';
import { act } from '../src/agent/act';
import { initialAgentMemory } from '../src/decision/agentMemory';
import { applyMoves, isSolved, solvedState } from '../src/cube/state';
import type { Move } from '../src/cube/types';

describe('agentLoop (Sense -> Decide -> Act)', () => {
  it('senses a solved cube correctly', () => {
    const memory = initialAgentMemory();
    const obs = sense(solvedState(), memory);
    expect(obs.isSolved).toBe(true);
    expect(obs.matrix.top).toBeDefined();
    expect(obs.matrix.front).toBeDefined();
  });

  it('senses a scrambled cube and detects the white_cross stage', () => {
    const memory = initialAgentMemory();
    const R: Move = { face: 'R', turns: 1 };
    const scrambled = applyMoves(solvedState(), [R]);
    const obs = sense(scrambled, memory);
    expect(obs.isSolved).toBe(false);
    expect(obs.detectedStage).toBe('white_cross');
  });

  it('decides a speedcuber algorithm with calibrated confidence and latency profile', () => {
    const memory = initialAgentMemory();
    const R: Move = { face: 'R', turns: 1 };
    const scrambled = applyMoves(solvedState(), [R]);
    const obs = sense(scrambled, memory);
    const decision = decide(obs, 'laya');
    expect(decision.engine).toContain('laya-modernbert-421m');
    expect(decision.confidence).toBeGreaterThan(0.9);
    expect(decision.latencyMs).toBeLessThan(45);
    expect(decision.selectedAlgorithm.name).toBeDefined();
    expect(decision.speedcuberRule).toBeDefined();
  });

  it('acts and updates agent memory trajectory', () => {
    const memory = initialAgentMemory();
    const R: Move = { face: 'R', turns: 1 };
    const scrambled = applyMoves(solvedState(), [R]);
    const obs = sense(scrambled, memory);
    const decision = decide(obs, 'laya');
    const result = act(obs, decision, memory, 1);
    expect(result.movesToAnimate.length).toBeGreaterThanOrEqual(0);
    expect(result.updatedMemory).toBeDefined();
  });

  it('runs complete Sense-Decide-Act cycle through runAgentCycle', () => {
    const memory = initialAgentMemory();
    const R: Move = { face: 'R', turns: 1 };
    const scrambled = applyMoves(solvedState(), [R]);
    const cycle = runAgentCycle(scrambled, memory, 'laya', 0);
    expect(cycle.observation.isSolved).toBe(false);
    expect(cycle.decision.selectedAlgorithm.name).toBeDefined();
    expect(cycle.nextCube).toBeDefined();
  });
});
