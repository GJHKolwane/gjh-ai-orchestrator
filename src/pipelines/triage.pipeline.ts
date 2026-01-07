import { orchestrateAI } from "../orchestrator/ai.orchestrator.js";
import {
  ConsoleAuditLogger,
  createAuditEvent
} from "../orchestrator/audit.logger.js";

/**
 * ============================
 * INPUT / OUTPUT CONTRACTS
 * ============================
 */

export interface NurseTriageInput {
  consultationId: string;

  patient: {
    age?: number;
    sex?: "male" | "female" | "other";
    symptoms: string[];
    duration?: string;
    severity?: number;
  };

  nurse: {
    notes: string;
    confidence: "low" | "medium" | "high";
  };

  context: {
    location: "rural" | "urban";
    doctorAvailable: boolean;
  };
}

export interface NurseTriageResult {
  observations: string[];
  considerations: string[]; // NON-diagnostic only
  riskLevel: "low" | "medium" | "high";
  missingInformation: string[];
  suggestedNextSteps: string[];

  governance: {
    diagnosticAllowed: false;
    humanInControl: "nurse";
    escalationRecommended: boolean;
  };
}

/**
 * ============================
 * PROMPT BUILDER (GOVERNED)
 * ============================
 */

function buildNurseTriagePrompt(input: NurseTriageInput): string {
  return `
You are a clinical AI assistant supporting a NURSE.

STRICT RULES (MANDATORY):
- You MUST NOT provide a diagnosis.
- You MUST NOT use diagnostic language.
- You MAY suggest possible considerations ONLY.
- You MUST respect nurse authority at all times.
- You MUST highlight risk flags conservatively.
- You MUST indicate missing information clearly.

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

REQUIRED OUTPUT FORMAT (JSON ONLY):
{
  "observations": [string],
  "considerations": [string],
  "riskLevel": "low | medium | high",
  "missingInformation": [string],
  "suggestedNextSteps": [string],
  "escalationRecommended": boolean
}
`;
}

/**
 * ============================
 * PIPELINE EXECUTION
 * ============================
 */

export async function runNurseTriagePipeline(
  input: NurseTriageInput
): Promise<NurseTriageResult> {
  const auditLogger = new ConsoleAuditLogger();

  // 1️⃣ Build governed prompt
  const prompt = buildNurseTriagePrompt(input);

  // 2️⃣ Audit: nurse initiated triage
  await auditLogger.log(
    createAuditEvent(
      input.consultationId,
      "NURSE",
      "INPUT_RECEIVED",
      "Nurse initiated AI triage",
      { notes: input.nurse.notes }
    )
  );

  // 3️⃣ Call orchestrator (governed AI entry)
  const aiResult = await orchestrateAI(
    {
      consultationId: input.consultationId,
      actor: "AI_TRIAGE",
      prompt
    },
    auditLogger
  );

  // 4️⃣ Parse and validate AI output
  let parsed: any;
  try {
    parsed = JSON.parse(aiResult.output);
  } catch {
    throw new Error("AI output was not valid JSON (governance violation)");
  }

  // 5️⃣ Enforce governance at pipeline level
  const result: NurseTriageResult = {
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

  // 6️⃣ Audit: nurse-reviewed AI output
  await auditLogger.log(
    createAuditEvent(
      input.consultationId,
      "NURSE",
      "NURSE_REVIEW",
      "Nurse reviewed AI triage output",
      {
        escalationRecommended: result.governance.escalationRecommended,
        riskLevel: result.riskLevel
      }
    )
  );

  return result;
}
