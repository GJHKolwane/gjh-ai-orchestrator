import { AIMode, AIModeCapabilities } from "./ai.modes";

/**
 * Validates whether a requested AI action is allowed
 * in the current AI mode.
 */
export function assertAIModeAllows(
  mode: AIMode,
  request: {
    diagnosis?: boolean;
    comparison?: boolean;
    procedural?: boolean;
  }
): void {
  const caps = AIModeCapabilities[mode];

  if (request.diagnosis && !caps.allowDiagnosis) {
    throw new Error(`AI diagnosis not allowed in mode ${mode}`);
  }

  if (request.comparison && !caps.allowComparisons) {
    throw new Error(`AI comparison not allowed in mode ${mode}`);
  }

  if (request.procedural && !caps.allowProceduralGuidance) {
    throw new Error(`AI procedural guidance not allowed in mode ${mode}`);
  }
}
