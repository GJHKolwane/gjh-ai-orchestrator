import OpenAI from "openai";
import { AIAdapter } from "./ai.adapter.js";

/*
================================================
OPENAI ADAPTER
================================================
Implements AIAdapter interface using OpenAI API
*/

export class OpenAIAdapter implements AIAdapter {

  private client: OpenAI;

  constructor(client: OpenAI) {
    this.client = client;
  }

  /*
  ================================================
  GENERATE COMPLETION
  ================================================
  */

  async generateCompletion({ text }: { text: string }) {

    const response = await this.client.chat.completions.create({
      model: "gpt-4o-mini", // fast + cheap for MVP
      messages: [
        {
          role: "system",
          content:
            "You are a clinical triage assistant. Provide structured medical reasoning but do not prescribe treatment."
        },
        {
          role: "user",
          content: text
        }
      ],
      temperature: 0.2
    });

    const output = response.choices?.[0]?.message?.content || "";

    return {
      text: output
    };

  }

}
