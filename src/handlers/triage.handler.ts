import { runTriagePipeline, TriageInput } from "../pipelines/triage.pipeline";
import { MockAIAdapter } from "../adapters/mock.adapter";

const ai = new MockAIAdapter();

export async function handleTriageRequest(input: TriageInput) {
  return runTriagePipeline(input, ai);
}
