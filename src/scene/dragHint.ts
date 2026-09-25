import type { HoverHint } from './dragControls';

export type DragHint = { update(hint: HoverHint | null): void };

/** Clean drag hint provider that avoids visual clutter over 3D stickers. */
export function createDragHint(_container: HTMLElement): DragHint {
  return {
    update(_hint) {
      // Kept clean and quiet to avoid visual crosshair debris on the 3D cube
    },
  };
}
