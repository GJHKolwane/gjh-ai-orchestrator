import { AIAdapter, AICompletionInput, AICompletionOutput } from "./ai.adapter.js";

/**
 * Mock AI Adapter
 *
 * Used for local development, testing, and demos.
 * Replaces real AI calls with deterministic output.
 */
export class MockAIAdapter implements AIAdapter {
  async generateCompletion(
    input: AICompletionInput
  ): Promise<AICompletionOutput> {
    return {
      text: `
## Subjective
Patient reports general discomfort.

## Objective
No objective data provided.

## Assessment
Moderate risk based on reported symptoms.

## Next Steps
Recommend clinical review.
      `.trim(),
    };
  }
}
