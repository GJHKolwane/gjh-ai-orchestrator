/**
 * Authoritative clinical phases in GJHealth
 * These are HARD states – transitions are governed.
 */
export var ClinicalPhase;
(function (ClinicalPhase) {
    ClinicalPhase["PHASE_1"] = "PHASE_1";
    ClinicalPhase["PHASE_T"] = "PHASE_T";
    ClinicalPhase["PHASE_1_5"] = "PHASE_1_5";
    ClinicalPhase["PHASE_2"] = "PHASE_2"; // Doctor-led care
})(ClinicalPhase || (ClinicalPhase = {}));
