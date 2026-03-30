import OpenAI from "openai";

/*
================================================
OPENAI ADAPTER
================================================
Handles communication with OpenAI API
*/

export class OpenAIAdapter {
  private client: OpenAI;

  constructor(client: OpenAI) {
    this.client = client;
  }

  /*
  ================================================
  BASE COMPLETION
  ================================================
  */

  async generateCompletion({ text }: { text: string }) {
    const response = await this.client.chat.completions.create({
      model: "gpt-4o-mini",

      messages: [
        {
          role: "system",
          content: `
You are a clinical AI assistant.

RULES:
- DO NOT make decisions
- DO NOT prescribe treatment
- ONLY provide structured clinical analysis
- RETURN VALID JSON ONLY
          `,
        },
        {
          role: "user",
          content: text,
        },
      ],

      temperature: 0.2,

      response_format: { type: "json_object" },
    });

    const output = response.choices?.[0]?.message?.content || "";

    return {
      text: output,
    };
  }

  /*
  ================================================
  STRUCTURED OUTPUT (USED BY PIPELINE)
  ================================================
  */

  async generateStructured(prompt: string) {
    const result = await this.generateCompletion({ text: prompt });

    try {
      return JSON.parse(result.text);
    } catch (err) {
      throw new Error("AI returned invalid JSON");
    }
  }
}
