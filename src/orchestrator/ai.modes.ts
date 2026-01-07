/**
 * AI Modes
 *
 * Each mode strictly defines what the AI is allowed to do.
 * Modes are enforced by guards before and after AI execution.
 */

export enum AIMode {
  TRIAGE = "TRIAGE",                 // Phase 1
  SAFETY_ASSIST = "SAFETY_ASSIST",   // Phase 1.5
  INVESTIGATIVE = "INVESTIGATIVE"    // Phase 2 (Doctor only)
}

/**
 * Capabilities allowed per AI mode
 */
export const AIModeCapabilities: Record<AIMode, {
  allowDiagnosis: boolean;
  allowComparisons: boolean;
  allowProceduralGuidance: boolean;
  allowMonitoring: boolean;
}> = {
  [AIMode.TRIAGE]: {
    allowDiagnosis: false,
    allowComparisons: false,
    allowProceduralGuidance: false,
    allowMonitoring: true
  },
  [AIMode.SAFETY_ASSIST]: {
    allowDiagnosis: false,
    allowComparisons: false,
    allowProceduralGuidance: true,
    allowMonitoring: true
  },
  [AIMode.INVESTIGATIVE]: {
    allowDiagnosis: false,          // still assistive
    allowComparisons: true,
    allowProceduralGuidance: false,
    allowMonitoring: false
  }
};
