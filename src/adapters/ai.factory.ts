import { AIAdapter } from "./ai.adapter.js";
import { MockAIAdapter } from "./mock.adapter.js";
import { VertexAIAdapter } from "./vertex.adapter.js";
import { VertexAI } from "@google-cloud/vertexai";

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
        location
      });

      const model = vertex.getGenerativeModel({
        model: "gemini-1.5-flash" // safer model
      });

      return new VertexAIAdapter(model);
    }

    case "mock":
    default:
      return new MockAIAdapter();
  }
}
