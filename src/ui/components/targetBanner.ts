export type TargetBannerApi = {
  readonly element: HTMLElement;
  update(data: {
    stageTitle: string;
    actionName: string;
    formula: string;
    isSolved: boolean;
  }): void;
};

export function createTargetBanner(): TargetBannerApi {
  const container = document.createElement('div');
  container.className = 'scene-target-banner';

  const pill = document.createElement('div');
  pill.className = 'target-indicator-pill';

  container.appendChild(pill);

  return {
    element: container,
    update({ stageTitle, actionName, formula, isSolved }) {
      if (isSolved) {
        pill.innerHTML = `
          <span class="target-pulse-dot solved"></span>
          <span class="target-stage-label">✓ CUBE SOLVED</span>
          <span class="target-divider">·</span>
          <span class="target-algo-formula">All 6 Faces In Identity State</span>
        `;
        return;
      }

      const moveTokens = formula.split(' ').filter(Boolean);
      const moveChips = moveTokens.length > 0
        ? moveTokens.map((m) => `<span class="target-move-chip">${m}</span>`).join('')
        : `<span class="target-move-chip">${formula}</span>`;

      pill.innerHTML = `
        <span class="target-pulse-dot"></span>
        <div class="target-info-group">
          <span class="target-stage-label">${stageTitle.toUpperCase()}</span>
          <span class="target-algo-title">🎯 <strong>${actionName}</strong></span>
        </div>
        <div class="target-moves-row">${moveChips}</div>
      `;
    },
  };
}
