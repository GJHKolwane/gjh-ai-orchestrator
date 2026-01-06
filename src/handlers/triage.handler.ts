import { runTriagePipeline, TriageInput } from "../pipelines/triage.pipeline";
import { createAIAdapter } from "../adapters/ai.factory";

export async function handleTriageRequest(input: TriageInput) {
  const ai = createAIAdapter();
  return runTriagePipeline(input, ai);
}
