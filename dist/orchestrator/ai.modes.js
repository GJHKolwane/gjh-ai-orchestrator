/**
 * AI Modes
 *
 * Each mode strictly defines what the AI is allowed to do.
 * Modes are enforced by guards before and after AI execution.
 */
export var AIMode;
(function (AIMode) {
    AIMode["TRIAGE"] = "TRIAGE";
    AIMode["SAFETY_ASSIST"] = "SAFETY_ASSIST";
    AIMode["INVESTIGATIVE"] = "INVESTIGATIVE"; // Phase 2 (Doctor only)
})(AIMode || (AIMode = {}));
/**
 * Capabilities allowed per AI mode
 */
export const AIModeCapabilities = {
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
        allowDiagnosis: false, // still assistive
        allowComparisons: true,
        allowProceduralGuidance: false,
        allowMonitoring: false
    }
};
