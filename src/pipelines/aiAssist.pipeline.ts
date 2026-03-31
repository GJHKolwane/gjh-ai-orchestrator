import { getAIAdapter } from "../adapters/ai.factory.ts";
import { detectRisk } from "../orchestrator/risk.detector";

export async function runAIAssistPipeline(input: {
  inputText: string;
  vitals?: any;
  symptoms?: string[];
  encounterId: string;
}) {
  // 🔥 STEP 1: Pre-risk detection (cheap + fast)
  const risk = detectRisk(input);

  // 🔥 STEP 2: Get AI with routing
  const ai = getAIAdapter(risk);

  // 🔥 STEP 3: Strong structured prompt
  const prompt = `
You are a clinical AI assistant.

STRICT RULES:
- You DO NOT make decisions
- You DO NOT enforce actions
- You ONLY suggest
- You MUST return ONLY valid JSON
- Do NOT include any text before or after JSON

INPUT:
Text: ${input.inputText}
Vitals: ${JSON.stringify(input.vitals || {})}
Symptoms: ${JSON.stringify(input.symptoms || [])}
RiskPreAssessment: ${risk}

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

  // 🔥 STEP 4: Execute AI
  const raw = await ai.generateStructured(prompt);

  // 🔥 STEP 5: Normalize for CASE-MCP
  return normalize(raw, risk);
}

// 🔧 NORMALIZATION LAYER (CRITICAL FOR STABILITY)
function normalize(data: any, fallbackRisk: string) {
  return {
    message: data?.message || "",

    extractedSymptoms: Array.isArray(data?.extractedSymptoms)
      ? data.extractedSymptoms
      : [],

    extractedVitals:
      typeof data?.extractedVitals === "object" && data.extractedVitals !== null
        ? data.extractedVitals
        : {},

    missingData: Array.isArray(data?.missingData)
      ? data.missingData
      : [],

    riskLevel:
      data?.riskLevel === "LOW" ||
      data?.riskLevel === "MEDIUM" ||
      data?.riskLevel === "HIGH"
        ? data.riskLevel
        : fallbackRisk || "LOW",

    suggestedAction:
      data?.suggestedAction === "ESCALATE"
        ? "ESCALATE"
        : "CONTINUE",

    explanation: Array.isArray(data?.explanation)
      ? data.explanation
      : [],

    confidence:
      typeof data?.confidence === "number"
        ? data.confidence
        : 0.5,
  };
}
