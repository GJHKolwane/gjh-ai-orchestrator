import OpenAI from "openai";
import { OpenAIAdapter } from "./openai.adapter.js";
import { MockAIAdapter } from "./mock.adapter.js";

/*
================================================
AI ADAPTER FACTORY
================================================
Dev Mode: Mock Adapter
Prod Mode: OpenAI Adapter (switch via env)
*/

export function getAIAdapter() {
  const provider = process.env.AI_PROVIDER;

  /*
  ================================================
  MOCK MODE (DEFAULT FOR NOW)
  ================================================
  */

  if (!provider || provider.toLowerCase() === "mock") {
    console.log("AI Provider: MOCK");
    return new MockAIAdapter();
  }

  /*
  ================================================
  OPENAI MODE
  ================================================
  */

  if (provider.toLowerCase() === "openai") {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error("OPENAI_API_KEY must be set");
    }

    console.log("AI Provider: OpenAI");

    const client = new OpenAI({ apiKey });

    return new OpenAIAdapter(client);
  }

  /*
  ================================================
  INVALID PROVIDER
  ================================================
  */

  throw new Error(`Unsupported AI_PROVIDER '${provider}'`);
}
