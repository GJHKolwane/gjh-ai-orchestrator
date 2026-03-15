/*
================================================
CLINICAL PROMPT BUILDER
================================================

Builds structured AI prompt for triage analysis
based on nurse inputs and patient timeline
*/

export function buildClinicalPrompt(patient, vitals, symptoms, notes) {

  /*
  ================================================
  FORMAT VITALS
  ================================================
  */

  const vitalsText = vitals
    ? `
Temperature: ${vitals.temperature || "not recorded"}
Blood Pressure: ${vitals.bloodPressure || "not recorded"}
Heart Rate: ${vitals.heartRate || "not recorded"}
`
    : "No vitals recorded.";

  /*
  ================================================
  FORMAT SYMPTOMS
  ================================================
  */

  const symptomText = Array.isArray(symptoms) && symptoms.length > 0
    ? symptoms.map((s) => `- ${s.name}`).join("\n")
    : "No symptoms recorded.";

  /*
  ================================================
  FORMAT NOTES
  ================================================
  */

  const notesText = notes && notes.length
    ? notes.map((n) => `- ${n}`).join("\n")
    : "No nurse notes recorded.";

  /*
  ================================================
  CLINICAL TRIAGE PROMPT
  ================================================
  */

  return `
You are a clinical triage support AI assisting a nurse in a rural healthcare facility.

Analyze the patient information and provide structured clinical guidance.

PATIENT INFORMATION
-------------------
Identifier: ${patient?.identifier || "unknown"}

VITAL SIGNS
-----------
${vitalsText}

REPORTED SYMPTOMS
-----------------
${symptomText}

NURSE CLINICAL NOTES
--------------------
${notesText}

TRIAGE TASK
-----------
Based on the available clinical information:

1. Identify key clinical observations
2. Provide possible medical considerations
3. Estimate risk level: LOW, MEDIUM, or HIGH
4. Suggest possible clinical actions

OUTPUT FORMAT (JSON ONLY):

{
  "riskLevel": "LOW | MEDIUM | HIGH",
  "observations": [],
  "considerations": [],
  "reasoning": "",
  "aiSuggestion": ""
}

Do NOT include explanations outside the JSON.
`;

}
