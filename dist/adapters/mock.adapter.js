export class MockAIAdapter {
    async generateCompletion(_input) {
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
