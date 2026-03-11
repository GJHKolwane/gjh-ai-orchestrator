/*
================================================
AI PROMPT BUILDER
================================================
Builds structured prompt for clinical triage AI
*/

export function buildClinicalPrompt(
  patient: any,
    vitals: any,
      symptoms: any[],
        notes: any[]
        ) {

          return `
          You are a clinical triage assistant.

          Patient:
          Name: ${patient?.name || "unknown"}
          Gender: ${patient?.gender || "unknown"}

          Vitals:
          ${JSON.stringify(vitals, null, 2)}

          Symptoms:
          ${JSON.stringify(symptoms, null, 2)}

          Nurse Notes:
          ${JSON.stringify(notes, null, 2)}

          Task:
          Provide a triage recommendation.

          Classify risk level:
          LOW
          MEDIUM
          HIGH

          Explain your reasoning.
          `;
          }