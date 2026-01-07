/**
 * Authoritative clinical phases in GJHealth
 * These are HARD states – transitions are governed.
 */
export enum ClinicalPhase {
  PHASE_1 = "PHASE_1",        // Nurse triage
  PHASE_T = "PHASE_T",        // Controlled transfer (non-emergency)
  PHASE_1_5 = "PHASE_1_5",    // Emergency safety assist
  PHASE_2 = "PHASE_2"         // Doctor-led care
}
