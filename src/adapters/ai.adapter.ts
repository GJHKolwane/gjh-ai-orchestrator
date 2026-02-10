/**
 * AI Adapter Interface
 *
 * This defines how the system talks to any AI provider.
 * Pipelines NEVER talk directly to Vertex, OpenAI, etc.
 */

export type AICompletionInput = {
  text: string;
};

export type AICompletionOutput = {
  text: string;
};

export interface AIAdapter {
  generateCompletion(
    input: AICompletionInput
  ): Promise<AICompletionOutput>;
}
