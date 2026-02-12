/**
 * The ONLY legal exit reasons from a clinical phase.
 * Anything else is a governance violation.
 */
export var PhaseExitType;
(function (PhaseExitType) {
    PhaseExitType["TRANSFER_COMPLETE"] = "TRANSFER_COMPLETE";
    PhaseExitType["DELAY_OR_DETERIORATION"] = "DELAY_OR_DETERIORATION";
    PhaseExitType["TRANSFER_CANCELLED"] = "TRANSFER_CANCELLED";
    PhaseExitType["ACUTE_EMERGENCY"] = "ACUTE_EMERGENCY";
})(PhaseExitType || (PhaseExitType = {}));
