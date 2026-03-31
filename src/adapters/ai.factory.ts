import fetch from "node-fetch";

type AIProvider = "openrouter" | "mock";

export class AIFactory {
  private provider: AIProvider;

  constructor() {
    this.provider = (process.env.AI_PROVIDER as AIProvider) || "openrouter";
  }

  // 🔹 MAIN ENTRY (RAW TEXT)
  async run(prompt: string) {
    switch (this.provider) {
      case "openrouter":
        return this.runOpenRouter(prompt);

      case "mock":
      default:
        return this.runMock(prompt);
    }
  }

  // 🔥 STRUCTURED OUTPUT (FOR CASE-MCP PIPELINE)
  async generateStructured(prompt: string) {
    const raw = await this.run(prompt);

    try {
      const cleaned = this.extractJSON(raw);
      return JSON.parse(cleaned);
    } catch (err) {
      console.error("❌ Failed to parse AI response:", raw);

      // Safe fallback aligned with CASE-MCP expectations
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

  // 🔧 Extract JSON safely from model output
  private extractJSON(text: string) {
    const match = text.match(/\{[\s\S]*\}/);
    return match ? match[0] : text;
  }

  // 🔥 OPENROUTER CALL
  private async runOpenRouter(prompt: string) {
    const response = await fetch(
      process.env.OPENROUTER_BASE_URL ||
        "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "openai/gpt-4o-mini",
          messages: [
            {
              role: "system",
              content:
                "You are a clinical AI assistant. You MUST return STRICT JSON only. No explanations outside JSON.",
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

  // 🧪 MOCK (SAFE FALLBACK)
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

// 🔁 BACKWARD COMPATIBILITY (FOR EXISTING PIPELINE)
export function getAIAdapter() {
  const factory = new AIFactory();

  return {
    generateStructured: (prompt: string) =>
      factory.generateStructured(prompt),

    run: (prompt: string) => factory.run(prompt),
  };
          }
