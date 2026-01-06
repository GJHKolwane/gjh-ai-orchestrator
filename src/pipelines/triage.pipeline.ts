import { AIAdapter } from "../adapters/ai.adapter";

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
  input: TriageInput,
  ai: AIAdapter
): Promise<TriageOutput> {
  const completion = await ai.generateCompletion({
    prompt: input.symptoms,
  });

  return {
    soan: completion.text,
    riskLevel: "medium",
  };
}
