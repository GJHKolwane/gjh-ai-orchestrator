import { AIAdapter, AICompletionInput, AICompletionOutput } from "./ai.adapter";

/**
 * Vertex AI Adapter
 *
 * Real AI implementation using Google Vertex AI (Gemini).
 * This adapter is injected at runtime.
 *
 * IMPORTANT:
 * - No credentials are stored here
 * - Auth is handled by the environment (ADC)
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
