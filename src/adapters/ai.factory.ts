import OpenAI from "openai";
import { OpenAIAdapter } from "./openai.adapter.js";
// import { MockAIAdapter } from "./mock.adapter.js";

/*
================================================
AI ADAPTER FACTORY
================================================
Resolves AI provider (OpenAI only for now)
*/

export function getAIAdapter() {
  const provider = process.env.AI_PROVIDER;

  if (!provider) {
    throw new Error("AI_PROVIDER must be set (expected: 'openai')");
  }

  if (provider.toLowerCase() !== "openai") {
    throw new Error(`Unsupported AI_PROVIDER '${provider}'`);
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY must be set");
  }

  const client = new OpenAI({
    apiKey,
  });

  return new OpenAIAdapter(client);

  // fallback (optional):
  // return new MockAIAdapter();
}
