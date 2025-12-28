

export function calculateConfidence(
  baseConfidence: number,
  timesApplied: number,
  daysSinceLastUse: number
): number {
  let confidence = baseConfidence;

  const reinforcement = Math.min(0.3, timesApplied * 0.05);
  confidence += reinforcement;

  if (daysSinceLastUse > 30) {
    confidence -= 0.1;
  }

  return Math.max(0, Math.min(1, confidence));
}

export function shouldAutoApply(confidence: number): boolean {
  return confidence >= 0.7;
}