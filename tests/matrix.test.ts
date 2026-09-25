import { describe, expect, it } from 'vitest';
import { extractCubeMatrix } from '../src/cube/matrix';
import { solvedState, applyMove } from '../src/cube/state';

describe('extractCubeMatrix', () => {
  it('extracts solved face matrices with correct center and sticker colors', () => {
    const solved = solvedState();
    const matrix = extractCubeMatrix(solved);

    // Verify all 6 faces have 3x3 dimensions
    expect(matrix.top).toHaveLength(3);
    expect(matrix.top[0]).toHaveLength(3);
    expect(matrix.bottom).toHaveLength(3);
    expect(matrix.front).toHaveLength(3);
    expect(matrix.right).toHaveLength(3);
    expect(matrix.left).toHaveLength(3);
    expect(matrix.back).toHaveLength(3);

    // Verify centers match standard scheme: U=yellow, D=white, F=green, R=orange, L=red, B=blue
    expect(matrix.top[1][1]).toBe('yellow');
    expect(matrix.bottom[1][1]).toBe('white');
    expect(matrix.front[1][1]).toBe('green');
    expect(matrix.right[1][1]).toBe('orange');
    expect(matrix.left[1][1]).toBe('red');
    expect(matrix.back[1][1]).toBe('blue');

    // On solved cube, all 9 stickers of top are yellow
    expect(matrix.top.every((row) => row.every((c) => c === 'yellow'))).toBe(true);
    expect(matrix.bottom.every((row) => row.every((c) => c === 'white'))).toBe(true);
  });

  it('accurately updates matrices after moves', () => {
    const solved = solvedState();
    const afterR = applyMove(solved, { face: 'R', turns: 1 });
    const matrix = extractCubeMatrix(afterR);

    // Center pieces never move
    expect(matrix.right[1][1]).toBe('orange');
    expect(matrix.front[1][1]).toBe('green');
    expect(matrix.top[1][1]).toBe('yellow');

    // Right column of front face now has white stickers from D layer
    expect(matrix.front[0][2]).toBe('white');
    expect(matrix.front[1][2]).toBe('white');
    expect(matrix.front[2][2]).toBe('white');
  });
});
