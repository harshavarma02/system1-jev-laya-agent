import { faceGrid } from './state';
import type { Color, CubeState } from './types';

export type FaceMatrix = readonly (readonly [Color, Color, Color])[];

export type CubeMatrixState = {
  readonly top: FaceMatrix;
  readonly bottom: FaceMatrix;
  readonly front: FaceMatrix;
  readonly right: FaceMatrix;
  readonly left: FaceMatrix;
  readonly back: FaceMatrix;
};

/**
 * Extracts the 6-face 3x3 color matrix from the internal cube state.
 * Compliance: RULES.md § 1 (SRP) & § 6 (<300 lines)
 */
export function extractCubeMatrix(state: CubeState): CubeMatrixState {
  return {
    top: faceGrid(state, 'U'),
    bottom: faceGrid(state, 'D'),
    front: faceGrid(state, 'F'),
    right: faceGrid(state, 'R'),
    left: faceGrid(state, 'L'),
    back: faceGrid(state, 'B'),
  };
}

/** Formats a compact single-line or summary representation of the matrix. */
export function formatFaceMatrix(matrix: FaceMatrix): string {
  return matrix.map((row) => `[${row.join(', ')}]`).join(' ');
}
