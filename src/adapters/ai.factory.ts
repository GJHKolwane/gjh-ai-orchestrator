import fetch from "node-fetch";

type AIProvider = "openrouter" | "mock";

export class AIFactory {
  private provider: AIProvider;
  private model: string;

  constructor(risk?: string) {
    this.provider = (process.env.AI_PROVIDER as AIProvider) || "openrouter";

    // 🔥 MODEL ROUTING BASED ON RISK
    if (risk === "HIGH") {
      this.model = "openai/gpt-4o"; // strongest
    } else if (risk === "MEDIUM") {
      this.model = "openai/gpt-4o-mini"; // balanced
    } else {
      this.model = "openai/gpt-3.5-turbo"; // cheapest
    }
  }

  // 🔹 MAIN ENTRY (RAW TEXT)
  async run(prompt: string) {
    switch (this.provider) {
      case "openrouter":
        try {
          return await this.runOpenRouter(prompt);
        } catch (err) {
          console.warn("⚠️ OpenRouter failed, falling back to MOCK");
          return this.runMock(prompt);
        }

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

      // ✅ SAFE FALLBACK (ALIGNED WITH CASE-MCP)
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
          model: this.model, // 🔥 dynamic model selection
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

// 🔁 BACKWARD COMPATIBILITY + RISK SUPPORT
export function getAIAdapter(risk?: string) {
  const factory = new AIFactory(risk);

  return {
    generateStructured: (prompt: string) =>
      factory.generateStructured(prompt),

    run: (prompt: string) => factory.run(prompt),
  };
}
