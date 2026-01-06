/**
 * Triage Pipeline
 *
 * Responsible for orchestrating AI reasoning for patient triage.
 * This pipeline prepares input, selects prompts, and interprets AI output.
 *
 * NOTE:
 * - No cloud SDKs here
 * - No direct model calls yet
 */

export type TriageInput = {
  symptoms: string;
  age?: number;
  sex?: string;
  vitals?: Record<string, string | number>;
};

export type TriageOutput = {
  soan: string;
  riskLevel: "low" | "medium" | "high";
};

export async function runTriagePipeline(
  input: TriageInput
): Promise<TriageOutput> {
  // Placeholder logic – AI call will be injected later
  return {
    soan: "SOAN output placeholder",
    riskLevel: "medium",
  };
}
