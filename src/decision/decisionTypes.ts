/**
 * Types for System 1 Decision Payloads (Jev / Laya)
 * Strictly typed schemas for Choice, Score, and Noul primitives.
 */

export type ModelEngine = 'laya' | 'jev';

export type SystemOneChoiceQuestion = {
  readonly type: 'choice';
  readonly instructions: string;
  readonly options: readonly string[];
};

export type SystemOneScoreQuestion = {
  readonly type: 'score';
  readonly instructions: string;
  readonly scale: readonly string[];
};

export type SystemOneNoulQuestion = {
  readonly type: 'noul';
  readonly instructions: string;
};

export type DecisionRequest = {
  readonly model: string;
  readonly timestamp: number;
  readonly state: {
    readonly stage: string;
    readonly step_index: number;
    readonly total_steps: number;
    readonly last_move: string | null;
    readonly facelets: string;
    readonly is_solved: boolean;
  };
  readonly questions: {
    readonly next_move: SystemOneChoiceQuestion;
    readonly stage_progress: SystemOneScoreQuestion;
    readonly preserves_work: SystemOneNoulQuestion;
  };
};

export type DecisionResponse = {
  readonly model: string;
  readonly latency_ms: number;
  readonly answers: {
    readonly next_move: {
      readonly choice: string;
      readonly confidence: number;
      readonly distribution: Readonly<Record<string, number>>;
    };
    readonly stage_progress: {
      readonly score: number;
      readonly label: string;
    };
    readonly preserves_work: {
      readonly noul: number;
    };
  };
};
