import { createAIAdapter } from "../adapters/ai.factory.js";
import {
  AuditLogger,
  ConsoleAuditLogger,
  createAuditEvent
} from "./audit.logger.js";
import { AIMode } from "./ai.modes.js";
import { assertAIModeAllows } from "./ai.guards.js";

/**
 * Orchestrator Input
 */
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

/**
 * Orchestrator Output
 */
export interface OrchestratorOutput {
  source: string;
  timestamp: string;
  output: string;
}

/**
 * Core AI Orchestrator
 */
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

  // 🔒 1️⃣ HARD GOVERNANCE CHECK
  assertAIModeAllows(mode, intent);

  // 🧾 2️⃣ Audit invocation
  await auditLogger.log(
    createAuditEvent(
      consultationId,
      actor,
      "INPUT_RECEIVED",
      `AI invoked in mode ${mode}`,
      { mode, intent }
    )
  );

  // 🧠 3️⃣ Resolve adapter
  const aiAdapter = createAIAdapter();

  // ⚙️ 4️⃣ Generate AI output
  // IMPORTANT: pass as `text` for Vertex compatibility
  const result = await aiAdapter.generateCompletion({
    text: prompt
  });

  if (!result?.text) {
    throw new Error("AI adapter returned empty response");
  }

  // 🧾 5️⃣ Audit output preview
  await auditLogger.log(
    createAuditEvent(
      consultationId,
      "AI_TRIAGE",
      "AI_SUGGESTION",
      "AI generated output",
      {
        mode,
        outputPreview: result.text.slice(0, 300)
      }
    )
  );

  // ✅ 6️⃣ Return governed output
  return {
    source: process.env.AI_PROVIDER || "mock",
    timestamp: new Date().toISOString(),
    output: result.text
  };
}
