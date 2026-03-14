import { AIAdapter } from "./ai.adapter.js";
import { MockAIAdapter } from "./mock.adapter.js";
import { OpenAIAdapter } from "./openai.adapter.js";
import OpenAI from "openai";

export function createAIAdapter(): AIAdapter {

  const provider = process.env.AI_PROVIDER || "mock";

  switch (provider) {

    /*
    ================================================
    OPENAI PROVIDER
    ================================================
    */

    case "openai": {

      const apiKey = process.env.OPENAI_API_KEY;

      if (!apiKey) {
        throw new Error(
          "OPENAI_API_KEY must be set when using OpenAI adapter"
        );
      }

      const client = new OpenAI({
        apiKey
      });

      return new OpenAIAdapter(client);
    }

    /*
    ================================================
    MOCK PROVIDER
    ================================================
    */

    case "mock":
    default:
      return new MockAIAdapter();
  }

}
