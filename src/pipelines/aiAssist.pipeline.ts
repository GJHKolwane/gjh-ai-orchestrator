import { getAIAdapter } from "../adapters/ai.factory.ts";
import { detectRisk } from "../orchestrator/risk.detector";

export async function runAIAssistPipeline(input: {
  inputText: string;
  vitals?: any;
  symptoms?: string[];
  encounterId: string;
}) {
  /*
  ========================================
  🔥 STEP 1: PRE-RISK (FAST GUARDRAIL)
  ========================================
  */
  const risk = detectRisk(input);

  /*
  ========================================
  🔥 STEP 2: AI ROUTING (BASED ON RISK)
  ========================================
  */
  const ai = getAIAdapter(risk);

  /*
  ========================================
  🧠 STEP 3: CLINICAL REASONING PROMPT
  ========================================
  */
  const prompt = `
ROLE:
You are a clinical triage reasoning assistant operating in a telemedicine system.

CORE PRINCIPLES:
- You MUST perform clinical reasoning using symptoms and vitals together
- You MUST prioritize patient safety
- You MUST detect trauma, head injury, and abnormal vitals
- You DO NOT prescribe treatment
- You DO NOT replace a doctor
- You provide structured clinical analysis only

CLINICAL SAFETY RULES:
- Any head-related symptom = HIGH RISK unless clearly minor
- Trauma indicators (e.g. "broken", "fracture", "severe pain", "bruising") increase risk
- Elevated heart rate (>100) may indicate distress or pain
- High blood pressure (>140 systolic) contributes to risk
- If multiple concerning signals exist → escalate risk
- If uncertain → choose HIGH over LOW

INPUT DATA:
Text: ${input.inputText}

Vitals:
${JSON.stringify(input.vitals || {}, null, 2)}

Symptoms:
${JSON.stringify(input.symptoms || [], null, 2)}

Preliminary Risk (system): ${risk}

TASK:
1. Interpret symptoms semantically (not just keywords)
2. Combine symptoms + vitals for reasoning
3. Identify clinical concerns
4. Identify missing critical data
5. Determine overall risk level
6. Suggest next action
7. Explain reasoning clearly
8. Provide confidence score

OUTPUT STRICT JSON ONLY:
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

  /*
  ========================================
  🚀 STEP 4: EXECUTE AI
  ========================================
  */
  const raw = await ai.generateStructured(prompt);

  console.log("🧠 RAW AI OUTPUT:", raw);

  /*
  ========================================
  🛡️ STEP 5: SAFETY OVERRIDE (HARD RULES)
  ========================================
  */
  const safe = applySafetyOverrides(raw, input);

  /*
  ========================================
  🔧 STEP 6: NORMALIZE OUTPUT
  ========================================
  */
  return normalize(safe, risk);
}

/*
========================================
🛡️ SAFETY OVERRIDE LAYER (CRITICAL)
========================================
*/
function applySafetyOverrides(data: any, input: any) {
  const symptoms = (input.symptoms || []).map((s: string) =>
    s.toLowerCase()
  );

  let riskLevel = data?.riskLevel || "LOW";
  let suggestedAction = data?.suggestedAction || "CONTINUE";
  let explanation = Array.isArray(data?.explanation)
    ? [...data.explanation]
    : [];

  // 🚨 HEAD INJURY OVERRIDE
  if (symptoms.some((s: string) => s.includes("head"))) {
    riskLevel = "HIGH";
    suggestedAction = "ESCALATE";
    explanation.push("Head-related symptom detected (safety override)");
  }

  // 🚨 TRAUMA OVERRIDE
  if (
    symptoms.some(
      (s: string) =>
        s.includes("broken") ||
        s.includes("fracture") ||
        s.includes("injury") ||
        s.includes("bruise")
    )
  ) {
    if (riskLevel === "LOW") {
      riskLevel = "MEDIUM";
    }
    explanation.push("Trauma indicators detected");
  }

  // 🚨 MULTI-SYMPTOM ESCALATION
  if (symptoms.length >= 3 && riskLevel !== "HIGH") {
    riskLevel = "MEDIUM";
    explanation.push("Multiple symptoms increase risk");
  }

  return {
    ...data,
    riskLevel,
    suggestedAction,
    explanation,
  };
}

/*
========================================
🔧 NORMALIZATION LAYER (STABILITY)
========================================
*/
function normalize(data: any, fallbackRisk: string) {
  return {
    message: data?.message || "",

    extractedSymptoms: Array.isArray(data?.extractedSymptoms)
      ? data.extractedSymptoms
      : [],

    extractedVitals:
      typeof data?.extractedVitals === "object" &&
      data?.extractedVitals !== null
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
