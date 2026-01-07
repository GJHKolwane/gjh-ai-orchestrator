import { AIAdapter } from "./ai.adapter";
import { MockAIAdapter } from "./mock.adapter";
import { VertexAIAdapter } from "./vertex.adapter";
import { VertexAI } from "@google-cloud/vertexai";

/**
 * AI Factory
 *
 * Responsible for instantiating the correct AI adapter
 * based on runtime environment configuration.
 *
 * Default = mock (safe)
 * Explicit opt-in required for real AI providers.
 */
export function createAIAdapter(): AIAdapter {
  const provider = process.env.AI_PROVIDER || "mock";

  switch (provider) {
    case "vertex": {
      const project = process.env.GCP_PROJECT_ID;
      const location = process.env.GCP_LOCATION || "us-central1";

      if (!project) {
        throw new Error(
          "GCP_PROJECT_ID must be set when using Vertex AI adapter"
        );
      }

      const vertex = new VertexAI({
        project,
        location,
      });

      const model = vertex.getGenerativeModel({
        model: "gemini-3-flash",
      });

      return new VertexAIAdapter(model);
    }

    case "mock":
    default:
      return new MockAIAdapter();
  }
}
