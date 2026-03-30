/*
================================================
MOCK AI ADAPTER
================================================
Used for testing without OpenAI API
*/

export class MockAIAdapter {
  async generateStructured(_prompt: string) {
    return {
      message: "Mock AI response",
      extractedSymptoms: ["headache"],
      extractedVitals: { heartRate: 90 },
      missingData: ["temperature"],
      riskLevel: "LOW",
      suggestedAction: "CONTINUE",
      explanation: ["Symptoms appear mild"],
      confidence: 0.6,
    };
  }
}
