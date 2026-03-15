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

      model: "gpt-4o-mini",

      messages: [

        {
          role: "system",
          content: `
You are a clinical triage assistant.

Your job is to analyse symptoms, vitals and notes and produce
a structured triage assessment.

IMPORTANT RULES:
- Do NOT prescribe medication
- Do NOT give treatment instructions
- Only provide triage analysis

You MUST return valid JSON ONLY in the following format:

{
  "riskLevel": "LOW | MEDIUM | HIGH",
  "observations": ["clinical observations"],
  "considerations": ["possible clinical considerations"],
  "reasoning": "short reasoning summary",
  "aiSuggestion": "optional suggestion or null"
}
`
        },

        {
          role: "user",
          content: text
        }

      ],

      temperature: 0.2,

      /*
      ================================================
      FORCE JSON RESPONSE
      ================================================
      */

      response_format: { type: "json_object" }

    });

    const output = response.choices?.[0]?.message?.content || "";

    return {
      text: output
    };

  }

}
