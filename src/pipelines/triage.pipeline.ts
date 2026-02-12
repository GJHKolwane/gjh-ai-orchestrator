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
 * MEDICINE BRIDGE
 * ============================
 */

async function requestMedicineDistribution(
  consultationId: string,
  riskLevel: string,
  escalationRecommended: boolean,
  suggestedNextSteps: string[]
) {
  const gatewayUrl = process.env.API_GATEWAY_URL;

  if (!gatewayUrl) {
    console.warn("API_GATEWAY_URL not configured — skipping medicine request");
    return;
  }

  // Governance-safe trigger logic
  const needsMedicine =
    riskLevel !== "low" ||
    escalationRecommended ||
    suggestedNextSteps.some(step =>
      step.toLowerCase().includes("medication")
    );

  if (!needsMedicine) {
    return;
  }

  try {
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
 * MAIN PIPELINE
 * ============================
 */

export async function runNurseTriagePipeline(
  input: NurseTriageInput
): Promise<NurseTriageResult> {
  const auditLogger = new ConsoleAuditLogger();

  const prompt = buildNurseTriagePrompt(input);

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

  // 🔗 Medicine bridge
  await requestMedicineDistribution(
    input.consultationId,
    result.riskLevel,
    result.governance.escalationRecommended,
    result.suggestedNextSteps
  );

  return result;
}
