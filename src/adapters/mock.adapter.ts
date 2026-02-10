import { AIAdapter, AICompletionInput, AICompletionOutput } from "./ai.adapter.js";

export class MockAIAdapter implements AIAdapter {
  async generateCompletion(
    _input: AICompletionInput
  ): Promise<AICompletionOutput> {
    const mockResponse = {
      observations: ["Patient reports fever and headache."],
      considerations: ["Possible viral infection."],
      riskLevel: "medium",
      missingInformation: ["No temperature reading provided."],
      suggestedNextSteps: ["Monitor symptoms", "Consider lab tests if persists"],
      escalationRecommended: false
    };

    return {
      text: JSON.stringify(mockResponse)
    };
  }
}
