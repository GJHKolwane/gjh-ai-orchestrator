import { AIAdapter } from "./ai.adapter.js";
import { OpenAIAdapter } from "./openai.adapter.js";
import OpenAI from "openai";

/*
================================================
AI ADAPTER FACTORY
================================================
Resolves AI provider. Production requires OpenAI.
*/

export function createAIAdapter(): AIAdapter {

  const provider = process.env.AI_PROVIDER;

  if (!provider) {
    throw new Error(
      "AI_PROVIDER environment variable must be set (expected: 'openai')"
    );
  }

  if (provider.toLowerCase() !== "openai") {
    throw new Error(
      `Unsupported AI_PROVIDER '${provider}'. Only 'openai' is allowed.`
    );
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY must be set when using OpenAI adapter"
    );
  }

  console.log("AI Provider selected: OpenAI");

  const client = new OpenAI({
    apiKey
  });

  return new OpenAIAdapter(client);
}
