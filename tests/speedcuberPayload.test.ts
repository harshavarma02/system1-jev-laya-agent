import { describe, expect, it } from 'vitest';
import { initialAgentMemory } from '../src/decision/agentMemory';
import { generateSpeedcuberPayloads } from '../src/decision/speedcuberPayload';
import { solvedState } from '../src/cube/state';
import { algorithm } from '../src/solver/beginner/pieces';

describe('speedcuberPayload', () => {
  it('generates matrix, memory, and algorithm decision for a white_corners step', () => {
    const cube = solvedState();
    const memory = initialAgentMemory();
    const step = {
      stage: 'white_corners' as const,
      moves: algorithm("R U R' U'"),
      targetFacelets: [9, 18, 27],
      note: 'The Righty Algorithm',
    };

    const { request, response, updatedMemory } = generateSpeedcuberPayloads(
      cube,
      step,
      0,
      10,
      memory,
      'laya',
    );

    // Verify 6-Face Matrix in request
    expect(request.spatial_state.cube_matrix.top).toHaveLength(3);
    expect(request.spatial_state.cube_matrix.front).toHaveLength(3);
    expect(request.spatial_state.cube_matrix.bottom).toHaveLength(3);

    // Verify Memory in request
    expect(request.agent_memory.current_stage).toBe('Stage 2: White Corners (First Layer)');

    // Verify Speedcuber Decision in response
    expect(response.decision.selected_algorithm.formula).toBe("R U R' U'");
    expect(response.speedcuber_rule).toContain("Righty Algo");
    expect(response.latency_ms).toBeLessThan(40); // Laya is sub-40ms
    expect(updatedMemory.lockedMilestones).toContain('First Layer Complete & Locked');
  });

  it('generates Hook/Line resolver for yellow_cross step', () => {
    const cube = solvedState();
    const memory = initialAgentMemory();
    const step = {
      stage: 'yellow_cross' as const,
      moves: algorithm("F R U R' U' F'"),
      targetFacelets: [1, 3, 5, 7],
      note: 'Cross Resolver [F (Righty) F\']',
    };

    const { response } = generateSpeedcuberPayloads(
      cube,
      step,
      4,
      10,
      memory,
      'laya',
    );

    expect(response.decision.selected_algorithm.formula).toBe("F R U R' U' F'");
    expect(response.speedcuber_rule).toContain('Hook');
    expect(response.grounded_reasoning).toContain('Yellow');
  });
});
