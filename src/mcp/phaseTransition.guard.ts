import { ClinicalPhase } from "./clinicalPhases";
import { PhaseExitType } from "./phaseExits";
import { PhaseTransitionResult } from "./phaseTransition.types";

/**
 * Enforces legal clinical phase transitions.
 * Anything not explicitly allowed is BLOCKED.
 */
export function resolvePhaseTransition(
  from: ClinicalPhase,
  exit: PhaseExitType
): PhaseTransitionResult {

  // ---------------------------
  // PHASE T — CONTROLLED TRANSFER
  // ---------------------------
  if (from === ClinicalPhase.PHASE_T) {
    switch (exit) {

      case PhaseExitType.TRANSFER_COMPLETE:
        return {
          nextPhase: ClinicalPhase.PHASE_2,
          locked: true
        };

      case PhaseExitType.DELAY_OR_DETERIORATION:
        return {
          nextPhase: ClinicalPhase.PHASE_1_5,
          locked: true
        };

      case PhaseExitType.TRANSFER_CANCELLED:
        return {
          nextPhase: ClinicalPhase.PHASE_1,
          locked: true
        };

      case PhaseExitType.ACUTE_EMERGENCY:
        return {
          nextPhase: ClinicalPhase.PHASE_1_5,
          locked: true
        };

      default:
        throw new Error(`Illegal exit ${exit} from ${from}`);
    }
  }

  // ---------------------------
  // PHASE 1 — TRIAGE
  // ---------------------------
  if (from === ClinicalPhase.PHASE_1) {
    if (exit === PhaseExitType.DELAY_OR_DETERIORATION) {
      return {
        nextPhase: ClinicalPhase.PHASE_1_5,
        locked: true
      };
    }
  }

  throw new Error(
    `Transition from ${from} using ${exit} is not permitted`
  );
                        }
