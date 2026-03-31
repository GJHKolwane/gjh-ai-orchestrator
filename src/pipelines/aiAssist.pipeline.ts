import { getAIAdapter } from "../adapters/ai.factory.ts";
import { detectRisk } from "../orchestrator/risk.detector";

export async function runAIAssistPipeline(input: {
  inputText: string;
    vitals?: any;
      symptoms?: string[];
        encounterId: string;
        }) {
          const risk = detectRisk(input);

const ai = getAIAdapter(risk);

            const prompt = `
            You are a clinical AI assistant.

            STRICT RULES:
            - You DO NOT make decisions
            - You DO NOT enforce actions
            - You ONLY suggest
            - Output must be VALID JSON

            INPUT:
            Text: ${input.inputText}
            Vitals: ${JSON.stringify(input.vitals || {})}
            Symptoms: ${JSON.stringify(input.symptoms || [])}

            TASK:
            1. Extract symptoms
            2. Extract vitals
            3. Identify missing clinical data
            4. Estimate risk level (LOW, MEDIUM, HIGH)
            5. Suggest action (CONTINUE, ESCALATE)
            6. Provide explanation
            7. Provide confidence (0-1)

            OUTPUT FORMAT:
            {
              "message": "",
                "extractedSymptoms": [],
                  "extractedVitals": {},
                    "missingData": [],
                      "riskLevel": "LOW|MEDIUM|HIGH",
                        "suggestedAction": "CONTINUE|ESCALATE",
                          "explanation": [],
                            "confidence": 0.0
                            }
                            `;

                              const raw = await ai.generateStructured(prompt);

                                return normalize(raw);
                                }

                                function normalize(data: any) {
                                  return {
                                      message: data?.message || "",
                                          extractedSymptoms: data?.extractedSymptoms || [],
                                              extractedVitals: data?.extractedVitals || {},
                                                  missingData: data?.missingData || [],
                                                      riskLevel: data?.riskLevel || "LOW",
                                                          suggestedAction: data?.suggestedAction || "CONTINUE",
                                                              explanation: data?.explanation || [],
                                                                  confidence:
                                                                        typeof data?.confidence === "number" ? data.confidence : 0.5,
                                                                          };
                                                                          }
