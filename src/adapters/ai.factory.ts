import { AIAdapter } from "./ai.adapter";
import { MockAIAdapter } from "./mock.adapter";

/**
 * AI Factory
 *
 * Selects which AI adapter to use based on environment.
 */
export function createAIAdapter(): AIAdapter {
  const provider = process.env.AI_PROVIDER || "mock";

  if (provider === "vertex") {
    throw new Error(
      "Vertex adapter must be initialized explicitly with a model instance."
    );
  }

  return new MockAIAdapter();
}
