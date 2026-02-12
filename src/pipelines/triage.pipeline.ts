import { orchestrateAI } from "../orchestrator/ai.orchestrator.js";
import { AIMode } from "../orchestrator/ai.modes.js";
import {
  ConsoleAuditLogger,
  createAuditEvent
} from "../orchestrator/audit.logger.js";

import axios from "axios";
import { getIdToken } from "../utils/googleAuth.js";

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
  considerations: string[];
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
 * PROMPT BUILDER
 * ============================
 */

function buildNurseTriagePrompt(input: NurseTriageInput): string {
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
 * MEDICINE DISTRIBUTION CALL
 * ============================
 */

async function requestMedicineDistribution(
  consultationId: string,
  riskLevel: "low" | "medium" | "high",
  escalationRecommended: boolean
) {
  const gatewayUrl = process.env.API_GATEWAY_URL;

  if (!gatewayUrl) {
    console.warn("API_GATEWAY_URL not configured — skipping medicine request");
    return;
  }

  try {
    // 🔐 Generate ID token for Cloud Run IAM
    const token = await getIdToken(gatewayUrl);

    await axios.post(
      `${gatewayUrl}/medicine`,
      {
        signalId: consultationId,
        kpi: "PATIENT_MEDICATION_REQUEST",
        severity:
          riskLevel === "high"
            ? "HIGH"
            : riskLevel === "medium"
            ? "MEDIUM"
            : "LOW",
        escalationRecommended
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        timeout: 5000
      }
    );
  } catch (err: any) {
    console.error("Medicine distribution call failed:", err.message);
  }
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

  const prompt = buildNurseTriagePrompt(input);

  // Audit input
  await auditLogger.log(
    createAuditEvent(
      input.consultationId,
      "NURSE",
      "INPUT_RECEIVED",
      "Nurse initiated AI triage",
      { notes: input.nurse.notes }
    )
  );

  const aiResult = await orchestrateAI(
    {
      consultationId: input.consultationId,
      actor: "AI_TRIAGE",
      mode: AIMode.TRIAGE,
      intent: {
        diagnosis: false,
        comparison: false,
        procedural: false
      },
      prompt
    },
    auditLogger
  );

  let parsed: any;

  try {
    parsed = JSON.parse(aiResult.output);
  } catch {
    throw new Error("AI output was not valid JSON");
  }

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

  // Audit nurse review
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

  /**
   * 🔗 Trigger medicine distribution ONLY when necessary
   */
  if (
    result.riskLevel === "high" ||
    result.governance.escalationRecommended
  ) {
    await requestMedicineDistribution(
      input.consultationId,
      result.riskLevel,
      result.governance.escalationRecommended
    );
  }

  return result;
}
