import { createAIAdapter } from "../adapters/ai.factory.js";
import {
  AuditLogger,
  ConsoleAuditLogger,
  createAuditEvent
} from "./audit.logger.js";

/**
 * Orchestrator Input
 * Defines who is invoking AI and why
 */
export interface OrchestratorInput {
  consultationId: string;
  actor: "AI_TRIAGE" | "NURSE" | "DOCTOR";
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
 * - Route AI calls via adapters
 * - Enforce governance boundaries
 * - Emit full audit trail
 *
 * This file NEVER talks directly to cloud providers.
 */
export async function orchestrateAI(
  input: OrchestratorInput,
  auditLogger: AuditLogger = new ConsoleAuditLogger()
): Promise<OrchestratorOutput> {
  const { consultationId, actor, prompt } = input;

  // 1️⃣ Audit: input received
  await auditLogger.log(
    createAuditEvent(
      consultationId,
      actor,
      "INPUT_RECEIVED",
      "AI input received",
      { prompt }
    )
  );

  // 2️⃣ Resolve AI adapter (Vertex / Mock / Future)
  const aiAdapter = createAIAdapter();

  // 3️⃣ Generate AI output
  const result = await aiAdapter.generateCompletion({ prompt });

  // 4️⃣ Audit: AI suggestion produced
  await auditLogger.log(
    createAuditEvent(
      consultationId,
      "AI_TRIAGE",
      "AI_SUGGESTION",
      "AI generated suggestion",
      { output: result.text }
    )
  );

  // 5️⃣ Return governed output
  return {
    source: process.env.AI_PROVIDER || "mock",
    timestamp: new Date().toISOString(),
    output: result.text
  };
}
