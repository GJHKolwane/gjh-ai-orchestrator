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
 * Defines who is invoking AI, under what authority, and why
 */
export interface OrchestratorInput {
  consultationId: string;
  actor: "AI_TRIAGE" | "NURSE" | "DOCTOR";

  /**
   * AI operational mode (HARD GOVERNANCE)
   * - TRIAGE        → Phase 1
   * - SAFETY_ASSIST → Phase 1.5
   * - INVESTIGATIVE → Phase 2 (Doctor only)
   */
  mode: AIMode;

  /**
   * Intent explicitly declares what the AI is being asked to do.
   * Guards will BLOCK disallowed intents.
   */
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
 *
 * Responsibilities:
 * - Enforce AI mode boundaries
 * - Route AI calls via adapters
 * - Emit full audit trail
 *
 * This file NEVER talks directly to cloud providers.
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

  // 🔒 1️⃣ HARD GOVERNANCE CHECK (FAIL FAST)
  assertAIModeAllows(mode, intent);

  // 🧾 2️⃣ Audit: AI invocation requested
  await auditLogger.log(
    createAuditEvent(
      consultationId,
      actor,
      "INPUT_RECEIVED",
      `AI invoked in mode ${mode}`,
      {
        mode,
        intent
      }
    )
  );

  // 🧠 3️⃣ Resolve AI adapter (Vertex / Mock / Future)
  const aiAdapter = createAIAdapter();

  // ⚙️ 4️⃣ Generate AI output
  const result = await aiAdapter.generateCompletion({ prompt });

  // 🧾 5️⃣ Audit: AI suggestion produced
  await auditLogger.log(
    createAuditEvent(
      consultationId,
      "AI_TRIAGE",
      "AI_SUGGESTION",
      "AI generated output",
      {
        mode,
        outputPreview: result.text.slice(0, 300) // preview only, not full payload
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
