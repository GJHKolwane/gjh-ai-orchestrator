import { AIModeCapabilities } from "./ai.modes.js";
/**
 * Validates whether a requested AI action is allowed
 * in the current AI mode.
 */
export function assertAIModeAllows(mode, request) {
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
