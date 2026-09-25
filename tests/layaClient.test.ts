import { describe, expect, it } from 'vitest';
import { createLayaClient, LocalLayaClient, LAYA_MODEL_NAME } from '../src/agent/layaClient';
import { extractCubeMatrix } from '../src/cube/matrix';
import { solvedState } from '../src/cube/state';

describe('LayaClient (System 1 Engine)', () => {
  it('instantiates LocalLayaClient by default', () => {
    const client = createLayaClient();
    expect(client).toBeInstanceOf(LocalLayaClient);
    expect(client.modelName).toBe(LAYA_MODEL_NAME);
  });

  it('evaluates choice and returns calibrated probabilities in 30ms latency profile', async () => {
    const client = createLayaClient();
    const matrix = extractCubeMatrix(solvedState());
    const result = await client.evaluateChoice(
      {
        cube_matrix: matrix,
        current_stage: 'Stage 5: Orient Yellow Face',
        active_subgoal: 'Orient yellow stickers',
        locked_milestones: ['White Cross'],
        recent_action_history: [],
      },
      'select_algorithm',
      'Which algorithm applies to this pattern?',
      [
        {
          name: 'The Sune Algorithm',
          formula: "R U R' U R U2 R'",
          moves: [],
          targetFacelets: [],
          plainEnglishMoves: ['R', 'U', "R'", 'U', 'R', 'U2', "R'"],
          rule: "Matty's Rule",
          reasoning: "Permutes top corners",
        },
        {
          name: 'The Niklas Algorithm',
          formula: "U R U' L' U R' U' L",
          moves: [],
          targetFacelets: [],
          plainEnglishMoves: [],
          rule: 'Niklas rule',
          reasoning: 'Cycles corners',
        },
      ],
    );

    expect(result.selectedCandidate.name).toBe('The Sune Algorithm');
    expect(result.response.model).toBe(LAYA_MODEL_NAME);
    expect(result.response.latency_ms).toBeGreaterThan(25);
    expect(result.response.latency_ms).toBeLessThan(50);
    expect(result.response.answers['select_algorithm'].confidence).toBeGreaterThan(0.9);
    expect(result.response.answers['select_algorithm'].probabilities['The Sune Algorithm']).toBeGreaterThan(0.9);
  });
});
