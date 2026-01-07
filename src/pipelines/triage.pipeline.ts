import { createAIAdapter } from "../adapters/ai.factory";
import { AICompletionInput } from "../adapters/ai.adapter";

/**
 * ============================
 * INPUT / OUTPUT CONTRACTS
 * ============================
 */

export interface NurseTriageInput {
  consultationId: string;

  patient: {
    age?: number;
    sex?: "male" | "female" | "other";
    symptoms: string[];
    duration?: string;
    severity?: number;
  };

  nurse: {
    notes: string;
    confidence: "low" | "medium" | "high";
  };

  context: {
    location: "rural" | "urban";
    doctorAvailable: boolean;
  };
}

export interface NurseTriageResult {
  observations: string[];
  considerations: string[]; // NON-diagnostic only
  riskLevel: "low" | "medium" | "high";
  missingInformation: string[];
  suggestedNextSteps: string[];

  governance: {
    diagnosticAllowed: false;
    humanInControl: "nurse";
    escalationRecommended: boolean;
  };
}

/**
 * ============================
 * PROMPT BUILDER (GOVERNED)
 * ============================
 */

function buildNurseTriagePrompt(input: NurseTriageInput): string {
  return `
You are a clinical AI assistant supporting a NURSE.

STRICT RULES (MANDATORY):
- You MUST NOT provide a diagnosis.
- You MUST NOT use diagnostic language.
- You MAY suggest possible considerations ONLY.
- You MUST respect nurse authority at all times.
- You MUST highlight risk flags conservatively.
- You MUST indicate missing information clearly.

PATIENT SUMMARY:
- Age: ${input.patient.age ?? "unknown"}
- Sex: ${input.patient.sex ?? "unknown"}
- Symptoms: ${input.patient.symptoms.join(", ")}
- Duration: ${input.patient.duration ?? "unknown"}
- Severity (1–10): ${input.patient.severity ?? "unknown"}

NURSE NOTES:
${input.nurse.notes}

CONTEXT:
- Location: ${input.context.location}
- Doctor available: ${input.context.doctorAvailable}

REQUIRED OUTPUT FORMAT (JSON ONLY):
{
  "observations": [string],
  "considerations": [string],
  "riskLevel": "low | medium | high",
  "missingInformation": [string],
  "suggestedNextSteps": [string],
  "escalationRecommended": boolean
}
`;
}

/**
 * ============================
 * PIPELINE EXECUTION
 * ============================
 */

export async function runNurseTriagePipeline(
  input: NurseTriageInput
): Promise<NurseTriageResult> {
  // 1️⃣ Build governed prompt
  const prompt = buildNurseTriagePrompt(input);

  // 2️⃣ Prepare AI input
  const aiInput: AICompletionInput = {
    prompt,
  };

  // 3️⃣ Select AI adapter (mock or vertex)
  const ai = createAIAdapter();

  // 4️⃣ Execute AI call
  const completion = await ai.generateCompletion(aiInput);

  // 5️⃣ Parse and validate AI output
  let parsed: any;
  try {
    parsed = JSON.parse(completion.text);
  } catch (err) {
    throw new Error("AI output was not valid JSON (governance violation)");
  }

  // 6️⃣ Enforce governance at pipeline level
  const result: NurseTriageResult = {
    observations: parsed.observations ?? [],
    considerations: parsed.considerations ?? [],
    riskLevel: parsed.riskLevel ?? "medium",
    missingInformation: parsed.missingInformation ?? [],
    suggestedNextSteps: parsed.suggestedNextSteps ?? [],

    governance: {
      diagnosticAllowed: false,
      humanInControl: "nurse",
      escalationRecommended: Boolean(parsed.escalationRecommended),
    },
  };

  return result;
}
