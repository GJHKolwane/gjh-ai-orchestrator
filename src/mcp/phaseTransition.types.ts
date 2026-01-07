import { ClinicalPhase } from "./clinicalPhases";
import { PhaseExitType } from "./phaseExits";

/**
 * Request to transition a patient between phases.
 */
export interface PhaseTransitionRequest {
  consultationId: string;
  fromPhase: ClinicalPhase;
  exitType: PhaseExitType;
  timestamp: string;
  authorisedBy: "MCP";
}

/**
 * Result of a validated phase transition.
 */
export interface PhaseTransitionResult {
  nextPhase: ClinicalPhase;
  locked: boolean; // prevents silent re-entry
}
