/*
================================================
OFFLINE TRIAGE ENGINE
================================================
Fallback triage when AI services are unreachable.

This engine performs minimal safety analysis
based on vitals and symptom text.

It NEVER fabricates symptoms.
*/

export function runOfflineTriage(patient, vitals = {}, symptoms = []) {

  const observations = [];
  const considerations = [];

  let riskLevel = "LOW";

  /*
  ============================================
  NORMALIZE SYMPTOMS (support free text)
  ============================================
  */

  const symptomText = Array.isArray(symptoms)
    ? symptoms.map(s => (typeof s === "string" ? s : s.name || "")).join(" ").toLowerCase()
    : String(symptoms || "").toLowerCase();

  /*
  ============================================
  VITALS SAFETY RULES
  ============================================
  */

  const temperature = parseFloat(vitals?.temperature);
  const heartRate = parseFloat(vitals?.heartRate);
  const bloodPressure = vitals?.bloodPressure;

  if (!isNaN(temperature)) {

    if (temperature >= 39) {
      observations.push("High fever detected");
      considerations.push("Possible infection or systemic illness");
      riskLevel = "HIGH";
    }

    else if (temperature >= 38) {
      observations.push("Elevated temperature detected");
      considerations.push("Monitor for infection");
      riskLevel = "MEDIUM";
    }

  }

  if (!isNaN(heartRate)) {

    if (heartRate > 120) {
      observations.push("Severe tachycardia detected");
      considerations.push("Possible dehydration, infection, or shock");
      riskLevel = "HIGH";
    }

    else if (heartRate > 100 && riskLevel === "LOW") {
      observations.push("Elevated heart rate");
      considerations.push("Possible physiological stress");
      riskLevel = "MEDIUM";
    }

  }

  if (bloodPressure) {

    const parts = bloodPressure.split("/");

    if (parts.length === 2) {

      const systolic = parseInt(parts[0]);

      if (systolic < 90) {
        observations.push("Low blood pressure detected");
        considerations.push("Possible shock or dehydration");
        riskLevel = "HIGH";
      }

      else if (systolic > 160 && riskLevel !== "HIGH") {
        observations.push("Elevated blood pressure");
        considerations.push("Possible hypertension");
        riskLevel = "MEDIUM";
      }

    }

  }

  /*
  ============================================
  SYMPTOM SAFETY RULES
  ============================================
  */

  if (symptomText.includes("chest pain")) {

    observations.push("Chest pain reported");
    considerations.push("Possible cardiac emergency");

    riskLevel = "HIGH";
  }

  if (symptomText.includes("difficulty breathing") ||
      symptomText.includes("shortness of breath")) {

    observations.push("Breathing difficulty reported");
    considerations.push("Possible respiratory distress");

    riskLevel = "HIGH";
  }

  if (symptomText.includes("severe headache") && riskLevel === "LOW") {

    observations.push("Severe headache reported");
    considerations.push("Possible neurological issue");

    riskLevel = "MEDIUM";
  }

  /*
  ============================================
  FINAL SAFETY RESULT
  ============================================
  */

  if (observations.length === 0) {

    observations.push("No critical abnormalities detected from available data");

    considerations.push(
      "Offline triage engine performed minimal safety analysis"
    );

  }

  return {

    riskLevel,
    observations,
    considerations,
    reasoning: "Offline rule-based safety triage",
    aiSuggestion: null,
    source: "OFFLINE_RULE_ENGINE"

  };

}
