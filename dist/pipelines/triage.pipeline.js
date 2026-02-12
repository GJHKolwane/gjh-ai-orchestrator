import { orchestrateAI } from "../orchestrator/ai.orchestrator.js";
import { AIMode } from "../orchestrator/ai.modes.js";
import { ConsoleAuditLogger, createAuditEvent } from "../orchestrator/audit.logger.js";
/**
 * ============================
 * PROMPT BUILDER
 * ============================
 */
function buildNurseTriagePrompt(input) {
    return `
You are a clinical AI assistant supporting a NURSE.

STRICT RULES:
- You MUST NOT provide a diagnosis.
- You MUST NOT use diagnostic language.
- You MAY suggest considerations only.
- You MUST highlight risk flags conservatively.

PATIENT SUMMARY:
- Age: ${input.patient.age ?? "unknown"}
- Sex: ${input.patient.sex ?? "unknown"}
- Symptoms: ${input.patient.symptoms.join(", ")}
- Duration: ${input.patient.duration ?? "unknown"}
- Severity (1–10): ${input.patient.severity ?? "unknown"}

NURSE NOTES:
${input.nurse.notes}

CONTEXT:
- Location: ${input.context.location}
- Doctor available: ${input.context.doctorAvailable}

RETURN JSON ONLY.
`;
}
/**
 * ============================
 * MAIN PIPELINE
 * ============================
 */
export async function runNurseTriagePipeline(input) {
    const auditLogger = new ConsoleAuditLogger();
    const prompt = buildNurseTriagePrompt(input);
    // Audit input
    await auditLogger.log(createAuditEvent(input.consultationId, "NURSE", "INPUT_RECEIVED", "Nurse initiated AI triage", { notes: input.nurse.notes }));
    const aiResult = await orchestrateAI({
        consultationId: input.consultationId,
        actor: "AI_TRIAGE",
        mode: AIMode.TRIAGE,
        intent: {
            diagnosis: false,
            comparison: false,
            procedural: false
        },
        prompt
    }, auditLogger);
    let parsed;
    try {
        parsed = JSON.parse(aiResult.output);
    }
    catch {
        throw new Error("AI output was not valid JSON");
    }
    const result = {
        observations: parsed.observations ?? [],
        considerations: parsed.considerations ?? [],
        riskLevel: parsed.riskLevel ?? "medium",
        missingInformation: parsed.missingInformation ?? [],
        suggestedNextSteps: parsed.suggestedNextSteps ?? [],
        governance: {
            diagnosticAllowed: false,
            humanInControl: "nurse",
            escalationRecommended: Boolean(parsed.escalationRecommended)
        }
    };
    await auditLogger.log(createAuditEvent(input.consultationId, "NURSE", "NURSE_REVIEW", "Nurse reviewed AI triage output", {
        escalationRecommended: result.governance.escalationRecommended,
        riskLevel: result.riskLevel
    }));
    return result;
}
