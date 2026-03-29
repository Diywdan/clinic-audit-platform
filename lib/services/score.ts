import { BLOCK_CONFIG } from "@/lib/constants";

export type ScoreAnswer = {
  criterionId: string;
  blockId: number;
  selectedScore: number;
  isCritical: boolean;
};

export type ScoreResult = {
  totalScore: number;
  totalPercentage: number;
  criticalViolations: number;
  byBlock: Array<{
    blockId: number;
    score: number;
    normalized: number;
    weighted: number;
    weight: number;
  }>;
};

export function calculateEvaluationScore(answers: ScoreAnswer[]): ScoreResult {
  const grouped = new Map<number, ScoreAnswer[]>();

  for (const answer of answers) {
    const bucket = grouped.get(answer.blockId) ?? [];
    bucket.push(answer);
    grouped.set(answer.blockId, bucket);
  }

  const byBlock = Object.values(BLOCK_CONFIG).map((block) => {
    const blockAnswers = grouped.get(block.id) ?? [];
    const score = blockAnswers.reduce((sum, answer) => sum + answer.selectedScore, 0);
    const normalized = Math.max(0, Math.min(1, (score - block.min) / (block.max - block.min)));

    return {
      blockId: block.id,
      score,
      normalized,
      weighted: normalized * block.weight,
      weight: block.weight
    };
  });

  const criticalViolations = answers.filter(
    (answer) => answer.isCritical && answer.selectedScore < 0
  ).length;

  let totalScore = byBlock.reduce((sum, block) => sum + block.weighted, 0);
  if (criticalViolations >= 2) {
    totalScore = Math.min(totalScore, 0.4);
  }

  return {
    totalScore,
    totalPercentage: Math.round(totalScore * 100),
    criticalViolations,
    byBlock
  };
}
