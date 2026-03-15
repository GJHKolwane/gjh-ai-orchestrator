import { createAIAdapter } from "../adapters/ai.factory.js";
import {
  AuditLogger,
  ConsoleAuditLogger,
  createAuditEvent
} from "./audit.logger.js";

import { AIMode } from "./ai.modes.js";
import { assertAIModeAllows } from "./ai.guards.js";

import { enforceHumanGate } from "../governance/humanGate.guard.js";

export interface OrchestratorInput {
  consultationId: string;
  actor: "AI_TRIAGE" | "NURSE" | "DOCTOR";
  mode: AIMode;

  intent?: {
    diagnosis?: boolean;
    comparison?: boolean;
    procedural?: boolean;
  };

  prompt: string;
}

export interface OrchestratorOutput {
  source: string;
  timestamp: string;
  output: string;
}

export async function orchestrateAI(
  input: OrchestratorInput,
  auditLogger: AuditLogger = new ConsoleAuditLogger()
): Promise<OrchestratorOutput> {

  const {
    consultationId,
    actor,
    mode,
    intent = {},
    prompt
  } = input;

  /*
  ======================================================
  1️⃣ HARD GOVERNANCE CHECK
  ======================================================
  */

  assertAIModeAllows(mode, intent);

  /*
  ======================================================
  2️⃣ AUDIT INPUT
  ======================================================
  */

  await auditLogger.log(
    createAuditEvent(
      consultationId,
      actor,
      "INPUT_RECEIVED",
      `AI invoked in mode ${mode}`,
      { mode, intent }
    )
  );

  /*
  ======================================================
  3️⃣ CHECK AI CONFIG
  ======================================================
  */

  console.log("AI Provider:", process.env.AI_PROVIDER);
  console.log("OpenAI Key Loaded:", !!process.env.OPENAI_API_KEY);

  /*
  ======================================================
  4️⃣ RESOLVE AI ADAPTER
  ======================================================
  */

  const aiAdapter = createAIAdapter();

  /*
  ======================================================
  5️⃣ GENERATE AI OUTPUT
  ======================================================
  */

  const result = await aiAdapter.generateCompletion({
    text: prompt
  });

  if (!result?.text) {

    console.error("AI adapter returned empty result");

    throw new Error("AI adapter returned empty response");
  }

  console.log("RAW AI OUTPUT:\n", result.text);

  /*
  ======================================================
  6️⃣ HUMAN SAFETY GATE
  ======================================================
  */

  const safeOutput = enforceHumanGate(result.text);

  /*
  ======================================================
  7️⃣ AUDIT OUTPUT
  ======================================================
  */

  await auditLogger.log(
    createAuditEvent(
      consultationId,
      "AI_TRIAGE",
      "AI_SUGGESTION",
      "AI generated output",
      {
        mode,
        outputPreview: safeOutput.slice(0, 300)
      }
    )
  );

  /*
  ======================================================
  8️⃣ RETURN RESULT
  ======================================================
  */

  return {

    source: process.env.AI_PROVIDER || "UNKNOWN_AI_PROVIDER",
    timestamp: new Date().toISOString(),
    output: safeOutput

  };

}
