import fetch from "node-fetch";

type AIProvider = "openrouter" | "mock";

export class AIFactory {
  private provider: AIProvider;

  constructor() {
    this.provider = (process.env.AI_PROVIDER as AIProvider) || "openrouter";
  }

  // 🔹 MAIN ENTRY
  async run(prompt: string) {
    switch (this.provider) {
      case "openrouter":
        return this.runOpenRouter(prompt);

      case "mock":
      default:
        return this.runMock(prompt);
    }
  }

  // 🔥 STRUCTURED OUTPUT (FOR PIPELINE)
  async generateStructured(prompt: string) {
    const raw = await this.run(prompt);

    try {
      // Attempt to extract JSON safely
      const cleaned = this.extractJSON(raw);
      return JSON.parse(cleaned);
    } catch (err) {
      console.error("❌ Failed to parse AI response:", raw);

      return {
        message: "Invalid AI response format",
        extractedSymptoms: [],
        extractedVitals: {},
        missingData: [],
        riskLevel: "LOW",
        suggestedAction: "CONTINUE",
        explanation: ["AI response was not valid JSON"],
        confidence: 0.2,
      };
    }
  }

  // 🔧 HELPER: Extract JSON from messy AI output
  private extractJSON(text: string) {
    const match = text.match(/\{[\s\S]*\}/);
    return match ? match[0] : text;
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
          model: "openai/gpt-4o-mini",
          messages: [
            {
              role: "system",
              content:
                "You are a clinical assistant. Always return STRICT JSON only. No extra text.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          max_tokens: 300,
          temperature: 0.2,
        }),
      }
    );

    const data = await response.json();

    if (!data || !data.choices) {
      console.error("❌ OpenRouter raw response:", data);
      throw new Error("Invalid OpenRouter response");
    }

    return data.choices[0].message.content;
  }

  // 🧪 MOCK (SAFETY FALLBACK)
  private async runMock(prompt: string) {
    return JSON.stringify({
      message: "Mock response",
      extractedSymptoms: ["headache"],
      extractedVitals: {},
      missingData: ["temperature"],
      riskLevel: "LOW",
      suggestedAction: "CONTINUE",
      explanation: ["This is a mock response"],
      confidence: 0.5,
    });
  }
}
