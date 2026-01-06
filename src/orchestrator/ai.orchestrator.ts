import { runGemini } from "../providers/vertex.provider.js";

export async function orchestrateAI(input: string) {
  const response = await runGemini(input);

  return {
    source: "vertex-gemini",
    timestamp: new Date().toISOString(),
    output: response
  };
}
