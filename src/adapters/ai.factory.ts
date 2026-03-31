import fetch from "node-fetch";

type AIProvider = "openrouter" | "mock";

export class AIFactory {
  private provider: AIProvider;

  constructor() {
    // Default provider (can be changed via ENV later)
    this.provider = process.env.AI_PROVIDER as AIProvider || "openrouter";
  }

  async run(prompt: string) {
    switch (this.provider) {
      case "openrouter":
        return this.runOpenRouter(prompt);

      case "mock":
      default:
        return this.runMock(prompt);
    }
  }

  // 🔥 OPENROUTER IMPLEMENTATION
  private async runOpenRouter(prompt: string) {
    const response = await fetch(
      process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "openai/gpt-4o-mini", // 🔥 DEFAULT MODEL
          messages: [
            {
              role: "system",
              content: "You are a clinical assistant. Provide structured, concise, medically relevant responses."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          max_tokens: 300,
          temperature: 0.2
        }),
      }
    );

    const data = await response.json();

    if (!data || !data.choices) {
      throw new Error("Invalid OpenRouter response");
    }

    return data.choices[0].message.content;
  }

  // 🧪 MOCK (SAFETY FALLBACK)
  private async runMock(prompt: string) {
    return `MOCK RESPONSE: ${prompt}`;
  }
}
