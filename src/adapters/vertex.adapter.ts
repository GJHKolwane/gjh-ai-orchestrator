import {
  AIAdapter,
  AICompletionInput,
  AICompletionOutput,
} from "./ai.adapter.js";

/**
 * Vertex AI Adapter
 */
export class VertexAIAdapter implements AIAdapter {
  private model: any;

  constructor(model: any) {
    this.model = model;
  }

  async generateCompletion(
    input: AICompletionInput
  ): Promise<AICompletionOutput> {

    if (!input.text) {
      throw new Error("VertexAIAdapter requires input.text");
    }

    const result = await this.model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: input.text }]
        }
      ]
    });

    const response = await result.response;
    const text = response.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      throw new Error("Vertex returned empty response");
    }

    return { text };
  }
}
