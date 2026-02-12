import { ClinicalPhase } from "./clinicalPhases.js";
/**
 * Determines who legally owns patient care
 * at any given moment.
 */
export function resolveCustodyOwner(phase) {
    switch (phase) {
        case ClinicalPhase.PHASE_1:
        case ClinicalPhase.PHASE_T:
            return "PRIMARY_FACILITY";
        case ClinicalPhase.PHASE_1_5:
            return "EMS";
        case ClinicalPhase.PHASE_2:
            return "RECEIVING_FACILITY";
        default:
            throw new Error(`Unknown clinical phase: ${phase}`);
    }
}
