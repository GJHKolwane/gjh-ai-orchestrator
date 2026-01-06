/**
 * Triage Handler
 *
 * Entry point for external systems (API, function, service).
 * Keeps transport concerns separate from AI logic.
 */

import { runTriagePipeline, TriageInput } from "../pipelines/triage.pipeline";

export async function handleTriageRequest(input: TriageInput) {
  return runTriagePipeline(input);
}
