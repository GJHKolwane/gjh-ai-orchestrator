import {
  AIAdapter,
  AICompletionInput,
  AICompletionOutput,
} from "./ai.adapter";

/**
 * Vertex AI Adapter
 *
 * Real AI implementation using Google Vertex AI (Gemini).
 * The model is injected by the AI factory.
 *
 * IMPORTANT:
 * - No credentials are stored here
 * - Auth is handled by the environment (ADC / workload identity)
 * - No clinical or governance logic lives here
 */
export class VertexAIAdapter implements AIAdapter {
  private model: any;

  constructor(model: any) {
    this.model = model;
  }

  async generateCompletion(
    input: AICompletionInput
  ): Promise<AICompletionOutput> {
    const result = await this.model.generateContent(input.prompt);
    const response = await result.response;
    const text = response.text();

    return { text };
  }
}
